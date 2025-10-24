"use client"

import React, { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '../../components/ui/button'

function Hero() {
  useEffect(() => {
    // disable page scroll while Hero is mounted
    const prevHtmlOverflow = document.documentElement.style.overflow
    const prevBodyOverflow = document.body.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow || ''
      document.body.style.overflow = prevBodyOverflow || ''
    }
  }, [])
  return (
  <section className="relative h-screen box-border flex items-start justify-center pt-16 sm:pt-20 lg:pt-24 bg-gradient-to-br from-background via-background to-muted overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
  <div className="absolute top-4 left-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
  <div className="absolute bottom-24 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
        <div className="max-w-4xl mx-auto max-h-[70vh] overflow-hidden">
          {/* Badge */}
            {/* Badge removed as requested */}
          
          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in-up animation-delay-100">
            Create Custom AI-Powered Courses{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Instantly
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            LEAP empowers learners and educators to generate personalized, professional courses using advanced AI. Start your journey to smarter learning and teaching today.
          </p>
          
          {/* CTA Button */}
          <div className="flex justify-center items-center animate-fade-in-up animation-delay-300">
            <Link href="/dashboard" passHref >
              <Button 
                size="lg" 
                className="px-8 py-4 text-lg font-semibold bg-primary hover:bg-primary/90 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
          </div>
          
          {/* Stats or features */}
            {/* Stats or features removed as requested */}
        </div>
      </div>
      
      {/* Scroll indicator */}
  <div className="absolute bottom-40 lg:bottom-44 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center">
          <div className="w-1 h-3 bg-muted-foreground rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}

export default Hero