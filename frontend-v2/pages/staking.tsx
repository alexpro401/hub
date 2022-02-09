import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Layout from '@/components/Layout'
import imgNA from '@/assets/images/ranks/na.png'
import { API_BASE_URL } from '@/utils/constants'
import { fetcher } from '@/utils'
import ABIStakingPool from '@/components/web3/abis/StakingPool.json'
import { useWeb3Default, GAFI } from '@/components/web3'
import { Contract, BigNumber, utils } from 'ethers'
import { useAppContext } from '@/context'
import { useMyWeb3 } from '@/components/web3/context'
import { TabPanel, Tabs } from '@/components/Base/Tabs'
import Image from 'next/image'
import TabStake from '@/components/Pages/Staking/TabStake'
import TabUnstake from '@/components/Pages/Staking/TabUnstake'

const Staking = ({ data }) => {
  const mounted = useRef(false)
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  const pool = useMemo(() => data.pool, [data])
  const { tiers, myTier } = useAppContext()
  useEffect(() => {
    tiers.actions.setConfigs(data.tierConfigs)
  }, [data, tiers])

  const tierMine = useMemo(() => myTier.state.tier, [myTier])
  const stakingMine = useMemo(() => myTier.state.staking, [myTier])
  const loadMyStaking = useCallback(() => {
    if (!myTier?.actions?.loadData) {
      return
    }

    myTier.actions.loadData()
  }, [myTier])
  useEffect(() => {
    if (!loadMyStaking) {
      return
    }

    const interval = setInterval(loadMyStaking, 10000)
    return () => clearInterval(interval)
  }, [loadMyStaking])

  const [totalStaked, setTotalStaked] = useState<BigNumber | null>(null)
  const totalStakedNumber = useMemo(() => {
    if (totalStaked === null) {
      return 0
    }

    return parseFloat(utils.formatUnits(totalStaked, GAFI.decimals))
  }, [totalStaked])

  const { library: libraryDefault } = useWeb3Default()
  const { library, account } = useMyWeb3()
  const contractStakingReadonly = useMemo(() => {
    if (!libraryDefault || !pool) {
      return null
    }

    return new Contract(pool.pool_address, ABIStakingPool, libraryDefault)
  }, [libraryDefault, pool])
  const contractStaking = useMemo(() => {
    if (!library || !pool) {
      return null
    }

    return new Contract(pool.pool_address, ABIStakingPool, library.getSigner())
  }, [library, pool])

  const [pendingWithdrawal, setPendingWithdrawal] = useState({
    amount: null,
    time: null
  })

  const loadMyPending = useCallback(() => {
    if (!account) {
      setPendingWithdrawal({
        time: 0,
        amount: 0
      })
      return
    }

    contractStakingReadonly.linearPendingWithdrawals(pool.pool_id, account).then(x => {
      if (!mounted.current) {
        return
      }

      const time = x.applicableAt.toNumber()
      const amount = x.amount

      if (!time) {
        setPendingWithdrawal({
          time: 0,
          amount: 0
        })
        return
      }

      setPendingWithdrawal({
        time: new Date(time * 1000),
        amount
      })
    })
  }, [account, contractStakingReadonly, pool, setPendingWithdrawal, mounted])

  useEffect(() => {
    if (!contractStakingReadonly) {
      setTotalStaked(null)
      setPendingWithdrawal({
        time: 0,
        amount: 0
      })
      return
    }

    contractStakingReadonly.linearTotalStaked(pool.pool_id).then(x => {
      if (!mounted.current) {
        return
      }

      setTotalStaked(x)
    })

    loadMyPending()
  }, [contractStakingReadonly, pool, loadMyPending, mounted])

  const [tab, setTab] = useState(0)

  if (!pool) {
    return (<Layout title="GameFi Staking">
      <div className="px-1 md:px-4 lg:px-16 md:container mx-auto lg:block pb-4">
        No Pool Available
      </div>
    </Layout>)
  }

  return (
    <Layout title="GameFi Staking">
      <div className="px-2 md:px-4 lg:px-16 mx-auto lg:block max-w-7xl pb-4">
        <div className="p-px bg-gradient-to-r from-gamefiDark-500 via-gamefiDark-800 rounded">
          <div className="bg-gradient-to-r from-gamefiDark-800 via-gamefiDark-900 to-gamefiDark-900 rounded flex">
            <div className="py-1 px-1 md:px-10 sm:px-2 pl-1 sm:pl-2 md:pl-4 flex-1 md:flex-initial flex items-center border-r border-gamefiDark-500">
              { (!account || !tierMine) && <img src={imgNA.src} className="hidden md:block w-20 mr-2" alt="No Rank" /> }
              { account && tierMine && <div className="hidden md:block w-20 mr-1 md:mr-2"> <Image src={tierMine.image} layout='responsive' objectFit='contain' alt={tierMine.name}/> </div> }
              <div>
                <span className="font-bold text-xs md:text-sm uppercase text-white opacity-50">Current Rank</span>
                { !account && <p className="sm:font-casual font-medium text-xs md:text-sm text-gamefiGreen-500 leading-6">Connect Wallet</p>}
                { account && <p className="font-semibold text-lg md:text-2xl text-white leading-6">{tierMine ? tierMine.name : 'Loading...'}</p>}
              </div>
            </div>
            <div className="px-1 md:px-10 sm:px-2 flex-1 md:flex-initial flex items-center border-r border-gamefiDark-600">
              <div>
                <span className="font-bold text-xs md:text-sm uppercase text-white opacity-50">Your Stake</span>
                { !account && <p className="sm:font-casual font-medium text-xs md:text-sm text-gamefiGreen-500 leading-6">Connect Wallet</p>}
                { account && <p className="font-semibold text-lg md:text-2xl text-white leading-6">{stakingMine?.tokenStaked !== undefined ? stakingMine?.tokenStaked : 'Loading...'}</p>}
              </div>
            </div>
            <div className="px-1 md:px-10 sm:px-2 flex-1 md:flex-initial flex items-center border-r border-gamefiDark-700">
              <div>
                <span className="font-bold text-xs md:text-sm uppercase text-white opacity-50"><span className="hidden sm:inline">$GAFI Left To</span> Next Rank</span>
                { !account && <p className="sm:font-casual font-medium text-xs md:text-sm text-gamefiGreen-500 leading-6">Connect Wallet</p>}
                { account && <p className="font-semibold text-lg md:text-2xl text-white leading-6">{stakingMine?.nextTokens !== null ? stakingMine?.nextTokens : 'Loading...'}</p>}
              </div>
            </div>
            <div className="px-1 md:px-10 sm:px-2 flex-1 md:flex-initial flex items-center">
              <div>
                <span className="font-bold text-xs md:text-sm uppercase text-white opacity-50">Total <span className="hidden sm:inline">$GAFI</span> Staked</span>
                <p className="font-semibold text-lg md:text-2xl text-white leading-6">{totalStaked === null ? 'Loading...' : totalStakedNumber.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 md:mt-10">
          <div className="flex font-casual">
            <div className="hidden sm:flex w-32 md:w-40 flex-none flex-col">
              <p className="text-xs md:text-sm sm:leading-10 md:leading-10 mt-auto">$GAFI Required</p>
              <p className="text-xs md:text-sm sm:leading-10 md:leading-10">Winner Selection</p>
              <p className="text-xs md:text-sm sm:leading-10 md:leading-10 truncate">Max <span className="hidden md:inline">Individual</span> Allocation</p>
              <p className="text-xs md:text-sm sm:leading-10 md:leading-10">Withdrawal Delay</p>
            </div>
            <div className="flex-1 flex w-full">
              { tiers.state.all.map(tier => {
                return <div className="flex-1 flex flex-col items-center justify-center overflow-x-hidden" key={tier.name}>
                  <div className="w-1/2 relative mb-auto">
                    <Image src={tier.image} layout='responsive' objectFit='contain' alt={tier.name}/>
                  </div>
                  <p className="font-mechanic font-bold text-base uppercase">{tier.name}</p>
                  { tier.config.requirement && <div className="w-full text-sm leading-10 flex items-center"><span className="w-full text-xs md:text-sm leading-10 md:leading-10 opacity-50 truncate">{tier.config.requirement}</span>
                    <div className="hidden relative group z-10">
                      <svg className="w-4 h-4 ml-2" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM9 12H7V7H9V12ZM8 6C7.4 6 7 5.6 7 5C7 4.4 7.4 4 8 4C8.6 4 9 4.4 9 5C9 5.6 8.6 6 8 6Z" fill="#858689"/>
                      </svg>
                      <div className="absolute inset-x-0 bottom-0 z-50 flex flex-col items-center hidden mb-6 group-hover:flex">
                        <span className="relative z-10 p-4 text-xs leading-5 text-white whitespace-no-wrap bg-black w-96">{tier.config.requirementDescription}</span>
                        <div className="w-3 h-3 -mt-2 rotate-45 bg-black"></div>
                      </div>
                    </div>
                  </div> }
                  { !tier.config.requirement && <p className="w-full text-xs md:text-sm leading-10 md:leading-10 opacity-50 truncate"><span className="hidden md:inline">Min</span> {tier.config.tokens} ${GAFI.symbol}</p> }
                  <p className="w-full text-xs md:text-sm leading-10 md:leading-10 opacity-50 truncate">{ tier.method || '—' }</p>
                  <p className="w-full text-xs md:text-sm leading-10 md:leading-10 opacity-50 truncate">{ tier.config.max ? `$${tier.config.max}` : '—' }</p>
                  <p className="w-full text-xs md:text-sm leading-10 md:leading-10 opacity-50 truncate">{ tier.config.delay ? `${tier.config.delay} days` : '—' }</p>
                </div>
              }) }
            </div>
          </div>
        </div>

        <Tabs
          titles={[
            'Stake',
            'Unstake',
            'Legendary Ranking'
          ]}
          currentValue={tab}
          onChange={setTab}
          className="mt-2 md:mt-10"
        />

        <div>
          <TabPanel value={tab} index={0}>
            <TabStake {...{ pool, contractStaking, loadMyStaking, stakingMine, loadMyPending, pendingWithdrawal }} />
          </TabPanel>
          <TabPanel value={tab} index={1}>
            <TabUnstake {...{ pool, contractStaking, loadMyStaking, stakingMine, loadMyPending, pendingWithdrawal, goStake: () => { setTab(0) } }} />
          </TabPanel>
          <TabPanel value={tab} index={2}>Legendary Ranking</TabPanel>
        </div>
      </div>
    </Layout>
  )
}

export default Staking

export async function getServerSideProps () {
  const [pools, tierConfigs] = await Promise.all([
    fetcher(`${API_BASE_URL}/staking-pool`),
    fetcher(`${API_BASE_URL}/get-tiers`)
  ])

  return {
    props: {
      data: {
        pool: pools?.data?.[0] || null,
        tierConfigs: tierConfigs?.data || null
      }
    }
  }
}
