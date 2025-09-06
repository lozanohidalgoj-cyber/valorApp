import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ATRRegistro } from '../types/atr'

type Store = {
  registros: ATRRegistro[]
  add: (r: ATRRegistro) => void
  remove: (id: string) => void
  clear: () => void
}

const Ctx = createContext<Store | null>(null)
const LS_KEY = 'valorApp.registros'

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [registros, setRegistros] = useState<ATRRegistro[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      return raw ? (JSON.parse(raw) as ATRRegistro[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(registros))
    } catch {}
  }, [registros])

  const value = useMemo<Store>(() => ({
    registros,
    add(r) {
      setRegistros(prev => [r, ...prev])
    },
    remove(id) {
      setRegistros(prev => prev.filter(r => r.id !== id))
    },
    clear() {
      setRegistros([])
    },
  }), [registros])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>')
  return ctx
}
