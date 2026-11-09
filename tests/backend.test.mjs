import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// Environnement de test isolé : dossier de données temporaire, aucune clé réelle.
const dataDir = mkdtempSync(path.join(tmpdir(), "pth-test-"));
process.env.NODE_ENV = "test";
process.env.PTH_DATA_DIR = dataDir;
process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
for (const k of ["RESEND_API_KEY", "PTH_CONTACT_EMAIL", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "TURNSTILE_SECRET_KEY", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "ADMIN_PASSWORD", "ADMIN_SESSION_SECRET", "DONATION_PROVIDER", "HELLOASSO_DONATION_URL"]) delete process.env[k];

const sec = await import("../src/lib/server/security.js");
const leads = await import("../src/lib/server/leads.js");
const mail = await import("../src/lib/server/emails.js");
const stripe = await import("../src/lib/server/stripe.js");
const admin = await import("../src/lib/server/admin.js");
const { verifyTurnstile } = await import("../src/lib/server/turnstile.js");
const { donationPaymentLink, donationProvider } = await import("../src/lib/server/config.js");
const { participationSchema, donationCheckoutSchema } = await import("../src/lib/forms/schemas.js");

test.after(() => rmSync(dataDir, { recursive: true, force: true }));

/* ───────── sécurité ───────── */
test("escapeHtml neutralise le HTML", () => {
  assert.equal(sec.escapeHtml(`<img src=x onerror="a()">&'`), "&lt;img src=x onerror=&quot;a()&quot;&gt;&amp;&#39;");
});

test("oneLine supprime les retours à la ligne (injection d'en-têtes d'email)", () => {
  assert.equal(sec.oneLine("Bonjour\r\nBcc: evil@x.com"), "Bonjour Bcc: evil@x.com");
  assert.equal(sec.oneLine("x".repeat(500), 10).length, 10);
});

test("jeton signé : valide, falsifié, expiré, mauvais secret", () => {
  const token = sec.signToken({ sub: "admin", exp: Date.now() + 60_000 }, "s".repeat(20));
  assert.equal(sec.verifyToken(token, "s".repeat(20)).sub, "admin");
  assert.equal(sec.verifyToken(token, "autre-secret-autre-secret"), null);
  const [body, sig] = token.split(".");
  const forged = Buffer.from(JSON.stringify({ sub: "admin", exp: Date.now() + 9e9 })).toString("base64url");
  assert.equal(sec.verifyToken(`${forged}.${sig}`, "s".repeat(20)), null);
  assert.equal(sec.verifyToken(`${body}x.${sig}`, "s".repeat(20)), null);
  const old = sec.signToken({ sub: "admin", exp: 1000 }, "s".repeat(20));
  assert.equal(sec.verifyToken(old, "s".repeat(20), 2000), null);
  assert.equal(sec.verifyToken("", "s"), null);
  assert.equal(sec.verifyToken("abc", "s"), null);
});

test("safeEqual compare sans fuite de longueur", () => {
  assert.equal(sec.safeEqual("motdepasse", "motdepasse"), true);
  assert.equal(sec.safeEqual("motdepasse", "motdepassE"), false);
  assert.equal(sec.safeEqual("a", "aaaa"), false);
});

test("signature Stripe : valide, mauvais secret, corps modifié, horloge trop ancienne", () => {
  const secret = "whsec_test";
  const body = '{"id":"evt_1"}';
  const now = 1_700_000_000_000;
  const t = Math.floor(now / 1000);
  const v1 = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");
  const header = `t=${t},v1=${v1}`;
  assert.equal(sec.verifyStripeSignature(body, header, secret, 300, now), true);
  assert.equal(sec.verifyStripeSignature(body, header, "autre", 300, now), false);
  assert.equal(sec.verifyStripeSignature(body + " ", header, secret, 300, now), false);
  assert.equal(sec.verifyStripeSignature(body, header, secret, 300, now + 10 * 60_000), false);
  assert.equal(sec.verifyStripeSignature(body, `t=${t},v1=deadbeef`, secret, 300, now), false);
  assert.equal(sec.verifyStripeSignature(body, "", secret, 300, now), false);
});

