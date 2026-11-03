/**
 * Match a pattern like '/students/:id' or '/students/:id/edit' against a path like '/students/12'
 */
export function matchRoutePattern(
  pattern: string,
  pathname: string,
): { match: boolean; params: Record<string, string> } {
  const patternParts = pattern.replace(/\/$/, '').split('/')
  const pathParts = pathname.replace(/\/$/, '').split('/')

  // Root path check
  if (pattern === '/' && (pathname === '' || pathname === '/')) {
    return { match: true, params: {} }
  }

  if (patternParts.length !== pathParts.length) {
    return { match: false, params: {} }
  }

  const params: Record<string, string> = {}

  for (let i = 0; i < patternParts.length; i++) {
    const pPart = patternParts[i]
    const uPart = pathParts[i]

    if (pPart.startsWith(':')) {
      const paramName = pPart.slice(1)
      params[paramName] = decodeURIComponent(uPart)
    } else if (pPart !== uPart) {
      return { match: false, params: {} }
    }
  }

  return { match: true, params }
}
