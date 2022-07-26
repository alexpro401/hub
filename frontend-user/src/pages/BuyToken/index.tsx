import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HashLoader } from "react-spinners";
import { Link, useLocation, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
//@ts-ignore
import { CopyToClipboard } from 'react-copy-to-clipboard';
import BigNumber from 'bignumber.js';
import Tooltip from '@material-ui/core/Tooltip';
import withWidth, { isWidthDown, isWidthUp } from '@material-ui/core/withWidth';

import { useTypedSelector } from '../../hooks/useTypedSelector';
import usePoolDetailsMapping, { PoolDetailKey } from './hooks/usePoolDetailsMapping';
import useAuth from '../../hooks/useAuth';
import usePoolDetails from '../../hooks/usePoolDetails';
import useTokenSoldProgress from './hooks/useTokenSoldProgress';
import usePoolJoinAction from './hooks/usePoolJoinAction';
import useWhitelistSubmissionDetail from './hooks/useWhitelistSubmissionDetail';
import useFetch, { useFetchV1 } from '../../hooks/useFetch';

import LotteryWinners from './LotteryWinners';
import PoolAbout from './PoolAbout';
import ClaimToken from './ClaimToken';
import MyTier from './MyTier';
import BuyTokenForm from './BuyTokenForm';
import Button from './Button';
import StatusBar from './StatusBar';
import Countdown from '../../components/Base/Countdown';
import DefaultLayout from '../../components/Layout/DefaultLayout';
import { ETH_CHAIN_ID, BSC_CHAIN_ID, POLYGON_CHAIN_ID, NETWORK_BSC_NAME, NETWORK_ETH_NAME } from '../../constants/network';
import { getPoolCountDown, getPoolCountDownPreOrder } from '../../utils/getPoolCountDown';
import { numberWithCommas } from '../../utils/formatNumber';

import { sotaTiersActions } from '../../store/constants/sota-tiers';

import useStyles from './style';
import { pushMessage } from '../../store/actions/message';
import { getIconCurrencyUsdt } from "../../utils/usdt";
import { POOL_TYPE, TIER_LEVELS, KYC_STATUS, POOL_IS_PRIVATE } from "../../constants";
import PoolInfoTable from "./PoolInfoTable/PoolInfoTable";
import WhiteListUserGuideBanner from "./WhiteListUserGuideBanner/WhiteListUserGuideBanner";
import { getEtherscanName, getEtherscanTransactionAddress } from "../../utils/network";
import PoolIsEndMessage from "./PoolIsEndMessage/PoolIsEndMessage";
import WhitelistCountryModal from "./ApplyWhitelistModal/WhitelistCountryModal";

import {
  checkIsInPreOrderTime,
  checkIsPoolPreOrder,
  checkIsEnoughTierPreOrder,
  checkAllowUserBuyPreOrder
} from "../../utils/preOrder";

// new component update ui

import ByTokenHeader from "./ByTokenHeader";
import BuyTokenPoolTimeLine from "./BuyTokenPoolTimeLine";
import BuyTokenPoolSwapInfo from "./BuyTokenPoolSwapInfo";
import BuyTokenPoolDetails from "./BuyTokenPoolDetails";
import BannerNotification from "./ByTokenHeader/BannerNotification";
import ApplyWhiteListButton from "./ByTokenHeader/ApplyWhiteListButton";
import HowToParticipant from "./HowToParticipant";
import ApplyWhitelistModal from "./ApplyWhitelistModal/ApplyWhitelistModal";

import { getPoolStatusByPoolDetail } from "../../utils/getPoolStatusByPoolDetail";
import useCountDownFreeBuyTime from "./hooks/useCountDownFreeBuyTime";
import useKyc from '../../hooks/useKyc';
import { AlertKYC } from '../../components/Base/AlertKYC';
import { setTypeIsPushNoti } from '../../store/actions/alert';
import { TOKEN_TYPE } from "../../constants";
import NotFoundPage from "../NotFoundPage/ContentPage";
import { Backdrop, CircularProgress, useTheme } from '@material-ui/core';
import { WrapperAlert } from '../../components/Base/WrapperAlert';
import { isClaim, isSwap } from './utils';
import WrapperContent from '@base-components/WrapperContent';
import axios from '@services/axios';
import { ObjectType } from '@app-types';

const copyImage = "/images/copy.svg";
const poolImage = "/images/pool_circle.svg";
const iconClose = "/images/icons/close.svg";

enum HeaderType {
  Main = "Main",
  About = "About the project",
  Participants = "Winner",
  MyTier = "My Rank"
}

const headers = [HeaderType.Main, HeaderType.MyTier, HeaderType.About, HeaderType.Participants];

const ETHERSCAN_BASE_URL = process.env.REACT_APP_ETHERSCAN_BASE_URL;

const BuyToken: React.FC<any> = (props: any) => {
  const params = useParams<{ [k: string]: any }>();
  const id = params.id;
  const theme = useTheme();
  const [checkParamType, setCheckParamType] = useState({
    checking: true,
    valid: false,
  });
  const { poolDetails, loading: loadingPoolDetail } = usePoolDetails(id);
  // const { data: dataTicket = null, loading: loadingTicket } = useFetchV1<any>(
  //   `/pool/${id}`,
  // );
  useEffect(() => {
    if (!loadingPoolDetail) {
      const result = {
        checking: false,
        valid: false
      }
      if (poolDetails) {
        result.valid = (poolDetails.tokenDetails as any)?.token_type === TOKEN_TYPE.ERC20;
      }
      setCheckParamType(result);
    }
  }, [loadingPoolDetail, poolDetails]);
  return <DefaultLayout>
    <WrapperContent useShowBanner={false}>
      {
        checkParamType.checking ?
          <Backdrop open={checkParamType.checking} style={{ color: '#fff', zIndex: theme.zIndex.drawer + 1, }}>
            <CircularProgress color="inherit" />
          </Backdrop>
          : (checkParamType.valid ? <ContentToken id={id} poolDetails={poolDetails} /> : <NotFoundPage />)
      }
    </WrapperContent>
  </DefaultLayout>
}

const ContentToken = ({ id, poolDetails, ...props }: any) => {
  const dispatch = useDispatch();
  const styles = useStyles();

  const [buyTokenSuccess, setBuyTokenSuccess] = useState<boolean>(false);
  // const { solanaAddress, setSolanaAddress } = useState();

  // const [copiedAddress, setCopiedAddress] = useState(false);
  const [activeNav, setActiveNav] = useState(HeaderType.About);
  const [disableAllButton, setDisableAllButton] = useState<boolean>(false);
  const [showWhitelistFormModal, setShowWhitelistFormModal] = useState<boolean>(false);

  const { pathname } = useLocation();
  /* const userTier = useTypedSelector(state => state.userTier).data; */
  const { appChainID } = useTypedSelector(state => state.appNetwork).data;
  // const { poolDetails, loading: loadingPoolDetail } = usePoolDetails(id);
  const { isAuth, connectedAccount, wrongChain } = useAuth();
  // Fetch token sold, total tokens sold
  const { tokenSold, soldProgress } = useTokenSoldProgress(
    poolDetails?.poolAddress,
    poolDetails?.amount,
    poolDetails?.networkAvailable,
    poolDetails,
  );
  // const { checkingKyc, isKYC } = useKyc(connectedAccount);


  const { joinPool, poolJoinLoading, joinPoolSuccess } = usePoolJoinAction({ poolId: poolDetails?.id, poolDetails });
  // const { data: existedWinner } = useFetch<Array<any>>(
  //   poolDetails ? `/pool/${poolDetails?.id}/check-exist-winner?wallet_address=${connectedAccount}` : undefined,
  //   poolDetails?.method !== "whitelist"
  // );

  const { data: dataUser } = useFetch<any>(connectedAccount ? `/user/profile?wallet_address=${connectedAccount}` : undefined);
  const [checkKyc, setCheckKyc] = useState<{ [k: string]: any }>({});

  useEffect(() => {
    setCheckKyc({});
  }, [connectedAccount])

  const onCheckKyc = async () => {
    try {
      let isKyc = false;
      if (poolDetails?.kycBypass) {
        isKyc = true;
      } else {
        //const response = await axios.get(`/user/profile?wallet_address=${connectedAccount}`) as any;
        //const result = response.data.data;
        isKyc = !!dataUser?.user?.is_kyc;
      }
      setCheckKyc({ checked: false, isKyc: isKyc });
      if (isKyc) {
        setShowWhitelistFormModal(true);
      }
    } catch (error) {
      setCheckKyc({ checked: false, isKyc: false });
      return false;
    }
  }
  // const { data: pickedWinner } = useFetch<Array<any>>(
  //   poolDetails ? `/pool/${poolDetails?.id}/check-picked-winner` : undefined,
  //   poolDetails?.method !== "whitelist"
  // );

  const { data: alreadyJoinPool, loading: loadingJoinPool } = useFetch<boolean>(
    poolDetails && connectedAccount ?
      `/user/check-join-campaign/${poolDetails?.id}?wallet_address=${connectedAccount}`
      : undefined
  );

  const { submission: whitelistSubmission, completed: whitelistCompleted, loading: whitelistLoading } = useWhitelistSubmissionDetail(poolDetails?.id, connectedAccount, alreadyJoinPool, joinPoolSuccess)

  const { data: previousWhitelistSubmission } = useFetch<boolean>(
    poolDetails && connectedAccount ?
      `/user/whitelist-apply/previous?wallet_address=${connectedAccount}`
      : undefined
  );

  // const { data: verifiedEmail = true } = useFetch<boolean>(
  //   poolDetails && connectedAccount && isAuth ?
  //     `/user/check-wallet-address?wallet_address=${connectedAccount}`
  //     : undefined
  // );

  const { data: currentUserTier, loading: loadingCurrentTier } = useFetchV1<any>(`pool/${id}/user/${connectedAccount}/current-tier`, !!(id && connectedAccount));

  useEffect(() => {
    if (!loadingCurrentTier && currentUserTier) {
      setCheckKyc({ isKyc: currentUserTier.exist_whitelist })
    }
  }, [loadingCurrentTier, currentUserTier])
  const { data: winnersList, loading: loadingWinnerList } = useFetch<any>(`/user/winner-list/${id}?page=1&limit=10&`);
  const pickedWinner = !!(+winnersList?.total)

  const poolDetailsMapping = usePoolDetailsMapping(poolDetails);

  // const countDown = useCountDownFreeBuyTime(poolDetails);

  // Use for check whether pool exist in selected network or not
  const appNetwork = useMemo(() => {
    switch (appChainID) {
      case BSC_CHAIN_ID:
        return 'bsc';

      case POLYGON_CHAIN_ID:
        return 'polygon';

      case ETH_CHAIN_ID:
        return 'eth';
    }
  }, [appChainID]);

  const ableToFetchFromBlockchain = appNetwork === poolDetails?.networkAvailable && !wrongChain;

  const [userBuyLimit, setUserBuyLimit] = useState(0);
  useEffect(() => {
    if (currentUserTier?.max_buy) {
      setUserBuyLimit(currentUserTier.max_buy)
    }
  }, [currentUserTier])

  const userBuyMinimum = currentUserTier?.min_buy || 0;
  const currentUserTierLevel = currentUserTier?.level || 0;

  // Detect PreOrder
  // const isPreOrderPool = checkIsPoolPreOrder({ poolDetails, currentUserTierLevel });
  // const isEnoughTierPreOrder = checkIsEnoughTierPreOrder({ poolDetails, currentUserTierLevel });
  // const isInPreOrderTime = isPreOrderPool && checkIsInPreOrderTime({ poolDetails, currentUserTierLevel });
  // const allowUserBuyPreOrder = isPreOrderPool && checkAllowUserBuyPreOrder({
  //   poolDetails,
  //   currentUserTierLevel,
  //   userJoined: (alreadyJoinPool || joinPoolSuccess),
  // });

  // With Whitelist situation, Enable when join time < current < end join time
  // With FCFS, always disable join button
  // const joinTimeInDate = poolDetails?.joinTime ? new Date(Number(poolDetails?.joinTime) * 1000) : undefined;
  // const endJoinTimeInDate = poolDetails?.endJoinTime ? new Date(Number(poolDetails?.endJoinTime) * 1000) : undefined;
  // // const startBuyTimeInDate = poolDetails?.startBuyTime ? new Date(Number(poolDetails?.startBuyTime) * 1000) : undefined;
  // // const endBuyTimeInDate = poolDetails?.endBuyTime ? new Date(Number(poolDetails?.endBuyTime) * 1000) : undefined;

  // const startStartTimePreOrder = (poolDetails?.startPreOrderTime ? new Date(Number(poolDetails?.startPreOrderTime) * 1000) : undefined);
  // const startBuyTimeNormal = (poolDetails?.startBuyTime ? new Date(Number(poolDetails?.startBuyTime) * 1000) : undefined);
  // const startBuyTimeInDate = isInPreOrderTime ? startStartTimePreOrder : startBuyTimeNormal;
  // console.log(startBuyTimeInDate, startStartTimePreOrder)
  // const endStartTimePreOrder = (poolDetails?.startBuyTime ? new Date(Number(poolDetails?.startBuyTime) * 1000) : undefined);
  // const endBuyTimeNormal = (poolDetails?.endBuyTime ? new Date(Number(poolDetails?.endBuyTime) * 1000) : undefined)
  // const endBuyTimeInDate = isInPreOrderTime ? endStartTimePreOrder : endBuyTimeNormal;
  // const announcementTime = poolDetails?.whitelistBannerSetting?.announcement_time ? new Date(Number(poolDetails?.whitelistBannerSetting?.announcement_time) * 1000) : undefined;
  // /* const tierStartBuyInDate = new Date(Number(currentUserTier?.start_time) * 1000); */
  // /* const tierEndBuyInDate = new Date(Number(currentUserTier?.end_time) * 1000); */
  // const releaseTimeInDate = poolDetails?.releaseTime ? new Date(Number(poolDetails?.releaseTime) * 1000) : undefined;
  const [timelineInPool, setTimelineInPool] = useState<ObjectType<any>>({});
  useEffect(() => {
    if (poolDetails) {
      const isPreOrderPool = checkIsPoolPreOrder({ poolDetails, currentUserTierLevel });
      const isEnoughTierPreOrder = checkIsEnoughTierPreOrder({ poolDetails, currentUserTierLevel });
      const isInPreOrderTime = isPreOrderPool && checkIsInPreOrderTime({ poolDetails, currentUserTierLevel });
      const allowUserBuyPreOrder = isPreOrderPool && checkAllowUserBuyPreOrder({
        poolDetails,
        currentUserTierLevel,
        userJoined: (alreadyJoinPool || joinPoolSuccess),
      });
      const joinTimeInDate = poolDetails?.joinTime ? new Date(Number(poolDetails?.joinTime) * 1000) : undefined;
      const endJoinTimeInDate = poolDetails?.endJoinTime ? new Date(Number(poolDetails?.endJoinTime) * 1000) : undefined;
      // const startBuyTimeInDate = poolDetails?.startBuyTime ? new Date(Number(poolDetails?.startBuyTime) * 1000) : undefined;
      // const endBuyTimeInDate = poolDetails?.endBuyTime ? new Date(Number(poolDetails?.endBuyTime) * 1000) : undefined;

      const startStartTimePreOrder = (poolDetails?.startPreOrderTime ? new Date(Number(poolDetails?.startPreOrderTime) * 1000) : undefined);
      const startBuyTimeNormal = (poolDetails?.startBuyTime ? new Date(Number(poolDetails?.startBuyTime) * 1000) : undefined);
      const startBuyTimeInDate = isInPreOrderTime ? startStartTimePreOrder : startBuyTimeNormal;
      const endStartTimePreOrder = (poolDetails?.startBuyTime ? new Date(Number(poolDetails?.startBuyTime) * 1000) : undefined);
      const endBuyTimeNormal = (poolDetails?.endBuyTime ? new Date(Number(poolDetails?.endBuyTime) * 1000) : undefined)
      const endBuyTimeInDate = isInPreOrderTime ? endStartTimePreOrder : endBuyTimeNormal;
      const announcementTime = poolDetails?.whitelistBannerSetting?.announcement_time ? new Date(Number(poolDetails?.whitelistBannerSetting?.announcement_time) * 1000) : undefined;
      /* const tierStartBuyInDate = new Date(Number(currentUserTier?.start_time) * 1000); */
      /* const tierEndBuyInDate = new Date(Number(currentUserTier?.end_time) * 1000); */
      const releaseTimeInDate = poolDetails?.releaseTime ? new Date(Number(poolDetails?.releaseTime) * 1000) : undefined;
      setTimelineInPool({
        isPreOrderPool,
        isEnoughTierPreOrder,
        joinTimeInDate,
        isInPreOrderTime,
        allowUserBuyPreOrder,
        endJoinTimeInDate,
        startStartTimePreOrder,
        startBuyTimeNormal,
        endStartTimePreOrder,
        endBuyTimeNormal,
        startBuyTimeInDate,
        endBuyTimeInDate,
        announcementTime,
        releaseTimeInDate,
      })
    }
  }, [poolDetails, currentUserTierLevel]);
  const {
    isPreOrderPool,
    isEnoughTierPreOrder,
    isInPreOrderTime,
    allowUserBuyPreOrder,
    joinTimeInDate,
    endJoinTimeInDate,
    startStartTimePreOrder,
    startBuyTimeNormal,
    endStartTimePreOrder,
    endBuyTimeNormal,
    startBuyTimeInDate,
    endBuyTimeInDate,
    announcementTime,
    releaseTimeInDate,
  } = timelineInPool;

  const [activeTabBottom, setActiveTabBottom] = useState('tab_pool_details')
  const [numberWiner, setNumberWiner] = useState(0);

  // Get Currency Info
  const { currencyIcon, currencyName } = getIconCurrencyUsdt({
    purchasableCurrency: poolDetails?.purchasableCurrency,
    networkAvailable: poolDetails?.networkAvailable,
  });

  const today = new Date();

  const availablePurchase = startBuyTimeInDate && endBuyTimeInDate &&
    today >= startBuyTimeInDate &&
    today <= endBuyTimeInDate &&
    /* today >= tierStartBuyInDate && */
    /* today <= tierEndBuyInDate && */
    poolDetails?.isDeployed
    // && verifiedEmail
    ;
  /* (poolDetails?.method === 'whitelist' ? alreadyJoinPool: true); */


  // const poolStatus = getPoolStatusByPoolDetail(
  //   poolDetails,
  //   tokenSold
  // );

  const displayCountDownTime = useCallback((
    method: string | undefined,
    startJoinTime: Date | undefined,
    endJoinTime: Date | undefined,
    startBuyTime: Date | undefined,
    endBuyTime: Date | undefined
  ) => {
    // if (isEnoughTierPreOrder && isInPreOrderTime) { // Pool is PreOrder Pool and Pool in PreOrder Time Actived
    //   return getPoolCountDownPreOrder({ endBuyTime });
    // }

    return getPoolCountDown(
      startJoinTime, endJoinTime, startBuyTime, endBuyTime, releaseTimeInDate, method, poolDetails?.campaignStatus, poolDetails, soldProgress
    );
  }, [poolDetails?.method]);

  // const { date: countDownDate, display } = displayCountDownTime(poolDetails?.method, joinTimeInDate, endJoinTimeInDate, startBuyTimeInDate, endBuyTimeInDate)

  const [infoCountdown, setInfoCountdown] = useState<ObjectType<any>>({
    countDownDate: undefined, display: '', poolStatus: undefined,
  });

  const [recallCountdown, setRecallCountdown] = useState(false);
  const onFinishCountdown = () => {
    setRecallCountdown(true);
  }

  useEffect(() => {
    if (infoCountdown.isSwapPhase2 && +currentUserTier?.max_bonus) {
      const maxBuy = (+currentUserTier.max_buy) + (+currentUserTier.max_bonus);
      setUserBuyLimit(maxBuy);
    }
  }, [infoCountdown, currentUserTier])
  useEffect(() => {
    if (timelineInPool.joinTimeInDate) {
      setRecallCountdown(true);
    }
  }, [timelineInPool]);

  useEffect(() => {
    if (recallCountdown && timelineInPool.joinTimeInDate) {
      const { date: countDownDate, display, poolStatus, ...other } = displayCountDownTime(
        poolDetails?.method,
        timelineInPool.joinTimeInDate,
        timelineInPool.endJoinTimeInDate,
        timelineInPool.startBuyTimeInDate,
        timelineInPool.endBuyTimeNormal
      )
      setInfoCountdown({ countDownDate, display, poolStatus, ...other });
      setRecallCountdown(false);
    }
  }, [recallCountdown, timelineInPool]);

  useEffect(() => {
    if (+soldProgress > 0) {
      setRecallCountdown(true);
    }
  }, [soldProgress])

  // const shortenAddress = (address: string, digits: number = 4) => {
  //   return `${address.substring(0, digits + 2)}...${address.substring(42 - digits)}`
  // }

  // const userTiersAnnotationText = useMemo(() => {
  //   if (!verifiedEmail) {
  //     return 'Determined at whitelist closing';
  //   }

  //   if (pickedWinner && poolDetails) {
  //     const approximateValue = new BigNumber(userBuyLimit).dividedBy(poolDetails?.ethRate || 0);
  //     return `
  //       *Individual caps: ${numberWithCommas(userBuyLimit.toString())} ${currencyName} - ${' '}
  //       Estimated equivalent of ${numberWithCommas(approximateValue.toFixed())} ${poolDetails?.tokenDetails?.symbol}
  //     `;
  //   }

  //   return 'Determined at whitelist closing';
  // }, [existedWinner, userBuyLimit, poolDetails, verifiedEmail]);

  useEffect(() => {
    dispatch(setTypeIsPushNoti());
  }, [dispatch]);

  useEffect(() => {
    setActiveNav(HeaderType.Main);
    if (!poolDetails?.isDeployed) setActiveNav(HeaderType.About);
    if (availablePurchase) setActiveNav(HeaderType.Main);
  }, [availablePurchase, poolDetails]);

  // Auto Scroll To Top When redirect from other pages
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Hide main tab after end buy time
  useEffect(() => {
    if (
      endBuyTimeInDate && endBuyTimeInDate < new Date() &&
      activeNav === HeaderType.Main
    ) setActiveNav(HeaderType.About);
  }, [endBuyTimeInDate]);

  useEffect(() => {
    currentUserTier && dispatch({
      type: sotaTiersActions.USER_TIER_SUCCESS,
      payload: currentUserTier.level
    })
  }, [currentUserTier]);

  useEffect(() => {
    const appNetwork = (() => {
      switch (appChainID) {
        case BSC_CHAIN_ID:
          return 'bsc';

        case POLYGON_CHAIN_ID:
          return 'polygon';

        case ETH_CHAIN_ID:
          return 'eth';
      }
    })();
    setDisableAllButton(appNetwork !== poolDetails?.networkAvailable);
    if (appNetwork !== poolDetails?.networkAvailable && poolDetails) {
      dispatch(pushMessage(`Please switch to ${poolDetails?.networkAvailable.toLocaleUpperCase()} network to do Apply Whitelist, Approve/Buy tokens.`))
    } else {
      dispatch(pushMessage(''));
    }
  }, [appChainID, poolDetails])


  // const [showWhitelistCountryModal, setShowWhitelistCountryModal] = useState(false);

  const winnerListRef = useRef(null);
  const scrollToWinner = () => {
    setActiveTabBottom('tab_winner');
    setTimeout(() => {
      // @ts-ignore
      winnerListRef && winnerListRef.current && winnerListRef.current.scrollIntoView({ behavior: "smooth" })
    }, 200);
  };
  const now = new Date();
  const isOverTimeApplyWhiteList = endJoinTimeInDate && endJoinTimeInDate < now;
  const render = () => {

    // if (loadingPoolDetail) {
    //   return (
    //     <div className={styles.loader} style={{ marginTop: 70 }}>
    //       <HashLoader loading={true} color={'#72F34B'} />
    //       <p className={styles.loaderText}>
    //         <span style={{ marginRight: 10 }}>Loading Pool Details ...</span>
    //       </p>
    //     </div>
    //   )
    // }

    if ((!poolDetails || !poolDetails?.isDisplay) /**&& !loadingPoolDetail*/) {
      return (<p style={{
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 700,
        marginTop: 20
      }}>
        This pool does not exist. Try later! 🙂
      </p>)
    } else {
      return (
        <>
          <section className={styles.headerComponent}>
            {
              !connectedAccount && <WrapperAlert className="mb-6px">
                Please connect to wallet
              </WrapperAlert>
            }

            <BannerNotification
              poolDetails={poolDetails}
              ableToFetchFromBlockchain={ableToFetchFromBlockchain}
              winnersList={winnersList}
              // verifiedEmail={verifiedEmail}
              currentUserTier={currentUserTier}
              loadingCurrentTier={loadingCurrentTier}
              // existedWinner={existedWinner}
              currencyName={currencyName}
              userBuyLimit={userBuyLimit}
              endBuyTimeInDate={endBuyTimeInDate}
              alreadyJoinPool={alreadyJoinPool}
              joinPoolSuccess={joinPoolSuccess}
              // isKYC={(dataUser?.user?.is_kyc === KYC_STATUS.APPROVED || poolDetails?.kycBypass) ? true : false}
              // isKYC={!!(isKYC || poolDetails?.kycBypass)}
              checkKyc={checkKyc}
              // dataUser={dataUser}
              connectedAccount={connectedAccount}
              startBuyTimeInDate={startBuyTimeInDate}
              announcementTime={announcementTime}
              purchasableCurrency={poolDetails?.purchasableCurrency?.toUpperCase()}
              whitelistCompleted={whitelistCompleted}
              whitelistLoading={whitelistLoading}
              scrollToWinner={scrollToWinner}
              poolAddress={poolDetails?.poolAddress}
              tokenDetails={poolDetails?.tokenDetails}
              maximumBuy={userBuyLimit}
              isOverTimeApplyWhiteList={isOverTimeApplyWhiteList}
              countDownDate={infoCountdown.countDownDate}
              isPreOrderPool={isPreOrderPool}
              isInPreOrderTime={isInPreOrderTime}
              poolStatus={infoCountdown.poolStatus}
              loadingJoinPool={loadingJoinPool}
              loadingWinnerList={loadingWinnerList}
              dataUser={dataUser}
            />

            <ByTokenHeader
              poolDetailsMapping={poolDetailsMapping}
              poolDetails={poolDetails}
              solanaAddress={whitelistSubmission?.solana_address}
            />

            {
              !loadingJoinPool && Number(poolDetails?.isPrivate || '0') !== POOL_IS_PRIVATE.COMMUNITY &&
              joinTimeInDate && new Date() > joinTimeInDate && !(alreadyJoinPool || joinPoolSuccess) &&
              !(ableToFetchFromBlockchain && (winnersList && winnersList.total > 0)) &&
              !isOverTimeApplyWhiteList &&
              <ApplyWhiteListButton
                poolDetails={poolDetails}
                joinTimeInDate={joinTimeInDate}
                endJoinTimeInDate={endJoinTimeInDate}
                currentUserTier={currentUserTier}
                connectedAccount={connectedAccount}
                wrongChain={wrongChain}
                // verifiedEmail={verifiedEmail}

                alreadyJoinPool={alreadyJoinPool}
                joinPoolSuccess={joinPoolSuccess}
                poolJoinLoading={poolJoinLoading}
                // joinPool={joinPool}
                joinPool={onCheckKyc}
                // joinPool={() => { setShowWhitelistFormModal(true) }}
                // isKYC={!!(isKYC || poolDetails?.kycBypass)}
                checkKyc={checkKyc}
                winnersList={winnersList}
                ableToFetchFromBlockchain={ableToFetchFromBlockchain}
              />
            }

            {
              !loadingJoinPool && Number(poolDetails?.isPrivate || '0') === POOL_IS_PRIVATE.COMMUNITY &&
              poolDetails?.socialRequirement?.gleam_link &&
              joinTimeInDate && new Date() > joinTimeInDate && !(alreadyJoinPool || joinPoolSuccess) &&
              !(ableToFetchFromBlockchain && (winnersList && winnersList.total > 0)) &&
              !isOverTimeApplyWhiteList &&
              <Button
                text='Join Competition'
                backgroundColor='#D01F36'
                style={{
                  width: 200,
                  height: 42,
                  backgroundColor: '#D01F36',
                  borderRadius: 60,
                  color: 'white',
                  border: 'none',
                  marginTop: 16,
                  padding: 10,
                  fontSize: 16,
                  lineHeight: '24px',
                  fontWeight: 500,
                }}
                onClick={() => window.open(poolDetails?.socialRequirement?.gleam_link)}
              />
            }

            {
              !loadingJoinPool && Number(poolDetails?.isPrivate || '0') !== POOL_IS_PRIVATE.COMMUNITY &&
              (alreadyJoinPool || joinPoolSuccess) && !whitelistCompleted && !whitelistLoading &&
              !(ableToFetchFromBlockchain && (winnersList && winnersList.total > 0)) &&
              <Button
                text="Whitelist Status"
                backgroundColor="#FFD058"
                style={{
                  width: 200,
                  height: 42,
                  backgroundColor: `#FFD058`,
                  borderRadius: 60,
                  color: '#0A0D1C',
                  fontWeight: 500,
                  border: 'none',
                  marginTop: 16,
                  padding: 10,
                  fontSize: 16,
                  lineHeight: '24px',
                }}
                onClick={() => { setShowWhitelistFormModal(true) }}
              />
            }

            {
              showWhitelistFormModal &&
              <ApplyWhitelistModal
                poolDetails={poolDetails}
                connectedAccount={connectedAccount}
                // joinPool={joinPool}
                joinPool={joinPool}
                alreadyJoinPool={alreadyJoinPool}
                joinPoolSuccess={joinPoolSuccess}
                whitelistSubmission={whitelistSubmission}
                previousWhitelistSubmission={previousWhitelistSubmission}
                dataUser={dataUser}
                handleClose={() => { setShowWhitelistFormModal(false) }}
              />
            }

          </section>

          <div className={styles.midPage}>
            <BuyTokenPoolTimeLine
              currentStatus={infoCountdown.poolStatus}
              display={infoCountdown.display}
              poolDetails={poolDetails}
              countDownDate={infoCountdown.countDownDate}
              onFinishCountdown={onFinishCountdown}
            />
            <BuyTokenPoolSwapInfo
              poolDetails={poolDetails}
              currencyName={currencyName}
            />
          </div>
          {
            ((+soldProgress < 100) && isSwap(infoCountdown.poolStatus)) && !allowUserBuyPreOrder &&
            startBuyTimeInDate &&
            endBuyTimeInDate &&
            startBuyTimeInDate < new Date() && new Date() < endBuyTimeInDate &&
            <BuyTokenForm
              disableAllButton={disableAllButton}
              // existedWinner={existedWinner}
              alreadyJoinPool={alreadyJoinPool}
              joinPoolSuccess={joinPoolSuccess}
              tokenDetails={poolDetails?.tokenDetails}
              networkAvailable={poolDetails?.networkAvailable || ''}
              rate={poolDetails?.ethRate}
              poolAddress={poolDetails?.poolAddress}
              maximumBuy={userBuyLimit}
              minimumBuy={userBuyMinimum}
              poolAmount={poolDetails?.amount}
              purchasableCurrency={poolDetails?.purchasableCurrency?.toUpperCase()}
              poolId={poolDetails?.id}
              joinTime={joinTimeInDate}
              method={poolDetails?.method}
              availablePurchase={availablePurchase}
              ableToFetchFromBlockchain={ableToFetchFromBlockchain}
              minTier={poolDetails?.minTier}
              isDeployed={poolDetails?.isDeployed}
              startBuyTimeInDate={startBuyTimeInDate}
              endBuyTimeInDate={endBuyTimeInDate}
              endJoinTimeInDate={endJoinTimeInDate}
              tokenSold={tokenSold}
              setBuyTokenSuccess={setBuyTokenSuccess}
              isClaimable={poolDetails?.type === 'claimable'}
              currentUserTier={currentUserTier}
              poolDetailsMapping={poolDetailsMapping}
              poolDetails={poolDetails}
              isKyc={checkKyc.isKyc}
              // isKyc={!!(isKYC || poolDetails?.kycBypass)}
              // Setting Enable PreOrder
              isInPreOrderTime={false}
            />
          }

          {
            (alreadyJoinPool || joinPoolSuccess) &&
            isPreOrderPool &&      // Pre Order Pool
            isEnoughTierPreOrder &&
            allowUserBuyPreOrder &&
            startBuyTimeInDate &&
            endBuyTimeInDate &&
            startBuyTimeInDate < new Date() && new Date() < endBuyTimeInDate &&
            <BuyTokenForm
              disableAllButton={disableAllButton}
              // existedWinner={existedWinner}
              alreadyJoinPool={alreadyJoinPool}
              joinPoolSuccess={joinPoolSuccess}
              tokenDetails={poolDetails?.tokenDetails}
              networkAvailable={poolDetails?.networkAvailable || ''}
              rate={poolDetails?.ethRate}
              poolAddress={poolDetails?.poolAddress}
              maximumBuy={userBuyLimit}
              minimumBuy={userBuyMinimum}
              poolAmount={poolDetails?.amount}
              purchasableCurrency={poolDetails?.purchasableCurrency?.toUpperCase()}
              poolId={poolDetails?.id}
              joinTime={joinTimeInDate}
              method={poolDetails?.method}
              availablePurchase={availablePurchase}
              ableToFetchFromBlockchain={ableToFetchFromBlockchain}
              minTier={poolDetails?.minTier}
              isDeployed={poolDetails?.isDeployed}

              // Apply PreOrder Time
              startBuyTimeInDate={startBuyTimeInDate}
              endBuyTimeInDate={endBuyTimeInDate}

              endJoinTimeInDate={endJoinTimeInDate}
              tokenSold={tokenSold}
              setBuyTokenSuccess={setBuyTokenSuccess}
              isClaimable={poolDetails?.type === 'claimable'}
              currentUserTier={currentUserTier}
              poolDetailsMapping={poolDetailsMapping}
              poolDetails={poolDetails}
              isKyc={checkKyc.isKyc}
              // isKyc={!!(isKYC || poolDetails?.kycBypass)}
              // Setting Enable PreOrder
              isInPreOrderTime={isInPreOrderTime}
            />
          }

          {
            ((+soldProgress === 100) || isClaim(infoCountdown.poolStatus)) &&
            <ClaimToken
              releaseTime={poolDetails?.releaseTime ? releaseTimeInDate : undefined}
              ableToFetchFromBlockchain={ableToFetchFromBlockchain}
              poolAddress={poolDetails?.poolAddress}
              tokenDetails={poolDetails?.tokenDetails}
              buyTokenSuccess={buyTokenSuccess}
              poolId={poolDetails?.id}
              disableAllButton={disableAllButton}
              poolDetails={poolDetails}
              currencyName={currencyName}
              startBuyTimeInDate={startBuyTimeInDate}
              isKyc={checkKyc.isKyc}
              currentUserTier={currentUserTier}
            // isKyc={!!(isKYC || poolDetails?.kycBypass)}
            />
          }

          <div className={styles.boxBottom}>
            <ul className={`${!!pickedWinner && 'multilTabBottom'} ${styles.navBottom}`}>
              <li onClick={() => setActiveTabBottom('tab_pool_details')} className={activeTabBottom === 'tab_pool_details' ? 'active' : ''}>Pool Details</li>
              {
                // !isClaim(infoCountdown?.poolStatus) && 
                !!pickedWinner &&
                <li onClick={() => setActiveTabBottom('tab_winner')} className={activeTabBottom === 'tab_winner' ? 'active' : ''}>
                  Winners ({numberWiner})
                </li>
              }
            </ul>
            {
              activeTabBottom === 'tab_pool_details' &&
              <BuyTokenPoolDetails
                poolDetails={poolDetails}
              />
            }

            {
              // !isClaim(infoCountdown?.poolStatus) &&
              <div className={`${activeTabBottom === 'tab_winner' && 'show'} ${styles.hiddenTabWinner}`}>
                <div ref={winnerListRef}/>
                <LotteryWinners
                    handleWiners={(total) => setNumberWiner(total)}
                    poolId={poolDetails?.id}
                    // userWinLottery={existedWinner ? true : false}
                    userWinLottery={userBuyLimit > 0}
                    pickedWinner={!!pickedWinner}
                    maximumBuy={userBuyLimit}
                    purchasableCurrency={poolDetails?.purchasableCurrency.toUpperCase()}
                    // verifiedEmail={verifiedEmail ? true : false}
                />
              </div>
            }
          </div>
          {
            // hidden when is commnunity pool
            poolDetails && +poolDetails?.isPrivate !== 3 && <HowToParticipant
              poolDetails={poolDetails}
              joinTimeInDate={joinTimeInDate}
              endJoinTimeInDate={endJoinTimeInDate}
              currentUserTier={currentUserTier}
              alreadyJoinPool={alreadyJoinPool}
              joinPoolSuccess={joinPoolSuccess}
              whitelistCompleted={whitelistCompleted}
              isKyc={checkKyc.isKyc}
            // isKYC={!!(isKYC || poolDetails?.kycBypass)}
            />
          }


          {/* <header className={styles.poolDetailHeader}>
            <div className={styles.poolHeaderWrapper}>
              <div className={styles.poolHeaderImage}>
                <img src={poolDetails?.banner || poolImage} alt="pool-image" className={styles.poolImage}/>
              </div>
              <div className={styles.poolHeaderInfo}>
                <h2 className={styles.poolHeaderTitle}>
                  {poolDetails?.title}
                </h2>
                <Tooltip title={<p style={{ fontSize: 15, textAlign: 'left' }}>Token ICO Address</p>}>
                    <p className={styles.poolHeaderAddress}>
                      {isWidthUp('sm', props.width) && poolDetails?.tokenDetails?.address}
                      {isWidthDown('xs', props.width) && shortenAddress(poolDetails?.tokenDetails?.address || '', 8)}

                      <CopyToClipboard text={poolDetails?.tokenDetails?.address ?? ''}
                        onCopy={() => {
                        setCopiedAddress(true);
                        setTimeout(() => {
                          setCopiedAddress(false);
                          }, 2000);
                        }}
                      >
                      {
                        !copiedAddress ? <img src={copyImage} alt="copy-icon" className={styles.poolHeaderCopy} />
                        : <p style={{ color: '#72F34B', marginLeft: 10 }}>Copied</p>
                      }
                      </CopyToClipboard>
                    </p>
                </Tooltip>
                {isWidthUp('md', props.width) && <StatusBar currentStatus={poolStatus} />}
              </div>
            </div>
            <div className={styles.poolType}>
              <span className={styles.poolHeaderType}>
                <div className={styles.poolHeaderTypeInner}>
                  <img src={poolDetails?.networkIcon} />
                  <strong className={styles.poolHeaderNetworkAvailable}>{networkAvailable}</strong>
                </div>
              </span>
              <span className={`${styles.poolStatus} ${styles.poolStatus}--${poolStatus}`}>
                {poolStatus}
              </span>
            </div>
            {ableToFetchFromBlockchain && (winnersList && winnersList.total > 0) && verifiedEmail &&
            (currentUserTier && currentUserTier.level == TIER_LEVELS.DOVE) &&
              <p className={styles.poolTicketWinner}>
                {existedWinner &&
                <div>
                  {
                    [...Array(3)].map((num, index) => (
                      <img src="/images/fire-cracker.svg" alt="file-cracker" key={index} />
                    ))
                  }
                </div>
                }
                {!existedWinner &&
                <div>
                  {
                    [...Array(3)].map((num, index) => (
                      <img style={{ paddingLeft: 5 }} src="/images/icons/warning.svg" alt="file-cracker" key={index} />
                    ))
                  }
                </div>
                }
                <span style={{ marginLeft: 14 }}>
                  Congratulations! You have won the lottery!
                  {existedWinner &&
                    <p className={styles.LotteryWinnersMessage}>
                      Congratulations! You have won the lottery. You can buy up to {numberWithCommas(`${userBuyLimit}`)} {currencyName}.
                    </p>
                  }
                  {!existedWinner &&
                    <p className={styles.LotteryWinnersMessage}>
                      Unfortunately, you did not win a ticket to buy this time! See you next time.
                    </p>
                  }
                </span>
              </p>
            }
            {endBuyTimeInDate && new Date() > endBuyTimeInDate && ableToFetchFromBlockchain &&
              <p className={styles.poolTicketWinner}>
                <div>
                  {
                    [...Array(3)].map((num, index) => (
                      <img src="/images/fire-cracker.svg" alt="file-cracker" key={index} />
                    ))
                  }
                </div>
                <span style={{ marginLeft: 14 }}>
                  <PoolIsEndMessage
                    poolDetails={poolDetails}
                  />
                </span>
              </p>
            }
            {
              !verifiedEmail && (
                <p className={styles.poolTicketWinner}>
                  <div>
                    <img src="/images/red-warning.svg" alt="warning" />
                  </div>
                  <span style={{ marginLeft: 14 }}>
                    Your account has not been verified. To verify your account, please click&nbsp;
                    <Link
                      to="/account"
                      style={{ color: 'white', textDecoration: 'underline' }}
                    >
                      here
                    </Link>.
                  </span>
                </p>
              )
            }
            {
              (joinTimeInDate || 0) <= today && today <= (endJoinTimeInDate || 0) &&
              (poolDetails?.joinTime || 0) <= (today.getTime() / 1000) && (today.getTime() / 1000) <= (poolDetails?.endJoinTime || 0) &&

              <>
                {!(alreadyJoinPool || joinPoolSuccess) &&
                  (
                    <p className={styles.poolTicketWinner}>
                      <div>
                        <img src="/images/tick.svg" alt="warning" />
                      </div>
                      <span style={{ marginLeft: 14 }}>
                        You must click the Apply Whitelist button to join the pool whitelist.
                      </span>
                    </p>
                  )
                }
                {
                (alreadyJoinPool || joinPoolSuccess) &&
                  (
                    <WhiteListUserGuideBanner
                      poolDetails={poolDetails}
                    />
                  )
                }
              </>
            }
          </header>
           */}

          {/* <main className={styles.poolDetailInfo}>
            <div className={styles.poolDetailTierWrapper}>
              <div className={styles.poolDetailIntro}>
              {
                (loadingPoolDetail) ? (
                  <div className={styles.loader}>
                    <HashLoader loading={true} color={'#72F34B'} />
                    <p className={styles.loaderText}>
                      <span style={{ marginRight: 10 }}>Loading Pool Details ...</span>
                    </p>
                  </div>
                ):  poolDetailsMapping &&
                (
                  <>
                    <PoolInfoTable
                      poolDetailsMapping={poolDetailsMapping}
                      poolDetails={poolDetails}
                    />

                    <div className={styles.btnGroup}>
                      {
                        (availableJoin && !alreadyJoinPool && !joinPoolSuccess && !disableAllButton) &&
                        <>

                          {showWhitelistCountryModal &&
                            <WhitelistCountryModal
                              handleOk={() => {
                                joinPool();
                                setShowWhitelistCountryModal(false);
                              }}
                              handleCancel={() => {
                                setShowWhitelistCountryModal(false);
                              }}
                              textWhitelist={poolDetails?.whitelistCountry}
                            />
                          }

                          {poolDetails?.whitelistCountry &&
                            <Button
                              text={(!alreadyJoinPool && !joinPoolSuccess) ? 'Apply Whitelist': 'Applied Whitelist '}
                              backgroundColor={'#D01F36'}
                              loading={poolJoinLoading}
                              onClick={() => {
                                setShowWhitelistCountryModal(true);
                              }}
                              style={{
                                minWidth: 125,
                                padding: '0 20px',
                              }}
                            />
                          }

                          {!poolDetails?.whitelistCountry &&
                            <Button
                              text={(!alreadyJoinPool && !joinPoolSuccess) ? 'Apply Whitelist': 'Applied Whitelist '}
                              // text={(!joinPoolSuccess) ? 'Apply Whitelist': 'Applied Whitelist '}
                              backgroundColor={'#D01F36'}
                              // disabled={!availableJoin || alreadyJoinPool || joinPoolSuccess || disableAllButton}
                              loading={poolJoinLoading}
                              onClick={joinPool}
                              style={{
                                minWidth: 125,
                                padding: '0 20px',
                              }}
                            />
                          }

                        </>
                      }

                      <Button
                        text={getEtherscanName({ networkAvailable: poolDetails?.networkAvailable })}
                        backgroundColor={'#72F34B'}
                        onClick={() => {
                          const url = getEtherscanTransactionAddress({ appChainID: appChainID, address: poolDetails?.tokenDetails?.address });
                          poolDetails && window.open(url as string, '_blank')
                        }}
                        disabled={!poolDetails?.tokenDetails?.address}
                      />
                    </div>
                  </>
                )
              }
              </div>
              <div className={styles.poolDetailTier}>
                <Tiers
                  hideStatistics
                  showMoreInfomation={true}
                  tiersBuyLimit={poolDetails?.buyLimit || [] }
                  tokenSymbol={`${poolDetails?.purchasableCurrency?.toUpperCase()}`}
                  verifiedEmail={verifiedEmail}
                  userTier={currentUserTier?.level || 0}
                />
                <p className={styles.poolDetailMaxBuy}>
                  *Max bought: {numberWithCommas(userBuyLimit.toString())} {poolDetails?.purchasableCurrency?.toUpperCase()}
                  {userTiersAnnotationText}
                </p>
                <div className={styles.poolDetailProgress}>
                  <p className={styles.poolDetailProgressTitle}>Swap Progress</p>
                  {isWidthUp('sm', props.width) && <div className={styles.poolDetailProgressStat}>
                    <span className={styles.poolDetailProgressPercent}>
                      {numberWithCommas(new BigNumber(soldProgress).gt(99) ? '100': soldProgress)}%
                    </span>
                    <span>
                      {
                        numberWithCommas(new BigNumber(tokenSold).gt(`${poolDetails?.amount}`) ? `${poolDetails?.amount}`: tokenSold)}&nbsp;
                        / {numberWithCommas(`${poolDetails?.amount}` || "0")
                      }
                    </span>
                  </div>}
                  {isWidthDown('xs', props.width) && <div className={styles.poolDetailProgressStat}>
                    <span className={styles.poolDetailProgressPercent}>
                      {parseFloat(soldProgress).toFixed(2)}%
                    </span>
                    <span>
                      {
                        numberWithCommas(new BigNumber(tokenSold).gt(`${poolDetails?.amount}`) ? `${poolDetails?.amount}`: tokenSold)}&nbsp;
                        / {numberWithCommas(`${poolDetails?.amount}` || "0")
                      }
                    </span>
                  </div>}
                  <div className={styles.progress}>
                    <div className={styles.achieved} style={{ width: `${new BigNumber(soldProgress).gt(100) ? '100': soldProgress}%` }}></div>
                  </div>
                </div>
                <div className={styles.poolDetailStartTime}>
                  {
                    display ? (
                      <>
                        <span className={styles.poolDetailStartTimeTitle}>{display}</span>
                        <Countdown startDate={countDownDate} />
                      </>
                    ): (
                      <p
                        style={{
                          color: '#D01F36',
                          marginTop: 40,
                          font: 'normal normal bold 14px/18px DM Sans'
                        }}>
                        <PoolIsEndMessage
                          poolDetails={poolDetails}
                        />
                      </p>
                    )
                  }
                </div>
              </div>
            </div>
            <div className={styles.poolDetailBuy}>
              <nav className={styles.poolDetailBuyNav}>
                <ul className={styles.poolDetailLinks}>
                  {
                    headers.map((header) => {
                      if (header === HeaderType.Main
                        && endBuyTimeInDate && new Date() > endBuyTimeInDate
                      ) {
                        return;
                      }

                      if (
                        header !== HeaderType.About &&
                        header !== HeaderType.MyTier &&
                        header !== HeaderType.Participants &&
                        (!poolDetails?.isDeployed || endBuyTimeInDate && endBuyTimeInDate < new Date())
                      ) {
                        return;
                      }

                      return <li
                        className={`${styles.poolDetailLink} ${activeNav === header ? `${styles.poolDetailLinkActive}`: ''}`}
                        onClick={() => setActiveNav(header)}
                        key={header}
                      >
                        {header}
                      </li>
                    })
                  }
                </ul>
              </nav>
              <div className={styles.poolDetailBuyForm}>
                {
                  activeNav === HeaderType.Main
                  && endBuyTimeInDate && new Date() <= endBuyTimeInDate
                  && (
                      <BuyTokenForm
                        disableAllButton={disableAllButton}
                        existedWinner={existedWinner}
                        alreadyJoinPool={alreadyJoinPool}
                        joinPoolSuccess={joinPoolSuccess}
                        tokenDetails={poolDetails?.tokenDetails}
                        networkAvailable={poolDetails?.networkAvailable || ''}
                        rate={poolDetails?.ethRate}
                        poolAddress={poolDetails?.poolAddress}
                        maximumBuy={userBuyLimit}
                        minimumBuy={userBuyMinimum}
                        poolAmount={poolDetails?.amount}
                        purchasableCurrency={poolDetails?.purchasableCurrency?.toUpperCase()}
                        poolId={poolDetails?.id}
                        joinTime={joinTimeInDate}
                        method={poolDetails?.method}
                        availablePurchase={availablePurchase}
                        ableToFetchFromBlockchain={ableToFetchFromBlockchain}
                        minTier={poolDetails?.minTier}
                        isDeployed={poolDetails?.isDeployed}
                        startBuyTimeInDate={startBuyTimeInDate}
                        endBuyTimeInDate={endBuyTimeInDate}
                        endJoinTimeInDate={endJoinTimeInDate}
                        tokenSold={tokenSold}
                        setBuyTokenSuccess={setBuyTokenSuccess}
                        isClaimable={poolDetails?.type === 'claimable'}
                        currentUserTier={currentUserTier}
                        poolDetailsMapping={poolDetailsMapping}
                      />
                   )
                }
                {
                  activeNav === HeaderType.About && (
                     <PoolAbout
                       website={poolDetails?.website}
                       exchangeRate={poolDetailsMapping && poolDetailsMapping[PoolDetailKey.exchangeRate].display}
                       description={poolDetails?.description}
                     />
                  )
                }
                {
                  activeNav === HeaderType.Participants && (
                    <LotteryWinners
                      poolId={poolDetails?.id}
                      userWinLottery={existedWinner ? true: false}
                      maximumBuy={userBuyLimit}
                      purchasableCurrency={poolDetails?.purchasableCurrency.toUpperCase()}
                      verifiedEmail={verifiedEmail ? true: false}
                    />
                   )
                }
                {
                  activeNav === HeaderType.MyTier &&
                    <MyTier
                      tiers={poolDetails?.tiersWithDetails}
                      poolDetails={poolDetails}
                    />
                }
                {
                  poolDetails?.type === POOL_TYPE.CLAIMABLE && (
                    <ClaimToken
                      releaseTime={poolDetails?.releaseTime ? releaseTimeInDate : undefined}
                      ableToFetchFromBlockchain={ableToFetchFromBlockchain}
                      poolAddress={poolDetails?.poolAddress}
                      tokenDetails={poolDetails?.tokenDetails}
                      buyTokenSuccess={buyTokenSuccess}
                      poolId={poolDetails?.id}
                      disableAllButton={disableAllButton}
                      poolDetails={poolDetails}
                    />
                 )
                }
              </div>
            </div>
          </main> */}

        </>
      )
    }
  }

  return (
    <div className={styles.poolDetailContainer}>
      {render()}
    </div>
  )
}
export default withWidth()(BuyToken);
