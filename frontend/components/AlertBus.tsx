'use client'
import { Toaster, toast } from 'react-hot-toast'
import { useEffect } from 'react'

export function AlertBus(){
  useEffect(()=>{
    setTimeout(()=>toast('Welcome to the Thunderdome 🏀'), 600)
    setTimeout(()=>toast('Testing, testing, testing 🎤'), 1200)
  },[])
  return <Toaster position="top-right" />
}


