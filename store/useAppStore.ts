import { create } from 'zustand'

export type Shape = 'icosahedron' | 'box' | 'torus' | 'sphere'
export type Phase = 'landing' | 'chat'

interface AppState {
  accentColor: string
  shape: Shape
  spinSpeed: number
  phase: Phase
  setAccentColor: (accentColor: string) => void
  setShape: (shape: Shape) => void
  setSpinSpeed: (spinSpeed: number) => void
  setPhase: (phase: Phase) => void
}

export const useAppStore = create<AppState>((set) => ({
  accentColor: '#ff4400',
  shape: 'icosahedron',
  spinSpeed: 1,
  phase: 'landing',
  setAccentColor: (accentColor) => set({ accentColor }),
  setShape: (shape) => set({ shape }),
  setSpinSpeed: (spinSpeed) => set({ spinSpeed }),
  setPhase: (phase) => set({ phase }),
}))
