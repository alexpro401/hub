import React, { useCallback, useEffect, useState, useMemo } from 'react'
import PoolDetail from '@/components/Base/PoolDetail'
import clsx from 'clsx'
import styles from './MysteryBoxDetail.module.scss'
import { ButtonBase } from '@/components/Base/Buttons'
import CountDownTimeV1, { CountDownTimeType } from '@/components/Base/CountDownTime'
import { TabPanel, Tabs } from '@/components/Base/Tabs'
import PresaleBoxAbi from '@/components/web3/abis/PreSaleBox.json'
import Erc721Abi from '@/components/web3/abis/Erc721.json'
import { Contract, BigNumber, constants } from 'ethers'
import { ObjectType } from '@/utils/types'
import TokenItem from './TokenItem'
import BoxTypeItem from './BoxTypeItem'
import DetailPoolItem from './DetailPoolItem'
import RuleIntroduce from './RuleIntroduce'
import SerieContent from './SerieContent'
import { useMyWeb3 } from '@/components/web3/context'
import { useLibraryDefaultFlexible, useMyBalance, useTokenAllowance, useTokenApproval } from '@/components/web3/utils'
import { fetcher, isNumber } from '@/utils'
import { API_BASE_URL } from '@/utils/constants'
import { useCheckJoinPool, useJoinPool } from '@/hooks/useJoinPool'
import Alert from '@/components/Base/Alert'
import InfoBoxOrderItem from './InfoBoxOrderItem'
import BannerImagePool from './BannerImagePool'
import AscDescAmount from './AscDescAmount'
import TimeLine from './TimeLine'
import { getTimelineOfPool } from '@/utils/pool'
import { useAppContext } from '@/context'
import PlaceOrderModal from './PlaceOrderModal'
import toast from 'react-hot-toast'
import BuyBoxModal from './BuyBoxModal'
import stylesBoxType from './BoxTypeItem.module.scss'
import BoxInformation from './BoxInformation'
import WrapperPoolDetail from './WrapperPoolDetail'
import Link from 'next/link'
import { getNetworkByAlias } from '@/components/web3'
import Collection from './Collection'
import { getTierById } from '@/utils/tiers'
import Progress from './Progress'
import Modal from '@/components/Base/Modal'
import Tippy from '@tippyjs/react'

