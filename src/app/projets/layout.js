import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageMotion from "@/components/layout/PageMotion";

/** Chrome partagé par /projets et /projets/[slug] : même Header/Footer que l'accueil (pas de layout racine
 * partagé dans ce dépôt — chaque page monte son propre chrome, voir src/app/page.js). */
export default function ProjetsLayout({ children }) {
  return (
    <>
      <Header />
      <main id="contenu">{children}</main>
      <Footer />
      <PageMotion />
    </>
  );
}
