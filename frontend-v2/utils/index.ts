import { useState, useEffect, useMemo } from 'react'
import useSWR, { SWRResponse } from 'swr'
import { API_BASE_URL } from '@/utils/constants'

export const isImageFile = (str: string) => (/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i).test(str)
export const isVideoFile = (str: string) => (/\.(mp4)$/i).test(str)

export const getDiffTime = (date1: number, date2: number) => {
  let difftime = date1 - date2
  const days = Math.floor(difftime / 1000 / 60 / (60 * 24))
  difftime = difftime - days * 1000 * 60 * 60 * 24
  const hours = Math.floor(difftime / 1000 / 60 / 60)
  difftime = difftime - hours * 1000 * 60 * 60
  const minutes = Math.floor(difftime / 1000 / 60)
  difftime = difftime - minutes * 1000 * 60
  const seconds = Math.floor(difftime / 1000)
  return {
    days, hours, minutes, seconds
  }
}

export const caclDiffTime = (time: { [k in string]: any }): { [k in string]: any } => {
  if (time.seconds === 0) {
    time.seconds = 59
    if (time.minutes === 0) {
      time.minutes = 59
      if (time.hours === 0) {
        if (time.days > 0) {
          time.days -= 1
          time.hours = 23
        }
      } else {
        time.hours -= 1
      }
    } else {
      time.minutes -= 1
    }
  } else {
    time.seconds -= 1
  }

  return time
}

export const formatHumanReadableTime = (timeInput: number, timeToCheck: number) => {
  if (timeInput >= timeToCheck) return 'a few seconds ago'
  const { days, hours, seconds, minutes } = getDiffTime(timeToCheck, timeInput)
  let str = ''
  if (days && days > 7) {
    return new Date(timeInput).toUTCString()
  }
  if (days) {
    str += `${days} day${days > 1 ? 's' : ''} `
  } else {
    if (hours) {
      str += `${hours} hour${hours > 1 ? 's' : ''} `
    } else if (minutes) {
      str += `${minutes} minute${minutes > 1 ? 's' : ''} `
    } else if (seconds) {
      str += `${seconds} second${seconds > 1 ? 's' : ''} `
    }
  }
  str += 'ago'
  return str
}

export const debounce = (fn: (any) => void, timer: number) => {
  let timeout: any
  return function (args?: any) {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn(args)
    }, timer)
  }
}

export const formatNumber = (num: number, range = 2) => {
  const lengNum = String(num).length
  if (lengNum < range) {
    const arr = new Array(range - lengNum).fill('0', 0, range - lengNum)
    return arr.join('') + num.toString()
  }
  return num
}

export const shortenAddress = (address: string, symbol = '*', lengHide = 14, lengStars = 10) => {
  address = address || ''
  let stars = ''
  for (let i = 0; i < lengStars; i++) {
    stars += symbol
  }
  return address.slice(0, lengHide) + stars + address.slice(-(lengHide))
}

export function shorten (s: string, max = 12) {
  return s.length > max ? s.substring(0, (max / 2) - 1) + '…' + s.substring(s.length - (max / 2) + 2, s.length) : s
}

type PaginatorInput = {
    current: number;
    last: number;
    betweenFirstAndLast?: number;
};

type Paginator = {
    first: number;
    current: number;
    last: number;
    pages: Array<number>;
    leftCluster: boolean;
    rightCluster: boolean;
};

export const paginator = (options: PaginatorInput): Paginator | null => {
  const current = options.current
  const total = options.last
  const center = [current - 2, current - 1, current, current + 1, current + 2]
  const filteredCenter: number[] = center.filter((p) => p > 1 && p < total)
  const includeThreeLeft = current === 5
  const includeThreeRight = current === total - 4
  const includeLeftDots = current > 5
  const includeRightDots = current < total - 4

  if (includeThreeLeft) filteredCenter.unshift(2)
  if (includeThreeRight) filteredCenter.push(total - 1)

  let leftCluster = false; let rightCluster = false
  if (includeLeftDots) {
    leftCluster = true
  }

  if (includeRightDots) {
    rightCluster = true
  }

  return {
    current,
    first: 1,
    pages: filteredCenter,
    last: total,
    leftCluster,
    rightCluster
  }
}

export const fetcher = (url, ...args) => fetch(url, ...args).then(res => res.json())