test("limitation de débit : bloque à la 6e demande, puis se libère", () => {
  sec.resetRateLimits();
  const t0 = 1_000_000;
  for (let i = 0; i < 5; i++) assert.equal(sec.rateLimit("ip", { windowMs: 1000, max: 5 }, t0 + i), false);
  assert.equal(sec.rateLimit("ip", { windowMs: 1000, max: 5 }, t0 + 6), true);
  assert.equal(sec.rateLimit("ip", { windowMs: 1000, max: 5 }, t0 + 5000), false);
  assert.equal(sec.rateLimit("autre", { windowMs: 1000, max: 5 }, t0), false);
});

test("hashIp : stable, salé, ne contient pas l'IP", () => {
  const h = sec.hashIp("203.0.113.9");
  assert.equal(h, sec.hashIp("203.0.113.9"));
  assert.notEqual(h, sec.hashIp("203.0.113.10"));
  assert.ok(!h.includes("203"));
  assert.equal(h.length, 32);
});

test("sameOrigin : refuse un autre site, accepte le sien et l'absence d'Origin", () => {
  const req = (origin, host = "localhost:3000") => ({ headers: new Headers({ ...(origin ? { origin } : {}), host }) });
  assert.equal(sec.sameOrigin(req("http://localhost:3000")), true);
  assert.equal(sec.sameOrigin(req("https://evil.example")), false);
  assert.equal(sec.sameOrigin(req(null)), true);
  assert.equal(sec.sameOrigin(req("pas une url")), false);
});

/* ───────── Turnstile ───────── */
test("Turnstile : désactivé sans clé, puis succès / échec / panne", async () => {
  assert.deepEqual(await verifyTurnstile("x", "1.2.3.4"), { ok: true, skipped: true });
  process.env.TURNSTILE_SECRET_KEY = "secret";
  assert.equal((await verifyTurnstile("", "1.2.3.4")).error, "missing");
  const calls = [];
  const ok = async (url, init) => (calls.push({ url, body: init.body.toString() }), { json: async () => ({ success: true }) });
  assert.equal((await verifyTurnstile("tok", "1.2.3.4", ok)).ok, true);
  assert.match(calls[0].body, /secret=secret/);
  assert.match(calls[0].body, /response=tok/);
  assert.match(calls[0].body, /remoteip=1.2.3.4/);
  const ko = async () => ({ json: async () => ({ success: false, "error-codes": ["invalid-input-response"] }) });
  assert.equal((await verifyTurnstile("tok", "1.2.3.4", ko)).error, "invalid-input-response");
  const down = async () => {
    throw new Error("réseau");
  };
  assert.equal((await verifyTurnstile("tok", "1.2.3.4", down)).error, "unavailable");
  delete process.env.TURNSTILE_SECRET_KEY;
});

/* ───────── validation ───────── */
test("schémas : demande valide, email invalide, don hors bornes (voir aussi tests/donations.test.mjs)", () => {
  assert.equal(participationSchema.safeParse({ mode: "contact", name: "A", email: "a@b.co", message: "Un message assez long" }).success, true);
  assert.equal(participationSchema.safeParse({ mode: "contact", name: "A", email: "pas-un-email", message: "Un message assez long" }).success, false);
  const base = { firstName: "A", lastName: "B", email: "a@b.co", message: "" };
  assert.equal(donationCheckoutSchema.safeParse({ ...base, amount: "25" }).data.amount, 25);
  assert.equal(donationCheckoutSchema.safeParse({ ...base, amount: 0 }).success, false);
  assert.equal(donationCheckoutSchema.safeParse({ ...base, amount: 9999 }).success, true); // plus de plafond commercial (brief §4) — juste un plafond technique à 100 000 €
  assert.equal(donationCheckoutSchema.safeParse({ ...base, amount: 10 }).data.frequency, "once");
});