const MysteryBoxDetail = ({ poolInfo }: any) => {
  const eventId = 0
  const tiersState = useAppContext()?.$tiers
  const userTier = tiersState?.state?.data?.tier || 0
  const { account, chainID, library } = useMyWeb3()
  const [boxTypes, setBoxTypes] = useState<any[]>([])
  const [boxSelected, setBoxSelected] = useState<ObjectType>({})
  const [currencySelected, setCurrencySelected] = useState<ObjectType>({})
  const [myBoxOrdered, setMyBoxOrdered] = useState(0)
  const [currentTab, setCurrentTab] = useState(0)
  const [amountBoxBuy, setAmountBoxBuy] = useState(0)
  const [countdown, setCountdown] = useState<CountDownTimeType & { title: string;[k: string]: any }>({ date1: 0, date2: 0, title: '' })
  const [timelinePool, setTimelinePool] = useState<ObjectType>({})
  const [timelines, setTimelines] = useState<ObjectType<{
    title: string;
    desc: string;
    current?: boolean;
  }>>({})
  const [openPlaceOrderModal, setOpenPlaceOrderModal] = useState(false)
  const [openBuyBoxModal, setOpenBuyBoxModal] = useState(false)
  const [loadingCollection, setLoadingCollection] = useState(false)
  // const [collections, setCollections] = useState<ObjectType[]>([])
  const [ownedBox, setOwnedBox] = useState(0)
  const balanceInfo = useMyBalance(currencySelected as any, poolInfo.network_available)
  const [supplyBox, setSupplyBox] = useState({ total: 0, sold: 0 })
  const [showApplyWhitelist, setShowApplyWhitelist] = useState(false)

  const [formData, setFormData] = useState({
    email: ''
  })

  const setEmail = useCallback((v) => {
    setFormData(_formData => ({
      ..._formData,
      email: v
    }))
  }, [])

  const { isJoinPool, loading: loadingCheckJPool, checkJoinPool } = useCheckJoinPool(poolInfo?.id, account)
  const { joinPool, loading: loadingJPool, success: isJoinSuccess } = useJoinPool(poolInfo?.id, account, formData.email)

  useEffect(() => {
    if (!poolInfo.id) {
      return
    }

    const fetchSubmission = async () => {
      try {
        const submission = await fetcher(`${API_BASE_URL}/user/whitelist-apply/previous?wallet_address=${account}&campaign_id=${poolInfo.id}`)
        setEmail(submission?.data?.email || '')
      } catch (e) {
        return null
      }
    }
    if (isJoinPool) {
      fetchSubmission()
    }
  }, [isJoinPool, account, poolInfo.id, setEmail])

  const handleJoinPool = useCallback(async () => {
    if (!formData.email) {
      toast.error('Email required')
      return
    }

    if (!formData.email.match(/^\w+([\\.-]?\w+)*@\w+([\\.-]?\w+)*(\.\w{2,3})+$/)) {
      toast.error('Email is not correct')
      return
    }

    await joinPool().finally(() => {
      setShowApplyWhitelist(false)
      checkJoinPool()
    })
  }, [checkJoinPool, formData.email, joinPool])

  const networkPool = useMemo(() => {
    const network = getNetworkByAlias(poolInfo.network_available)
    return network
  }, [poolInfo])

  const isValidChain = useMemo(() => {
    return networkPool?.id === chainID
  }, [networkPool, chainID])
  const poolRank = useMemo(() => {
    return getTierById(poolInfo?.min_tier)
  }, [poolInfo])

  useEffect(() => {
    if (!account) return
    tiersState.actions.getUserTier(account)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])
  const { provider: libraryDefaultTemporary } = useLibraryDefaultFlexible(poolInfo?.network_available)
  const [myBoxThisPool, setMyBoxThisPool] = useState(0)
  const erc721Contract = useMemo(() => {
    if (!libraryDefaultTemporary || !poolInfo.token) return
    const contract = new Contract(poolInfo.token, Erc721Abi, libraryDefaultTemporary)
    return contract
  }, [libraryDefaultTemporary, poolInfo])

  const presaleContract = useMemo(() => {
    if (!poolInfo.campaign_hash || !libraryDefaultTemporary) return
    const contract = new Contract(poolInfo.campaign_hash, PresaleBoxAbi, libraryDefaultTemporary)
    return contract
  }, [poolInfo, libraryDefaultTemporary])

  const remainingBox = supplyBox.total - supplyBox.sold

  const maxBoxCanBuy = useMemo(() => {
    const currentTier = poolInfo.tiers.find(t => t.level === userTier)
    const ticketAllow = currentTier?.ticket_allow || 0

    if (myBoxThisPool <= 0) {
      return ticketAllow
    }

    if (ticketAllow <= remainingBox) {
      return ticketAllow
    }
    return myBoxThisPool + remainingBox
  }, [poolInfo, userTier, remainingBox, myBoxThisPool])

  const getMyBoxThisPool = useCallback(async () => {
    try {
      const myBox = await presaleContract.userBought(eventId, account)
      setMyBoxThisPool(myBox.toNumber())
    } catch (error) {
      console.debug('er', error)
    }
  }, [presaleContract, account])

  const getMyNumBox = useCallback(async () => {
    try {
      const myNumBox = await erc721Contract.balanceOf(account)
      setOwnedBox(myNumBox.toString() || 0)
    } catch (error) {
      console.debug(error)
    }
  }, [erc721Contract, account])

  const getSupplyBoxes = useCallback(async () => {
    const boxes = poolInfo.boxTypesConfig || []
    if (!presaleContract) return boxes
    const listBoxes = await Promise
      .all(boxes.map((b, subBoxId) => new Promise((resolve) => {
        presaleContract.subBoxes(eventId, subBoxId).then(res => {
          resolve({
            ...b,
            subBoxId,
            maxSupply: res.maxSupply ? res.maxSupply.toNumber() : 0,
            totalSold: res.totalSold ? res.totalSold.toNumber() : 0
          })
        }).catch(error => {
          console.debug('err', error)
          resolve({ ...b, subBoxId })
        })
      })))
      .then((boxes) => {
        return boxes
      })
      .catch(err => {
        console.debug('err', err)
        return boxes
      })
    return listBoxes
  }, [poolInfo, presaleContract])

  const handleSetSupplyBoxes = useCallback(async () => {
    const boxes = await getSupplyBoxes()
    if (!boxes?.length) return
    setBoxTypes(boxes)
    setBoxSelected(boxes[0])
  }, [getSupplyBoxes])

  useEffect(() => {
    handleSetSupplyBoxes()
  }, [handleSetSupplyBoxes])

  useEffect(() => {
    const handleSetSupplyBox = () => {
      getSupplyBoxes().then(boxes => {
        const sl = boxes.reduce((sl, box) => {
          sl.total += box.maxSupply || 0
          sl.sold += box.totalSold || 0
          return sl
        }, { total: 0, sold: 0 })
        setSupplyBox(sl)
      })
    }
    handleSetSupplyBox()
    const interval = setInterval(() => {
      handleSetSupplyBox()
    }, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [getSupplyBoxes])

  useEffect(() => {
    if (!presaleContract || !account) {
      setMyBoxThisPool(0)
      return
    }
    getMyBoxThisPool()
  }, [presaleContract, account, getMyBoxThisPool])

  const onCloseBuyBoxModal = useCallback((isReset?: boolean) => {
    setOpenBuyBoxModal(false)
    if (isReset) {
      getMyBoxThisPool()
      getMyNumBox()
      handleSetSupplyBoxes()
      setAmountBoxBuy(0)
    }
  }, [getMyBoxThisPool, getMyNumBox, handleSetSupplyBoxes])

  const onSetCountdown = useCallback(() => {
    if (poolInfo) {
      const isAccIsBuyPreOrder = userTier >= poolInfo.pre_order_min_tier
      const timeLine = getTimelineOfPool(poolInfo)
      setTimelinePool(timeLine)
      const neededApplyWl = !!timeLine.startJoinPooltime
      const timeLinesInfo: { [k: string]: any } = {
        1: {
          title: 'INTRODUCTION',
          desc: `Stay tuned and prepare to ${neededApplyWl ? 'APPLY WHITELIST' : 'BUY'}.`
        }
      }

      if (neededApplyWl) {
        timeLinesInfo[2] = {
          title: 'WHITELISTING',
          desc: 'Click the [APPLY WHITELIST] button to register for Phase 1.'
        }
      }

      if (timeLine.freeBuyTime) {
        timeLinesInfo[!neededApplyWl ? 2 : 3] = {
          title: 'BUYING - PHASE 1',
          desc: neededApplyWl ? `Whitelist registrants will be given favorable deals to buy ${poolInfo.process === 'only-buy' ? 'Ticket' : 'Mystery Box'} on a First-Come First-Served basis.` : `You can buy ${poolInfo.process === 'only-buy' ? 'Ticket' : 'Mystery Box'} before the Buy Phase ends`
        }
        timeLinesInfo[!neededApplyWl ? 3 : 4] = {
          title: 'BUYING - PHASE 2',
          desc: 'Phase 2 will start right after Phase 1 ends. Remaining boxes in Phase 1 will be transferred to Phase 2.'
        }
        timeLinesInfo[!neededApplyWl ? 4 : 5] = {
          title: 'END',
          desc: 'Thank you for your participation.'
        }
      } else {
        timeLinesInfo[!neededApplyWl ? 2 : 3] = {
          title: 'BUYING - PHASE 1',
          desc: neededApplyWl ? `Whitelist registrants will be given favorable deals to buy ${poolInfo.process === 'only-buy' ? 'Ticket' : 'Mystery Box'} in Phase 1, on a First-Come First-Served basis.` : `You can buy ${poolInfo.process === 'only-buy' ? 'Ticket' : 'Mystery Box'} before the Buy Phase ends`
        }
        timeLinesInfo[!neededApplyWl ? 3 : 4] = {
          title: 'END',
          desc: 'Thank you for your participation.'
        }
      }
      const startBuyTime = isAccIsBuyPreOrder && timeLine.startPreOrderTime ? timeLine.startPreOrderTime : timeLine.startBuyTime
      const soldOut = supplyBox.sold !== 0 && supplyBox.total !== 0 && supplyBox.sold >= supplyBox.total
      const currentTime = Date.now()
      if (soldOut) {
        setCountdown({ date1: 0, date2: 0, title: 'Sold out! See you in the next pool.', isFinished: true })
        timeLine.freeBuyTime ? (timeLinesInfo[!neededApplyWl ? 4 : 5].current = true) : (timeLinesInfo[!neededApplyWl ? 3 : 4].current = true)
      } else if (timeLine.startJoinPooltime > currentTime) {
        setCountdown({ date1: timeLine.startJoinPooltime, date2: currentTime, title: 'Whitelist Opens In', isUpcoming: true })
        timeLinesInfo[1].current = true
      } else if (timeLine.endJoinPoolTime > currentTime) {
        if (isAccIsBuyPreOrder && startBuyTime < currentTime) {
          timeLinesInfo[!neededApplyWl ? 2 : 3].current = true
          setCountdown({ date1: timeLine?.freeBuyTime || timeLine?.finishTime, date2: currentTime, title: 'Phase 1 Ends In', isSale: true, isPhase1: true })
        } else {
          setCountdown({ date1: timeLine.endJoinPoolTime, date2: currentTime, title: 'Whitelist Closes In', isWhitelist: true })
          timeLinesInfo[!neededApplyWl ? 1 : 2].current = true
        }
      } else if (startBuyTime > currentTime) {
        timeLinesInfo[!neededApplyWl ? 1 : 2].current = true
        if (timeLine.freeBuyTime) {
          setCountdown({ date1: startBuyTime, date2: currentTime, title: poolInfo.process === 'only-buy' ? 'Buying Phase Starts In' : 'Sale Phase 1 Starts In', isUpcomingSale: true, isMultiPhase: true })
        } else {
          setCountdown({ date1: startBuyTime, date2: currentTime, title: 'Sale Starts In', isUpcomingSale: true })
        }
      } else if (timeLine.freeBuyTime && timeLine.freeBuyTime > currentTime) {
        timeLinesInfo[!neededApplyWl ? 2 : 3].current = true
        setCountdown({ date1: timeLine.freeBuyTime, date2: currentTime, title: 'Phase 1 Ends In', isSale: true, isPhase1: true })
      } else if (timeLine.finishTime > currentTime) {
        if (timeLine.freeBuyTime) {
          timeLinesInfo[!neededApplyWl ? 3 : 4].current = true
          setCountdown({ date1: timeLine.finishTime, date2: currentTime, title: poolInfo.process === 'only-buy' ? 'Buying Phase Ends In' : 'Phase 2 Ends In', isSale: true, isPhase2: true })
        } else {
          timeLinesInfo[!neededApplyWl ? 2 : 3].current = true
          setCountdown({ date1: timeLine.finishTime, date2: currentTime, title: 'Sale Ends In', isSale: true, isPhase1: true })
        }
      } else {
        setCountdown({ date1: 0, date2: 0, title: 'Finished', isFinished: true })
        timeLine.freeBuyTime ? (timeLinesInfo[!neededApplyWl ? 4 : 5].current = true) : (timeLinesInfo[!neededApplyWl ? 3 : 4].current = true)
      }
      setTimelines(timeLinesInfo)
    }
  }, [poolInfo, userTier, supplyBox])

  useEffect(() => {
    onSetCountdown()
  }, [onSetCountdown])

  const listTokens = useMemo(() => {
    if (!boxSelected?.currency_ids) {
      return []
    }
    const currencyIds = boxSelected.currency_ids.split(',').map(id => +id)
    const listCurrencies = (poolInfo.acceptedTokensConfig || [])
      .filter((c, id) => currencyIds.includes(id))
      .map(token => {
        if (token.address && !BigNumber.from(token.address).isZero()) {
          token.neededApprove = true
        }
        return token
      })
    const token = listCurrencies[0] || {}
    setCurrencySelected(token)
    return listCurrencies
  }, [poolInfo, boxSelected])

  useEffect(() => {
    const boxes = poolInfo.boxTypesConfig || []
    if (!poolInfo.campaign_hash) {
      const _boxes = boxes.map((b, subBoxId) => ({ ...b, subBoxId }))
      setBoxTypes(_boxes)
      setBoxSelected(_boxes[0])
    }
  }, [poolInfo])

  const onSelectCurrency = (t: ObjectType) => {
    if (t.address === currencySelected.address) return
    setCurrencySelected(t)
  }

  const onSelectBoxType = (b: ObjectType) => {
    if (b.id === boxSelected?.id) return
    setBoxSelected(b)
  }

  const onChangeTab = (val: any) => {
    setCurrentTab(val)
  }

  const getBoxOrdered = useCallback(async () => {
    if (!account) {
      setMyBoxOrdered(0)
      return
    }
    try {
      const res = await fetcher(`${API_BASE_URL}/pool/${poolInfo?.id}/nft-order?wallet_address=${account}`)
      const amount = res.data?.amount
      setMyBoxOrdered(amount)
    } catch (error) {
      console.debug('error', error)
    }
  }, [account, poolInfo])

  useEffect(() => {
    getBoxOrdered()
  }, [getBoxOrdered])

  const onChangeNumBuyBox = (num: number) => {
    setAmountBoxBuy(num)
  }

  const [isApprovedToken, setTokenApproved] = useState<boolean | null>(null)
  const { approve, loading: loadingApproveToken, error: approvalError } = useTokenApproval(currencySelected as any, poolInfo.campaign_hash)
  const { allowance, load: getAllowance, loading: loadingAllowance } = useTokenAllowance(currencySelected as any, account, poolInfo.campaign_hash, poolInfo.network_available)
  useEffect(() => {
    if (currencySelected && account) {
      getAllowance()
    }
  }, [getAllowance, currencySelected, account])
  useEffect(() => {
    if (!allowance) {
      setTokenApproved(null)
    } else {
      setTokenApproved(!BigNumber.from(allowance).isZero())
    }
  }, [allowance])
  useEffect(() => {
    if (approvalError) {
      approvalError?.message && toast.error(approvalError?.message)
    }
  }, [approvalError])
  const handleApproveToken = async () => {
    const ok = await approve(constants.MaxUint256)
    if (ok) {
      toast.success('Approve token successfully')
      setTokenApproved(true)
    }
  }

  const [isClickedCompetition, setClickedCompetition] = useState(false)
  const onJoinCompetition = (link: string) => {
    setClickedCompetition(true)
    window.open(link)
  }

  useEffect(() => {
    if (!account || !erc721Contract) {
      setOwnedBox(0)
      return
    }
    getMyNumBox()
  }, [account, erc721Contract, getMyNumBox])

  const [filterCollection, setFilterCollection] = useState({ page: 1, totalRecords: 0, dataExternals: [], perPage: 8, totalPage: 0 })
  const [collectionData, setCollectionData] = useState<ObjectType<ObjectType>>({})
  const isCallDefaultCollection = poolInfo.campaign_hash === poolInfo.token
  const callWithExternalApi = !!poolInfo.use_external_api

  const onChangePageCollection = useCallback((page: number) => {
    setFilterCollection(f => ({ ...f, page }))
  }, [])

  useEffect(() => {
    if (callWithExternalApi) {
      if (!account || !poolInfo.token) {
        return
      }
      fetcher(`${API_BASE_URL}/pool/owner/${poolInfo.token}?wallet=${account}`)
        .then((result) => {
          const arr = result.data.data?.data || []
          setFilterCollection(f => ({ ...f, totalRecords: arr.length, dataExternals: arr, totalPage: Math.ceil(arr.length / f.perPage) }))
        })
    } else {
      setFilterCollection(f => ({ ...f, totalRecords: +ownedBox || 0, totalPage: Math.ceil((+ownedBox || 0) / f.perPage) }))
    }
  }, [isCallDefaultCollection, callWithExternalApi, ownedBox, poolInfo.token, account])

  useEffect(() => {
    if (!account || !erc721Contract || !presaleContract || !filterCollection.totalRecords) {
      return setCollectionData({})
    }
    const handleInfoTokenExternal = async (collectionId: number, collection: ObjectType) => {
      try {
        const tokenURI = await erc721Contract.tokenURI(collectionId)
        collection.collectionId = collectionId
        let infoBoxType = await fetcher(tokenURI)
        infoBoxType = infoBoxType?.data || infoBoxType || {}
        Object.assign(collection, infoBoxType)
        return collection
      } catch (error) {
        console.debug('error', error)
      }
    }
    const handleSetCollection = (collection: ObjectType) => {
      setCollectionData((c) => {
        return {
          ...c,
          [filterCollection.page]: {
            ...(c[filterCollection.page] || {}),
            [collection.collectionId]: collection
          }
        }
      })
    }
    const getTokenInfo = async () => {
      const to = (filterCollection.totalRecords - 1) - ((filterCollection.page - 1) * filterCollection.perPage)
      let from = filterCollection.totalRecords - ((filterCollection.page - 1) * filterCollection.perPage) - filterCollection.perPage
      from = from >= 0 ? from : 0
      setLoadingCollection(true)
      if (callWithExternalApi) {
        const length = filterCollection.dataExternals?.length
        if (!length) {
          return setCollectionData({})
        }
        const promises = []
        const getInfo = async (index: number) => {
          const collectionId = filterCollection.dataExternals[index]?.token_id
          if (collectionId === null || collectionId === undefined) return
          const collection: ObjectType = { collectionId }
          try {
            await handleInfoTokenExternal(collectionId, collection)
          } catch (error) {
            console.debug(error)
          }
          handleSetCollection(collection)
        }

        for (let index = to; index >= from; index--) {
          // const collectionId = filterCollection.dataExternals[index]?.token_id
          // if (collectionId === null || collectionId === undefined) continue
          // const collection: ObjectType = { collectionId }
          // try {
          //   await handleInfoTokenExternal(collectionId, collection)
          // } catch (error) {
          //   console.debug(error)
          // }
          // handleSetCollection(collection)
          promises.push(getInfo(index))
        }
        await Promise.all(promises)
      } else {
        if (isCallDefaultCollection) {
          const getInfo = async (index: number) => {
            const collection: ObjectType = {}
            try {
              const collectionId = await presaleContract.tokenOfOwnerByIndex(account, index)
              collection.collectionId = collectionId.toNumber()
              const boxType = await presaleContract.boxes(collection.collectionId)
              const idBoxType = boxType.subBoxId.toNumber()
              const infoBox = boxTypes.find((b, subBoxId) => subBoxId === idBoxType) || {}
              infoBox && Object.assign(collection, infoBox)
              handleSetCollection(collection)
            } catch (error) {
              console.debug('error', error)
            }
          }
          const promises = []
          for (let index = to; index >= from; index--) {
            promises.push(getInfo(index))
          }
          await Promise.all(promises)
        } else {
          const getInfo = async (index: number) => {
            const collection: ObjectType = {}
            try {
              const collectionId = await erc721Contract.tokenOfOwnerByIndex(account, index)
              collection.collectionId = collectionId.toNumber()
              await handleInfoTokenExternal(collection.collectionId, collection)
              handleSetCollection(collection)
            } catch (error) {
              console.debug('error', error)
            }
          }
          const promises = []
          for (let index = to; index >= from; index--) {
            promises.push(getInfo(index))
          }
          await Promise.all(promises)
        }
      }
      setLoadingCollection(false)
    }
    getTokenInfo().catch()
  }, [filterCollection, isCallDefaultCollection, callWithExternalApi, erc721Contract, presaleContract, account, boxTypes])

  // const handleSetCollections = useCallback(async (ownedBox: number) => {
  //   if (!presaleContract) return
  //   setLoadingCollection(true)
  //   setCollections([])
  //   try {
  //     if (!erc721Contract) return
  //     const isCallDefaultCollection = poolInfo.campaign_hash === poolInfo.token
  //     // const arrCollections = []
  //     if (!account) return
  //     const callWithExternalApi = !!poolInfo.use_external_api
  //     const handleInfoTokenExternal = async (collectionId: number, collection: ObjectType) => {
  //       try {
  //         const tokenURI = await erc721Contract.tokenURI(collectionId)
  //         collection.collectionId = collectionId
  //         let infoBoxType = await fetcher(tokenURI)
  //         infoBoxType = infoBoxType?.data || infoBoxType || {}
  //         Object.assign(collection, infoBoxType)
  //         return collection
  //       } catch (error) {
  //         console.debug('error', error)
  //       }
  //     }
  //     const handleSetCollection = (collection: ObjectType) => {
  //       setCollections((c) => {
  //         const newArr = [...c]
  //         const existId = c.find((b) => b.collectionId === collection.collectionId)
  //         if (!existId) {
  //           newArr.push(collection)
  //         }
  //         return newArr
  //       })
  //     }
  //     if (callWithExternalApi) {
  //       const result = await fetcher(`${API_BASE_URL}/pool/owner/${poolInfo.token}?wallet=${account}&limit=100`)
  //       const arr = result.data.data?.data || []
  //       for (let i = 0; i < arr.length; i++) {
  //         const collectionId = arr[i]?.token_id
  //         const collection: ObjectType = {
  //           collectionId
  //         }
  //         try {
  //           await handleInfoTokenExternal(collectionId, collection)
  //         } catch (error) {
  //           console.debug(error)
  //         }
  //         handleSetCollection(collection)
  //         // arrCollections.push(collection)
  //         // setCollections(arrCollections)
  //       }
  //     } else {
  //       for (let id = 0; id < ownedBox; id++) {
  //         if (isCallDefaultCollection) {
  //           const collection: ObjectType = {}
  //           try {
  //             const collectionId = await presaleContract.tokenOfOwnerByIndex(account, id)
  //             collection.collectionId = collectionId.toNumber()
  //             const boxType = await presaleContract.boxes(collection.collectionId)
  //             const idBoxType = boxType.subBoxId.toNumber()
  //             const infoBox = boxTypes.find((b, subBoxId) => subBoxId === idBoxType) || {}
  //             infoBox && Object.assign(collection, infoBox)
  //             handleSetCollection(collection)
  //           } catch (error) {
  //             // console.debug('error', error)
  //           }
  //           // arrCollections.push(collection)
  //         } else {
  //           const collection: ObjectType = {}
  //           try {
  //             const collectionId = await erc721Contract.tokenOfOwnerByIndex(account, id)
  //             collection.collectionId = collectionId.toNumber()
  //             await handleInfoTokenExternal(collection.collectionId, collection)
  //             // arrCollections.push(collection)
  //             handleSetCollection(collection)
  //           } catch (error) {
  //           }
  //         }
  //       }
  //     }
  //     // setCollections(arrCollections)
  //   } catch (error) {
  //     console.debug(error)
  //     console.error('Something went wrong when show collections')
  //   } finally {
  //     setLoadingCollection(false)
  //   }
  // }, [presaleContract, erc721Contract, boxTypes, poolInfo, account])

  // useEffect(() => {
  //   setCollections([])
  // }, [account])

  // useEffect(() => {
  //   if (+ownedBox > 0 && boxTypes.length) {
  //     handleSetCollections(ownedBox)
  //   }
  // }, [ownedBox, boxTypes.length, handleSetCollections])
  const onClaimAllNFT = async () => {
    try {
      if (!library || !account) {
        toast.error('Please connect your wallet')
        return
      }
      if (!isValidChain) {
        toast.error(`Network invalid. Please switch to ${networkPool.name}`)
        return
      }
      const contractSigner = presaleContract.connect(library.getSigner(account).connectUnchecked())
      const tx = await contractSigner.claimAllNFT()
      // setShowModalTx(true)
      // setTxHash(tx.hash)
      toast.loading('Request is processing!', { duration: 2000 })
      const result = await tx.wait(1)
      if (+result?.status === 1) {
        toast.success('Request is completed!')
        getMyNumBox()
      } else {
        toast.error('Request Failed')
      }
    } catch (error: any) {
      console.error(error)
      toast.error(error?.data?.message || error.message)
    }
  }
  const onClaimNFT = async (boxId: number) => {
    try {
      if (!library || !account) {
        toast.error('Please connect your wallet')
        return
      }
      if (!isValidChain) {
        toast.error(`Network invalid. Please switch to ${networkPool.name}`)
        return
      }
      const contractSigner = presaleContract.connect(library.getSigner(account).connectUnchecked())
      const tx = await contractSigner.claimNFT(boxId)
      // setShowModalTx(true)
      // setTxHash(tx.hash)
      toast.loading('Request is processing!', { duration: 2000 })
      const result = await tx.wait(1)
      if (+result?.status === 1) {
        toast.success('Request is completed!')
        getMyNumBox()
      } else {
        toast.error('Request Failed')
      }
    } catch (error: any) {
      console.error(error)
      toast.error(error?.data?.message || error.message)
    }
  }
  const isCommunityPool = +poolInfo.is_private === 3
  const isAppliedWhitelist = isJoinPool || isJoinSuccess
  const isDeployedPool = !!+poolInfo.is_deploy
  const isShowBtnApprove = !!account && isDeployedPool && currencySelected.neededApprove && !isApprovedToken && ((countdown.isPhase1 && isAppliedWhitelist) || countdown.isPhase2)
  const isShowBtnBuy = useMemo(() => {
    return !!account && isDeployedPool && ((countdown.isPhase1 && isAppliedWhitelist) || countdown.isPhase2) && countdown.isSale && (!currencySelected.neededApprove || (currencySelected.neededApprove && isApprovedToken))
  }, [account, isDeployedPool, countdown, currencySelected, isApprovedToken, isAppliedWhitelist])
  const isAllowedJoinCompetition = (countdown.isWhitelist || countdown.isUpcoming) && isCommunityPool && poolInfo.socialRequirement?.gleam_link && !isAppliedWhitelist
  const needApplyWhitelist = !!poolInfo.start_join_pool_time
  const renderMsg = () => {
    if (!account) {
      return <Alert type="danger">
        Please connect your wallet
      </Alert>
    }
    if (!isValidChain && networkPool && account) {
      return <Alert type="danger">
        Please switch to <b>{networkPool.name}</b>
      </Alert>
    }
    if (
      account && poolInfo.min_tier > 0 && isNumber(userTier) && (userTier < poolInfo.min_tier)
    ) {
      return <Alert>
        <span>{`You haven't achieved min rank (${poolRank?.name}) to apply for Whitelist yet. To upgrade your Rank, please click`} <Link href="/staking"><a className="font-semibold link">here</a></Link></span></Alert>
    }
    if (isAppliedWhitelist && countdown.isWhitelist) {
      return <Alert type="info">
        You have successfully applied whitelist.
        {timelinePool.freeBuyTime ? <>&nbsp;Please stay tuned, you can buy from <b>Phase 1</b></> : `Please stay tuned and wait until time to buy ${poolInfo.process === 'only-buy' ? 'Ticket' : 'Mystery Box'}`}
        {
          // Hard code for EPIC WAR
          poolInfo.id === 150 && <button className="underline text-gamefiGreen" onClick={() => { setShowApplyWhitelist(true) }}>Review</button>
        }
      </Alert>
    }
    if (isAppliedWhitelist && (countdown.isSale || countdown.isUpcomingSale)) {
      return <Alert type="info">
        Congratulations! You have successfully applied whitelist and can buy {poolInfo.process === 'only-buy' ? 'Ticket' : 'Mystery Box'}
      </Alert>
    }
    if (needApplyWhitelist && ((!loadingCheckJPool && !loadingJPool) && account && (countdown.isSale || countdown.isUpcomingSale)) && !countdown.isPhase2 && !isAppliedWhitelist) {
      return <Alert type="danger">
        You have not applied whitelist.
        {(timelinePool.freeBuyTime && !countdown.isPhase2) ? ' Please stay tuned, you can buy from Phase 2' : ' Please stay tuned and join other pools'}
      </Alert>
    }
  }

  return (<WrapperPoolDetail backLink='/ino'>
    <PlaceOrderModal
      open={openPlaceOrderModal}
      onClose={() => setOpenPlaceOrderModal(false)}
      poolId={poolInfo.id}
      getBoxOrdered={getBoxOrdered}
      maxBoxOrdered={maxBoxCanBuy}
    />
    <BuyBoxModal
      open={openBuyBoxModal}
      onClose={onCloseBuyBoxModal}
      amountBoxBuy={amountBoxBuy}
      boxTypeBuy={boxSelected}
      currencyInfo={currencySelected}
      poolInfo={poolInfo}
      eventId={eventId}
      isValidChain={isValidChain}
      balanceInfo={balanceInfo}
    />
    <PoolDetail
      headContent={<div className={clsx(styles.headPool)}>
        {!countdown.isFinished && <div className='mb-10'>{renderMsg()}</div>}
        <div className={`grid ${needApplyWhitelist ? 'lg:grid-cols-2' : ''} `}>
          {needApplyWhitelist && poolInfo.process !== 'only-buy' && <div className={clsx('flex mb-2 lg:mb-0 justify-center lg:justify-start', styles.headInfoBoxOrder)}>
            <InfoBoxOrderItem label='Registered Users' value={poolInfo.totalRegistered || 0} />
            <InfoBoxOrderItem label='Ordered Boxes' value={poolInfo.totalOrder || 0} />
            <InfoBoxOrderItem label='Your Ordered' value={myBoxOrdered} />
          </div>
          }
          {
            poolInfo.process === 'only-buy' && needApplyWhitelist && <div className={clsx('flex items-center mb-2 lg:mb-0 justify-center lg:justify-start', styles.headInfoBoxOrder)}></div>
          }
          <div className={clsx('flex items-center gap-2',
            styles.headCountdown,
            {
              [styles.headClipedpath]: needApplyWhitelist,
              'bg-black justify-center': !countdown.isFinished,
              [`${styles.countdownFinished} justify-center lg:justify-end`]: countdown.isFinished
            })} >
            <div className={clsx('', styles.titleCountdown,
              {
                'font-bold text-sm uppercase': !countdown.isFinished,
                'font-casual text-base font-normal': countdown.isFinished
              })}>
              {countdown.title}
            </div>
            {
              !countdown.isFinished && <div className={clsx(styles.countdown)} >
                {countdown.date2 !== 0 && <CountDownTimeV1 time={countdown} className="bg-transparent" background='bg-transparent' onFinish={onSetCountdown} />}
              </div>
            }
          </div>
        </div>
      </div>}
      bodyBannerContent={<BannerImagePool src={boxSelected?.banner} />}
      bodyDetailContent={<>
        <h2 className="font-semibold text-4xl mb-2 uppercase">{poolInfo.title || poolInfo.name}</h2>
        <div className="creator flex items-center gap-1">
          <img src={poolInfo.token_images} className="icon rounded-full w-8 h-8" alt="" />
          <span className="text-white/70 uppercase text-sm">{poolInfo.symbol}</span>
        </div>
        <div className="divider bg-white/20 w-full mt-3 mb-8" style={{ height: '1px' }}></div>
        <div className='mb-4'>
          <div className="grid gap-1">
            <div className="flex items-center gap-2">
              <img src={currencySelected?.icon} className="icon rounded-full w-8 h-8" alt="" />
              <span className="uppercase font-bold text-white text-2xl">{Number(currencySelected?.price) || ''} {currencySelected?.name}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-12 mb-8">
          <DetailPoolItem label='TOTAL SALES' value={`${poolInfo.total_sold_coin} ${poolInfo.process === 'only-buy' ? 'Tickets' : 'Boxes'}`} />
          <DetailPoolItem label='SUPPORTED'
            icon={getNetworkByAlias(poolInfo.network_available)?.image}
            value={poolInfo.network_available} />
          <DetailPoolItem label='Min Rank'
            value={poolInfo.min_tier > 0 ? poolRank?.name : 'No Required'} />
        </div>
        <div className='mb-8'>
          <div> <h4 className='font-bold text-base mb-1 uppercase'>Currency</h4> </div>
          <div className='flex gap-1'>
            {listTokens.map((t) => <TokenItem key={t.address} item={t} onClick={onSelectCurrency} selected={currencySelected?.address === t.address} />)}
          </div>
        </div>
        <div className='mb-8'>
          <div> <h4 className='font-bold text-base mb-1 uppercase'>Type</h4></div>
          <div className={clsx('gap-2 flex flex-wrap', stylesBoxType.boxTypes)}>
            {boxTypes.map((b) => <BoxTypeItem key={b.id} item={b} onClick={onSelectBoxType} selected={boxSelected?.id === b.id} />)}
          </div>
        </div>
        {
          countdown.isSale &&
          <div className='mb-8'>
            <AscDescAmount
              disabled={!isShowBtnBuy}
              value={amountBoxBuy}
              maxBuy={maxBoxCanBuy}
              bought={myBoxThisPool}
              onChangeValue={onChangeNumBuyBox}
              poolInfo={poolInfo}
              currencyInfo={currencySelected}
              balanceInfo={balanceInfo}
            />
          </div>
        }
        <div className='mb-8'>
          <div className={clsx('gap-2 flex flex-wrap', stylesBoxType.boxTypes)}>
            <Progress {...supplyBox}></Progress>
          </div>
        </div>
        <div className={poolInfo.process === 'only-buy' ? 'md:flex gap-2' : ''}>
          {isAllowedJoinCompetition && !isClickedCompetition && <ButtonBase color="red"
            onClick={() => onJoinCompetition(poolInfo.socialRequirement.gleam_link)}
            className={clsx('w-full mt-4 uppercase')}>
            Join Competition
          </ButtonBase>
          }
          {
            !isAppliedWhitelist && (!isCommunityPool || (isCommunityPool && isClickedCompetition)) && countdown.isWhitelist && <ButtonBase
              color={'green'}
              isLoading={loadingJPool || loadingCheckJPool}
              disabled={loadingCheckJPool || loadingJPool}
              onClick={() => {
                // Hard code for EPIC WAR
                if (poolInfo.id === 150) {
                  setShowApplyWhitelist(true)
                  return
                }

                joinPool()
              }}
              className={clsx('w-full mt-4 uppercase')}>
              Apply Whitelist
            </ButtonBase>
          }
          {
            poolInfo.process !== 'only-buy' && isAppliedWhitelist && countdown.isWhitelist &&
            <ButtonBase
              color={'green'}
              onClick={() => setOpenPlaceOrderModal(true)}
              className={clsx('w-full mt-4 uppercase')}>
              Place Order
            </ButtonBase>
          }
          {
            isShowBtnApprove &&
            <ButtonBase
              color={'green'}
              isLoading={loadingApproveToken || loadingAllowance}
              disabled={loadingApproveToken || loadingAllowance || !isValidChain}
              onClick={() => {
                handleApproveToken()
              }}
              className={clsx('w-full mt-4 uppercase')}>
              {loadingAllowance ? 'Checking Approval' : 'Approve'}
            </ButtonBase>
          }
          {
            isShowBtnBuy &&
            <ButtonBase
              color={'green'}
              disabled={+amountBoxBuy < 1 || !isValidChain}
              onClick={() => setOpenBuyBoxModal(true)}
              className={clsx('w-full mt-4 uppercase')}>
              Buy
            </ButtonBase>
          }
          {
            (isShowBtnBuy || isShowBtnApprove) && poolInfo.process === 'only-buy' && (ownedBox > 0
              ? <a
                href={poolInfo.claim_policy}
                target="_blank"
                rel="noopenner noreferrer"
                className="w-full mt-4 uppercase text-black rounded-sm clipped-t-r flex items-center justify-center bg-gamefiGreen font-semibold cursor-pointer">
                Play
              </a>
              : <Tippy content={<div className="">You need to buy <b>1 Ticket</b> and play the game to get the allocation</div>}>
                <div className="w-full px-6 py-4 mt-4 uppercase bg-gamefiDark-600 rounded-sm clipped-t-r flex items-center justify-center text-gamefiDark-200 font-semibold cursor-not-allowed">Play</div>
              </Tippy>)
          }
        </div>
      </>}
      footerContent={<>
        <Tabs
          titles={poolInfo.process === 'only-buy'
            ? [
              'Rule Introduction',
              'Ticket Information',
              '',
              'TimeLine',
              `My Tickets ${ownedBox ? `(${ownedBox})` : ''}`
            ]
            : [
              'Rule Introduction',
              'Box Information',
              'Series Content',
              'TimeLine',
              `Collection ${ownedBox ? `(${ownedBox})` : ''}`
            ]}
          currentValue={currentTab}
          onChange={onChangeTab}
        />
        <div className="mt-6 mb-10 font-casual text-sm leading-6 font-light">
          <TabPanel value={currentTab} index={0}>
            <RuleIntroduce poolInfo={poolInfo} />
          </TabPanel>
          <TabPanel value={currentTab} index={1}>
            <BoxInformation boxes={boxTypes} poolInfo={poolInfo} />
          </TabPanel>
          {
            poolInfo.process !== 'only-buy' && <TabPanel value={currentTab} index={2}>
              <SerieContent poolInfo={poolInfo} selected={boxSelected} />
            </TabPanel>
          }
          <TabPanel value={currentTab} index={3}>
            <TimeLine timelines={timelines} />
          </TabPanel>
          <TabPanel value={currentTab} index={4}>
            <Collection
              poolInfo={poolInfo}
              // collections={collections}
              collections={Object.values(collectionData[filterCollection.page] || {}).reverse().slice(0, filterCollection.perPage)}
              loading={loadingCollection}
              onClaimAllNFT={onClaimAllNFT}
              onClaimNFT={onClaimNFT}
              isValidChain={isValidChain}
              ownedBox={ownedBox}
              handleChangePage={onChangePageCollection}
              filter={filterCollection}
            />
          </TabPanel>
        </div>
        <Modal show={showApplyWhitelist} toggle={setShowApplyWhitelist} className='dark:bg-transparent fixed z-50 sm:!max-w-3xl'>
          <div className="bg-gamefiDark-700">
            <div className="p-4 xl:p-6 2xl:p-7 pt-11 font-casual w-full">
              <strong className="uppercase text-2xl font-mechanic">Welcome to {poolInfo?.title || ''} on GameFi.org</strong>
              <p className="mt-6 text-sm">In order to participate in the IGO, you must fulfill requirements as below.</p>
              <div className="mt-6 w-full text-sm inline-flex items-center font-medium">
                <span className="flex items-center justify-center mr-2 bg-black w-6 h-6 rounded-full font-bold">1</span>
                Provide social information
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <div className="w-full text-sm">
                  <span className="text-[13px]"><span className="hidden sm:inline">Your</span> Email Address</span>
                  <input
                    type="email"
                    value={formData.email}
                    placeholder="example@email.com"
                    onChange={e => setEmail(e.target.value)}
                    className="mt-2 w-full bg-gamefiDark-600 border-gamefiDark-400 rounded text-sm"
                    disabled={isJoinPool || loadingJPool}
                    readOnly={isJoinPool || loadingJPool}
                  />
                </div>
              </div>
              <div className="mt-6 text-sm flex items-center justify-end gap-6 font-mechanic text-[13px]">
                <button className="font-bold uppercase text-gamefiGreen-500 hover:text-white" onClick={() => setShowApplyWhitelist(false)}>Close</button>
                {!isJoinPool && !loadingJPool && <button className="font-bold uppercase clipped-t-r bg-gamefiGreen-600 hover:bg-gamefiGreen-500 text-black py-2 px-6 tracking-wider rounded-sm" onClick={() => { handleJoinPool() }}>Apply Whitelist</button>}
                {loadingJPool && <div className="font-bold uppercase clipped-t-r bg-gamefiGreen-600 hover:bg-gamefiGreen-500 text-black py-4 px-6 w-36 tracking-wider rounded-sm">
                  <div className="dot-flashing mx-auto"></div>
                </div>}
              </div>
            </div>
          </div>
        </Modal>
      </>}
    />
  </WrapperPoolDetail>
  )
}

export default MysteryBoxDetail
