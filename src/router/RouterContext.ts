import { createContext, useContext } from 'react'

export interface RouterContextType {
  path: string
  query: URLSearchParams
  navigate: (to: string, options?: { replace?: boolean }) => void
}

export const RouterContext = createContext<RouterContextType | null>(null)

export function useRouter(): RouterContextType {
  const ctx = useContext(RouterContext)
  if (!ctx) {
    throw new Error('useRouter must be used within a RouterProvider')
  }
  return ctx
}
