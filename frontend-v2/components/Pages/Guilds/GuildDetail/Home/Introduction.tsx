import { printNumber } from '@/utils'
import { format } from 'date-fns'
import { useState } from 'react'
import { useGuildDetailContext } from '../utils'

const Introduction = ({ totalFavorites, showMoreIntroduction }) => {
  const { guildData } = useGuildDetailContext()
  const [isUpArrow, setIsUpArrow] = useState(false)

  return (
    <div className="container mx-auto px-4 lg:px-16">
      <div className='grid md:grid-cols-2'>
        <div className='p-6 bg-gamefiDark-700/70 text-gamefiDark-100 rounded-tl-sm md:rounded-bl-sm md:rounded-tr-none rounded-tr-sm font-casual text-sm leading-7'>
          <p className={ !isUpArrow ? 'line-clamp-6' : ''}>
            {guildData.introduction}
          </p>
          { showMoreIntroduction && (isUpArrow
          // up
            ? <button className='w-full flex justify-center' onClick={() => setIsUpArrow(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9L12.3536 8.64645L12 8.29289L11.6464 8.64645L12 9ZM18.3536 14.6464L12.3536 8.64645L11.6464 9.35355L17.6464 15.3536L18.3536 14.6464ZM11.6464 8.64645L5.64645 14.6464L6.35355 15.3536L12.3536 9.35355L11.6464 8.64645Z" fill="white" />
              </svg>
            </button>
          // down
            : <button className='w-full flex justify-center' onClick={() => setIsUpArrow(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15L12.3536 15.3536L12 15.7071L11.6464 15.3536L12 15ZM18.3536 9.35355L12.3536 15.3536L11.6464 14.6464L17.6464 8.64645L18.3536 9.35355ZM11.6464 15.3536L5.64645 9.35355L6.35355 8.64645L12.3536 14.6464L11.6464 15.3536Z" fill="white" />
              </svg>
            </button>)
          }
        </div>
        <div className='p-6 bg-gamefiDark-700 rounded-bl-sm md:rounded-bl-none md:rounded-tr-sm rounded-br-sm text-gamefiDark-100'>
          <div className="grid md:grid-cols-2 gap-4">
            <div className='flex gap-4 items-center'>
              <span className='w-5 h-5 block rounded-full'>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.66667 7.33334H0.666667C0.489856 7.33334 0.320286 7.40357 0.195262 7.5286C0.0702379 7.65362 0 7.82319 0 8L0 15.3333C0 15.5101 0.0702379 15.6797 0.195262 15.8047C0.320286 15.9298 0.489856 16 0.666667 16H2.66667V7.33334Z" fill="#3E3C43" />
                  <path d="M15.026 6.93333C14.7757 6.64071 14.465 6.40577 14.1153 6.24465C13.7655 6.08353 13.3851 6.00007 13 6H8.66667V2.66667C8.66667 1.196 8.13733 1.39036e-08 6.66667 1.39036e-08C6.52038 -2.98518e-05 6.37815 0.0480562 6.26189 0.136846C6.14563 0.225635 6.06181 0.350198 6.02333 0.491333L4 7.33333V16H12.284C12.9218 16.003 13.5394 15.776 14.0235 15.3607C14.5076 14.9454 14.8259 14.3695 14.92 13.7387L15.6373 9.072C15.6954 8.69252 15.6708 8.30499 15.5653 7.93588C15.4598 7.56678 15.2758 7.2248 15.026 6.93333Z" fill="#53545A" />
                </svg>
              </span>
              <span className='text-13px font-casual font-light leading-5'>
                <span className="font-medium text-white">{printNumber(totalFavorites || 0)}</span> people like this
              </span>
            </div>
            <div className='flex gap-4 items-center'>
              <span className='w-5 h-5 block rounded-full'>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.6663 2V0.666667C12.6663 0.489856 12.5961 0.320286 12.4711 0.195262C12.3461 0.0702379 12.1765 0 11.9997 0C11.8229 0 11.6533 0.0702379 11.5283 0.195262C11.4032 0.320286 11.333 0.489856 11.333 0.666667V2H12.6663Z" fill="#3E3C43" />
                  <path d="M4.66634 2V0.666667C4.66634 0.489856 4.5961 0.320286 4.47108 0.195262C4.34605 0.0702379 4.17649 0 3.99967 0C3.82286 0 3.65329 0.0702379 3.52827 0.195262C3.40325 0.320286 3.33301 0.489856 3.33301 0.666667V2H4.66634Z" fill="#3E3C43" />
                  <path d="M14 15.3333H2C1.46957 15.3333 0.960859 15.1226 0.585786 14.7475C0.210714 14.3725 0 13.8638 0 13.3333L0 4.66666C0 4.13623 0.210714 3.62752 0.585786 3.25245C0.960859 2.87738 1.46957 2.66666 2 2.66666H14C14.5304 2.66666 15.0391 2.87738 15.4142 3.25245C15.7893 3.62752 16 4.13623 16 4.66666V13.3333C16 13.8638 15.7893 14.3725 15.4142 14.7475C15.0391 15.1226 14.5304 15.3333 14 15.3333ZM14.6667 6H1.33333V13.3333C1.33333 13.5101 1.40357 13.6797 1.5286 13.8047C1.65362 13.9298 1.82319 14 2 14H14C14.1768 14 14.3464 13.9298 14.4714 13.8047C14.5964 13.6797 14.6667 13.5101 14.6667 13.3333V6Z" fill="#53545A" />
                </svg>
              </span>
              <span className='text-13px font-casual font-light leading-5'>
                <span className="font-medium text-white">Founding Date:</span> {guildData.foundingDate ? format(new Date(guildData.foundingDate), guildData.foundingDateFormat || 'dd MMMM yyyy') : 'Unknown'}
              </span>
            </div>
            <div className='flex gap-4 items-center'>
              <span className='w-5 h-5 block rounded-full'>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 0C6.41775 0 4.87104 0.469192 3.55544 1.34824C2.23985 2.22729 1.21447 3.47672 0.608967 4.93853C0.00346629 6.40034 -0.15496 8.00887 0.153721 9.56072C0.462403 11.1126 1.22433 12.538 2.34315 13.6569C3.46197 14.7757 4.88743 15.5376 6.43928 15.8463C7.99113 16.155 9.59966 15.9965 11.0615 15.391C12.5233 14.7855 13.7727 13.7602 14.6518 12.4446C15.5308 11.129 16 9.58225 16 8C15.9977 5.87897 15.1541 3.84547 13.6543 2.34568C12.1545 0.845885 10.121 0.00229405 8 0V0ZM8 14.6667C7.11416 14.6671 6.23718 14.4904 5.42064 14.147C4.60409 13.8035 3.86449 13.3002 3.24534 12.6667L4.21534 11.852C4.3138 11.7692 4.38621 11.6597 4.42383 11.5367C4.46144 11.4136 4.46266 11.2824 4.42734 11.1587L3.96067 9.51067C3.93136 9.40899 3.87862 9.3156 3.80667 9.238L2.98267 8.35733L2.858 8.14467L3.28467 7.78L4.94267 6.94133C5.03789 6.89319 5.12016 6.82289 5.18257 6.73635C5.24499 6.64981 5.28572 6.54955 5.30134 6.444L5.568 4.61733C5.58293 4.51883 5.57558 4.41823 5.54651 4.32293C5.51744 4.22763 5.46738 4.14007 5.4 4.06667L4.30067 2.89333C4.28127 2.87204 4.26033 2.85221 4.238 2.834L4.026 2.66C5.09636 1.85962 6.38394 1.40199 7.71934 1.34733L8.018 1.844L8.40867 2.986C8.44987 3.10497 8.52353 3.21005 8.62134 3.28933L10.144 4.514C10.2625 4.60934 10.4099 4.66133 10.562 4.66133C10.5883 4.66144 10.6146 4.65988 10.6407 4.65667L12.6407 4.41933C12.7286 4.40869 12.8135 4.38082 12.8907 4.33733L13.3693 4.06533C14.1002 5.05716 14.5414 6.23243 14.6437 7.46021C14.746 8.68799 14.5054 9.92006 13.9487 11.0192C13.392 12.1183 12.5411 13.0412 11.4908 13.6852C10.4405 14.3292 9.23203 14.669 8 14.6667Z" fill="#53545A" />
                  <path d="M13.2629 8.294L12.5062 6.842C12.4621 6.75724 12.4003 6.68295 12.325 6.62418C12.2496 6.5654 12.1625 6.52351 12.0696 6.50133L10.4982 6.12533C10.3736 6.0955 10.243 6.10245 10.1222 6.14534L8.63758 6.66667C8.51937 6.70792 8.41517 6.78162 8.33691 6.87934L7.44491 8.19467C7.34982 8.38675 7.33239 8.60807 7.39624 8.81267L7.93758 10.1873L7.60424 11.3333C7.58096 11.4305 7.58015 11.5317 7.60187 11.6292C7.62359 11.7267 7.66726 11.8179 7.72958 11.896L8.16758 13.0527C8.23014 13.1286 8.30874 13.1897 8.39772 13.2317C8.4867 13.2736 8.58387 13.2954 8.68224 13.2953H8.72491L10.2842 13.1953C10.438 13.1854 10.5836 13.1225 10.6962 13.0173L11.8709 11.9233C11.9367 11.8623 11.9896 11.7886 12.0262 11.7067L13.2809 8.87334C13.3217 8.78164 13.3413 8.68192 13.3382 8.58161C13.335 8.4813 13.3093 8.38298 13.2629 8.294Z" fill="#3E3C43" />
                </svg>
              </span>
              <span className='text-13px font-casual font-light leading-5'>
                <span className="font-medium text-white">Guild Region:</span> {guildData.region}
              </span>
            </div>
            <div className='flex gap-4 items-center'>
              <span className='w-5 h-5 block rounded-full'>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.548 9.54973L8.182 7.74473C7.52619 7.54455 6.89671 7.26657 6.307 6.91673C6.74654 6.42914 7.11946 5.88539 7.416 5.29973C7.72721 4.68863 7.95716 4.03946 8.1 3.36873C8.689 3.36873 9.079 3.38873 9.519 3.42873V1.61973C9.03748 1.67176 8.55329 1.69513 8.069 1.68973H5.687V1.07973C5.68665 0.874903 5.70675 0.670557 5.747 0.469727H3.738C3.77922 0.673787 3.79932 0.881549 3.798 1.08973V1.68973H1.589C1.10504 1.69487 0.621206 1.6715 0.14 1.61973V3.42873C0.64 3.38873 0.979 3.36873 1.569 3.36873C1.73855 3.96097 1.96982 4.53378 2.259 5.07773C2.60815 5.74034 3.0414 6.35509 3.548 6.90673C2.45071 7.54661 1.24995 7.98962 0 8.21573C0.420415 8.74493 0.744977 9.34363 0.959 9.98473C2.3811 9.60478 3.72712 8.98268 4.938 8.14573C5.74428 8.72357 6.62146 9.19544 7.548 9.54973ZM3.488 3.36873H6.137C5.92419 4.26476 5.495 5.09499 4.887 5.78673C4.22732 5.10925 3.74655 4.27829 3.488 3.36873Z" fill="#53545A"/>
                  <path d="M13.717 15.9998L12.992 13.6208H9.349L8.624 15.9998H6.341L9.868 5.96484H12.459L16 15.9998H13.717ZM12.486 11.8438C11.8193 9.68784 11.4423 8.46884 11.355 8.18684C11.271 7.90384 11.21 7.68084 11.174 7.51684C11.0233 8.09951 10.5927 9.54184 9.882 11.8438H12.486Z" fill="#53545A"/>
                </svg>
              </span>
              <span className='text-13px font-casual font-light leading-5'>
                <span className="font-medium text-white">Languages:</span> {guildData.languages}
              </span>
            </div>
            <div className='flex gap-4 items-center'>
              <span className='w-5 h-5 block rounded-full'>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 0C6.41775 0 4.87104 0.469192 3.55544 1.34824C2.23985 2.22729 1.21447 3.47672 0.608967 4.93853C0.00346629 6.40034 -0.15496 8.00887 0.153721 9.56072C0.462403 11.1126 1.22433 12.538 2.34315 13.6569C3.46197 14.7757 4.88743 15.5376 6.43928 15.8463C7.99113 16.155 9.59966 15.9965 11.0615 15.391C12.5233 14.7855 13.7727 13.7602 14.6518 12.4446C15.5308 11.129 16 9.58225 16 8C15.9977 5.87897 15.1541 3.84547 13.6543 2.34568C12.1545 0.845885 10.121 0.00229405 8 0V0ZM8 14.6667C7.11416 14.6671 6.23718 14.4904 5.42064 14.147C4.60409 13.8035 3.86449 13.3002 3.24534 12.6667L4.21534 11.852C4.3138 11.7692 4.38621 11.6597 4.42383 11.5367C4.46144 11.4136 4.46266 11.2824 4.42734 11.1587L3.96067 9.51067C3.93136 9.40899 3.87862 9.3156 3.80667 9.238L2.98267 8.35733L2.858 8.14467L3.28467 7.78L4.94267 6.94133C5.03789 6.89319 5.12016 6.82289 5.18257 6.73635C5.24499 6.64981 5.28572 6.54955 5.30134 6.444L5.568 4.61733C5.58293 4.51883 5.57558 4.41823 5.54651 4.32293C5.51744 4.22763 5.46738 4.14007 5.4 4.06667L4.30067 2.89333C4.28127 2.87204 4.26033 2.85221 4.238 2.834L4.026 2.66C5.09636 1.85962 6.38394 1.40199 7.71934 1.34733L8.018 1.844L8.40867 2.986C8.44987 3.10497 8.52353 3.21005 8.62134 3.28933L10.144 4.514C10.2625 4.60934 10.4099 4.66133 10.562 4.66133C10.5883 4.66144 10.6146 4.65988 10.6407 4.65667L12.6407 4.41933C12.7286 4.40869 12.8135 4.38082 12.8907 4.33733L13.3693 4.06533C14.1002 5.05716 14.5414 6.23243 14.6437 7.46021C14.746 8.68799 14.5054 9.92006 13.9487 11.0192C13.392 12.1183 12.5411 13.0412 11.4908 13.6852C10.4405 14.3292 9.23203 14.669 8 14.6667Z" fill="#53545A" />
                  <path d="M13.2629 8.294L12.5062 6.842C12.4621 6.75724 12.4003 6.68295 12.325 6.62418C12.2496 6.5654 12.1625 6.52351 12.0696 6.50133L10.4982 6.12533C10.3736 6.0955 10.243 6.10245 10.1222 6.14534L8.63758 6.66667C8.51937 6.70792 8.41517 6.78162 8.33691 6.87934L7.44491 8.19467C7.34982 8.38675 7.33239 8.60807 7.39624 8.81267L7.93758 10.1873L7.60424 11.3333C7.58096 11.4305 7.58015 11.5317 7.60187 11.6292C7.62359 11.7267 7.66726 11.8179 7.72958 11.896L8.16758 13.0527C8.23014 13.1286 8.30874 13.1897 8.39772 13.2317C8.4867 13.2736 8.58387 13.2954 8.68224 13.2953H8.72491L10.2842 13.1953C10.438 13.1854 10.5836 13.1225 10.6962 13.0173L11.8709 11.9233C11.9367 11.8623 11.9896 11.7886 12.0262 11.7067L13.2809 8.87334C13.3217 8.78164 13.3413 8.68192 13.3382 8.58161C13.335 8.4813 13.3093 8.38298 13.2629 8.294Z" fill="#3E3C43" />
                </svg>
              </span>
              <span className='text-13px font-casual font-light leading-5'>
                <span className="font-medium text-white">Member Regions:</span> {guildData.memberRegions}
              </span>
            </div>
          </div>
        </div>
      </div>
      {
        guildData.difference && <div className="mt-16">
          <h1 className="text-2xl font-bold uppercase">What makes {guildData.name} different?</h1>
          <p className="mt-4 max-w-[1000px] font-casual text-sm">{guildData.difference}</p>
        </div>
      }
    </div>
  )
}

export default Introduction
