import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Short Lets — Premium Short-Term Rentals',
  description: 'Browse and book our selection of premium short-term rental properties.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <a href="/" className="text-xl font-bold">
              Short Lets
            </a>
            <nav className="flex gap-4 text-sm">
              <a href="/properties" className="hover:text-blue-600">
                Properties
              </a>
              <a href="/admin" className="hover:text-blue-600">
                Admin
              </a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t bg-white mt-12">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Short Lets. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  )
}
