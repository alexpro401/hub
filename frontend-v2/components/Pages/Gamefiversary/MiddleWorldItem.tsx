import smile from '@/components/Pages/Adventure/images/smile.svg'
import angry from '@/components/Pages/Adventure/images/angry.svg'
import currentFish from '@/components/Pages/Adventure/images/current-fish.svg'
import clsx from 'clsx'
import { useCallback, useContext, useMemo, useState } from 'react'
import { useMyWeb3 } from '@/components/web3/context'
import present from '@/components/Pages/Adventure/images/present.svg'
import SocialTaskButton from './SocialTaskButton'
import toast from 'react-hot-toast'
import { fetcher } from '@/utils'
import { AdventureTasksContext } from '@/pages/happy-gamefiversary/tasks'
import Image from 'next/image'

const MiddleWorldItem = ({ data, accountEligible = false }) => {
  const canPlayNow = useMemo(() => {
    return data?.status?.toUpperCase() !== 'LOCK'
  }, [data?.status])
  const { account } = useMyWeb3()

  const { fetchTasks, fetchGafish } = useContext(AdventureTasksContext)

  const [loadingRecheck, setLoadingRecheck] = useState(false)

  const handleRecheck = useCallback(
    (task) => {
      setLoadingRecheck(true)

      fetcher('/api/adventure/recheckSocialTask', {
        method: 'POST',
        body: JSON.stringify({
          walletAddress: account,
          projectSlug: task.projectSlug,
          taskSlug: task.slug
        })
      })
        .then((res) => {
          if (!res) {
            toast.error('Failed')
            return
          }
          if (res.error) {
            toast.error(res.error)
            return
          }

          fetchTasks()
          fetchGafish()
        })
        .catch((e) => console.debug(e))
        .finally(() => {
          setLoadingRecheck(false)
        })
    },
    [account, fetchGafish, fetchTasks]
  )

  return (
    <div className="flex flex-col h-[600px] md:h-auto md:flex-1 bg-[#1B1D26] relative">
      <div className="w-full p-6 pt-8 flex items-center justify-between">
        <span className="font-mechanic font-bold text-[20px] leading-[100%] uppercase text-white">
          {data.name}
        </span>
        {data?.tutorialUrl && (
          <img src={present.src} alt="present" className="" />
        )}
      </div>
      <div className="flex-1 flex flex-col overflow-y-scroll md:mr-2 gap-2 pb-30 md:pb-0">
        {data?.tasks?.length > 0 &&
          data?.status === 'UNLOCK' &&
          data?.tasks
            .filter((e) => !e.name.includes('dummy'))
            .map((task, iTask) => (
              <div key={`task-${iTask}`} className="gap-1 md:gap-0 mr-2 ml-4">
                <div className="flex flex-col md:flex-row items-center w-full p-4 rounded gap-2 md:gap-32 lg:gap-10 bg-gradient-to-r from-[#292B36]/0 to-[#21232E]">
                  <div className="w-full md:w-1/6 lg:w-1/4">
                    <span className="font-casual font-medium text-sm">
                      {task?.name}
                    </span>
                  </div>
                  <div className="w-full lg:flex-1 flex flex-col lg:flex-row gap-2 items-center">
                    {task?.socialInfo && (
                      <div className="flex gap-4 items-center">
                        <div>
                          <Image
                            src={
                              task.stages[0].difficulty === 'HARD'
                                ? angry.src
                                : smile.src
                            }
                            alt=""
                            width={16}
                            height={16}
                          />
                        </div>
                        <SocialTaskButton data={task} />
                      </div>
                    )}
                    <div className="lg:ml-auto flex font-casual font-medium text-[#FFD600] gap-2">
                      <span>+{task.stages[0]?.reward}</span>
                      <img src={currentFish.src} alt="" className="w-4 h-4" />
                    </div>
                    {task?.socialInfo?.url &&
                      task?.currentRepetition !==
                        task?.stages?.[0]?.repetition &&
                      account && accountEligible && (
                      <button
                        onClick={() => {
                          if (loadingRecheck) return
                          handleRecheck(task)
                        }}
                        className={`text-sm font-semibold ${
                          loadingRecheck
                            ? 'text-gamefiDark-200'
                            : 'text-gamefiGreen'
                        }`}
                      >
                          Recheck
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  )
}

export default MiddleWorldItem
