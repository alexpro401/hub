import { getLibraryDefaultFlexible } from '@/components/web3/utils'
import { fetcher } from '@/utils'
import { API_BASE_URL } from '@/utils/constants'
import { Contract } from 'ethers'
import ABIStakingPool from '@/components/web3/abis/StakingPool.json'
import { BUSD_BSC, GAFI } from '@/components/web3'

export type Pool = {
  id: string;
  title: string;
  logo: string;
  contractAddress: string;
  network: string;
  token?: string;
  tokenAddress?: string;
  tokenImage?: string;
  tokenDecimals?: number;
  cap?: string;
  totalStaked?: string;
  minInvestment?: string;
  maxInvestment?: string;
  APR?: string;
  lockDuration?: string;
  delayDuration?: string;
  startJoinTime?: string;
  endJoinTime?: string;
  buyURL?: string;
}

export function fetchAll () {
  return fetcher(`${API_BASE_URL}/staking-pool`).then(pools => {
    const poolsAPI = (pools?.data || []).filter(x => !x?.rkp_rate)
    return Promise.all(poolsAPI.map(async ({ pool_id: poolID, title, logo, pool_address: contractAddress, network_available: network }): Promise<Pool> => {
      const library = await getLibraryDefaultFlexible(null, network)
      const data = {
        id: poolID,
        title,
        logo,
        contractAddress,
        network
      }

      if (!library) {
        return data
      }

      const contract = new Contract(contractAddress, ABIStakingPool, library)
      const linearData = await contract.linearPoolInfo(poolID)
      console.log(linearData.totalStaked.toString())
      return {
        ...data,
        token: GAFI.symbol,
        tokenAddress: GAFI.address,
        tokenImage: GAFI.image,
        tokenDecimals: GAFI.decimals,
        cap: linearData.cap.toString(),
        totalStaked: linearData.totalStaked.toString(),
        minInvestment: linearData.minInvestment.toString(),
        maxInvestment: linearData.maxInvestment.toString(),
        APR: linearData.APR.toString(),
        lockDuration: linearData.lockDuration.toString(),
        delayDuration: linearData.delayDuration.toString(),
        startJoinTime: linearData.startJoinTime.toString(),
        endJoinTime: linearData.endJoinTime.toString(),
        buyURL: `https://pancakeswap.finance/swap?outputCurrency=${GAFI.address}&inputCurrency=${BUSD_BSC.address}`
      }
    }))
  })
}

export default async function handler (req, res) {
  try {
    const data = await fetchAll()
    if (!data) {
      throw new Error('Invalid response')
    }

    res.status(200).json({ data })
  } catch (err) {
    res.status(500).json({ error: 'failed to load data' })
  }
}
