import Tippy from '@tippyjs/react'
import get from 'lodash.get'
import Image from 'next/image'
import Item from '@/components/Pages/Account/Rank/Quest/ListQuestItem'
import { useMemo } from 'react'
import clsx from 'clsx'

const List = ({ data }) => {
  const { name, tooltipText, description, quests } = useMemo(() => {
    return {
      name: get(data, 'name', ''),
      tooltipText: get(data, 'tooltipText', ''),
      description: get(data, 'description', ''),
      quests: get(data, 'quests', [])
    }
  }, [data])

  return (
    <div className={clsx(data._id === '1' ? 'md:block hidden' : 'block')}>
      <div className="flex flex-col gap-3">
        <div className="flex gap-3 mt-20">
          <div className="uppercase font-mechanic font-bold text-[18px] leading-[100%] text-white">
            {name}
          </div>
          {tooltipText && (
            <Tippy content={tooltipText}>
              <div className="w-4 h-4 relative mr-36 cursor-pointer">
                <Image
                  src={require('@/assets/images/ranks/tooltip.svg')}
                  alt=""
                  layout="fill"
                ></Image>
              </div>
            </Tippy>
          )}
        </div>
        {description && (
          <div className="font-casual font-normal text-sm leading-[150%] text-white">
            {description}
          </div>
        )}
      </div>

      <div className="mt-[30px] grid gap-4 grid-cols-1 md:grid-cols-4 relative">
        {quests.map((e) => {
          return (
            <div key={e._id} className="flex w-full h-full">
              <Item data={e}></Item>
            </div>
          )
        })}
        {get(data, '_id') === '1' && (
          <div
            className="absolute w-[calc(100%+20px)] h-[calc(100%+20px)] -top-[10px] -left-[10px] flex justify-center items-center"
            style={{
              backdropFilter: 'blur(3px)',
              background: 'rgba(21, 23, 30, 0.5)'
            }}
          >
            <span className="text-base uppercase font-mechanic text-white/70 font-bold">
              Coming soon
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default List
