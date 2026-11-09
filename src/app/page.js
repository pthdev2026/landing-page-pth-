import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Statement from "@/components/sections/Statement";
import Disciplines from "@/components/sections/Disciplines";
import Presentation from "@/components/sections/Presentation";
import Mission from "@/components/sections/Mission";
import Stats from "@/components/sections/Stats";
import Ambition from "@/components/sections/Ambition";
import Origin from "@/components/sections/Origin";
import Promesse from "@/components/sections/Promesse";
import Formats from "@/components/sections/Formats";
import Maison from "@/components/sections/Maison";
import WhyNow from "@/components/sections/WhyNow";
import Support from "@/components/sections/Support";
import Donate from "@/components/sections/Donate";
import Member from "@/components/sections/Member";
import Contact from "@/components/sections/Contact";
import Ending from "@/components/sections/Ending";
import PageMotion from "@/components/layout/PageMotion";
import Diagnostics from "@/components/layout/Diagnostics";
import { footer, site } from "@/content/fr";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.fullName,
  alternateName: site.name,
  description: site.description,
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  logo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/brand/logo-pth.png`,
  sameAs: footer.socials.filter((s) => s.href).map((s) => s.href),
};

/**
 * Home — une scène = une idée :
 * Hero → Énoncé → Qui sommes-nous → Mission → Chiffres → Ambition → Origin → Promesse → Formats → Maison → Pourquoi maintenant → Soutenir → Don → Membre → Contact → Fin.
 */
export default function HomePage() {
  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ivory focus:px-5 focus:py-2.5 focus:text-[length:var(--text-small)] focus:text-ink"
      >
        Aller au contenu
      </a>
      <Header />
      <main id="contenu">
        <Hero />
        <Statement />
        <Disciplines />
        <Presentation />
        <Mission />
        <Stats />
        <Ambition />
        <Origin />
        <Promesse />
        <Formats />
        <Maison />
        <WhyNow />
        <Support />
        <Donate />
        <Member />
        <Contact />
        <Ending />
      </main>
      <Footer />
      {/* Entrées des blocs sans scène dédiée (data-reveal) — monté APRÈS toutes les sections : ses déclencheurs se calculent une fois les scènes épinglées en place. */}
      <PageMotion />
      {/* Panneau de diagnostic : n'existe que si l'adresse contient ?diag (voir Diagnostics.jsx). */}
      <Diagnostics />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
