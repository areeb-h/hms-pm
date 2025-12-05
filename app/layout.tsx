import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from 'sonner'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NuqsAdapter>{children}</NuqsAdapter>
        <Toaster position="top-right" richColors closeButton expand={false} visibleToasts={4} />
      </body>
    </html>
  )
}
