import type { Metadata } from 'next'
import './globals.css'

// Nunito variable font — design system typeface (weights 400–900)
// Replaces Comic Sans. See DESIGN.md for full rationale.
import { Nunito } from 'next/font/google'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-nunito',
  display: 'swap',
})

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
    <html lang="en" className={nunito.variable}>
      <body>
        {children}
      </body>
    </html>
  )
}
