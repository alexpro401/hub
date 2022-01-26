import { ObjectType } from '@/common/types'
import React, { useEffect, useRef, useState } from 'react'

type Item = {
  key: any,
  label: string,
  value: any
} | ObjectType;
type Props = {
  items?: Array<Item>,
  selected?: Item,
  onChange?: any,
  propLabel?: string;
  propValue?: string;
}
const Dropdown = ({ items, selected, onChange, propLabel, propValue }: Props) => {
  const [show, setShow] = useState(false)
  const wrapperRef = useRef(null)

  const getSelectedItem = (value: any) => {
    return items.find(item => item.value === value)
  }

  const handleClickOutside = (e: any) => {
    if (show === true && wrapperRef.current && !wrapperRef.current.contains(e?.target)) {
      setShow(false)
    }
  }

  useEffect(() => {
    window && window.addEventListener('click', handleClickOutside)

    return () => {
      window && window.removeEventListener('click', handleClickOutside)
    }
  })

  const availableOptions = () => {
    return items?.filter(item => (item[propValue] || item.value) !== (selected?.[propValue] || selected?.value))
  }

  const handleChangeFilter = (item: Item) => {
    onChange && onChange(item)
    setShow(false)
  }

  return (
    <div className="relative inline-block text-sm">
      <button className="flex align-middle items-center bg-gamefiDark-650 text-white font-bold uppercase px-4 py-2 rounded" onClick={() => setShow(!show)}>
        {selected?.[propLabel] || selected?.label || 'No Item chose'}
        <svg className="ml-2" width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.5 4.5L8 12L0.5 4.5" stroke="#ffffff" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {show
        ? <div ref={wrapperRef} className="origin-top-right right-0 absolute mt-2 z-10 w-52 rounded-sm py-1 shadow-lg focus:outline-none text-base bg-gamefiDark-500">
          {
            availableOptions() && availableOptions().length
              ? availableOptions().map(item =>
                <button key={item[propValue] || item.value} onClick={() => handleChangeFilter(item)} className="cursor-pointer hover:bg-gamefiDark-600 px-4 py-1 w-full text-left">{item[propLabel] || item.label}</button>
              )
              : <></>
          }
        </div>
        : <></>}
    </div>
  )
}

export default Dropdown
