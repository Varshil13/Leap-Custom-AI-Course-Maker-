import { Button } from '../../components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function Header() {
  return (
    <div className='justify-between flex p-5 shadow-sm'>
        
          <Image src="/logo.png" alt="Logo" width={50} height={50} />
       
        <Button>Click Me</Button>
    </div>
  )
}

export default Header