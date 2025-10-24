'use client'
import { Button } from '../../../components/ui/button';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import React, { use } from 'react'

function Addcourse() {
    const {user} = useUser();

  return (
  <div className='flex justify-between items-center '>
    <div className='p-5'>
      <h2 className='text-3xl text-foreground'>Hello, 
        <span className='font-bold text-primary'>{user?.fullName}</span>
        </h2>
        
    </div>
    <Link href='/createCourse'>
      <Button>+ Create Course</Button>
    </Link>
  </div>
  )
}

export default Addcourse