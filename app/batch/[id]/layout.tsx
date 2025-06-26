export default function BatchIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <body
      style={{
        margin: 0,
        padding: 0,
        backgroundColor: "#111",
        minHeight: "100vh",
        width: "100vw",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {children}
    </body>
  );
}
