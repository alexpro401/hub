import { IS_TESTNET } from '@/components/web3/connectors'
import { pie as PIE, arc as ARC, PieArcDatum } from 'd3'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import anime from 'animejs'
import Image from 'next/image'
import f2gf from '@/components/Pages/Adventure/images/fish-to-gf.svg'
import iconGF from '@/components/Pages/Adventure/images/icon-gf.svg'
import iconFish from '@/components/Pages/Adventure/images/icon-fish.svg'
import iconTicket from '@/components/Pages/Adventure/images/icon-ticket.svg'
import { useMyWeb3 } from '@/components/web3/context'
import { useWalletContext } from '@/components/Base/WalletConnector/provider'
import toast from 'react-hot-toast'
import { useBalanceToken, useTokenAllowance, useTokenApproval } from '@/components/web3/utils'
import { GAFI, switchNetwork, Token, useWeb3Default } from '@/components/web3'
import { fetcher, printNumber } from '@/utils'
import { parseUnits } from '@ethersproject/units'
import { BigNumber, constants, Contract } from 'ethers'
import { TransactionReceipt } from '@ethersproject/providers'
import Modal from '@/components/Base/Modal'
import clsx from 'clsx'
import Link from 'next/link'
import useWalletSignature from '@/hooks/useWalletSignature'
import { useAppContext } from '@/context'
import { format } from 'date-fns'

const CONTRACT_WHEEL = IS_TESTNET ? process.env.NEXT_PUBLIC_WHEEL_CONTRACT_97 : process.env.NEXT_PUBLIC_WHEEL_CONTRACT_56
const CONTRACT_TICKET = IS_TESTNET ? process.env.NEXT_PUBLIC_WHEEL_TICKET_97 : process.env.NEXT_PUBLIC_WHEEL_TICKET_56
const CONTRACT_WHEEL_ABI = '[{"inputs":[{"internalType":"address","name":"_gafi","type":"address"},{"internalType":"address","name":"_birthday_ticket","type":"address"},{"internalType":"address","name":"_link","type":"address"},{"internalType":"address","name":"_vrfCoordinator","type":"address"},{"internalType":"bytes32","name":"_keyHash","type":"bytes32"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"have","type":"address"},{"internalType":"address","name":"want","type":"address"}],"name":"OnlyCoordinatorCanFulfill","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"requestId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RequestCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},{"inputs":[],"name":"LOCK_DURATION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"SIGNER","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"consumerAddress","type":"address"}],"name":"addConsumer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"buyTicket","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"requestId","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"buyTicketByFish","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"receivingWallet","type":"address"}],"name":"cancelSubscription","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint32","name":"_gas","type":"uint32"}],"name":"changeGas","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_keyHash","type":"bytes32"}],"name":"changeKeyHash","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"lockDuration","type":"uint256"}],"name":"changeLockDuration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"state","type":"bool"}],"name":"changePauseState","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"signer","type":"address"}],"name":"changeSigner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"price","type":"uint256"}],"name":"changeTicketPriceByGAFI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"emergencyWithdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"emergencyWithdrawAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"requestId","type":"uint256"}],"name":"getTicketsByRequestId","outputs":[{"internalType":"bool","name":"status","type":"bool"},{"components":[{"internalType":"uint256","name":"createdAt","type":"uint256"},{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"prizeId","type":"uint256"},{"internalType":"uint8","name":"status","type":"uint8"}],"internalType":"struct Wheel.Ticket[]","name":"result","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getTotalSpin","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"requestId","type":"uint256"}],"name":"getTotalTicketsByRequestId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getTotalTransactions","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"offset","type":"uint256"},{"internalType":"uint256","name":"limit","type":"uint256"}],"name":"getTransactionHistory","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"components":[{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint8","name":"transactionType","type":"uint8"}],"internalType":"struct Wheel.TicketTransaction[]","name":"result","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"offset","type":"uint256"},{"internalType":"uint256","name":"limit","type":"uint256"}],"name":"getUserHistory","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"components":[{"internalType":"uint256","name":"createdAt","type":"uint256"},{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"prizeId","type":"uint256"},{"internalType":"uint8","name":"status","type":"uint8"}],"internalType":"struct Wheel.Ticket[]","name":"result","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"lockingTicketByFish","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxPerTurn","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"requestId","type":"uint256"},{"internalType":"uint256[]","name":"randomWords","type":"uint256[]"}],"name":"rawFulfillRandomWords","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"consumerAddress","type":"address"}],"name":"removeConsumer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"requestToTickets","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"spin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"subscriptionId","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ticketPriceByGAFI","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"tickets","outputs":[{"internalType":"uint256","name":"createdAt","type":"uint256"},{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"prizeId","type":"uint256"},{"internalType":"uint8","name":"status","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"topUpSubscription","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"transactionIds","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"transactions","outputs":[{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint8","name":"transactionType","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_signer","type":"address"},{"internalType":"address","name":"_user","type":"address"},{"internalType":"uint256","name":"_requestFishID","type":"uint256"},{"internalType":"string","name":"_method","type":"string"},{"internalType":"uint256","name":"_timestamp","type":"uint256"},{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"verify","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawLink","outputs":[],"stateMutability":"nonpayable","type":"function"}]'