export const formatterUSD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

export function formatPrice (price: string): string {
  const priceInFloat = parseFloat(price)
  if (priceInFloat > 1) {
    return `$${priceInFloat.toFixed(4)}`
  }

  const matches = price?.match(/(\.([0])*)/)
  if (!matches?.[0]) {
    return price
  }

  const position = price.indexOf(matches[0])
  return `$${price.slice(0, position + matches[0].length + 4)}`
}

export function printNumber (_n: string | number): string {
  if (typeof _n === 'number') {
    return _n.toLocaleString()
  }

  const n = parseInt(_n)
  if (!n) {
    return _n
  }

  return n.toLocaleString()
}

export const networkImage = (network: string) => {
  switch (network) {
  case 'bsc': {
    return require('assets/images/networks/bsc.svg')
  }

  case 'eth': {
    return require('assets/images/networks/eth.svg')
  }

  case 'polygon': {
    return require('assets/images/networks/polygon.svg')
  }
  }
}

export const useFetch = (url: string, shouldSkip?: boolean) => {
  const [response, setResponse] = useState<SWRResponse | null>(null)
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [loading, setLoading] = useState(true)

  const { data, error: fetchError, mutate } = useSWR(shouldSkip ? null : `${API_BASE_URL}${url}`, fetcher)

  useEffect(() => {
    setLoading(true)
    setResponse(data)
    if (data) {
      if (data.status >= 400) {
        setError(true)
        setErrorMessage(data.message || '')
      }
      setLoading(false)
    }

    if (fetchError) {
      setError(true)
      setErrorMessage(fetchError.message)
      setLoading(false)
    }

    return function () {
      setLoading(false)
    }
  }, [url, shouldSkip, data, fetchError])

  return { response, loading, error, errorMessage, mutate }
}

export function safeToFixed (num: number | string, fixed: number): string {
  const re = new RegExp(`^-?\\d+(?:.\\d{0,${(fixed || -1)}})?`)
  return num.toString().match(re)?.[0] || `${num}`
}

const USER_STATUS = {
  UNVERIFIED: 0,
  ACTIVE: 1,
  BLOCKED: 2,
  DELETED: 3
}

const KYC_STATUS = {
  INCOMPLETE: 0, // Blockpass verifications pending
  APPROVED: 1, // Profile has been approved by Merchant
  RESUBMIT: 2, // Merchant has rejected one or more attributes
  WAITING: 3, // Merchant's review pending
  INREVIEW: 4 // In review by Merchant
}

export const useProfile = (walletAddress?: string) => {
  const skip = useMemo(() => {
    if (!walletAddress) {
      return true
    }

    return false
  }, [walletAddress])
  const { response, loading, error, errorMessage, mutate } = useFetch(`/user/profile?wallet_address=${walletAddress || ''}`, skip)
  const loadingActual = useMemo(() => {
    if (skip) {
      return false
    }

    return loading
  }, [loading, skip])

  const profile = useMemo(() => {
    const exist = !!response?.data?.user
    const verifiedEmail = response?.data?.user?.status === USER_STATUS.ACTIVE
    const verifiedKYC = response?.data?.user?.is_kyc === KYC_STATUS.APPROVED
    const verified = verifiedEmail && verifiedKYC

    const kycStatus = response?.data?.user?.is_kyc === KYC_STATUS.APPROVED
      ? 'Approved'
      : (
        response?.data?.user?.is_kyc === KYC_STATUS.INCOMPLETE
          ? 'Incomplete KYC'
          : (
            response?.data?.user?.is_kyc === KYC_STATUS.RESUBMIT
              ? 'Rejected KYC'
              : (
                response?.data?.user?.is_kyc === KYC_STATUS.WAITING || response?.data?.user?.is_kyc === KYC_STATUS.INREVIEW ? 'Pending KYC' : 'Invalid KYC'
              )
          )
      )
    const verifiedStatus = !walletAddress ? 'Disconnected' : (verifiedKYC ? 'Verified' : (verifiedEmail ? kycStatus : 'Unverified'))

    return {
      exist,
      verified,
      verifiedEmail,
      verifiedKYC,
      verifiedStatus,
      ...response?.data?.user
    }
  }, [response, walletAddress])

  return {
    profile,
    load: mutate,
    loading: loadingActual,
    error,
    errorMessage
  }
}
