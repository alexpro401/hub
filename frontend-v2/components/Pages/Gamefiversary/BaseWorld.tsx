import left from '@/components/Pages/Adventure/images/left.svg'
import right from '@/components/Pages/Adventure/images/right.svg'
import VerifyMail from '@/components/Pages/Adventure/Tasks/VerifyMail'
import circleArrow from '@/components/Pages/Adventure/images/circle-arrow.svg'
import Flicking, { Plugin } from '@egjs/react-flicking'
import { useCallback, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { Sync } from '@egjs/flicking-plugins'
import { fetcher } from '@/utils'
import { useHubContext } from '@/context/hubProvider'
import { useMyWeb3 } from '@/components/web3/context'
import TopWorldItem from './TopWorldItem'
import MiddleWorldItem from './MiddleWorldItem'
import { useWalletContext } from '@/components/Base/WalletConnector/provider'
import toast from 'react-hot-toast'
import '@egjs/flicking-plugins/dist/pagination.css'
import '@egjs/react-flicking/dist/flicking.css'
import { useRouter } from 'next/router'

type WorldType = 'top-world' | 'middle-world'

const BaseWorld = ({
  projects,
  type,
  className = '',
  layoutBodyRef,
  accountEligible
}: {
  projects: Array<Record<string, unknown>>;
  type: WorldType;
  className?: string;
  layoutBodyRef: any;
  accountEligible: boolean;
}) => {
  const ref = useRef(null)
  const router = useRouter()
  const flickingGameRef = useRef(null)
  const flickingListGameRef = useRef(null)
  const [currentProjectIndex, setCurrentProjectIndex] = useState<number>(0)
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const { accountHub } = useHubContext()

  const { account } = useMyWeb3()
  const { setShowModal: showConnectWallet } = useWalletContext()

  const next = useCallback(() => {
    const nextIndex = currentProjectIndex + 1
    const index = nextIndex > projects.length ? projects.length - 1 : nextIndex
    setCurrentProjectIndex(index)
    flickingListGameRef.current?.moveTo(index).catch(() => { })
    // if (router) {
    //   router.query = {
    //     g: projects[index]?.slug?.toString()
    //   }
    //   router.push({ query: router.query }, undefined, { shallow: true })
    // }
  }, [currentProjectIndex, projects])
  const prev = useCallback(() => {
    const prevIndex = currentProjectIndex - 1
    const index = prevIndex < 0 ? 0 : prevIndex
    setCurrentProjectIndex(index)
    flickingListGameRef.current?.moveTo(index).catch(() => { })
    // if (router) {
    //   router.query = {
    //     g: projects[index]?.slug?.toString()
    //   }
    //   router.push({ query: router.query }, undefined, { shallow: true })
    // }
  }, [currentProjectIndex])

  useEffect(() => {
    if (router?.query?.g && projects?.length > 0) {
      const slug = router.query.g
      const index = projects?.findIndex(item => item.slug === slug)
      if (index > -1) {
        setCurrentProjectIndex(index)
        flickingGameRef.current?.moveTo(index).catch(() => { })
        flickingListGameRef.current?.moveTo(index).catch(() => { })
        setTimeout(() => {
          ref?.current?.scrollIntoView({ behavior: 'smooth' })
        }, 1000)
      }
    }
  }, [projects, ref, router.query.g])

  useEffect(() => {
    if (!projects || !projects.length) return

    setTimeout(() => {
      setPlugins([
        new Sync({
          type: 'index',
          synchronizedFlickingOptions: [
            {
              flicking: flickingGameRef.current,
              isClickable: true,
              activeClass: ''
            },
            {
              flicking: flickingListGameRef.current,
              isSlidable: true
            }
          ]
        })
      ])
      if (flickingGameRef.current) {
        flickingGameRef.current.change = (e) => {
          setCurrentProjectIndex(e.index)
        }
      }

      if (flickingListGameRef.current) {
        flickingListGameRef.current.change = (e) => {
          setCurrentProjectIndex(e.index)
        }
      }
    }, 1000)
  }, [projects])

  const playGame = useCallback(
    async (id, needMail) => {
      if (!account) {
        showConnectWallet(true)
        return
        // return layoutBodyRef?.current?.scrollTo({ top: 0, behavior: 'smooth' })
      }
      if (!accountEligible) {
        toast.error('You should register your GameFi Pass and verify mail first')
        return layoutBodyRef?.current?.scrollTo({ top: 0, behavior: 'smooth' })
      }

      if (accountEligible && (needMail && !accountHub?.confirmed)) {
        toast.error('You should verify your mail first')
        return document.getElementById('newEmail').focus()
      }

      return fetcher(`/api/adventure/${account}/connect?id=${id}`, {
        method: 'PATCH'
      })
        .catch((e) => console.debug(e))
    },
    [account, accountEligible, layoutBodyRef, showConnectWallet, accountHub]
  )

  return (
    <>
      {projects?.length !== 0 && (
        <section ref={ref} className={clsx(className, 'relative')}>
          <div className="flex justify-center gap-3 sm:gap-6">
            <img src={left.src} alt="" />
            <span className="uppercase font-bold min-w-fit sm:text-2xl">
              {type === 'top-world' ? 'Upper world' : 'Middle world'}
            </span>
            <img src={right.src} alt="" />
          </div>

          {(type === 'top-world' && account && !accountHub?.confirmed) && <VerifyMail />}

          <div
            className={clsx('my-5 mt-10 relative')}
          >
            <img src={circleArrow.src} alt="prev" className='xl:block hidden absolute -left-16 top-28 rotate-180 cursor-pointer' onClick={prev} />
            <Flicking
              defaultIndex={currentProjectIndex}
              ref={flickingGameRef}
              bound={true}
              plugins={plugins}
              preventClickOnDrag={false}
              onChanged={(e) => {
                setCurrentProjectIndex(e.index)
                // if (router) {
                //   router.query = {
                //     g: projects[e.index]?.slug?.toString()
                //   }
                //   router.push({ query: router.query }, undefined, { shallow: true })
                // }
              }}
              interruptable={true}
            >
              {projects && projects.map((el, i) => (
                <div key={`top-world-${i}`} className="w-1/3 md:w-1/6">
                  <div
                    className={clsx(
                      'border-2 border-transparent rounded-xl cursor-pointer overflow-hidden mx-1',
                      i === currentProjectIndex ? 'bg-[#6CDB00]' : ''
                    )}
                  >
                    <div className="w-full rounded-xl overflow-hidden aspect-[158/213]">
                      {el?.imageUrl && <img src={el.imageUrl.toString()} className="w-full h-full object-cover" alt="" />}
                    </div>
                  </div>
                  <div
                    className={clsx(
                      el?.status === 'UNLOCK'
                        ? 'bg-gradient-to-t from-[#C9DB00] to-[#6CDB00]'
                        : '',
                      'mx-auto mt-2 justify-center w-2 h-2 rounded-full'
                    )}
                  />
                </div>
              ))}
            </Flicking>
            <img src={circleArrow.src} alt="next" className='xl:block hidden absolute -right-16 top-28 cursor-pointer' onClick={next} />
          </div>
          {
            type === 'top-world' && <div className="my-2 text-right font-casual text-sm">
              For Gafish earned from missions, they will be updated every 4-8 hours in your Current Gafish
            </div>
          }
          <Flicking
            defaultIndex={currentProjectIndex}
            ref={flickingListGameRef}
            plugins={plugins}
            preventClickOnDrag={false}
            onChanged={(e) => {
              setCurrentProjectIndex(e.index)
              // if (router) {
              //   router.query = {
              //     g: projects[e.index]?.slug?.toString()
              //   }
              //   router.push({ query: router.query }, undefined, { shallow: true })
              // }
            }}
            interruptable={true}
          >
            {projects && projects.map((el, i) => (
              <div
                key={`top-world-info-${i}`}
                className="flex md:h-96 flex-col md:flex-row w-full border border-[#303342] rounded-[4px] overflow-hidden"
              >
                <div className="aspect-[158/213] hidden md:block relative">
                  {el?.imageUrl && <img src={el.imageUrl.toString()} className="object-cover w-full h-full" alt="" />}
                  <div
                    className="absolute top-0 left-0 w-full h-full"
                    style={{
                      background:
                        'linear-gradient(270deg, #1B1D26 0%, rgba(27, 29, 38, 0) 118.45%)'
                    }}
                  ></div>
                </div>
                {el?.mobileImageUrl && <img src={el.mobileImageUrl.toString()} className="md:hidden aspect-[2/1] object-cover" alt="" />}
                {type === 'top-world' && (
                  <TopWorldItem data={el} playGame={playGame} accountEligible={accountEligible} confirmed={accountHub?.confirmed} />
                )}
                {type === 'middle-world' && (
                  <MiddleWorldItem data={el} accountEligible={accountEligible} />
                )}
              </div>
            ))}
          </Flicking>
        </section>
      )}
    </>
  )
}

export default BaseWorld
