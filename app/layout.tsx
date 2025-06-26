export const metadata = {
  title: "Seranova QR",
  description: "QR Kod ile Batch Takibi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
