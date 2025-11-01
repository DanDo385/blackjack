import Navbar from '@/components/Navbar'
import TableCanvas from '@/components/TableCanvas'
import { AlertBus } from '@/components/AlertBus'

export default function Play(){
  return (<><Navbar/><AlertBus/><main className="p-4"><TableCanvas/></main></>)
}


