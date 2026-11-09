import Link from "next/link";
import { thanks } from "../../content/fr.js";

export const metadata = { title: "Merci", robots: { index: false, follow: false } };

/** Page de retour après un paiement. Wording à valider (`thanks` dans fr.js). Non indexée. */
export default function ThanksPage() {
  return (
    <main className="mx-auto grid min-h-svh max-w-2xl place-items-center px-[var(--space-gutter)] py-24 text-center">
      <div>
        <h1 className="font-sans text-[length:var(--text-headline)] font-normal leading-[1.1] tracking-[-0.05em] text-silver">{thanks.title}</h1>
        <p className="mx-auto mt-6 max-w-[40ch] text-[length:var(--text-lead)] leading-snug text-ivory-dim">{thanks.text}</p>
        <Link href="/" className="mt-10 inline-flex min-h-12 items-center rounded-full bg-ivory px-8 text-[length:var(--text-small)] font-medium text-ink">
          {thanks.back}
        </Link>
      </div>
    </main>
  );
}
