'use client'
import { Button } from '../../../components/ui/button';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import React, { use } from 'react'

function Addcourse() {
    const {user} = useUser();

  return (
  <div className='flex justify-between items-center '>
    <div>
      <h2 className='text-3xl text-foreground'>Hello, 
        <span className='font-bold text-primary'>{user?.fullName}</span></h2>
        <p className='text-sm' style={{ color: 'var(--muted-foreground)' }}>Create new course with AI</p>
    </div>
    <Link href='/createCourse'>
      <Button>+ Create AI Course</Button>
    </Link>
  </div>
  )
}

export default Addcourse