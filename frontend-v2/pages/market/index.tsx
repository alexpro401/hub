import React from 'react'
import Layout from 'components/Layout'
import Image from 'next/image'
import Link from 'next/link'
import HotCollections from 'components/Pages/Market/HotCollections'
// import HotAuctions from 'components/Pages/Market/HotAuctions'
import ListTrending from 'components/Pages/Market/ListTrending'
import Discover from 'components/Pages/Market/Discover'

const Market = () => {
  return (
    <Layout title="GameFi Market">
      <div className="relative w-full min-h-full pt-28">
        <div
          className="absolute top-0 right-0"
          style={{
            background: 'radial-gradient(74.55% 74.55% at 19.72% 25.45%, #C5BD06 0%, #00FF0A 100%)',
            width: '250px',
            height: '559px',
            opacity: '0.1',
            filter: 'blur(184px)'
          }}
        ></div>
        {/* <div className="absolute bottom-0 right-0">
          <Image src={require('assets/images/bg-item-market.png')} width="221" height="247" alt=""></Image>
        </div> */}
        <div className="md:px-4 lg:px-16 md:container mx-auto lg:block text-center">
          <Image src={require('assets/images/market-banner.png')} alt="" className="-z-0"></Image>
          {/* <Link href="/account/collections/assets">
            <a className="inline-block px-4 py-2 border border-gamefiGreen-500 text-gamefiGreen-500 bg-gamefiDark-800 hover:text-gamefiGreen-300 rounded text-base font-semibold">Your Assets</a>
          </Link> */}
        </div>
        {/* <HotCollections></HotCollections> */}
        {/* <HotAuctions></HotAuctions> */}
        {/* <ListTrending></ListTrending> */}
        {/* <Discover></Discover> */}
      </div>
    </Layout>
  )
}

export default Market
