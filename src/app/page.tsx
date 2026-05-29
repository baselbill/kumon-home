import dynamic from 'next/dynamic'

const MathGame = dynamic(() => import('@/components/MathGame'), { ssr: false })

export default function Home() {
  return <MathGame />
}
