import { contact } from "@/content/fr";
import Accent from "@/components/ui/Accent";
import CTAButton from "@/components/ui/CTAButton";
import ParticipationForm from "@/components/form/ParticipationForm";

/**
 * 14 — CONTACT / PARTENARIAT. « Très simple » : une question, « Parlons-en. », un bouton.
 * Le formulaire dynamique vit ici (fin de page) : tous les boutons du site (Hero, cartes de « Soutenir », Membre, Contact)
 * y mènent en présélectionnant le bon mode. Textes du brief (§14) dans `contact` de fr.js.
 */
export default function Contact() {
  return (
    <section
      id={contact.id}
      aria-labelledby="contact-title"
      className="atmo-glow-bottom px-[var(--space-gutter)] py-[var(--space-section)]"
    >
      <div className="mx-auto max-w-[110rem]">
        <div className="mx-auto flex max-w-[56rem] flex-col items-center text-center">
          <h2
            id="contact-title"
            data-reveal
            className="max-w-[20ch] font-sans text-[length:var(--text-headline)] font-normal leading-[1.1] tracking-[-0.05em] text-silver"
          >
            <Accent text={contact.title} />
          </h2>
          <p data-reveal className="mt-6 text-[length:var(--text-lead)] text-ivory-dim">{contact.text}</p>
          <CTAButton href="#participer" mode="contact" variant="solid" arrow data-reveal="fade" className="mt-[var(--space-sub)]">
            {contact.cta}
          </CTAButton>
        </div>

        <ParticipationForm />
      </div>
    </section>
  );
}
