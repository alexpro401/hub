import React, { ReactNode } from 'react'
import Head from 'next/head'
import Sidebar from '@/components/Base/Sidebar'
import Topbar from '@/components/Base/Topbar'
import Toolbox from '@/components/Base/Toolbox'
import Footer from '@/components/Base/Footer'
import { defaultDescription, defaultTitle } from '@/utils/constants'

type Props = {
  children?: ReactNode;
  title?: string;
  description?: string;
  image?: string;
  disableFooter?: boolean;
  extended?: boolean;
  hideTopBar?: boolean;
  className?: string;
}

// const BETA_SUPPRESSION = 'BETA_SUPPRESSION'

const GameFiTaskLayout = ({ children, title, description, image, disableFooter, extended, hideTopBar = false, className = '' }: Props) => {
  // const [suppressed, setSuppressed] = useState<boolean>(true)

  // useEffect(function () {
  //   if (!window.localStorage) {
  //     return
  //   }

  //   const suppressed = window.localStorage.getItem(BETA_SUPPRESSION)
  //   if (!suppressed) {
  //     setSuppressed(false)
  //   }
  // }, [])

  // const suppress = () => {
  //   setSuppressed(true)
  //   if (window.localStorage) {
  //     window.localStorage.setItem(BETA_SUPPRESSION, '1')
  //   }
  // }

  const theme = 'dark'

  return (
    <div className={`flex w-full h-screen ${theme}`}>
      <div className="dark:bg-gamefiDark-900 dark:text-white w-full h-full flex flex-col md:flex-row">
        <Head>
          <title>{title || defaultTitle}</title>
          <meta charSet="utf-8" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
          <meta property="og:title" content={title} key="title" />
          <meta property="og:description" content={description} key="description" />
          <meta property="og:image" content={'https://gamefi.org/happy-gamefiversary.jpg?v=1661187628261'} key="image" />
          <meta name="keywords" content="launchpad, game hub, nft marketplace, game portal, game pass, game guild, tournament, metaverse, ido"></meta>
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
          <meta name="twitter:image" content={'https://gamefi.org/happy-gamefiversary.jpg?v=1661187628261'} />
        </Head>

        <div>
          <Sidebar></Sidebar>
        </div>
        <div id='layoutBody' className={`${className} w-full h-full overflow-y-auto overflow-x-hidden relative scroll-smooth`}>
          {
            !hideTopBar && <Topbar absolute={extended}></Topbar>
          }
          {children}
        </div>
        <Toolbox></Toolbox>
      </div>
    </div>
  )
}

export default GameFiTaskLayout
