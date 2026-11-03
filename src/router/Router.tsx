import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type FC,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { RouterContext, useRouter } from './RouterContext'

export const RouterProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUrl, setCurrentUrl] = useState<string>(() => window.location.pathname + window.location.search)

  useEffect(() => {
    const handlePopState = () => {
      setCurrentUrl(window.location.pathname + window.location.search)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
      window.history.replaceState({}, '', to)
    } else {
      window.history.pushState({}, '', to)
    }
    setCurrentUrl(window.location.pathname + window.location.search)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const [path, queryString] = currentUrl.split('?')
  const query = useMemo(() => new URLSearchParams(queryString || ''), [queryString])

  return (
    <RouterContext.Provider value={{ path, query, navigate }}>
      {children}
    </RouterContext.Provider>
  )
}

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string
  replace?: boolean
  children: ReactNode
}

export const Link: FC<LinkProps> = ({ to, replace, onClick, children, ...rest }) => {
  const { navigate } = useRouter()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e)
    if (
      !e.defaultPrevented &&
      e.button === 0 &&
      !e.metaKey &&
      !e.altKey &&
      !e.ctrlKey &&
      !e.shiftKey
    ) {
      e.preventDefault()
      navigate(to, { replace })
    }
  }

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}
