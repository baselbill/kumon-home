import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kumon Math Adventure 🦉',
  description: 'A fun math learning game for young kids — built on Kumon principles',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-amber-50">
        {children}
      </body>
    </html>
  )
}
