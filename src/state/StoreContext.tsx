import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ATRRegistro, ATRSaldoRow } from '../types/atr'

type Store = {
  registros: ATRRegistro[]
  add: (r: ATRRegistro) => void
  remove: (id: string) => void
  clear: () => void
  saldoATR: ATRSaldoRow[]
  setSaldoATR: (rows: ATRSaldoRow[]) => void
}

const Ctx = createContext<Store | null>(null)
const LS_KEY = 'valorApp.registros'
const LS_SALDO_KEY = 'valorApp.saldoATR'

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [registros, setRegistros] = useState<ATRRegistro[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      return raw ? (JSON.parse(raw) as ATRRegistro[]) : []
    } catch {
      return []
    }
  })
  const [saldoATR, setSaldoATRState] = useState<ATRSaldoRow[]>(() => {
    try {
      const raw = localStorage.getItem(LS_SALDO_KEY)
      return raw ? (JSON.parse(raw) as ATRSaldoRow[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(registros))
    } catch {}
  }, [registros])

  useEffect(() => {
    try {
      localStorage.setItem(LS_SALDO_KEY, JSON.stringify(saldoATR))
    } catch {}
  }, [saldoATR])

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
    saldoATR,
    setSaldoATR(rows) {
      setSaldoATRState(rows)
    }
  }), [registros, saldoATR])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>')
  return ctx
}