test("schémas : lettre d'actus — consentement requis, jamais coché par défaut (RGPD)", async () => {
  const { newsletterSchema } = await import("../src/lib/forms/schemas.js");
  assert.equal(newsletterSchema.safeParse({ mode: "newsletter", email: "a@b.co", consent: true }).success, true);
  assert.equal(newsletterSchema.safeParse({ mode: "newsletter", email: "a@b.co", consent: false }).success, false);
  assert.equal(newsletterSchema.safeParse({ mode: "newsletter", email: "a@b.co" }).success, false); // consentement absent = refusé
});

/* ───────── stockage local ───────── */
test("stockage local : enregistrer, lister, filtrer, changer le statut, compter", async () => {
  assert.equal(leads.backend(), "local");
  const data = { mode: "contact", name: "Test", email: "t@x.co", message: "Bonjour", website: "", turnstileToken: "tok" };
  const saved = await leads.saveLead({ mode: "contact", data, ipHash: "hash1", userAgent: "UA" });
  assert.equal(saved.ok, true);
  const all = await leads.listLeads();
  assert.equal(all.length, 1);
  assert.equal(all[0].status, "new");
  assert.equal("website" in all[0].payload, false, "le champ piège ne doit pas être stocké");
  assert.equal("turnstileToken" in all[0].payload, false, "le jeton ne doit pas être stocké");
  assert.equal((await leads.listLeads({ mode: "invest" })).length, 0);
  assert.equal((await leads.setLeadStatus(saved.id, "contacted")).ok, true);
  assert.equal((await leads.listLeads({ status: "contacted" })).length, 1);
  assert.equal((await leads.setLeadStatus(saved.id, "n'importe quoi")).ok, false);
  assert.equal((await leads.setLeadStatus("inconnu", "archived")).error, "not_found");
  assert.equal(await leads.countRecentLeads("hash1", 60_000), 1);
  assert.equal(await leads.countRecentLeads("autre", 60_000), 0);
});

test("dons : upsert idempotent sur provider_ref", async () => {
  const d = { provider: "stripe", provider_ref: "cs_1", email: "d@x.co", name: "Donateur", amount_cents: 2500, currency: "eur", frequency: "once", status: "pending" };
  await leads.upsertDonation(d);
  await leads.upsertDonation({ ...d, status: "paid" });
  const list = await leads.listDonations();
  assert.equal(list.length, 1);
  assert.equal(list[0].status, "paid");
  assert.equal((await leads.getDonationByRef("cs_1")).amount_cents, 2500);
  assert.equal(await leads.getDonationByRef("absent"), null);
});

/* ───────── stockage Supabase (fetch simulé) ───────── */
test("Supabase : bonnes requêtes REST, clé serveur, erreurs sans exception", async () => {
  process.env.SUPABASE_URL = "https://abc.supabase.co/";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";
  assert.equal(leads.backend(), "supabase");
  const realFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    if (String(url).includes("/rest/v1/leads") && init.method === "POST") return new Response(JSON.stringify([{ id: "uuid-1" }]), { status: 201 });
    if (init.method === "PATCH") return new Response(null, { status: 204 });
    return new Response(JSON.stringify([{ id: "a" }, { id: "b" }]), { status: 200 });
  };
  try {
    const saved = await leads.saveLead({ mode: "invest", data: { mode: "invest", firstName: "A", lastName: "B", email: "a@b.co", website: "" }, ipHash: "h", userAgent: "UA" });
    assert.deepEqual([saved.ok, saved.id], [true, "uuid-1"]);
    assert.equal(calls[0].url, "https://abc.supabase.co/rest/v1/leads");
    assert.equal(calls[0].init.headers.apikey, "service-key");
    assert.equal(calls[0].init.headers.Authorization, "Bearer service-key");
    const sent = JSON.parse(calls[0].init.body);
    assert.equal(sent.name, "A B");
    assert.equal(sent.ip_hash, "h");
    assert.equal("website" in sent.payload, false);

    await leads.listLeads({ mode: "invest", status: "new", limit: 10 });
    assert.match(calls[1].url, /order=created_at\.desc/);
    assert.match(calls[1].url, /mode=eq\.invest/);
    assert.match(calls[1].url, /status=eq\.new/);

    assert.equal((await leads.setLeadStatus("id-1", "archived")).ok, true);
    assert.equal(calls[2].init.method, "PATCH");
    assert.match(calls[2].url, /leads\?id=eq\.id-1/);

    assert.equal(await leads.countRecentLeads("h", 60_000), 2);

    await leads.upsertDonation({ provider: "stripe", provider_ref: "cs_9", amount_cents: 1000 });
    const last = calls.at(-1);
    assert.match(last.url, /donations\?on_conflict=provider_ref/);
    assert.equal(last.init.headers.Prefer, "resolution=merge-duplicates");

    globalThis.fetch = async () => new Response("boom", { status: 500 });
    const failed = await leads.saveLead({ mode: "contact", data: { mode: "contact", name: "x", email: "a@b.co" }, ipHash: "h", userAgent: "" });
    assert.equal(failed.ok, false);
    assert.match(failed.error, /supabase 500/);
    assert.equal(await leads.countRecentLeads("h", 60_000), 0, "panne de base : on ne bloque pas les visiteurs");
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  }
});

