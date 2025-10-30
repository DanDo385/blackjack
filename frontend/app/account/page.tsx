'use client'
import Navbar from '@/components/Navbar'
import StatsCards from '@/components/StatsCards'
import TimeRangeTabs from '@/components/TimeRangeTabs'
import { useEffect, useState } from 'react'

export default function Account(){
  const [data,setData] = useState<any>(null)
  useEffect(()=>{
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/user/summary`)
      .then(r=>r.json()).then(setData)
  },[])
  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-3">Account Summary</h1>
        <TimeRangeTabs onPick={()=>{}} />
        {data && <StatsCards data={data} />}
      </main>
    </>
  )
}


