'use client'
import Navbar from '@/components/Navbar'
import StatsCards from '@/components/StatsCards'
import TimeRangeTabs from '@/components/TimeRangeTabs'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { getUserSummary } from '@/lib/api'

export default function Account(){
  const { address } = useAccount()
  const [data,setData] = useState<any>(null)
  
  useEffect(()=>{
    if (!address) return
    getUserSummary(address)
      .then(data => {
        if (data) {
          setData(data)
        }
      })
  },[address])
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


