import Layout from 'components/Layout'
import React, { useCallback, useEffect, useState } from 'react'
import MarketplaceDetail from 'components/Pages/INO/MarketplaceDetail'
import { fetchOneCollection } from 'pages/api/market/collection/[slug]'
import axios from 'utils/axios'
import { Contract } from '@ethersproject/contracts'
import ERC721Abi from 'components/web3/abis/Erc721.json'
import { useWeb3Default } from 'components/web3'
import LoadingOverlay from 'components/Base/LoadingOverlay'

const MarketplaceDetailPage = ({ projectInfo, params }: any) => {
  const [loading, setLoading] = useState(true)
  const { library } = useWeb3Default()
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const getTokenInfo = useCallback(async () => {
    try {
      if (!projectInfo) {
        setLoading(false)
        return
      }
      if (!library) return
      if (+projectInfo.use_external_uri === 1) {
        const result = await axios.post(`/marketplace/collection/${projectInfo.token_address}/${params.id}`)
        const info = result.data.data
        if (info) {
          setTokenInfo({ ...info, id: params.id })
        }
      } else {
        const erc721Contract = new Contract(projectInfo.token_address, ERC721Abi, library)
        const tokenURI = await erc721Contract.tokenURI(params.id)
        const info = (await axios.get(tokenURI)).data || {}
        setTokenInfo({ ...info, id: params.id })
      }
    } catch (error) {
      console.log('error', error)
    }
    setLoading(false)
  }, [projectInfo, params, library])

  useEffect(() => {
    getTokenInfo().catch(err => {
      console.debug(err)
    })
  }, [getTokenInfo])

  return <Layout title="GameFi Market">
    {
      loading
        ? <LoadingOverlay loading></LoadingOverlay>
        : (
          !projectInfo || !tokenInfo
            ? <div className='h-60 w-full flex items-center justify-center'> <h1 className='text-6xl text-center uppercase font-bold'>Not Found</h1> </div>
            : <MarketplaceDetail projectInfo={projectInfo} tokenInfo={tokenInfo} />
        )
    }
  </Layout>
}

export default MarketplaceDetailPage

export async function getServerSideProps ({ params }) {
  if (!params?.slug) {
    return { props: { projectInfo: null } }
  }
  if (!params?.id) {
    return { props: { projectInfo: null } }
  }
  const data = await fetchOneCollection(params.slug)
  if (!data?.data) {
    return { props: { projectInfo: null } }
  }

  return { props: { projectInfo: data.data, params } }
}
