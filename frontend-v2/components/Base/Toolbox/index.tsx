import React, { useState } from 'react'
import Image from 'next/image'
import ToolboxItem from './ToolboxItem'
import MenuLink from './MenuLink'
import WalletConnector from '../WalletConnector'
import Topbar from '../Topbar'

const Toolbox = () => {
  const [showMenu, setShowMenu] = useState(false)
  return (
    <>
      <div className="fixed w-full bottom-0 grid grid-cols-5 md:hidden dark:bg-gamefiDark-700" style={{ boxShadow: 'inset -1px 0px 0px #303442', zIndex: '1000' }}>
        <ToolboxItem path='/'>
          <Image src={require('@/assets/images/icons/home.svg')} alt='home'></Image>
        </ToolboxItem>
        <ToolboxItem path='/hub'>
          <Image src={require('@/assets/images/icons/controller.svg')} alt='hub'></Image>
        </ToolboxItem>
        <ToolboxItem path='/ino'>
          <Image src={require('@/assets/images/icons/nft.svg')} alt='ino'></Image>
        </ToolboxItem>
        <ToolboxItem path='/igo'>
          <Image src={require('@/assets/images/icons/spaceship.svg')} alt='launchpad'></Image>
        </ToolboxItem>
        <button
          className={'relative w-full py-4 flex flex-col align-middle items-center justify-center uppercase text-xs lg:text-sm font-semibold cursor-pointer opacity-40'}
          onClick={() => setShowMenu(true)}
        >
          <Image src={require('@/assets/images/icons/menuToggler.svg')} alt='menu'></Image>
        </button>
      </div>
      <div className={`flex flex-col fixed left-0 top-0 bottom-0 right-0 md:hidden dark:bg-gamefiDark-900 overflow-auto hide-scrollbar menu-slide-up ${showMenu ? 'h-full' : 'h-0'}`} style={{ boxShadow: 'inset -1px 0px 0px #303442', zIndex: '99' }}>
        <Topbar className="flex-none"></Topbar>
        <div className="flex-1 overflow-y-auto">
          <MenuLink onClick={() => setShowMenu(false)} path='/'>
            <Image src={require('@/assets/images/icons/home.svg')} alt='home'></Image>
            <span>Home</span>
          </MenuLink>
          <MenuLink onClick={() => setShowMenu(false)} path='/hub'>
            <Image src={require('@/assets/images/icons/controller.svg')} alt='hub'></Image>
            <span>Hub</span>
          </MenuLink>
          <MenuLink onClick={() => setShowMenu(false)} path='/igo'>
            <Image src={require('@/assets/images/icons/spaceship.svg')} alt='launchpad'></Image>
            <span>Launchpad</span>
          </MenuLink>
          <MenuLink onClick={() => setShowMenu(false)} path='/ino'>
            <Image src={require('@/assets/images/icons/nft.svg')} alt='ino'></Image>
            <span>INO</span>
          </MenuLink>
          <MenuLink onClick={() => setShowMenu(false)} path='/marketplace'>
            <Image src={require('@/assets/images/icons/shop.svg')} alt='marketplace'></Image>
            <span>Marketplace</span>
          </MenuLink>
          <MenuLink onClick={() => setShowMenu(false)} path='/staking'>
            <Image src={require('@/assets/images/icons/coin.svg')} alt='staking'></Image>
            <span>Staking</span>
          </MenuLink>
          <MenuLink onClick={() => setShowMenu(false)} path='/earn'>
            <Image src={require('@/assets/images/icons/earn.svg')} alt='earn'></Image>
            <span>Earn</span>
          </MenuLink>
          <MenuLink onClick={() => setShowMenu(false)} path='/insight'>
            <Image src={require('@/assets/images/icons/news.svg')} alt='insight'></Image>
            <span>Insight</span>
          </MenuLink>
          <MenuLink onClick={() => setShowMenu(false)} path='/metaverse'>
            <Image src={require('@/assets/images/icons/planet.svg')} alt='metaverse'></Image>
            <span>Metaverse</span>
          </MenuLink>
        </div>
        <div className="px-6">
          <WalletConnector></WalletConnector>
        </div>
        <div className="mx-2"></div>
        <div className={`${showMenu ? 'grid grid-cols-5' : 'hidden'} w-full bg-gamefiDark-900`}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div className="py-4 flex align-middle items-center justify-center">
            <button className="cursor-pointer" onClick={() => setShowMenu(false)}>
              <Image src={require('@/assets/images/icons/x.svg')} alt='x'></Image>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Toolbox
