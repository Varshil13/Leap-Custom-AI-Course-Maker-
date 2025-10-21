'use client';
import React from 'react'
import Sidebar from './_components/Sidebar'
import Header from './_components/Header'
import { usePathname } from 'next/navigation';

function DashboardLayout({ children }) {
    const pathname = usePathname();
    const isLearnCourse = pathname?.includes('/dashboard/learnCourse/');
    return (
        <div>
            {!isLearnCourse && (
                <div className='md:w-64 hidden md:block' >
                    <Sidebar />
                </div>
            )}
            <div className={!isLearnCourse ? 'md:ml-64' : ''}>
                <Header />
                <div className='p-10'>
                {children}
                </div>
            </div>
        </div>
    )
}

export default DashboardLayout