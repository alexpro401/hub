import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Layout from '@/components/Layout'
import imgNA from '@/assets/images/ranks/na.png'
import { API_BASE_URL } from '@/utils/constants'
import { fetcher, safeToFixed, shortenAddress } from '@/utils'
import ABIStakingPool from '@/components/web3/abis/StakingPool.json'
import ABIERC20 from '@/components/web3/abis/ERC20.json'
import { useWeb3Default, GAFI } from '@/components/web3'
import { Contract, BigNumber, utils } from 'ethers'
import { useAppContext } from '@/context'
import { useMyWeb3 } from '@/components/web3/context'
import { TabPanel, Tabs } from '@/components/Base/Tabs'
import Image from 'next/image'
import TabStake from '@/components/Pages/Staking/TabStake'
import TabUnstake from '@/components/Pages/Staking/TabUnstake'
import Ranks from '@/components/Pages/Staking/Ranks'
import FilterDropdown from '@/components/Pages/Home/FilterDropdown'
import TopRanking from '@/components/Pages/Staking/TopRanking'
import { handleChangeStaking } from '@/components/Pages/Staking/utils'

const Staking = ({ data }) => {
  const mounted = useRef(false)
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  const pool = useMemo(() => data.pool, [data])
  const { tiers, myTier, loadMyStakingData } = useAppContext()
  useEffect(() => {
    tiers.actions.setConfigs(data.tierConfigs)
  }, [data, tiers])

  const tierMine = useMemo(() => myTier.state.tier, [myTier])
  const stakingMine = useMemo(() => myTier.state.staking, [myTier])
  const loadMyStaking = useCallback(() => {
    return loadMyStakingData(pool)
  }, [loadMyStakingData, pool])
  useEffect(() => {
    loadMyStaking()
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
  const contractGÀIReadonly = useMemo(() => {
    if (!libraryDefault) {
      return null
    }

    return new Contract(GAFI.address, ABIERC20, libraryDefault)
  }, [libraryDefault])
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

    if (!contractStakingReadonly) {
      setPendingWithdrawal({
        time: 0,
        amount: 0
      })
      return
    }

    setPendingWithdrawal({
      time: null,
      amount: null
    })

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
    if (!contractGÀIReadonly) {
      setTotalStaked(null)
      return
    }

    if (!pool?.pool_address) {
      return
    }

    contractGÀIReadonly.balanceOf(pool.pool_address).then(x => {
      if (!mounted.current) {
        return
      }

      setTotalStaked(x)
    })
  }, [contractGÀIReadonly, pool, mounted])

  useEffect(() => {
    loadMyPending()
  }, [loadMyPending])

  const [tab, setTab] = useState(0)

  const [rankingSelected, setRankingSelected] = useState()
  const [isLive, setIsLive] = useState(null)
  const rankingOptions = useMemo(() => {
    let all = (data?.legendSnapshots || []).sort((a, b) => b.snapshot_at - a.snapshot_at).map(s => {
      return {
        key: s.id,
        label: s.name,
        value: s.top.map(x => ({ ...x, snapshot_at: x.snapshot_at ? new Date(x.snapshot_at * 1000) : null, wallet_address: shortenAddress(x.wallet_address, '*', 14, 13) }))
      }
    })

    if (data?.legendCurrent) {
      all = [{
        key: 0,
        label: 'Realtime',
        value: data.legendCurrent.map(x => ({ wallet_address: x.wallet_address, amount: parseFloat(x.amount), snapshot_at: x.last_time ? new Date(x.last_time * 1000) : null }))
      }, ...all]
    }

    return all
  }, [data])
  useEffect(() => {
    if (!rankingSelected) {
      const selected = handleChangeStaking(rankingOptions, rankingOptions?.[0], account)
      setRankingSelected(selected.value)
    }

    if (isLive === null) {
      setIsLive(!rankingOptions?.[0]?.key)
    }
  }, [rankingOptions, rankingSelected, isLive, account])
  const handleRankingOption = (item: any) => {
    setIsLive(!item?.key)
    const selected = handleChangeStaking(rankingOptions, item, account)
    setRankingSelected(selected.value)
  }

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
              {(!account || !tierMine) && <img src={imgNA.src} className="hidden md:block w-20 mr-2" alt="No Rank" />}
              {account && tierMine && <div className="hidden md:block w-20 mr-1 md:mr-2"> <Image src={tierMine.image} layout='responsive' objectFit='contain' alt={tierMine.name} /> </div>}
              <div>
                <span className="font-bold text-xs md:text-sm uppercase text-white opacity-50">Current Rank</span>
                {!account && <p className="sm:font-casual font-medium text-xs md:text-sm text-gamefiGreen-500 leading-6">Connect Wallet</p>}
                {account && <p className="font-semibold text-lg md:text-2xl text-white leading-6">{tierMine ? tierMine.name : 'Loading...'}</p>}
              </div>
            </div>
            <div className="px-1 md:px-10 sm:px-2 flex-1 md:flex-initial flex items-center border-r border-gamefiDark-600">
              <div>
                <span className="font-bold text-xs md:text-sm uppercase text-white opacity-50">Your Stake</span>
                {!account && <p className="sm:font-casual font-medium text-xs md:text-sm text-gamefiGreen-500 leading-6">Connect Wallet</p>}
                {account && <p className="font-semibold text-lg md:text-2xl text-white leading-6">{stakingMine?.tokenStaked !== undefined ? safeToFixed(stakingMine?.tokenStaked, 4) : 'Loading...'}</p>}
              </div>
            </div>
            <div className="px-1 md:px-10 sm:px-2 flex-1 md:flex-initial flex items-center border-r border-gamefiDark-700">
              <div>
                <span className="font-bold text-xs md:text-sm uppercase text-white opacity-50"><span className="hidden sm:inline">$GAFI Left To</span> Next Rank</span>
                {!account && <p className="sm:font-casual font-medium text-xs md:text-sm text-gamefiGreen-500 leading-6">Connect Wallet</p>}
                {account && <p className="font-semibold text-lg md:text-2xl text-white leading-6">{stakingMine?.nextTokens !== null ? safeToFixed(stakingMine?.nextTokens, 4) : 'Loading...'}</p>}
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

        <Ranks />

        <Tabs
          titles={[
            'Stake',
            'Unstake',
            'Legendary Ranking'
          ]}
          currentValue={tab}
          onChange={setTab}
          className="mt-2 sm:mt-6 lg:mt-10 sticky top-0 bg-gamefiDark-900 z-50"
        />

        <div>
          <TabPanel value={tab} index={0}>
            <TabStake {...{ pool, contractStaking, loadMyStaking, stakingMine, loadMyPending, pendingWithdrawal }} />
          </TabPanel>
          <TabPanel value={tab} index={1}>
            <TabUnstake {...{ pool, contractStaking, loadMyStaking, stakingMine, loadMyPending, pendingWithdrawal, goStake: () => { setTab(0) } }} />
          </TabPanel>
          <TabPanel value={tab} index={2}>
            <div className="md:text-lg 2xl:text-2xl uppercase font-bold flex mt-6 items-center">
              <span className="mr-2">Ranking</span><FilterDropdown items={rankingOptions} selected={rankingSelected} onChange={handleRankingOption}></FilterDropdown>
            </div>
            {<TopRanking isLive={isLive} rankings={rankingSelected} />}
          </TabPanel>
        </div>
      </div>
    </Layout>
  )
}

export default Staking

export async function getServerSideProps() {
  const [pools, tierConfigs, legendSnapshots, legendCurrent] = await Promise.all([
    fetcher(`${API_BASE_URL}/staking-pool`),
    fetcher(`${API_BASE_URL}/get-tiers`),
    fetcher(`${API_BASE_URL}/staking-pool/legend-snapshots`),
    fetcher(`${API_BASE_URL}/staking-pool/legend-current`)
  ])

  return {
    props: {
      data: {
        pool: pools?.data?.[0] || null,
        tierConfigs: tierConfigs?.data || null,
        legendSnapshots: legendSnapshots?.data || null,
        legendCurrent: legendCurrent?.data || null
      }
    }
  }
}
