import Link from "next/link";

export const metadata = { title: "Mentions légales" };

/**
 * PLACEHOLDER — contenu juridique à rédiger et faire valider avant publication
 * (éditeur, hébergeur, données collectées via le formulaire, durée de conservation, droits RGPD).
 */
export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-[var(--space-gutter)] py-32">
      <Link href="/" className="text-sm uppercase tracking-[0.18em] text-champagne">← Retour</Link>
      <h1 className="mt-10 font-sans text-[length:var(--text-headline)] font-normal leading-[1.1] tracking-[-0.05em] text-silver">Mentions légales</h1>
      <p className="mt-8 text-ivory-dim">Contenu à compléter avant la mise en ligne.</p>
    </main>
  );
}
