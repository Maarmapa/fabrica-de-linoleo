export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'Georgia, serif', background: '#faf8f4', color: '#1a1a1a' }}>
        {children}
      </body>
    </html>
  )
}
