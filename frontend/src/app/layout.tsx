import "./globals.css";

export const metadata = {
  title: "AI Job Assistant",
  description:
    "Plateforme intelligente pour rechercher des offres, analyser les correspondances et préparer vos candidatures.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}