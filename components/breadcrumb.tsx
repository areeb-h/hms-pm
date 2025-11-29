'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
      <Link href="/" className="hover:text-foreground">
        Home
      </Link>
      {segments.map((segment, index) => (
        <span key={segment} className="flex items-center">
          <span className="mx-2">/</span>
          {index === segments.length - 1 ? (
            <span className="text-foreground capitalize">{segment}</span>
          ) : (
            <Link
              href={`/${segments.slice(0, index + 1).join('/')}`}
              className="hover:text-foreground capitalize"
            >
              {segment}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
