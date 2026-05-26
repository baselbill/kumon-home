import dynamic from 'next/dynamic'

// Dynamically import with no SSR — the game uses localStorage
const MathGame = dynamic(() => import('@/components/MathGame'), { ssr: false })

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <MathGame />
    </main>
  )
}
