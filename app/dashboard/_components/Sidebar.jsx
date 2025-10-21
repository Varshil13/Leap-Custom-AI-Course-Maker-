'use client'
import React from 'react'
import Image from 'next/image'
import {HiOutlineHome, HiOutlinePower, HiOutlineShieldCheck, HiOutlineSquare3Stack3D} from 'react-icons/hi2'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Progress } from '../../../components/ui/progress'

function Sidebar() {
    

    const MenuItems= [
        {id:1,name:'Home',icon:<HiOutlineHome />,path:'/dashboard'},
        {id:2,name:'Upgrade',icon:<HiOutlineShieldCheck />,path:'/dashboard/upgrade'},
      ]  
    
    const path = usePathname();
      return (
        <div
            className='fixed h-full p-5 w-64 shadow-md'
            style={{ background: 'var(--sidebar)', color: 'var(--sidebar-foreground)', borderRight: '1px solid var(--sidebar-border)' }}
        >
            <div className='flex items-center gap-3 mb-5'>
                <Image src="/logo.png" alt="Logo" width={80} height={80} />
                <h1 className='text-4xl font-bold' style={{ color: 'var(--primary)' }}>Leap</h1>
            </div>
            <hr className='my-5' style={{ borderColor: 'var(--sidebar-border)' }} />

            <ul>
                {MenuItems.map((item, index) => (
                    <Link href={item.path} key={index}>
                        <div
                            className={`flex items-center mb-2.5 gap-2 p-3 cursor-pointer rounded-lg transition-colors duration-150 ${item.path == path ? 'font-semibold' : ''}`}
                            style={{
                                color: item.path == path ? 'var(--sidebar-primary-foreground)' : 'var(--sidebar-foreground)',
                                background: item.path == path ? 'var(--sidebar-primary)' : 'transparent',
                            }}
                            onMouseOver={e => {
                                if (item.path !== path) {
                                    e.currentTarget.style.background = 'var(--sidebar-accent)';
                                    e.currentTarget.style.color = 'var(--sidebar-accent-foreground)';
                                }
                            }}
                            onMouseOut={e => {
                                if (item.path !== path) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'var(--sidebar-foreground)';
                                }
                            }}
                        >
                            <div className='text-4xl'>{item.icon}</div>
                            <h2>{item.name}</h2>
                        </div>
                    </Link>
                ))}
            </ul>
            <hr className='my-5' style={{ borderColor: 'var(--sidebar-border)' }} />
            {/* Progress Bar */}
            <div className='absolute bottom-10 w-[80%]'>
                <Progress value={60} />
                <h2 className='text-sm my-2' style={{ color: 'var(--sidebar-foreground)' }}> 3 out of 5 courses created</h2>
                <h2 className='text-xs' style={{ color: 'var(--muted-foreground)' }}>Upgrade your plan for unlimited course generation </h2>
            </div>
        </div>
  )
}

export default Sidebar