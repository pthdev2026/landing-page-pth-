import { Anton, Inter_Tight, Archivo } from "next/font/google";
import "./globals.css";
import { site } from "@/content/fr";

const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton", display: "swap" });
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", display: "swap" });
// Sous-titres de l'intro (question / réponse) : grotesque à largeur variable (axe wdth), utilisée en 300 et 700.
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${site.name} — ${site.fullName}`, template: `%s · ${site.name}` },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: site.fullName,
    title: `${site.name} — ${site.vision}`,
    description: site.description,
  },
  twitter: { card: "summary_large_image", title: `${site.name} — ${site.vision}`, description: site.description },
};

export const viewport = { themeColor: "#050505" };

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${anton.variable} ${interTight.variable} ${archivo.variable}`}>
      <head>
        {/* Le globe (section Chiffres) charge ses tuiles depuis CARTO en différé, au scroll (voir Globe.jsx) : la
            connexion est ouverte d'avance pour que la première tuile arrive plus vite le moment venu, sans rien
            bloquer au chargement de la page (aucune requête n'est faite ici, juste la connexion). */}
        <link rel="preconnect" href="https://basemaps.cartocdn.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://basemaps.cartocdn.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
