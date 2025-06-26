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
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#111", // siyah zemin
          color: "#fff", // beyaz yazı
          fontFamily: "sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
