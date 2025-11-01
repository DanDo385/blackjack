import '@/styles/globals.css'
import { Providers } from '@/components/Providers'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'YOLO Blackjack',
  description: 'Provably fair multicoin blackjack'
}

export default function RootLayout({ children }:{ children: ReactNode }){
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}


