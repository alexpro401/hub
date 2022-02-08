import { useState, useRef, useEffect } from 'react'
import Layout from '@/components/Layout'
import Carousel from '@/components/Pages/INO/Carousel'
import List, { TOKEN_TYPE } from '@/components/Pages/INO/List'
import ListAuction from '@/components/Pages/INO/ListAuction'
import ListOpening from '@/components/Pages/INO/ListOpening'
import ListUpcoming from '@/components/Pages/INO/ListUpcoming'
import { useFetch } from '@/utils'

const INO = () => {
  const [now, setNow] = useState<Date>(new Date())
  const interval = useRef<number | undefined>()
  useEffect(() => {
    interval.current = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(interval.current)
  }, [])

  const { response } = useFetch(`/pools/mysterious-box?token_type=${TOKEN_TYPE}&limit=10&is_featured=1&is_display=1`)

  return (
    <Layout title="GameFi INO">
      <>
        {response?.data?.data?.length ? <Carousel items={response?.data?.data || []} style={{ paddingBottom: '2rem' }} now={now}></Carousel> : <></>}
        <ListAuction now={now} />
        <ListOpening now={now} />
        <ListUpcoming now={now} />
        <List />
      </>
    </Layout>
  )
}

export default INO
