import { shortenAddress } from '@/utils'
import { ObjectType } from '@/utils/types'
import React, { useCallback } from 'react'
import { useMediaQuery } from 'react-responsive'

type Props = {
  rankings: ObjectType[];
  isLive?: boolean;
}

const TopRanking = ({ rankings, isLive }: Props) => {

  const isMdScreen = useMediaQuery({ maxWidth: '960px' })

  const renderNoRank = useCallback((no: number, obj: ObjectType) => {
    // obj.steps : no changed between last staking and before staking
    return (
      <div className='flex items-center gap-3'>
        <div className='relative'>
          <span className='absolute top-2/4 left-2/4 text-sm font-bold md:text-xl' style={{ transform: 'translate(-50%, -50%)' }}>{no}</span>
          {
            obj.steps > 0
              ? <svg width="50" height="58" className='md:w-auto md:h-auto w-9 h-10' viewBox="0 0 50 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.6325e-06 15.451L1.30998e-06 42.0175C0.00029883 42.3163 0.0791944 42.6098 0.22875 42.8686C0.378305 43.1273 0.593263 43.3422 0.852075 43.4916L23.8645 56.7749C24.1235 56.9237 24.4171 57.002 24.7158 57.002C25.0145 57.002 25.308 56.9237 25.567 56.7749L48.5779 43.4916C48.8369 43.3424 49.052 43.1276 49.2016 42.8688C49.3512 42.61 49.43 42.3164 49.4299 42.0175L49.4299 15.451C49.43 15.1521 49.3512 14.8584 49.2016 14.5996C49.052 14.3408 48.8369 14.126 48.5779 13.9769L25.567 0.693609C25.308 0.544813 25.0145 0.46652 24.7158 0.46652C24.4171 0.46652 24.1235 0.544813 23.8645 0.693609L0.852077 13.9769C0.593265 14.1263 0.378307 14.3412 0.228752 14.5999C0.0791968 14.8586 0.000301205 15.1521 3.6325e-06 15.451Z" fill="url(#paint0_linear_1983_4013)" />
                <path d="M3.91158 17.5968L3.91158 39.696C3.91185 39.9704 3.98428 40.2398 4.12158 40.4774C4.25888 40.7149 4.45622 40.9122 4.69383 41.0493L23.8321 52.099C24.0697 52.2363 24.3393 52.3086 24.6137 52.3086C24.8881 52.3086 25.1576 52.2363 25.3951 52.099L44.532 41.0493C44.7698 40.9124 44.9673 40.7152 45.1046 40.4776C45.2419 40.24 45.3142 39.9704 45.3142 39.696L45.3142 17.5968C45.3142 17.3224 45.2419 17.0528 45.1046 16.8152C44.9673 16.5776 44.7698 16.3804 44.532 16.2435L25.3951 5.19382C25.1576 5.05649 24.8881 4.98418 24.6137 4.98418C24.3393 4.98418 24.0697 5.05649 23.8321 5.19382L4.69383 16.2435C4.45623 16.3806 4.25888 16.5779 4.12159 16.8154C3.98428 17.0529 3.91186 17.3224 3.91158 17.5968Z" fill="url(#paint1_linear_1983_4013)" />
                <path d="M6.00645 18.8007L6.00645 38.6637C6.0067 38.9103 6.0718 39.1525 6.19521 39.366C6.31861 39.5795 6.49598 39.7568 6.70955 39.8801L23.9112 49.8116C24.1247 49.935 24.367 50 24.6137 50C24.8603 50 25.1025 49.935 25.3161 49.8116L42.5164 39.8801C42.7301 39.757 42.9077 39.5797 43.0311 39.3662C43.1545 39.1527 43.2195 38.9104 43.2195 38.6637L43.2195 18.8007C43.2195 18.5541 43.1545 18.3118 43.0311 18.0982C42.9077 17.8847 42.7301 17.7074 42.5164 17.5843L25.3161 7.65284C25.1025 7.52941 24.8603 7.46441 24.6137 7.46441C24.367 7.46441 24.1247 7.52941 23.9112 7.65284L6.70955 17.5843C6.49599 17.7076 6.31861 17.8849 6.19521 18.0984C6.0718 18.3119 6.0067 18.5541 6.00645 18.8007Z" fill="#15171E" />
                <defs>
                  <linearGradient id="paint0_linear_1983_4013" x1="10.2627" y1="50.9547" x2="24.715" y2="0.466521" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6CDB00" />
                    <stop offset="1" stopColor="#C1FF85" />
                  </linearGradient>
                  <linearGradient id="paint1_linear_1983_4013" x1="12.5077" y1="47.2465" x2="24.5988" y2="4.98015" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#C1FF85" />
                    <stop offset="1" stopColor="#6CDB00" />
                  </linearGradient>
                </defs>
              </svg>
              : obj.steps && obj.steps < 0
                ? <svg width="50" height="57" className='md:w-auto md:h-auto w-9 h-10' viewBox="0 0 50 57" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 41.5529L50 14.9864C49.9997 14.6876 49.9208 14.3941 49.7713 14.1353C49.6217 13.8766 49.4067 13.6617 49.1479 13.5123L26.1355 0.229041C25.8765 0.0802447 25.5829 0.00195312 25.2842 0.00195312C24.9855 0.00195312 24.692 0.0802447 24.433 0.229041L1.42214 13.5123C1.16311 13.6615 0.94797 13.8763 0.798382 14.1351C0.648794 14.3939 0.570041 14.6875 0.570068 14.9864L0.570068 41.5529C0.570041 41.8518 0.648794 42.1455 0.798382 42.4043C0.94797 42.6631 1.16311 42.8779 1.42214 43.027L24.433 56.3103C24.692 56.4591 24.9855 56.5374 25.2842 56.5374C25.5829 56.5374 25.8765 56.4591 26.1355 56.3103L49.1479 43.027C49.4067 42.8776 49.6217 42.6628 49.7713 42.404C49.9208 42.1453 49.9997 41.8518 50 41.5529Z" fill="url(#paint0_linear_1983_4032)" />
                  <path d="M46.0884 39.4071L46.0884 17.3079C46.0881 17.0335 46.0157 16.7641 45.8784 16.5265C45.7411 16.289 45.5438 16.0917 45.3062 15.9546L26.1679 4.90494C25.9303 4.76761 25.6607 4.69531 25.3863 4.69531C25.1119 4.69531 24.8424 4.76761 24.6049 4.90494L5.46804 15.9546C5.23024 16.0915 5.03273 16.2887 4.8954 16.5263C4.75807 16.7639 4.68577 17.0335 4.68579 17.3079L4.68579 39.4071C4.68577 39.6816 4.75807 39.9511 4.8954 40.1887C5.03273 40.4263 5.23024 40.6235 5.46804 40.7604L24.6049 51.8101C24.8424 51.9474 25.1119 52.0197 25.3863 52.0197C25.6607 52.0197 25.9303 51.9474 26.1679 51.8101L45.3062 40.7604C45.5438 40.6233 45.7411 40.426 45.8784 40.1885C46.0157 39.951 46.0881 39.6815 46.0884 39.4071Z" fill="url(#paint1_linear_1983_4032)" />
                  <path d="M43.9935 38.2901L43.9935 18.4271C43.9933 18.1805 43.9282 17.9383 43.8048 17.7248C43.6814 17.5113 43.504 17.334 43.2905 17.2107L26.0888 7.27923C25.8753 7.1558 25.633 7.09082 25.3863 7.09082C25.1397 7.09082 24.8975 7.1558 24.6839 7.27923L7.48361 17.2107C7.26987 17.3338 7.09234 17.5111 6.96891 17.7246C6.84548 17.9382 6.78049 18.1805 6.78052 18.4271L6.78052 38.2901C6.78049 38.5368 6.84548 38.7791 6.96891 38.9926C7.09234 39.2062 7.26987 39.3834 7.48361 39.5065L24.6839 49.438C24.8975 49.5614 25.1397 49.6264 25.3863 49.6264C25.633 49.6264 25.8753 49.5614 26.0888 49.438L43.2905 39.5065C43.504 39.3832 43.6814 39.2059 43.8048 38.9924C43.9282 38.7789 43.9933 38.5367 43.9935 38.2901Z" fill="#15171E" />
                  <defs>
                    <linearGradient id="paint0_linear_1983_4032" x1="39.7373" y1="6.04925" x2="25.285" y2="56.5374" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FE7C7C" />
                      <stop offset="1" stopColor="#E83535" />
                    </linearGradient>
                    <linearGradient id="paint1_linear_1983_4032" x1="25" y1="53.501" x2="24.9838" y2="5.00098" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FE7C7C" />
                      <stop offset="1" stopColor="#E83535" />
                    </linearGradient>
                  </defs>
                </svg>
                : <svg width="50" height="58" className='md:w-auto md:h-auto w-9 h-10' viewBox="0 0 50 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.6325e-06 15.451L1.30998e-06 42.0175C0.00029883 42.3163 0.0791944 42.6098 0.22875 42.8686C0.378305 43.1273 0.593263 43.3422 0.852075 43.4916L23.8645 56.7749C24.1235 56.9237 24.4171 57.002 24.7158 57.002C25.0145 57.002 25.308 56.9237 25.567 56.7749L48.5779 43.4916C48.8369 43.3424 49.052 43.1276 49.2016 42.8688C49.3512 42.61 49.43 42.3164 49.4299 42.0175L49.4299 15.451C49.43 15.1521 49.3512 14.8584 49.2016 14.5996C49.052 14.3408 48.8369 14.126 48.5779 13.9769L25.567 0.693609C25.308 0.544813 25.0145 0.46652 24.7158 0.46652C24.4171 0.46652 24.1235 0.544813 23.8645 0.693609L0.852077 13.9769C0.593265 14.1263 0.378307 14.3412 0.228752 14.5999C0.0791968 14.8586 0.000301205 15.1521 3.6325e-06 15.451Z" fill="url(#paint0_linear_1983_4050)" />
                  <path d="M3.91158 17.5968L3.91158 39.696C3.91185 39.9704 3.98428 40.2398 4.12158 40.4774C4.25888 40.7149 4.45622 40.9122 4.69383 41.0493L23.8321 52.099C24.0697 52.2363 24.3393 52.3086 24.6137 52.3086C24.8881 52.3086 25.1576 52.2363 25.3951 52.099L44.532 41.0493C44.7698 40.9124 44.9673 40.7152 45.1046 40.4776C45.2419 40.24 45.3142 39.9704 45.3142 39.696L45.3142 17.5968C45.3142 17.3224 45.2419 17.0528 45.1046 16.8152C44.9673 16.5776 44.7698 16.3804 44.532 16.2435L25.3951 5.19382C25.1576 5.05649 24.8881 4.98418 24.6137 4.98418C24.3393 4.98418 24.0697 5.05649 23.8321 5.19382L4.69383 16.2435C4.45623 16.3806 4.25888 16.5779 4.12159 16.8154C3.98428 17.0529 3.91186 17.3224 3.91158 17.5968Z" fill="url(#paint1_linear_1983_4050)" />
                  <path d="M6.00645 18.7138L6.00645 38.5768C6.0067 38.8234 6.0718 39.0656 6.19521 39.2791C6.31861 39.4926 6.49598 39.6699 6.70955 39.7932L23.9112 49.7247C24.1247 49.8481 24.367 49.9131 24.6137 49.9131C24.8603 49.9131 25.1025 49.8481 25.3161 49.7247L42.5164 39.7932C42.7301 39.6701 42.9077 39.4928 43.0311 39.2793C43.1545 39.0657 43.2195 38.8235 43.2195 38.5768L43.2195 18.7138C43.2195 18.4672 43.1545 18.2248 43.0311 18.0113C42.9077 17.7978 42.7301 17.6205 42.5164 17.4974L25.3161 7.56593C25.1025 7.4425 24.8603 7.3775 24.6137 7.3775C24.367 7.3775 24.1247 7.4425 23.9112 7.56593L6.70955 17.4974C6.49599 17.6207 6.31861 17.798 6.19521 18.0115C6.0718 18.225 6.0067 18.4672 6.00645 18.7138Z" fill="#15171E" />
                  <defs>
                    <linearGradient id="paint0_linear_1983_4050" x1="10.2627" y1="50.9547" x2="24.715" y2="0.466521" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#D7E0E2" />
                      <stop offset="1" stopColor="white" />
                    </linearGradient>
                    <linearGradient id="paint1_linear_1983_4050" x1="12.5077" y1="47.2465" x2="24.5988" y2="4.98015" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#F6FFED" />
                      <stop offset="1" stopColor="#DDDDDD" />
                    </linearGradient>
                  </defs>
                </svg>
          }
        </div>
        {
          'steps' in obj && <div className='flex flex-col items-center'>
            {obj.steps > 0
              ? <svg width="8" height="7" viewBox="0 0 8 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.99953 0.00195312C3.83653 0.00195312 3.68353 0.0814531 3.59003 0.215453L0.0900328 5.21545C-0.0169672 5.36795 -0.0289672 5.56745 0.0560328 5.73295C0.142533 5.89845 0.313033 6.00195 0.499533 6.00195H7.50003C7.68653 6.00195 7.85753 5.89845 7.94353 5.73295C8.02853 5.56745 8.01653 5.36795 7.90953 5.21545L4.40953 0.215453C4.31653 0.0814531 4.16353 0.00195312 4.00053 0.00195312C4.00003 0.00195312 4.00003 0.00195312 3.99953 0.00195312C4.00003 0.00195312 4.00003 0.00195312 3.99953 0.00195312Z" fill="#6CDB00" />
              </svg>
              : obj.steps < 0
                ? <svg width="8" height="7" viewBox="0 0 8 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.00047 6.00293C4.16347 6.00293 4.31647 5.92343 4.40997 5.78943L7.90997 0.78943C8.01697 0.63693 8.02897 0.43743 7.94397 0.27193C7.85747 0.10643 7.68697 0.00292966 7.50047 0.00292964L0.499967 0.00292903C0.313467 0.00292902 0.142467 0.106429 0.0564666 0.271929C-0.0285334 0.437429 -0.0165334 0.636929 0.0904665 0.789429L3.59047 5.78943C3.68347 5.92343 3.83647 6.00293 3.99947 6.00293C3.99997 6.00293 3.99997 6.00293 4.00047 6.00293C3.99997 6.00293 3.99997 6.00293 4.00047 6.00293Z" fill="#EE4A4A" />
                </svg>
                : ''
            }
            <span>
              {(obj.steps === 0 ? '' : (obj.steps > 0 ? obj.steps : obj.steps ? -obj.steps : ''))}
            </span>
          </div>
        }
      </div>
    )
  }, [])

  return (
    <div>
      <div className="w-full relative bg-gamefiDark-600" style={{ height: '1px' }}>
        <div className="absolute top-0 left-0 bg-gamefiDark-600 clipped-b-r-full-sm inline-block" style={{ height: '4px', width: '60px', marginTop: '0', marginLeft: '0' }}></div>
      </div>
      <div className='overflow-x-auto'>
        <table className="mt-4 w-full">
          <thead>
            <tr>
              <th scope="col" className="py-3 px-4 font-bold text-xs md:text-sm uppercase text-white opacity-50 text-left">
                Rank
              </th>
              <th scope="col" className="py-3 px-4 font-bold text-xs md:text-sm uppercase text-white opacity-50 text-left">
                Wallet Address
              </th>
              <th scope="col" className="py-3 px-4 font-bold text-xs md:text-sm uppercase text-white opacity-50 text-left">
                Amount ($GAFI)
              </th>
              <th scope="col" className="py-3 px-4 font-bold text-xs md:text-sm uppercase text-white opacity-50 text-left">
                {isLive ? 'Last Staking' : 'Snapshot Time'}
              </th>
            </tr>
          </thead>
          <tbody>
            {(rankings || []).map((x, index) => <tr key={index} className="border-b border-gamefiDark-600 font-casual">
              <td className="py-4 px-4 text-sm whitespace-nowrap">
                {renderNoRank(index + 1, x)}
              </td>
              <td className="py-4 px-4 text-sm whitespace-nowrap break-all md:w-auto w-12">
                {isMdScreen ? shortenAddress(x.wallet_address, '.', 4, 3) : x.wallet_address}
              </td>
              <td className="py-4 px-4 text-sm whitespace-nowrap">
                {x.amount}
              </td>
              <td className="py-4 px-4 text-sm sm:whitespace-nowrap break-words">
                {x.snapshot_at ? x.snapshot_at.toLocaleString('en-ZA', { timeZoneName: 'short', hour12: false }) : '—'}
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TopRanking
