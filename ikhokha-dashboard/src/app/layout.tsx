import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'iKhokha Dashboard',
  description: 'Sales insights from your iKhokha transactions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}
