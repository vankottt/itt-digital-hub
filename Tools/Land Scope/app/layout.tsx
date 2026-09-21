import type { Metadata } from 'next'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import '../src/styles.css'

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Анализатор на населени места',
  description: 'Автоматичен предварителен анализ на български населени места с отворени географски данни.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bg">
      <body>{children}</body>
    </html>
  )
}
