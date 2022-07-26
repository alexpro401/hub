import React, { useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
const LeftSideBar = ({ className }) => {
  const router = useRouter()
  const isCurrentLink = useCallback((path: string) => {
    return router.pathname === `${path}`
  }, [router])

  return <div className={className} style={{
    background: '#1B1D26',
    boxShadow: 'inset -1px 0px 0px #303442',
    minHeight: '100vh'
    // width: '234px'
  }}>
    <h3 className='mb-11 font-bold text-2xl'>GameFi Pass</h3>
    <div className="grid">
      <div className='mb-6'>
        <div className='flex gap-2 items-center'>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 10.5C9.933 10.5 11.5 8.933 11.5 7C11.5 5.067 9.933 3.5 8 3.5C6.067 3.5 4.5 5.067 4.5 7C4.5 8.933 6.067 10.5 8 10.5Z" stroke={isCurrentLink('/account/profile') ? '#6CDB00' : 'white'} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6.50004 10.1621C6.48788 10.5661 6.34977 10.9562 6.10503 11.2779C5.86029 11.5995 5.52116 11.8366 5.13504 11.9561L2.86804 13.0441C2.77236 13.0843 2.68006 13.1321 2.59204 13.1871" stroke={isCurrentLink('/account/profile') || isCurrentLink('/account') ? '#6CDB00' : 'white'} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.408 13.1881C13.3199 13.1331 13.2276 13.0853 13.132 13.0451L10.867 11.9571C10.035 11.5191 9.50195 11.0241 9.50195 10.1631" stroke={isCurrentLink('/account/profile') || isCurrentLink('/account') ? '#6CDB00' : 'white'} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 15.5C12.1421 15.5 15.5 12.1421 15.5 8C15.5 3.85786 12.1421 0.5 8 0.5C3.85786 0.5 0.5 3.85786 0.5 8C0.5 12.1421 3.85786 15.5 8 15.5Z" stroke={isCurrentLink('/account/profile') || isCurrentLink('/account') ? '#6CDB00' : 'white'} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <Link href={'/account/profile'}><a className={`uppercase text-sm font-bold ${isCurrentLink('/account/profile') || isCurrentLink('/account') ? 'text-gamefiGreen-700' : ''}`}>My ProFile</a></Link>
        </div>
      </div>
      <div className='mb-6'>
        <div className='flex gap-2 items-center'>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 9.5C10.4853 9.5 12.5 7.48528 12.5 5C12.5 2.51472 10.4853 0.5 8 0.5C5.51472 0.5 3.5 2.51472 3.5 5C3.5 7.48528 5.51472 9.5 8 9.5Z" stroke={isCurrentLink('/account/rank') ? '#6CDB00' : 'white'} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11.5 10.5V15.5L8 13.5L4.5 15.5V10.5" stroke={isCurrentLink('/account/rank') ? '#6CDB00' : 'white'} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <Link href={'/account/rank'}><a className={`uppercase text-sm font-bold ${isCurrentLink('/account/rank') ? 'text-gamefiGreen-700' : ''}`}>My Rank</a></Link>
        </div>
      </div>
      {/* <div className='mb-6'>
        <div className='flex gap-2 items-center'>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 9.5C10.4853 9.5 12.5 7.48528 12.5 5C12.5 2.51472 10.4853 0.5 8 0.5C5.51472 0.5 3.5 2.51472 3.5 5C3.5 7.48528 5.51472 9.5 8 9.5Z" stroke={isCurrentLink('/account/gxp') ? '#6CDB00' : 'white'} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11.5 10.5V15.5L8 13.5L4.5 15.5V10.5" stroke={isCurrentLink('/account/gxp') ? '#6CDB00' : 'white'} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <Link href={'/account/gxp'}><a className={`uppercase text-sm font-bold ${isCurrentLink('/account/gxp') ? 'text-gamefiGreen-700' : ''}`}>My GXP</a></Link>
        </div>
      </div> */}
      <div className='mb-6'>
        <div className='flex gap-2 items-center'>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 9.5C10.4853 9.5 12.5 7.48528 12.5 5C12.5 2.51472 10.4853 0.5 8 0.5C5.51472 0.5 3.5 2.51472 3.5 5C3.5 7.48528 5.51472 9.5 8 9.5Z" stroke={isCurrentLink('/account/gxp') ? '#6CDB00' : 'white'} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11.5 10.5V15.5L8 13.5L4.5 15.5V10.5" stroke={isCurrentLink('/account/gxp') ? '#6CDB00' : 'white'} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <Link href={'/account/gxp'}><a className={`uppercase text-sm font-bold ${isCurrentLink('/account/gxp') ? 'text-gamefiGreen-700' : ''}`}>My GXP</a></Link>
        </div>
      </div>
      <div className='mb-6'>
        <div className='flex gap-2 items-center'>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.5 0.5H1.5C0.948 0.5 0.5 0.948 0.5 1.5V11.5C0.5 12.052 0.948 12.5 1.5 12.5H5.5L8 15.5L10.5 12.5H14.5C15.052 12.5 15.5 12.052 15.5 11.5V1.5C15.5 0.948 15.052 0.5 14.5 0.5Z" stroke={isCurrentLink('/account/review') ? '#6CDB00' : 'white'} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3.5 4.5H12.5" stroke={isCurrentLink('/account/review') ? '#6CDB00' : 'white'} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3.5 8.5H12.5" stroke={isCurrentLink('/account/review') ? '#6CDB00' : 'white'} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>

          <Link href={'/account/review'}><a className={`uppercase text-sm font-bold ${isCurrentLink('/account/review') ? 'text-gamefiGreen-700' : ''}`}>My Review</a></Link>
        </div>
      </div>
      <div className='mb-6'>
        <div className='flex gap-2 items-center'>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.5 0.5H2.5C1.948 0.5 1.5 0.948 1.5 1.5V15.5L4 13.5L6 15.5L8 13.5L10 15.5L12 13.5L14.5 15.5V1.5C14.5 0.948 14.052 0.5 13.5 0.5Z" stroke={isCurrentLink('/account/pools') ? '#6CDB00' : 'white'} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4.5 5.5H11.5" stroke={isCurrentLink('/account/pools') ? '#6CDB00' : 'white'} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4.5 9.5H11.5" stroke={isCurrentLink('/account/pools') ? '#6CDB00' : 'white'} strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <Link href={'/account/pools'}><a className={`uppercase text-sm font-bold ${isCurrentLink('/account/pools') ? 'text-gamefiGreen-700' : ''}`}>IGO Pools</a></Link>
        </div>
      </div>
      <div className='mb-6'>
        <div className='flex gap-2 items-center'>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 14.5C13.3807 14.5 14.5 13.3807 14.5 12C14.5 10.6193 13.3807 9.5 12 9.5C10.6193 9.5 9.5 10.6193 9.5 12C9.5 13.3807 10.6193 14.5 12 14.5Z" stroke={isCurrentLink('/account/collections/assets') || isCurrentLink('/account/collections/on-sale') || isCurrentLink('/account/collections/favorites') ? '#6CDB00' : 'white'} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 6.5C5.38071 6.5 6.5 5.38071 6.5 4C6.5 2.61929 5.38071 1.5 4 1.5C2.61929 1.5 1.5 2.61929 1.5 4C1.5 5.38071 2.61929 6.5 4 6.5Z" stroke={isCurrentLink('/account/collections/assets') || isCurrentLink('collections/on-sale') || isCurrentLink('collections/favorites') ? '#6CDB00' : 'white'} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14.5 1.5H9.5V6.5H14.5V1.5Z" stroke={isCurrentLink('/account/collections/assets') || isCurrentLink('/account/collections/on-sale') || isCurrentLink('/account/collections/favorites') ? '#6CDB00' : 'white'} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6.5 9.5H1.5V14.5H6.5V9.5Z" stroke={isCurrentLink('/account/collections/assets') || isCurrentLink('/account/collections/on-sale') || isCurrentLink('/account/collections/favorites') ? '#6CDB00' : 'white'} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className='flex gap-2 items-center justify-between'>
            <Link href={'/account/collections/assets'}>
              <a className={`uppercase text-sm font-bold block ${isCurrentLink('/account/collections/assets') || isCurrentLink('/account/collections/on-sale') || isCurrentLink('/account/collections/favorites') ? 'text-gamefiGreen-700' : ''}`}>Collections</a>
            </Link>
          </div>
        </div>
        <div className='pl-10 mt-4'>
          <div className='flex gap-2 items-center mb-4'>
            <Link href={'/account/collections/assets'}><a className={`uppercase text-sm font-bold ${isCurrentLink('/account/collections/assets') ? 'text-gamefiGreen-700' : ''}`}>All Assets</a></Link>
          </div>
          <div className='flex gap-2 items-center mb-4'>
            <Link href={'/account/collections/on-sale'}><a className={`uppercase text-sm font-bold ${isCurrentLink('/account/collections/on-sale') ? 'text-gamefiGreen-700' : ''}`}>On sale </a></Link>
          </div>
          <div className='flex gap-2 items-center mb-4'>
            <Link href={'/account/collections/favorites'}><a className={`uppercase text-sm font-bold ${isCurrentLink('/account/collections/favorites') ? 'text-gamefiGreen-700' : ''}`}>Favorites</a></Link>
          </div>
        </div>
      </div>
    </div>
  </div>
}

export default LeftSideBar
