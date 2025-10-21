import React from 'react'
import Image from 'next/image'
import { UserButton } from '@clerk/nextjs'


function Header() {
  return (
    <div
      className='flex justify-between items-center p-4 h-20'
      style={{
        borderBottom: '1.5px solid var(--border)',
        boxShadow: '0 2px 12px 0 rgba(6,182,212,0.10)', // subtle cyan shadow
        background: 'var(--background)',
      }}
    >
      <Image src="/logo.png" alt="Logo" width={56} height={56} />
      <div className="flex items-center gap-4">
        <UserButton />
      </div>
    </div>
  )
}

export default Header