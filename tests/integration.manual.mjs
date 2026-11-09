/**
 * Test d'intégration MANUEL du back-end (lancer : `node tests/integration.manual.mjs`).
 * Démarre un faux Stripe, lance le site en mode développement sur le port 3300 avec des variables de test,
 * envoie de vraies requêtes HTTP et contrôle les réponses, les fichiers enregistrés et les journaux d'email.
 * Aucune donnée réelle, aucun compte : tout est local et jeté à la fin.
 */
import http from "node:http";
import { spawn } from "node:child_process";
import { createHmac } from "node:crypto";
import { mkdtempSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const PORT = 3300;
const BASE = `http://localhost:${PORT}`;
const dataDir = mkdtempSync(path.join(tmpdir(), "pth-int-"));
const WEBHOOK_SECRET = "whsec_integration";

let passed = 0;
let failed = 0;
const check = (name, condition, detail = "") => {
  if (condition) passed++;
  else failed++;
  console.log(`${condition ? "  ✔" : "  ✖"} ${name}${!condition && detail ? `  → ${detail}` : ""}`);
};

// Faux Stripe : répond à POST /v1/checkout/sessions.
const stripeCalls = [];
const stripe = http
  .createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      stripeCalls.push({ url: req.url, auth: req.headers.authorization, body: new URLSearchParams(body) });
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ id: "cs_test_int", url: "https://checkout.stripe.test/pay/cs_test_int" }));
    });
  })
  .listen(3399);

const env = {
  ...process.env,
  NODE_ENV: "development",
  PTH_DATA_DIR: dataDir,
  NEXT_PUBLIC_SITE_URL: BASE,
  ADMIN_PASSWORD: "mot-de-passe-de-test",
  ADMIN_SESSION_SECRET: "secret-de-test-assez-long-1234567890",
  DONATION_PROVIDER: "stripe",
  STRIPE_SECRET_KEY: "sk_test_integration",
  STRIPE_API_BASE: "http://127.0.0.1:3399",
  STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET,
};
for (const k of ["RESEND_API_KEY", "PTH_CONTACT_EMAIL", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "TURNSTILE_SECRET_KEY"]) delete env[k];

