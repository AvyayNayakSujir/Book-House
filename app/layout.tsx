"use client";
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { WalletProvider } from "@/contexts/WalletContext";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BookStore DApp',
  description: 'A decentralized book store',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  )
}