const TICKET_PRICE_IN_GAFI = 0.2
const TICKET_PRICE_IN_FISH = IS_TESTNET ? 5 : 5000
const MAX_TICKET_IN_FISH = 99

export const TICKET: Token = {
  name: 'Birthday Ticket',
  symbol: 'Ticket',
  decimals: 0,
  image: iconTicket,
  address: CONTRACT_TICKET
}

type Prize = { id: number; text: string; positions: number[] }
type Slot = { id: number; text: string; position: number; lines: string[] }

const prizes: Prize[] = [{ id: 0, text: '0.1\nGAFI', positions: [0] }, { id: 1, text: '0.2\nGAFI', positions: [1] }, { id: 2, text: '1\nTicket', positions: [2] }, { id: 3, text: '0.5\nGAFI', positions: [3] }, { id: 4, text: '2\nTickets', positions: [4] }, { id: 5, text: '1\nGAFI', positions: [5] }, { id: 6, text: 'LOSE', positions: [6] }, { id: 7, text: '5\nGAFI', positions: [7] }]
const slots: Slot[] = prizes.reduce((acc, val) => {
  val.positions.forEach(p => {
    acc.push({
      id: val.id,
      text: val.text,
      lines: val.text.split('\n'),
      position: p
    })
  })
  return acc
}, []).sort((a, b) => {
  return a.position - b.position
})

const loss = (item?: Slot | Prize) => {
  return item?.id === 6
}

function Pie (pieces: Slot[], {
  width = 400,
  height = 400,
  outerRadius = Math.min(width, height) / 2 - 10,
  labelRadius = (outerRadius * 0.8),
  stroke = 'white',
  strokeWidth = 1,
  strokeLinejoin = 'round'
}: {
  width?: number;
  height?: number;
  outerRadius?: number;
  labelRadius?: number;
  stroke?: string;
  strokeWidth?: number;
  strokeLinejoin?: 'round' | 'miter' | 'bevel' | 'inherit';
}) {
  const arcs = PIE<Slot>().value(() => {
    return 1
  })(pieces)

  const arc = ARC<PieArcDatum<Slot>>().innerRadius(0).outerRadius(outerRadius)
  const arcLabel = ARC<PieArcDatum<Slot>>().innerRadius(labelRadius).outerRadius(labelRadius)

  return { width, height, stroke, strokeWidth, strokeLinejoin, arcs, arc, arcLabel }
}

const pie = Pie(slots, {
  stroke: 'currentColor',
  strokeWidth: 4
})

