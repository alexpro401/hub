import { useMyWeb3 } from '@/components/web3/context'
import { ethers } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import POOL_ABI from '@/components/web3/abis/Pool.json'
import { useLibraryDefaultFlexible } from '@/components/web3/utils'

export const useUserPurchased = (address: string, networkAlias: string) => {
  const [userPurchasedTokens, setUserPurchasedTokens] = useState('0')
  const { account, network } = useMyWeb3()
  const { provider } = useLibraryDefaultFlexible(networkAlias)

  const updatePurchasedTokens = useCallback(async () => {
    if (!address || !account || !provider || network?.alias !== networkAlias.toLowerCase()) {
      return
    }
    try {
      const poolContract = new ethers.Contract(address, POOL_ABI, provider)
      const purchased = await poolContract.userPurchased(account)
      setUserPurchasedTokens(ethers.utils.formatEther(purchased) || '0')
    } catch (e) {
      console.debug(e)
    }
  }, [account, address, network, networkAlias, provider])

  useEffect((): any => {
    updatePurchasedTokens()
  }, [updatePurchasedTokens])

  return {
    userPurchasedTokens,
    updatePurchasedTokens
  }
}