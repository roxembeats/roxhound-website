'use client'

import dynamic from 'next/dynamic'
import ChatWidget from '@/components/ChatWidget'
import { useAppStore } from '@/store/useAppStore'

const Scene = dynamic(() => import('@/components/Scene'), { ssr: false })

export default function Home() {
  const phase = useAppStore((s) => s.phase)

  return (
    <main className="w-screen h-screen bg-black overflow-hidden">
      <Scene />
      <ChatWidget />
    </main>
  )
}