test("production sans base : aucun stockage, pas de fichier écrit", async () => {
  process.env.NODE_ENV = "production";
  assert.equal(leads.backend(), "none");
  assert.deepEqual(await leads.saveLead({ mode: "contact", data: { name: "x", email: "a@b.co" }, ipHash: "h", userAgent: "" }), { ok: false, backend: "none", error: "no_backend" });
  assert.deepEqual(await leads.listLeads(), []);
  process.env.NODE_ENV = "test";
});

/* ───────── emails ───────── */
test("email équipe : échappe le HTML, sujet sur une ligne, contient le message", () => {
  const payload = { mode: "contact", name: "Eve\r\nBcc: x@y.z", email: "eve@x.co", message: "<script>alert(1)</script>\nLigne 2" };
  const { subject, html, text } = mail.renderTeamEmail({ mode: "contact", payload });
  assert.ok(!/[\r\n]/.test(subject));
  assert.match(subject, /^\[PTH\] Nouvelle demande — Contact —/);
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(html.includes("Ligne 2"));
  assert.match(text, /Message : <script>alert\(1\)<\/script>/, "la version texte reste littérale (pas de HTML interprété)");
});

test("email de confirmation : salutation, rappel sans l'email, échappement", () => {
  const { subject, html, text } = mail.renderConfirmationEmail({ mode: "volunteer", payload: { mode: "volunteer", firstName: "Zoé<b>", lastName: "L", email: "z@x.co", skill: "Vidéo", message: "Je veux aider." } });
  assert.equal(subject, "Merci, nous avons bien reçu votre message");
  assert.ok(html.includes("Bonjour Zoé&lt;b&gt;"));
  assert.ok(html.includes("Vidéo"));
  assert.ok(!text.includes("z@x.co"), "on ne répète pas l'email dans le rappel");
  assert.match(text, /\(bénévole\)/);
});

test("email de don : montant formaté en euros, mention mensuelle", () => {
  const once = mail.renderDonationEmail({ name: "Paul", amountCents: 2500, frequency: "once" });
  assert.match(once.text.replace(/ | /g, " "), /25,00 €/);
  assert.ok(!once.text.includes("par mois"));
  const monthly = mail.renderDonationEmail({ name: "Paul", amountCents: 1000, frequency: "monthly" });
  assert.match(monthly.text, /par mois/);
});

