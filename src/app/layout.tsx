import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Audio Chart Player',
  description: 'A chart player with audio controls and image capture functionality',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
