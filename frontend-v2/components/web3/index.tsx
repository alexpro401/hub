import { useWeb3React, createWeb3ReactRoot } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import React, { ReactNode, useEffect } from 'react'
import { network, POLLING_INTERVAL } from './connectors'

export function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider)
  library.pollingInterval = POLLING_INTERVAL
  return library
}

export const DEFAULT_WEB3 = 'NETWORK'
export const DEFAULT_CONNECTOR = network
export function useWeb3Default () {
  return useWeb3React<Web3Provider>(DEFAULT_WEB3)
}

const DefaultConnector = ({ children }) => {
  const contextDefault = useWeb3Default()
  const { active: activeDefault, activate: activateDefault } = contextDefault
  useEffect(() => {
    if (activeDefault) {
      return
    }

    activateDefault(DEFAULT_CONNECTOR).finally(() => {})
    console.debug('activate default connector')
  }, [activeDefault, activateDefault])
  return <>{children}</>
}

interface PropsType {
  children?: ReactNode
  getLibrary (provider: any): Web3Provider
}

export class ErrorBoundaryWeb3ProviderNetwork extends React.Component<PropsType, { hasError: boolean }> {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }
  render() {
    let Web3ReactProviderDefault
    try {
      Web3ReactProviderDefault = createWeb3ReactRoot(DEFAULT_WEB3)
    } catch (e) {
      return <>{this.props.children}</>
    }
    if (this.state.hasError) {
      return <>{this.props.children}</>
    }
    return <Web3ReactProviderDefault getLibrary={this.props.getLibrary}>
      <DefaultConnector>
        {this.props.children}
      </DefaultConnector>
    </Web3ReactProviderDefault>
  }
}

export const networks = [{
  id: 5,
  name: 'Ethereum',
  image: require('assets/images/icons/ethereum.svg')
}, {
  id: 56,
  name: 'BSC',
  image: require('assets/images/icons/bsc.svg')
}, {
  id: 137,
  name: 'Polygon',
  image: require('assets/images/icons/polygon.svg')
}]

export const wallets = [{
  id: 'metamask',
  name: 'MetaMask',
  networks: [5, 56, 137],
  image: require('assets/images/icons/metamask.svg')
}, {
  id: 'bsc-wallet',
  name: 'BSC Wallet',
  networks: [5, 56],
  image: require('assets/images/icons/bsc.svg')
}, {
  id: 'walletconnect',
  name: 'WalletConnect',
  networks: [5, 56, 137],
  image: require('assets/images/icons/walletconnect.svg')
}]