test("envoi : dev = journal, production sans clé = erreur explicite, avec clé = appel Resend", async () => {
  const log = console.info;
  const lines = [];
  console.info = (l) => lines.push(l);
  try {
    assert.deepEqual(await mail.sendMail({ to: "a@b.co", subject: "S", html: "<p>x</p>", text: "x" }), { ok: true, dev: true });
    assert.match(lines[0], /\[email:dev\]/);
  } finally {
    console.info = log;
  }
  process.env.NODE_ENV = "production";
  assert.deepEqual(await mail.sendMail({ to: "a@b.co", subject: "S", html: "x", text: "x" }), { ok: false, error: "Email non configuré" });
  process.env.NODE_ENV = "test";

  process.env.RESEND_API_KEY = "re_test";
  process.env.PTH_CONTACT_EMAIL = "equipe@pth.fr";
  const realFetch = globalThis.fetch;
  let captured;
  globalThis.fetch = async (url, init) => ((captured = { url: String(url), init }), new Response(JSON.stringify({ id: "mail-1" }), { status: 200 }));
  try {
    const result = await mail.notifyTeam({ mode: "contact", payload: { mode: "contact", name: "Léa", email: "lea@x.co", message: "Un message assez long" } });
    assert.equal(result.ok, true);
    assert.match(captured.url, /api\.resend\.com\/emails/);
    const body = JSON.parse(captured.init.body);
    assert.equal(Array.isArray(body.to) ? body.to[0] : body.to, "equipe@pth.fr");
    assert.equal(body.reply_to ?? body.replyTo, "lea@x.co");
    assert.ok(body.html.includes("Un message assez long"));
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.RESEND_API_KEY;
    delete process.env.PTH_CONTACT_EMAIL;
  }
});

/* ───────── Stripe ───────── */
test("stripeForm : encodage imbriqué façon Stripe", () => {
  const p = stripe.stripeForm({ mode: "payment", line_items: [{ quantity: 1, price_data: { currency: "eur", unit_amount: 2500 } }], vide: undefined, metadata: { a: "b" } });
  assert.equal(p.get("mode"), "payment");
  assert.equal(p.get("line_items[0][quantity]"), "1");
  assert.equal(p.get("line_items[0][price_data][unit_amount]"), "2500");
  assert.equal(p.get("metadata[a]"), "b");
  assert.equal(p.has("vide"), false);
});

test("Stripe Checkout : paiement unique vs abonnement mensuel (voir aussi tests/donations.test.mjs)", async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_x";
  process.env.STRIPE_API_BASE = "http://stripe.mock";
  const realFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init) => (calls.push({ url: String(url), init }), new Response(JSON.stringify({ id: "cs_test_1", url: "https://checkout.stripe.com/x" }), { status: 200 }));
  try {
    const once = await stripe.createDonationCheckout({
      amountCents: 2500,
      donationType: "once",
      email: "d@x.co",
      name: "Dona",
      internalReference: "ref-1",
      idempotencyKey: "idem-1",
    });
    assert.deepEqual([once.ok, once.url], [true, "https://checkout.stripe.com/x"]);
    assert.equal(calls[0].url, "http://stripe.mock/v1/checkout/sessions");
    assert.equal(calls[0].init.headers.Authorization, "Bearer sk_test_x");
    assert.equal(calls[0].init.headers["Idempotency-Key"], "idem-1"); // la clé d'idempotence part bien jusqu'à Stripe
    const a = new URLSearchParams(calls[0].init.body);
    assert.equal(a.get("mode"), "payment");
    assert.equal(a.get("submit_type"), "donate");
    assert.equal(a.get("line_items[0][price_data][unit_amount]"), "2500");
    assert.equal(a.get("line_items[0][price_data][currency]"), "eur");
    assert.equal(a.has("line_items[0][price]"), false); // ponctuel : jamais de Price ID, un prix calculé à la volée
    assert.equal(a.get("metadata[internal_reference]"), "ref-1");
    assert.equal(a.get("metadata[donation_type]"), "once");
    assert.equal(a.get("customer_email"), "d@x.co");
    assert.match(a.get("success_url"), /\/merci\?session_id=\{CHECKOUT_SESSION_ID\}&don=1$/);

    // Mensuel : montant libre depuis le 2026-10-14 (demande utilisateur), prix calculé à la volée comme le
    // ponctuel — mais récurrent (`recurring[interval]=month`), jamais un Price ID fixe créé à l'avance.
    await stripe.createDonationCheckout({ amountCents: 1500, donationType: "monthly", email: "d@x.co", name: "Dona", internalReference: "ref-2", idempotencyKey: "idem-2" });
    const b = new URLSearchParams(calls[1].init.body);
    assert.equal(b.get("mode"), "subscription");
    assert.equal(b.get("line_items[0][price_data][unit_amount]"), "1500");
    assert.equal(b.get("line_items[0][price_data][recurring][interval]"), "month");
    assert.equal(b.has("line_items[0][price]"), false); // jamais de Price ID fixe
    assert.equal(b.get("subscription_data[metadata][donation_type]"), "monthly");
    assert.equal(b.has("submit_type"), false);

    globalThis.fetch = async () => new Response(JSON.stringify({ error: { message: "Invalid API Key" } }), { status: 401 });
    assert.deepEqual(await stripe.createDonationCheckout({ amountCents: 1000, donationType: "once", email: "d@x.co", name: "x" }), { ok: false, error: "Invalid API Key" });
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_API_BASE;
  }
});