let log = "";
const server = spawn("npx", ["next", "dev", "-p", String(PORT)], { env, cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"] });
server.stdout.on("data", (d) => (log += d));
server.stderr.on("data", (d) => (log += d));
const stop = () => {
  server.kill("SIGTERM");
  stripe.close();
  rmSync(dataDir, { recursive: true, force: true });
};

async function waitReady() {
  for (let i = 0; i < 120; i++) {
    try {
      const r = await fetch(`${BASE}/robots.txt`);
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("le serveur n'a pas démarré\n" + log.slice(-800));
}

const post = (url, body, headers = {}) =>
  fetch(`${BASE}${url}`, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) });
const leadsFile = () => (existsSync(path.join(dataDir, "leads.jsonl")) ? readFileSync(path.join(dataDir, "leads.jsonl"), "utf8").split("\n").filter(Boolean).map(JSON.parse) : []);
const donationsFile = () => (existsSync(path.join(dataDir, "donations.jsonl")) ? readFileSync(path.join(dataDir, "donations.jsonl"), "utf8").split("\n").filter(Boolean).map(JSON.parse) : []);
const contact = (extra = {}) => ({ mode: "contact", name: "Léa Test", email: "lea@example.com", message: "Bonjour, ceci est un message de test.", website: "", ...extra });

try {
  await waitReady();

  console.log("\n— Formulaire /api/participate");
  let r = await post("/api/participate", contact());
  check("demande valide → 200", r.status === 200, r.status);
  check("demande enregistrée (1)", leadsFile().length === 1);
  check("aucune IP en clair, empreinte à la place", !/127\.0\.0\.1|::1/.test(JSON.stringify(leadsFile())) && leadsFile()[0].ip_hash?.length === 32);
  check("notification équipe + confirmation visiteur journalisées", (log.match(/\[email:dev\]/g) || []).length >= 2, log.slice(-300));
  r = await post("/api/participate", contact({ website: "http://spam" }));
  check("robot (champ piège) → 200 sans rien enregistrer", r.status === 200 && leadsFile().length === 1);
  r = await post("/api/participate", contact({ email: "pas-un-email" }));
  check("email invalide → 422", r.status === 422, r.status);
  r = await post("/api/participate", "{pas du json");
  check("JSON invalide → 400", r.status === 400, r.status);
  r = await post("/api/participate", contact(), { Origin: "https://evil.example" });
  check("autre origine (CSRF) → 403", r.status === 403, r.status);
  r = await post("/api/participate", contact({ message: "x".repeat(25_000) }));
  check("corps trop gros → 413", r.status === 413, r.status);
  let last;
  for (let i = 0; i < 6; i++) last = await post("/api/participate", contact({ name: `Rafale ${i}` }));
  check("limitation de débit → 429 après 5 demandes", last.status === 429, last.status);

  console.log("\n— Espace admin");
  r = await fetch(`${BASE}/admin`);
  let html = await r.text();
  check("sans session : page de connexion (pas de données)", r.status === 200 && html.includes("Mot de passe") && !html.includes("Léa Test"));
  check("/admin non indexable (en-tête)", (r.headers.get("x-robots-tag") || "").includes("noindex"));
  r = await post("/api/admin/login", { password: "faux" });
  check("mauvais mot de passe → 401", r.status === 401, r.status);
  r = await post("/api/admin/login", { password: env.ADMIN_PASSWORD });
  const cookie = (r.headers.get("set-cookie") || "").split(";")[0];
  const flags = (r.headers.get("set-cookie") || "").toLowerCase();
  check("bon mot de passe → 200 + cookie", r.status === 200 && cookie.startsWith("pth_admin="));
  check("cookie HttpOnly + SameSite=Strict", flags.includes("httponly") && flags.includes("samesite=strict"));
  r = await fetch(`${BASE}/admin`, { headers: { cookie } });
  html = await r.text();
  check("avec session : la demande apparaît", r.status === 200 && html.includes("Léa Test") && html.includes("Nouvelle"));
  r = await fetch(`${BASE}/admin`, { headers: { cookie: "pth_admin=falsifie.abc" } });
  check("cookie falsifié → retour à la connexion", (await r.text()).includes("Mot de passe"));
  const id = leadsFile()[0].id;
  r = await post("/api/admin/leads", { id, status: "contacted" });
  check("changer un statut sans session → 401", r.status === 401);
  r = await post("/api/admin/leads", { id, status: "contacted" }, { cookie });
  check("changer un statut avec session → 200", r.status === 200 && leadsFile()[0].status === "contacted", r.status);
  r = await post("/api/admin/leads", { id, status: "n'importe quoi" }, { cookie });
  check("statut invalide → 400", r.status === 400);
  r = await fetch(`${BASE}/api/admin/export`);
  check("export CSV sans session → 401", r.status === 401);
  r = await fetch(`${BASE}/api/admin/export`, { headers: { cookie } });
  const bytes = new Uint8Array(await r.arrayBuffer());
  const csv = new TextDecoder().decode(bytes);
  check("export CSV : BOM UTF-8 (octets EF BB BF), séparateur ;, contenu, téléchargement", bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf && csv.includes(";") && csv.includes("Léa Test") && (r.headers.get("content-disposition") || "").includes("attachment"));
  await post("/api/participate", contact({ name: "=CMD()", email: "inj@example.com" })).catch(() => {});
  r = await post("/api/admin/logout", {});
  check("déconnexion efface le cookie", (r.headers.get("set-cookie") || "").includes("Max-Age=0"));

  console.log("\n— Dons /api/donate (Stripe simulé)");
  const donor = { firstName: "Paul", lastName: "Donateur", email: "paul@example.com", message: "", amount: 25, frequency: "once", website: "" };
  r = await post("/api/donate", donor);
  let json = await r.json();
  check("don valide → 200 + URL de paiement", r.status === 200 && json.url === "https://checkout.stripe.test/pay/cs_test_int", JSON.stringify(json));
  const call = stripeCalls.at(-1);
  check("session Stripe : clé serveur, montant 2500 centimes, paiement unique", call?.auth === "Bearer sk_test_integration" && call.body.get("line_items[0][price_data][unit_amount]") === "2500" && call.body.get("mode") === "payment");
  check("la demande « don » est enregistrée avec le montant", leadsFile().some((l) => l.mode === "donate" && l.payload.amount === "25 €"));
  r = await post("/api/donate", { ...donor, amount: 10, frequency: "monthly" });
  await r.json();
  check("don mensuel → abonnement Stripe", stripeCalls.at(-1).body.get("mode") === "subscription" && stripeCalls.at(-1).body.get("line_items[0][price_data][recurring][interval]") === "month");
  r = await post("/api/donate", { ...donor, amount: 0 });
  json = await r.json();
  check("montant 0 → 422 avec message clair", r.status === 422 && /minimum/i.test(json.error), JSON.stringify(json));
  r = await post("/api/donate", { ...donor, amount: 99999 });
  check("montant énorme → 422", r.status === 422);
  r = await post("/api/donate", { ...donor, website: "bot" });
  check("robot sur /api/donate → faux succès sans appel Stripe", r.status === 200 && stripeCalls.length === 2);

  console.log("\n— Webhook Stripe");
  const event = { id: "evt_1", type: "checkout.session.completed", data: { object: { id: "cs_test_int", payment_status: "paid", mode: "payment", amount_total: 2500, currency: "eur", customer_details: { email: "paul@example.com", name: "Paul Donateur" }, metadata: { lead_id: "x" } } } };
  const raw = JSON.stringify(event);
  const sign = (body, secret = WEBHOOK_SECRET, t = Math.floor(Date.now() / 1000)) => `t=${t},v1=${createHmac("sha256", secret).update(`${t}.${body}`).digest("hex")}`;
  r = await post("/api/webhooks/stripe", raw, { "stripe-signature": sign(raw, "mauvais-secret") });
  check("signature invalide → 400 et rien d'enregistré", r.status === 400 && donationsFile().length === 0);
  r = await post("/api/webhooks/stripe", raw, { "stripe-signature": sign(raw, WEBHOOK_SECRET, Math.floor(Date.now() / 1000) - 3600) });
  check("signature trop ancienne (rejeu) → 400", r.status === 400);
  const before = (log.match(/\[email:dev\]/g) || []).length;
  r = await post("/api/webhooks/stripe", raw, { "stripe-signature": sign(raw) });
  check("signature valide → 200, don « payé » enregistré", r.status === 200 && donationsFile()[0]?.status === "paid" && donationsFile()[0]?.amount_cents === 2500, r.status);
  check("email de remerciement envoyé", (log.match(/\[email:dev\]/g) || []).length === before + 1);
  r = await post("/api/webhooks/stripe", raw, { "stripe-signature": sign(raw) });
  check("même événement rejoué → 200, pas de doublon, pas de 2ᵉ email", r.status === 200 && donationsFile().length === 1 && (log.match(/\[email:dev\]/g) || []).length === before + 1);
  r = await post("/api/webhooks/stripe", JSON.stringify({ id: "evt_2", type: "customer.created", data: { object: {} } }), { "stripe-signature": sign(JSON.stringify({ id: "evt_2", type: "customer.created", data: { object: {} } })) });
  check("événement non géré → 200 ignoré", r.status === 200 && donationsFile().length === 1);

  console.log("\n— Pages");
  r = await fetch(`${BASE}/merci`);
  html = await r.text();
  check("/merci s'affiche, non indexable", r.status === 200 && html.includes("Merci") && html.includes("noindex"));
  r = await fetch(`${BASE}/robots.txt`);
  const robots = await r.text();
  check("robots.txt exclut /admin, /api et /merci", /Disallow: \/admin/.test(robots) && /Disallow: \/api\//.test(robots) && /Disallow: \/merci/.test(robots));
} catch (error) {
  failed++;
  console.error("✖ ERREUR", error.message);
} finally {
  stop();
  console.log(`\n${passed} vérifications réussies, ${failed} échec(s)`);
  process.exit(failed ? 1 : 0);
}