const Spin = ({ className, comingsoon }: { className?: string; comingsoon?: boolean }) => {
  const { now } = useAppContext()
  const { library: libraryDefault } = useWeb3Default()
  const { account, library, chainID } = useMyWeb3()
  const { setShowModal: showConnectWallet } = useWalletContext()
  const { balance: balanceGAFI, balanceShort: balanceGAFIShort } = useBalanceToken(GAFI)
  const { balance: balanceTICKET, balanceShort: balanceTICKETShort, updateBalance: updateBalanceTICKET } = useBalanceToken(TICKET)
  const [confirming, setConfirming] = useState<boolean>(false)
  const [amount, setAmount] = useState<string>('1')
  const [amountPurchase, setAmountPurchase] = useState<string>('5')

  const mounted = useRef(false)
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  const contract = useMemo(() => {
    if (!library) {
      return
    }

    if (!CONTRACT_WHEEL) {
      return
    }

    return new Contract(CONTRACT_WHEEL, CONTRACT_WHEEL_ABI, library.getSigner())
  }, [library])
  const chainIDCorrect = useMemo(() => {
    return (libraryDefault?.provider as any)?.chainId || 97
  }, [libraryDefault?.provider])
  const networkIncorrect = useMemo(() => {
    return chainID !== chainIDCorrect
  }, [chainID, chainIDCorrect])
  const { allowance: allowanceTICKET, load: loadAllowanceTICKET, loading: loadingAllowanceTICKET } = useTokenAllowance(TICKET, account, CONTRACT_WHEEL)
  useEffect(() => {
    loadAllowanceTICKET().catch(err => { console.debug(err) })
  }, [account, loadAllowanceTICKET])
  const { approve: approveTICKET, loading: loadingApprovalTICKET, error: errorApprovalTICKET } = useTokenApproval(TICKET, CONTRACT_WHEEL)
  useEffect(() => {
    if (!errorApprovalTICKET) {
      return
    }

    toast.error(`Error: ${errorApprovalTICKET.message}`)
  }, [errorApprovalTICKET])

  const { allowance: allowanceGAFI, load: loadAllowanceGAFI, loading: loadingAllowanceGAFI } = useTokenAllowance(GAFI, account, CONTRACT_WHEEL)
  useEffect(() => {
    loadAllowanceGAFI().catch(err => { console.debug(err) })
  }, [account, loadAllowanceGAFI])
  const { approve: approveGAFI, loading: loadingApprovalGAFI, error: errorApprovalGAFI } = useTokenApproval(GAFI, CONTRACT_WHEEL)
  useEffect(() => {
    if (!errorApprovalGAFI) {
      return
    }

    toast.error(`Error: ${errorApprovalGAFI.message}`)
  }, [errorApprovalGAFI])

  const valueInWeiTICKET = useMemo(() => {
    if (!amount) {
      return BigNumber.from('0')
    }
    return parseUnits(amount, TICKET.decimals)
  }, [amount])
  const balanceTICKETEnough = useMemo(() => {
    return balanceTICKET instanceof BigNumber && balanceTICKET.gte(valueInWeiTICKET)
  }, [balanceTICKET, valueInWeiTICKET])
  const allowanceTICKETEnough = useMemo(() => {
    return allowanceTICKET instanceof BigNumber && allowanceTICKET.gte(valueInWeiTICKET)
  }, [allowanceTICKET, valueInWeiTICKET])

  const formatAmountTicket = useCallback((str, max = 1_000_000) => {
    const v = parseInt(str)
    if (v <= 0 || !v) {
      return 0
    }

    if (v > max) {
      return 0
    }

    return v
  }, [])

  const valueGAFI = useMemo(() => {
    const v = formatAmountTicket(amountPurchase)
    return (v * TICKET_PRICE_IN_GAFI).toFixed(2)
  }, [amountPurchase, formatAmountTicket])
  const valueInWeiGAFI = useMemo(() => {
    if (!valueGAFI) {
      return BigNumber.from(0)
    }
    return parseUnits(valueGAFI.toString(), GAFI.decimals)
  }, [valueGAFI])

  const balanceGAFIEnough = useMemo(() => {
    return balanceGAFI instanceof BigNumber && balanceGAFI.gte(valueInWeiGAFI)
  }, [balanceGAFI, valueInWeiGAFI])
  const allowanceGAFIEnough = useMemo(() => {
    return allowanceGAFI instanceof BigNumber && allowanceGAFI.gte(valueInWeiGAFI)
  }, [allowanceGAFI, valueInWeiGAFI])

  const ref = useRef()
  const [rotate, setRotate] = useState<number | null | number[]>(null)
  const [rotation, setRotation] = useState(null)
  const [prizeID, setPrizeID] = useState<number | null | number[]>(null)
  const [spinning, setSpinning] = useState(false)

  useEffect(() => {
    setRotate(null)
    setPrizeID(null)
  }, [account])

  const slotActive: Slot | null = useMemo(() => {
    if (rotation === null) {
      return null
    }

    let _rotation = rotation % 360
    if (_rotation < 0) {
      _rotation = 360 + _rotation
    }

    const slot = slots.find(x => {
      if (_rotation === 0) {
        return x.position === 0
      }

      const arcWidth = 360 / slots.length
      const position = slots.length - x.position

      const max = position * arcWidth
      const min = max - arcWidth

      return _rotation > min && _rotation <= max
    })

    return slot
  }, [rotation])

  const syncRotationFromDom = useCallback(() => {
    if (!ref.current) {
      return
    }

    const deg = anime.get(ref.current, 'rotate').toString()
    if (!deg) {
      setRotation(null)
      return
    }

    setRotation(parseInt(deg.slice(0, -3)))
  }, [])

  const finishSpinning = useCallback((target) => {
    if (!target) {
      return
    }

    if (rotate instanceof Array) {
      const tl = anime.timeline({
        easing: 'easeOutBack',
        duration: 3000
      })

      let rLast

      rotate.forEach((r, i) => {
        tl.add({
          targets: target,
          rotate: r % 360 + 360 * (3 + i),
          update: syncRotationFromDom,
          complete () {
            anime.set(target, { rotate: r % 360 })
          }
        }, i > 0 ? '+=1000' : undefined)

        rLast = r
      })

      tl.finished.then(() => {
        if (rLast) {
          anime.set(target, { rotate: rLast % 360 })
        }

        anime.remove(target)
        setSpinning(false)
      })
      return
    }

    anime({
      targets: target,
      rotate: rotate % 360 + 360 * 3,
      duration: 3000,
      easing: 'easeOutBack',
      update: syncRotationFromDom
    })
      .finished.then(() => {
        anime.set(target, { rotate: rotate % 360 })
        anime.remove(target)
        setSpinning(false)
      })
  }, [rotate, syncRotationFromDom])

  const spin = useCallback(async (target) => {
    if (!account) {
      toast.error('Please connect your wallet first!')
      return
    }

    if (!target) {
      return
    }

    if (spinning) {
      return
    }

    if (confirming) {
      toast.error('Please confirm the transaction!')
      return
    }

    if (!contract) {
      return
    }

    if (networkIncorrect) {
      return
    }

    setConfirming(true)
    try {
      const tx = await contract.spin(amount)
      setConfirming(true)

      setSpinning(true)
      setPrizeID(null)

      const timeline = anime.timeline({
        targets: target
      })

      timeline.add({
        rotate: '+=360',
        duration: 2000,
        easing: 'easeInCubic',
        update: syncRotationFromDom
      })

      timeline.add({
        rotate: '+=360',
        duration: 500,
        easing: 'linear',
        update: syncRotationFromDom,
        changeComplete: anim => {
          anime.set(target, { rotate: 0 })
          setTimeout(() => anim.restart())
        }
      })

      let requestId
      await tx.wait(1).then((receipt: TransactionReceipt) => {
        setConfirming(false)
        requestId = receipt.logs.reduce((acc, val) => {
          if (acc) {
            return acc
          }

          if (val.address.toLowerCase() !== CONTRACT_WHEEL.toLowerCase()) {
            return null
          }

          try {
            const event = contract.interface.parseLog(val)
            return event.args?.requestId?.toString() || null
          } catch (_) {
            return null
          }

          return null
        }, null)
      })

      if (!requestId) {
        throw new Error('Invalid request')
      }

      let prizes = []
      let done = false
      const timeout = wait => new Promise(resolve => {
        setTimeout(resolve, wait)
      })

      for (let i = 0; i < 10; i++) {
        if (done) {
          break
        }

        const output = await contract.getTicketsByRequestId(requestId)

        if (!output?.result || !output?.status) {
          await timeout(3000)
          continue
        }

        done = true
        prizes = output?.result
      }

      if (!done) {
        throw new Error('Unable to fetch spin result. Please try again later')
      }

      updateBalanceTICKET()
      if (prizes.length === 1) {
        setPrizeID(prizes?.[0]?.prizeId?.toNumber())
        return
      }

      setPrizeID(prizes.map(p => p?.prizeId?.toNumber()))
    } catch (err) {
      anime.remove(target)
      setConfirming(false)
      if (err.code === 4001) {
        toast.error('User Denied Transaction')
        return
      }

      const matches = err.message.match(/"execution reverted: (.*?)"/)
      if (matches?.[1]) {
        toast.error(matches?.[1])
        return
      }

      toast.error(err.message)
    }
  }, [account, amount, confirming, contract, networkIncorrect, spinning, syncRotationFromDom, updateBalanceTICKET])

  const prizesFromID = useMemo(() => {
    if (prizeID instanceof Array) {
      return prizeID.map(id => {
        const prize = prizes.find(x => x.id === id)
        if (!prize) {
          return null
        }

        return prize
      }).filter(x => !!x)
    }

    return [prizes.find(x => x.id === prizeID)].filter(x => !!x)
  }, [prizeID])

  useEffect(() => {
    if (!prizesFromID?.length) {
      return
    }

    const randomRotate = prize => {
      const position = slots.length - prize.positions[anime.random(0, prize.positions.length - 1)]
      const arcWidth = 360 / slots.length
      const arcEnd = (position * arcWidth) % 360
      const arcOffset = anime.random(1, arcWidth / 2)
      return arcEnd - arcOffset
    }

    if (prizesFromID?.length === 1) {
      return setRotate(randomRotate(prizesFromID?.[0]))
    }

    const rotates = prizesFromID.map(randomRotate)
    setRotate(rotates)
  }, [prizesFromID])

  useEffect(() => {
    if (rotate === null) {
      return
    }

    anime.remove(ref.current)
    finishSpinning(ref.current)
  }, [rotate, finishSpinning])

  const approveAndReloadTICKET = useCallback((amount) => {
    return approveTICKET(amount)
      .then((ok) => {
        if (ok) {
          toast.success(`Successfully approved your ${TICKET?.symbol}`)
        }
        return loadAllowanceTICKET()
      })
  }, [loadAllowanceTICKET, approveTICKET])
  const approveAndReloadGAFI = useCallback((amount) => {
    return approveGAFI(amount)
      .then((ok) => {
        if (ok) {
          toast.success(`Successfully approved your ${GAFI?.symbol}`)
        }
        return loadAllowanceGAFI()
      })
  }, [loadAllowanceGAFI, approveGAFI])

  const approveOrSpin = useCallback(() => {
    if (!account) {
      return
    }

    if (loadingAllowanceTICKET || loadingApprovalTICKET) {
      return
    }

    if (!balanceTICKETEnough) {
      return
    }

    if (allowanceTICKETEnough) {
      spin(ref.current)
      return
    }

    return approveAndReloadTICKET(constants.MaxUint256)
  }, [account, loadingAllowanceTICKET, loadingApprovalTICKET, balanceTICKETEnough, allowanceTICKETEnough, approveAndReloadTICKET, spin])

  const [showModal, setShowModal] = useState(false)
  const [purchasing, setPurchasing] = useState(false)

  const approveOrPurchase = useCallback(async () => {
    if (loadingAllowanceGAFI || loadingApprovalGAFI) {
      return
    }

    if (!balanceGAFIEnough) {
      return
    }

    if (!allowanceGAFIEnough) {
      approveAndReloadGAFI(constants.MaxUint256)
      return
    }

    if (!(valueInWeiGAFI instanceof BigNumber && valueInWeiGAFI.gt(0))) {
      return
    }

    if (!contract) {
      return
    }

    if (networkIncorrect) {
      return
    }

    if (purchasing) {
      return
    }

    setPurchasing(true)
    try {
      const tx = await contract.buyTicket(formatAmountTicket(amountPurchase))
      await tx.wait(1)
      toast.success('Tickets purchased successfully')
    } catch (err) {
      toast.error('Unable to purchase tickets')
    } finally {
      updateBalanceTICKET()
      setPurchasing(false)
      setShowModal(false)
    }
  }, [allowanceGAFIEnough, amountPurchase, approveAndReloadGAFI, balanceGAFIEnough, contract, formatAmountTicket, loadingAllowanceGAFI, loadingApprovalGAFI, networkIncorrect, purchasing, updateBalanceTICKET, valueInWeiGAFI])

  const { signMessage } = useWalletSignature()
  const [balanceFISH, setBalanceFISH] = useState<number | null>(0)
  const updateBalanceFISH = useCallback(() => {
    if (!account) {
      setBalanceFISH(0)
      return
    }

    fetcher(`/api/adventure/${account}/points`)
      .then(response => {
        if (!mounted.current) {
          return
        }

        if (!response?.currentPoint) {
          setBalanceFISH(0)
          return
        }

        setBalanceFISH(Number(response?.currentPoint))
      })
      .catch(() => {
        setBalanceFISH(0)
      })
  }, [account])
  useEffect(() => {
    updateBalanceFISH()
  }, [updateBalanceFISH])

  const [timeoutFISH, setTimeoutFISH] = useState<number>(0)
  const timeoutFISHInDate = useMemo<Date | null>(() => {
    if (!timeoutFISH) {
      return null
    }

    return new Date(timeoutFISH)
  }, [timeoutFISH])
  const updateTimeoutFISH = useCallback(async () => {
    if (!account) {
      setTimeoutFISH(0)
      return
    }

    if (!contract) {
      setTimeoutFISH(0)
      return
    }

    if (networkIncorrect) {
      setTimeoutFISH(0)
      return
    }

    const timeout = await contract.lockingTicketByFish(account)
    if (!(timeout instanceof BigNumber)) {
      setTimeoutFISH(0)
      return
    }

    setTimeoutFISH(timeout.toNumber() * 1000)
  }, [account, contract, networkIncorrect])
  useEffect(() => {
    updateTimeoutFISH()
  }, [updateTimeoutFISH])

  const [purchaseInFISH, setPurchaseInFISH] = useState<boolean>(true)
  const valueFISH = useMemo(() => {
    const v = formatAmountTicket(amountPurchase)
    return v * TICKET_PRICE_IN_FISH
  }, [amountPurchase, formatAmountTicket])

  const purchaseWithFISH = useCallback(async () => {
    if (valueFISH > MAX_TICKET_IN_FISH) {
      return
    }

    if (valueFISH > balanceFISH) {
      return
    }

    if (!contract) {
      return
    }

    if (purchasing) {
      return
    }

    if (timeoutFISH > now) {
      return
    }

    if (networkIncorrect) {
      return
    }

    setPurchasing(true)
    try {
      const signature = await signMessage()
      if (!signature) {
        throw new Error('Unable to sign your transaction')
      }

      const response = await fetcher('/api/adventure/gashapons', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-signature': signature,
          'x-wallet-address': account
        },
        body: JSON.stringify({
          amount: amountPurchase
        })
      })

      if (!response?.amount || !response?.requestId || !response?.signature || !response?.timestamp || !response.userWallet) {
        if (response?.statusCode && response?.message) {
          throw new Error(response.message)
        }

        throw new Error('Unable to verify your transaction')
      }

      await new Promise(resolve => {
        setTimeout(resolve, 4000)
      })
      const tx = await contract.buyTicketByFish(BigInt(response.requestId).toString(), response.timestamp, response.amount, response.signature)
      await tx.wait(1)
      toast.success('Tickets purchased successfully')
    } catch (err) {
      toast.error(err?.message || 'Unable to purchase tickets')
    } finally {
      updateBalanceTICKET()
      updateBalanceFISH()
      updateTimeoutFISH()
      setPurchasing(false)
      setShowModal(false)
    }
  }, [account, amountPurchase, balanceFISH, contract, networkIncorrect, now, purchasing, signMessage, timeoutFISH, updateBalanceFISH, updateBalanceTICKET, updateTimeoutFISH, valueFISH])
  const purchaseTickets = useCallback(async () => {
    if (!purchaseInFISH) {
      return approveOrPurchase()
    }

    return purchaseWithFISH()
  }, [approveOrPurchase, purchaseWithFISH, purchaseInFISH])

  return (
    <div className={clsx('container mx-auto lg:block font-atlas p-6 lg:p-12', className)}>
      <div className="flex flex-col md:flex-row justify-between gap-4 py-8 lg:py-10 xl:py-12">
        <div className="w-full flex flex-col items-center md:block">
          <div className="font-spotnik text-4xl 2xl:text-5xl font-bold uppercase w-full">
            <h3>GameFi.org</h3>
            <h4 className="text-2xl md:text-3xl xl:text-4xl flex items-center mt-2 gap-2">
              <Image src={f2gf} alt="fish to gafi"></Image> Lucky Spin
            </h4>
          </div>
          <p className="text-base mt-8">Challenge your luck with the multiverse&lsquo;s wheel of fortune by using the GameFi.org ticket given to you through the <Link passHref href="/insight/gamefi-org-lucky-spin-tell-fortune-with-the-multiverses-wheel-of-luck" ><a className="text-gamefiGreen-500 hover:underline hover:underline-offset-4">GAFI Stakers Thank-you tickets</a></Link>, or Community Referral Programs. </p>
          <p className="text-base mt-8">You can also redeem your Gafish earned from your Catventure or purchase with $GAFI. 1000 GAFI is waiting for you. Read the rules <Link passHref href="/insight/gamefi-org-lucky-spin-tell-fortune-with-the-multiverses-wheel-of-luck" ><a className="text-gamefiGreen-500 hover:underline hover:underline-offset-4">HERE</a></Link>.</p>
          <p className="text-base mt-8">Connect your wallet to start spinning. Good luck, Catstronaut!</p>
          {account && <div className="mt-12 w-full max-w-sm">
            <div className="clipped-b-l-t-r bg-gamefiDark-400 p-px">
              <div className="clipped-b-l-t-r bg-[#111]">
                <div className="flex items-center p-4 border-b border-gamefiDark-400">
                  <Image src={iconGF} alt="gafi" className="flex-none"></Image>
                  <div className="ml-4 flex-1">
                    <p className="text-sm text-white text-opacity-60">{GAFI.symbol}</p>
                    <p className="text-[20px] leading-none font-spotnik font-bold">{printNumber(balanceGAFIShort, 3)}</p>
                  </div>
                </div>
                <div className="flex items-center p-4 border-b border-gamefiDark-400">
                  <Image src={iconFish} alt="gamefi-fish" className="flex-none"></Image>
                  <div className="ml-4 flex-1">
                    <p className="text-sm text-white text-opacity-60">Gafish</p>
                    <p className="text-[20px] leading-none font-spotnik font-bold">{printNumber(balanceFISH)}</p>
                  </div>
                  <Link href="/happy-gamefiversary/tasks" passHref>
                    <a className="font-casual uppercase text-xs tracking-wide font-semibold px-3 py-2 border rounded-sm border-white">
                      + Get more
                    </a>
                  </Link>
                </div>
                <div className="flex items-center p-4">
                  <Image src={iconTicket} alt="gamefi-ticket" className="flex-none"></Image>
                  <div className="ml-4 flex-1">
                    <p className="text-sm text-white text-opacity-60">{TICKET.symbol}</p>
                    <p className="text-[20px] leading-none font-spotnik font-bold">{(!balanceTICKETShort || balanceTICKETShort === '0') ? '-' : printNumber(balanceTICKETShort, 3)}</p>
                  </div>
                  <button className="font-casual uppercase text-xs tracking-wide font-semibold px-3 py-2 border rounded-sm border-white" onClick={() => {
                    if (comingsoon) {
                      toast.success('Coming Soon!')
                      return
                    }

                    setShowModal(true)
                  }}>
                    + Get more
                  </button>
                </div>
              </div>
            </div>
            {!!prizesFromID?.length && !spinning && <div className="mt-8">
              <p className="leading-relaxed">Your results</p>
              <p className="leading-relaxed inline-flex flex-wrap gap-4">{prizesFromID.map((prize, index) => {
                if (loss(prize)) {
                  return <span key={index}>Lose 😥</span>
                }

                return <span key={index} className="text-gamefiGreen-500">{prize.text}</span>
              })}</p>
            </div>}
          </div>}

          {!account && <div className="mt-12 w-full">
            <p className="mb-4">Please connect your wallet to spin.</p>
            <div
              className="bg-gamefiGreen-600 hover:bg-opacity-80 uppercase py-2 px-5 rounded-sm clipped-t-r text-[13px] font-medium text-center cursor-pointer text-gamefiDark-800 inline-block"
              onClick={() => showConnectWallet(true)
              }>Connect Wallet</div>
          </div>}
        </div>
        <div className="w-full font-casual flex flex-col items-center">
          <svg
            className="w-full max-w-sm xl:max-w-md"
            viewBox={`${-pie.width / 2 - pie.strokeWidth} ${-pie.height / 2 - pie.strokeWidth} ${pie.width + pie.strokeWidth * 2} ${pie.height + pie.strokeWidth * 2}`}
          >
            <linearGradient id="linear_active" x1="0" y1="0" x2="100%" y2="150%">
              <stop offset="0%" stopColor="#CDFFCC" />
              <stop offset="100%" stopColor="white" />
            </linearGradient>
            <linearGradient id="linear_loss" x1="-70%" y1="0%" x2="60%" y2="0">
              <stop offset="0%" stopColor="#e15759" />
              <stop offset="100%" stopColor="white" />
            </linearGradient>

            <circle cx="0" cy="0" r={pie.width / 2} fill="transparent" stroke="white" strokeWidth={5}></circle>
            <g ref={ref}>
              <g stroke={pie.stroke} strokeWidth={pie.strokeWidth} strokeLinejoin={pie.strokeLinejoin} className="text-gamefiDark-900">
                {pie.arcs.map((arc) => <path key={arc.data.id} d={pie.arc(arc)} fill={slotActive?.id === arc.data.id ? (loss(arc.data) ? 'url(#linear_loss)' : 'url(#linear_active)') : '#fff'}></path>)}
              </g>

              <g fontFamily="sans-serif" fontSize={14} textAnchor="middle" className="font-extrabold" stroke="none">
                {pie.arcs.map((arc) => {
                  const midAngle = arc.startAngle / 2 + arc.endAngle / 2 + Math.PI
                  return <text key={arc.data.id} transform={`translate(${pie.arcLabel.centroid(arc)}) rotate(${(midAngle) * 180 / Math.PI + 180})`} className="uppercase">
                    {arc.data.lines.map((line, i) => <tspan key={i} x="0" y={`${i * 0.95}em`}>{line}</tspan>)}
                  </text>
                })}
              </g>
            </g>

            <g className="text-gamefiDark-900 font-mech font-semibold cursor-pointer hover:text-gamefiDark-700 select-none" onClick={() => {
              if (comingsoon) {
                toast.success('Coming Soon!')
                return
              }

              approveOrSpin()
            }}>
              <path transform="translate(-28 -85) scale (0.5)" d="M52.1095 16.8229L17.1195 85.7882C14.8242 90.3105 19.0688 95.3767 23.9207 93.9077L56.5 84.0273L89.0793 93.9077C93.9289 95.3791 98.1735 90.3105 95.8805 85.7882L60.8905 16.8229C59.066 13.2257 53.934 13.2257 52.1095 16.8229V16.8229Z" fill="currentColor" />

              <circle cx="0" cy="0" r="60" fill="currentColor"></circle>
              <circle cx="0" cy="0" r="55" fill="#fff"></circle>
              <circle cx="0" cy="0" r="50" fill={'currentColor'}></circle>
              <text fontSize={28} textAnchor="middle" y={10} stroke="none" fill={'white'} className="uppercase">
                {slotActive?.lines?.length > 1
                  ? slotActive.lines.map((line, i) =>
                    <tspan key={i} x="0" y={`${i * 1.1}em`} fontSize={i > 0 ? '0.75em' : ''}>{line}</tspan>
                  )
                  : (slotActive?.text || 'GO')}
              </text>
            </g>
          </svg>

          {comingsoon && <div className="border border-white rounded-sm flex mt-8">
            <div className="py-3.5 px-10 text-[13px] font-semibold uppercase bg-gamefiDark-800 border-r border-white cursor-pointer" onClick={() => {
              toast.success('Coming Soon!')
            }}>
              Coming Soon</div>
          </div>
          }

          {account && !comingsoon && <div className="border border-white rounded-sm flex mt-8 cursor-pointer">
            {!networkIncorrect && balanceTICKETEnough && allowanceTICKETEnough && <div className="py-3.5 px-10 text-[13px] font-semibold uppercase bg-gamefiDark-800 border-r border-white" onClick={() => {
              approveOrSpin()
            }}>
              {confirming
                ? 'Confirming...'
                : (
                  spinning
                    ? 'Spinning...'
                    : (parseInt(amount) > 1 ? 'Multiple Spin' : 'Spin')
                )}
            </div>}
            {!networkIncorrect && balanceTICKETEnough && !allowanceTICKETEnough && <div className="py-3.5 px-10 text-[13px] font-semibold uppercase bg-gamefiDark-800 border-r border-white" onClick={() => {
              approveOrSpin()
            }}>
              {(loadingApprovalTICKET || loadingAllowanceTICKET) ? 'Loading...' : 'Approve'}
            </div>}
            {!networkIncorrect && !balanceTICKETEnough && <div className="py-3.5 px-10 text-[13px] font-semibold uppercase bg-gamefiDark-800 border-r border-white">
              {(loadingApprovalTICKET || loadingAllowanceTICKET) ? 'Loading...' : 'Insufficient Tickets'}
            </div>}
            {networkIncorrect && <div className="py-3.5 px-10 text-[13px] font-semibold uppercase bg-gamefiDark-800 border-r border-white" onClick={() => switchNetwork(library?.provider, chainIDCorrect)}>
              Switch Network
            </div>}
            <div>
              <select
                value={amount}
                onChange={e => {
                  setAmount(e.target.value || '1')
                }}
                className="bg-gamefiDark-900 border-none h-full pl-4 pt-1 min-w-0 m-0 w-18 font-spotnik font-bold text-base leading-none"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="5">5</option>
                <option value="10">10</option>
              </select>
            </div>
          </div>}
        </div>
      </div>

      <Modal
        show={showModal} toggle={setShowModal} className='dark:bg-transparent fixed z-50 sm:max-w-xs'
      >
        <div className="bg-gamefiDark-650">
          <div className="p-6 pt-10 flex justify-center">
            <div className="w-full flex justify-center flex-col">
              <div className="flex w-full text-sm text-center mt-4">
                <div onClick={() => setPurchaseInFISH(false)} className={`p-2 leading-1 flex items-center justify-center flex-1 rounded cursor-pointer ${purchaseInFISH ? 'hover:underline underline-offset-8' : 'bg-gamefiGreen-500 text-black font-medium'}`}>Pay with ${GAFI.symbol}</div>
                <div onClick={() => setPurchaseInFISH(true)} className={`p-2 leading-1 flex items-center justify-center flex-1 rounded cursor-pointer ${!purchaseInFISH ? 'hover:underline underline-offset-8' : 'bg-gamefiGreen-500 text-black font-medium'}`}>Pay with Gafish</div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-bold mb-2">
                  Balance
                </label>
                {purchaseInFISH && <input className="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gamefiDark-650" type="text" readOnly value={`${balanceFISH} Gafish`} />}
                {!purchaseInFISH && <input className="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gamefiDark-650" type="text" readOnly value={`${balanceGAFIShort} GAFI`} />}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-bold mb-2">
                  Price
                </label>
                {purchaseInFISH && <input className="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gamefiDark-650" type="text" readOnly value={`${TICKET_PRICE_IN_FISH} Gafish`} />}
                {!purchaseInFISH && <input className="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gamefiDark-650" type="text" readOnly value={`${TICKET_PRICE_IN_GAFI} GAFI`} />}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-bold mb-2">
                  Amount
                </label>
                <input className="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gamefiDark-900" type="text" value={amountPurchase} onChange={e => {
                  setAmountPurchase((formatAmountTicket(e.target.value) || '').toString())
                }} />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-bold mb-2">
                  Total
                </label>
                {purchaseInFISH && <input className="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gamefiDark-650" type="text" readOnly value={`${valueFISH} Gafish`} />}
                {!purchaseInFISH && <input className="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gamefiDark-650" type="text" readOnly value={`${valueGAFI} GAFI`} />}
              </div>
              {networkIncorrect && <div className="mt-6 py-2 px-4 md:py-3 md:px-8 bg-gamefiGreen-500 text-gamefiDark-900 font-bold text-[13px] uppercase rounded-xs hover:opacity-95 cursor-pointer clipped-b-l-t-r text-center" onClick={() => switchNetwork(library?.provider, chainIDCorrect)}>
                Switch Network
              </div>}
              {purchaseInFISH && timeoutFISH > now && timeoutFISHInDate && <span className="text-xs mt-2 text-center">
                Available at {format(timeoutFISHInDate, 'HH:mm:ss')}
              </span>}
              {!networkIncorrect && <button
                className='mt-6 py-2 px-4 md:py-3 md:px-8 bg-gamefiGreen-500 text-gamefiDark-900 font-bold text-[13px] uppercase rounded-xs hover:opacity-95 cursor-pointer clipped-b-l-t-r text-center'
                onClick={() => { purchaseTickets() }}
              >
                {purchaseInFISH && <span>{
                  valueFISH > MAX_TICKET_IN_FISH
                    ? `Maximum ${MAX_TICKET_IN_FISH} tickets`
                    : (valueFISH > balanceFISH
                      ? 'Insufficient Gafish'
                      : (
                        timeoutFISH > now
                          ? 'Cooldown'
                          : (
                            purchasing ? 'Confirming...' : 'Purchase'
                          )
                      ))
                }</span>}
                {!purchaseInFISH && <span>
                  {(loadingAllowanceGAFI || loadingApprovalGAFI)
                    ? 'Loading...'
                    : (
                      !balanceGAFIEnough
                        ? 'Insufficient GAFI'
                        : (
                          !allowanceGAFIEnough
                            ? 'Approve'
                            : (
                              purchasing ? 'Confirming...' : 'Purchase'
                            )
                        )
                    )}
                </span>}
              </button>}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Spin