test("fournisseur de dons : Checkout dynamique ou liens Stripe autorisés", () => {
  assert.equal(donationProvider(), "none");
  process.env.DONATION_PROVIDER = "stripe";
  assert.equal(donationProvider(), "none", "stripe sans clé secrète → inactif");
  process.env.STRIPE_DONATION_ONCE_20_URL = "https://donate.stripe.com/test-20";
  process.env.STRIPE_DONATION_ONCE_CUSTOM_URL = "https://donate.stripe.com/test-custom";
  assert.equal(donationProvider(), "stripe-link");
  assert.equal(donationPaymentLink({ amount: 20, frequency: "once" }), "https://donate.stripe.com/test-20");
  assert.equal(donationPaymentLink({ amount: 42, frequency: "once" }), "https://donate.stripe.com/test-custom");
  assert.equal(donationPaymentLink({ amount: 20, frequency: "monthly" }), "");
  process.env.STRIPE_SECRET_KEY = "sk";
  assert.equal(donationProvider(), "stripe-link", "les liens configurés restent prioritaires");
  delete process.env.STRIPE_DONATION_ONCE_20_URL;
  delete process.env.STRIPE_DONATION_ONCE_CUSTOM_URL;
  assert.equal(donationProvider(), "stripe");
  process.env.DONATION_PROVIDER = "helloasso";
  assert.equal(donationProvider(), "none");
  process.env.HELLOASSO_DONATION_URL = "https://www.helloasso.com/x";
  assert.equal(donationProvider(), "helloasso");
  for (const k of ["DONATION_PROVIDER", "STRIPE_SECRET_KEY", "HELLOASSO_DONATION_URL"]) delete process.env[k];
});

/* ───────── admin ───────── */
test("admin : désactivé sans mot de passe ET secret solide ; session valide / falsifiée", () => {
  assert.equal(admin.adminEnabled(), false);
  process.env.ADMIN_PASSWORD = "mot-de-passe";
  process.env.ADMIN_SESSION_SECRET = "court";
  assert.equal(admin.adminEnabled(), false, "secret < 16 caractères refusé");
  process.env.ADMIN_SESSION_SECRET = "un-secret-long-de-plus-de-16-caracteres";
  assert.equal(admin.adminEnabled(), true);
  const token = admin.createSession();
  assert.equal(admin.isAuthorized(token), true);
  assert.equal(admin.isAuthorized(token + "x"), false);
  assert.equal(admin.isAuthorized(undefined), false);
  assert.equal(admin.isAuthorized(sec.signToken({ sub: "admin", exp: Date.now() + 1000 }, "mauvais-secret-mauvais-secret")), false);
  assert.equal(admin.isAuthorized(sec.signToken({ sub: "autre", exp: Date.now() + 1000 }, process.env.ADMIN_SESSION_SECRET)), false);
  assert.equal(admin.cookieOptions().httpOnly, true);
  assert.equal(admin.cookieOptions().sameSite, "strict");
  delete process.env.ADMIN_PASSWORD;
  assert.equal(admin.isAuthorized(token), false, "sans mot de passe configuré, plus aucun accès");
  delete process.env.ADMIN_SESSION_SECRET;
});
