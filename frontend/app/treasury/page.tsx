'use client'
import Navbar from '@/components/Navbar'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useEffect, useState } from 'react'
import { getTreasuryOverview } from '@/lib/api'

const COLORS = ['#3b82f6','#22c55e','#eab308','#ef4444','#a855f7']

export default function Treasury(){
  const [data, setData] = useState<any>(null)

  useEffect(()=>{
    getTreasuryOverview()
      .then(data => {
        if (data) {
          setData(data)
        }
      })
  },[])

  const positions = data?.positions || []
  const pnl = data?.equitySeries || []

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto p-4">
        <h1 className="text-2xl font-bold">Treasury Vault</h1>
        <p className="opacity-70 mb-4">Aggregated assets & strategies (read-only)</p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border p-4">
            <h3 className="font-semibold mb-2">Allocation</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={positions} dataKey="pct" nameKey="token" outerRadius={100}>
                  {positions.map((e:any, i:number) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <ul className="mt-2 text-sm">{positions.map((p:any,i:number)=><li key={i}>{p.token}: {p.pct}%</li>)}</ul>
          </div>
          <div className="rounded-xl border p-4">
            <h3 className="font-semibold mb-2">Equity (ref USDC)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={pnl}>
                <XAxis dataKey="d"/>
                <YAxis/>
                <Tooltip/>
                <Line type="monotone" dataKey="v" dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </>
  )
}


