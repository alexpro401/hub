'use strict'

const crypto = use('crypto');
const BigNumber = use('bignumber.js');
const moment = use('moment');

const Const = use('App/Common/Const');
const RedisUtils = use('App/Common/RedisUtils')
const RedisStakingPoolUtils = use('App/Common/RedisStakingPoolUtils')
const StakingPoolModel = use('App/Models/StakingPool');

const CONFIGS_FOLDER = '../../blockchain_configs/';
const NETWORK_CONFIGS = require(`${CONFIGS_FOLDER}${process.env.NODE_ENV}`);
const CONTRACT_CONFIGS = NETWORK_CONFIGS.contracts[Const.CONTRACTS.CAMPAIGN];
const STAKING_CONTRACT_CONFIGS = NETWORK_CONFIGS.contracts[Const.CONTRACTS.STAKING_POOL];
const { abi: STAKING_POOL_CONTRACT_ABI } = STAKING_CONTRACT_CONFIGS.CONTRACT_DATA;
const ERC721_ABI = require('../../blockchain_configs/contracts/Erc721');
const MARKETPLACE_ABI = require('../../blockchain_configs/contracts/Marketplace');
const { abi: CONTRACT_ABI } = CONTRACT_CONFIGS.CONTRACT_DATA;

const GAFI_SMART_CONTRACT_ADDRESS = process.env.GAFI_SMART_CONTRACT_ADDRESS
const UNI_LP_GAFI_SMART_CONTRACT_ADDRESS = process.env.UNI_LP_GAFI_SMART_CONTRACT_ADDRESS
const STAKING_POOL_SMART_CONTRACT = process.env.STAKING_POOL_SMART_CONTRACT
const MARKETPLACE_SMART_CONTRACT = process.env.MARKETPLACE_SMART_CONTRACT
const LEGEND_DATA = NETWORK_CONFIGS.contracts[Const.CONTRACTS.Legend].DATA;
const ONE_UNIT = new BigNumber(Math.pow(10, 18))

const WEB3_ETH_PROVIDER = process.env.ETH_PROVIDER
const WEB3_BSC_PROVIDER = process.env.BSC_PROVIDER
const WEB3_POLYGON_PROVIDER = process.env.POLYGON_PROVIDER
const WEB3_AVAX_PROVIDER = process.env.AVAX_PROVIDER

/**
 * Switch Link Web3
 */
const isDevelopment = process.env.NODE_ENV === 'development';
console.log('isDevelopment:===========>', isDevelopment, process.env.NODE_ENV);

const getWeb3Provider = (network) => {
  if (!network) {
    network = Const.NETWORK_AVAILABLE.BSC
  }

  if (isDevelopment) {
    return getTestnetWeb3Provider(network)
  }

  return getMainnetWeb3Provider(network)
}

const getTestnetWeb3Provider = (network) => {
  let provider = ''
  switch (network) {
    case Const.NETWORK_AVAILABLE.ETH:
      provider = [
        'https://goerli.infura.io/v3/c745d07314904c539668b553dbd6b670',
        'https://goerli.infura.io/v3/f1464dc327c64a93a31220b50334bf78',
        'https://goerli.infura.io/v3/2bf3314408cb41fe9e6e34f706d30d22',
        'https://goerli.infura.io/v3/1462716938c549688773a726a3f3114f',
        'https://goerli.infura.io/v3/25fd6f14fda14ae2b14c4176d0794509',
        'https://goerli.infura.io/v3/cc59d48c26f54ab58d831f545eda2bb7',
        'https://goerli.infura.io/v3/3a18fd787c2342c4915364de4955bcf5'
      ]
    case Const.NETWORK_AVAILABLE.POLYGON:
      provider = ['https://rpc-mumbai.maticvigil.com/']
    case Const.NETWORK_AVAILABLE.AVAX:
      provider = ['https://api.avax-test.network/ext/bc/C/rpc']
    default:
      provider = ['https://data-seed-prebsc-1-s1.binance.org:8545']
  }

  return provider[Math.floor(Math.random() * provider.length)]
}

const getMainnetWeb3Provider = (network) => {
  switch (network) {
    case Const.NETWORK_AVAILABLE.BSC:
      return WEB3_BSC_PROVIDER
    case Const.NETWORK_AVAILABLE.ETH:
      return WEB3_ETH_PROVIDER
    case Const.NETWORK_AVAILABLE.POLYGON:
      return WEB3_POLYGON_PROVIDER
    case Const.NETWORK_AVAILABLE.AVAX:
      return WEB3_AVAX_PROVIDER
    default:
      return WEB3_BSC_PROVIDER
  }
}

const Web3 = require('web3')
const web3 = new Web3(getWeb3Provider(Const.NETWORK_AVAILABLE.ETH))
const web3Bsc = new Web3(getWeb3Provider(Const.NETWORK_AVAILABLE.BSC))
const web3Polygon = new Web3(getWeb3Provider(Const.NETWORK_AVAILABLE.POLYGON))
const web3Avax = new Web3(getWeb3Provider(Const.NETWORK_AVAILABLE.AVAX))

const networkToWeb3 = {
  [Const.NETWORK_AVAILABLE.ETH]: web3,
  [Const.NETWORK_AVAILABLE.BSC]: web3Bsc,
  [Const.NETWORK_AVAILABLE.POLYGON]: web3Polygon,
  [Const.NETWORK_AVAILABLE.AVAX]: web3Avax
}

const ETH_SMART_CONTRACT_USDT_ADDRESS = process.env.ETH_SMART_CONTRACT_USDT_ADDRESS;
const ETH_SMART_CONTRACT_USDC_ADDRESS = process.env.ETH_SMART_CONTRACT_USDC_ADDRESS;
const BSC_SMART_CONTRACT_USDT_ADDRESS = process.env.BSC_SMART_CONTRACT_USDT_ADDRESS;
const BSC_SMART_CONTRACT_USDC_ADDRESS = process.env.BSC_SMART_CONTRACT_USDC_ADDRESS;
const BSC_SMART_CONTRACT_BUSD_ADDRESS = process.env.BSC_SMART_CONTRACT_BUSD_ADDRESS;
const POLYGON_SMART_CONTRACT_USDT_ADDRESS = process.env.POLYGON_SMART_CONTRACT_USDT_ADDRESS
const POLYGON_SMART_CONTRACT_USDC_ADDRESS = process.env.POLYGON_SMART_CONTRACT_USDC_ADDRESS
const AVALANCHE_SMART_CONTRACT_USDT_ADDRESS = process.env.AVALANCHE_SMART_CONTRACT_USDT_ADDRESS
const AVALANCHE_SMART_CONTRACT_USDC_ADDRESS = process.env.AVALANCHE_SMART_CONTRACT_USDC_ADDRESS

const currencyAddresses = {
  eth: {
    usdt: {
      address: ETH_SMART_CONTRACT_USDT_ADDRESS,
      decimal: 6
    },
    usdc: {
      address: ETH_SMART_CONTRACT_USDC_ADDRESS,
      decimal: 6
    }
  },
  bsc: {
    usdt: {
      address: BSC_SMART_CONTRACT_USDT_ADDRESS,
      decimal: 18
    },
    busd: {
      address: BSC_SMART_CONTRACT_BUSD_ADDRESS,
      decimal: 18
    },
    usdc: {
      address: BSC_SMART_CONTRACT_USDC_ADDRESS,
      decimal: 18
    }
  },
  polygon: {
    usdt: {
      address: POLYGON_SMART_CONTRACT_USDT_ADDRESS,
      decimal: 6
    },
    usdc: {
      address: POLYGON_SMART_CONTRACT_USDC_ADDRESS,
      decimal: 6
    }
  },
  avalanche: {
    usdt: {
      address: AVALANCHE_SMART_CONTRACT_USDT_ADDRESS,
      decimal: 6
    },
    usdc: {
      address: AVALANCHE_SMART_CONTRACT_USDC_ADDRESS,
      decimal: 6
    }
  }
}

const PoolStatus = Const.POOL_STATUS;

const getCurrencyAddress = (network, currency) => {
  if (!network || !currency) {
    return '0x0000000000000000000000000000000000000000'
  }

  network = network.toLowerCase()
  currency = currency.toLowerCase()

  if (currency === 'eth') {
    return '0x0000000000000000000000000000000000000000'
  }

  return currencyAddresses[network][currency].address
}

/**
 * Generate "random" alpha-numeric string.
 *
 * @param  {int}      length - Length of the string
 * @return {string}   The result
 */
const randomString = async (length = 40) => {
  let string = ''
  let len = string.length

  if (len < length) {
    let size = length - len
    let bytes = await crypto.randomBytes(size)
    let buffer = new Buffer(bytes)

    string += buffer
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substr(0, size)
  }

  return string
};

const doMask = (obj, fields) => {
  for (const prop in obj) {
    if (!obj.hasOwnProperty(prop)) continue;
    if (fields.indexOf(prop) !== -1) {
      obj[prop] = this.maskEmail(obj[prop]);
    } else if (typeof obj[prop] === 'object') {
      this.doMask(obj[prop], fields);
    }
  }
};

const maskEmail = async (email) => {
  if (!email || email.indexOf('@') < 0) {
    return email
  }

  const preEmailLength = email.split("@")[0].length;
  // get number of word to hide, half of preEmail
  const hideLength = ~~(preEmailLength / 2);
  // create regex pattern
  const r = new RegExp(".{" + hideLength + "}@", "g")
  // replace hide with ***
  email = email.replace(r, "***@");
  return email;
};

const maskWalletAddress = async (wallet) => {
  const preWalletLength = wallet.length;

  // get number of word to hide, 1/3 of preWallet
  const hideLength = Math.floor(preWalletLength / 3);

  // replace hide with ***
  let r = wallet.substr(hideLength, hideLength);
  wallet = wallet.replace(r, "*************");

  return wallet;
};

const responseErrorInternal = (message) => {
  return {
    status: 500,
    message: message || 'Internal server error',
    data: null,
  }
};

const responseNotFound = (message) => {
  return {
    status: 404,
    message: message || 'Not Found',
    data: null,
  }
};

const responseBadRequest = (message) => {
  return {
    status: 400,
    message: message || 'Bad request',
    data: null,
  }
};

const responseSuccess = (data = null, message) => {
  return {
    status: 200,
    message: message || 'Success',
    data,
  }
};

const checkSumAddress = (address) => {
  return Web3.utils.toChecksumAddress(address)
}

const isAddress = (address) => {
  try {
    if (!address) {
      return false
    }

    return Web3.utils.isAddress(address.toLowerCase())
  }
  catch (e) {
    return false
  }
}

const paginationArray = (array, page_number, page_size) => {
  const newData = JSON.parse(JSON.stringify(array));
  const pageData = newData.slice((page_number - 1) * page_size, page_number * page_size);
  const dataLength = newData.length;
  return {
    data: pageData,
    total: dataLength,
    perPage: page_size,
    lastPage: Math.ceil(dataLength / page_size),
    page: page_number,
  };
};

const getTiers = () => {
  let tiers = []
  let delays = []
  try {
    tiers = JSON.parse(process.env.USER_TIERS)
    delays = JSON.parse(process.env.DELAY_DURATIONS)
  } catch (error) {
    tiers = [15, 100, 400, 1000]
    delays = [5, 8, 12, 15]
  }
  return {
    tiers: tiers.map(tier => Web3.utils.toWei(tier.toString())),
    delays: delays
  }
}

const getStakingPoolInstance = async () => {
  const pool = STAKING_POOL_SMART_CONTRACT
  if (!pool) {
    return null
  }

  const stakingPoolSC = new networkToWeb3[Const.NETWORK_AVAILABLE.BSC].eth.Contract(STAKING_POOL_CONTRACT_ABI, pool);
  if (!stakingPoolSC) {
    return null
  }

  return stakingPoolSC
}

const getMarketplaceInstance = async () => {
  const pool = MARKETPLACE_SMART_CONTRACT
  if (!pool) {
    return null
  }

  const instance = new networkToWeb3[Const.NETWORK_AVAILABLE.BSC].eth.Contract(MARKETPLACE_ABI, pool);
  if (!instance) {
    return null
  }

  return instance
}

const getStakingPoolsDetail = async (data) => {
  if (!data) {
    return
  }

  const instance = await getStakingPoolInstance()
  if (!instance) {
    return data
  }

  data = JSON.parse(JSON.stringify(data))
  try {
    data = await Promise.all(data.map(async (item) => {
      if (item.staking_type === 'linear') {
        const scData = await instance.methods.linearPoolInfo(item.pool_id).call()
        item.cap = scData.cap
        item.minInvestment = scData.minInvestment
        item.maxInvestment = scData.maxInvestment
        item.APR = scData.APR
        item.lockDuration = scData.lockDuration
        item.delayDuration = scData.delayDuration
        item.startJoinTime = scData.startJoinTime
        item.endJoinTime = scData.endJoinTime
      }

      return item
    }))

  } catch (e) {
    return
  }

  return data
};

const getStakingPool = async (wallet_address) => {
  let pools = []
  if (await RedisStakingPoolUtils.existRedisStakingPoolsDetail()) {
    pools = JSON.parse(await RedisStakingPoolUtils.getRedisStakingPoolsDetail())
  }

  if (!pools || !Array.isArray(pools) || pools.length < 1) {
    pools = await StakingPoolModel.query().fetch();
    pools = JSON.parse(JSON.stringify(pools))
  }

  let stakedToken = new BigNumber('0');
  let stakedUni = new BigNumber('0');
  for (const pool of pools) {
    if (!pool.pool_address) {
      continue;
    }

    const stakingPoolSC = new networkToWeb3[Const.NETWORK_AVAILABLE.BSC].eth.Contract(STAKING_POOL_CONTRACT_ABI, pool.pool_address);
    if (!stakingPoolSC) {
      continue;
    }

    if (Number(pool.rkp_rate) < 0.01) {
      continue;
    }

    try {
      switch (pool.staking_type) {
        case 'alloc':
          const [allocPoolInfo, allocUserInfo] = await Promise.all([
            stakingPoolSC.methods.allocPoolInfo(pool.pool_id).call(),
            stakingPoolSC.methods.allocUserInfo(pool.pool_id, wallet_address).call()
          ]);

          if (allocPoolInfo.lpToken.toLowerCase() === GAFI_SMART_CONTRACT_ADDRESS.toLowerCase()) {
            stakedToken = stakedToken.plus(new BigNumber(allocUserInfo.amount));
            break;
          }

          if (allocPoolInfo.lpToken.toLowerCase() === UNI_LP_GAFI_SMART_CONTRACT_ADDRESS.toLowerCase()) {
            stakedUni = stakedUni.plus(new BigNumber(allocUserInfo.amount));
            break;
          }

          break;
        case 'linear':
          const [linearAcceptedToken, linearStakingData] = await Promise.all([
            // stakingPoolSC.methods.linearAcceptedToken().call(),
            GAFI_SMART_CONTRACT_ADDRESS,
            stakingPoolSC.methods.linearStakingData(pool.pool_id, wallet_address).call()
          ]);

          if (linearAcceptedToken.toLowerCase() === GAFI_SMART_CONTRACT_ADDRESS.toLowerCase()) {
            stakedToken = stakedToken.plus(new BigNumber(linearStakingData.balance));
          }
          break;
        default:
      }
    } catch (err) {
      console.log('getStakingPool', err)
    }
  }

  return {
    staked: stakedToken.toFixed(),
    stakedUni: stakedUni.toFixed(),
  };
}

const getUserTierSmartWithCached = async (wallet_address) => {
  if (await RedisUtils.checkExistRedisUserTierBalance(wallet_address)) {
    return JSON.parse(await RedisUtils.getRedisUserTierBalance(wallet_address));
  }

  const tierInfo = await getUserTierSmart(wallet_address);
  RedisUtils.createRedisUserTierBalance(wallet_address, tierInfo);

  return tierInfo
}

const getUserTierSmart = async (wallet_address) => {
  try {
    // Get cached Rate Setting
    // const rateSetting = await getRateSetting()
    const tiers = getTiers().tiers
    const stakingData = await getStakingPool(wallet_address)

    // Caculate PKF Staked
    let stakedToken = new BigNumber((stakingData && stakingData.staked) || 0)

    // Caculate LP-PKF Staked
    // TODO: .multipliedBy(rateSetting.lp_pkf_rate)
    // let stakedUni = new BigNumber((stakingData && stakingData.stakedUni) || 0);
    let stakedUni = new BigNumber(0);

    // get tiers
    let userTier = 0;
    tiers.map((tokenRequire, index) => {
      // master: Fetch NFT Owner
      if (index === tiers.length - 1) {
        if (getLegendIdByOwner(wallet_address) && stakedToken.gte(tokenRequire)) {
          userTier = index + 1;
        }
        return;
      }

      if (stakedToken.gte(tokenRequire)) {
        userTier = index + 1;
      }
    });

    return [
      userTier,
      stakedToken.plus(stakedUni).dividedBy(ONE_UNIT).toFixed(),
      stakedToken.dividedBy(ONE_UNIT).toFixed(),
      0,
    ];
  }
  catch (e) {
    return [0, 0, 0, 0]
  }
};

const getContractInstance = async (camp) => {
  return new networkToWeb3[camp.network_available].eth.Contract(CONTRACT_ABI, camp.campaign_hash);
}

const getERC721TokenContractInstance = async (camp) => {
  return new networkToWeb3[camp.network_available].eth.Contract(ERC721_ABI, camp.token)
}

const getOfferCurrencyInfo = async (camp) => {
  // init pool contract
  const poolContract = await getContractInstance(camp);

  let scCurrency, unit;
  switch (camp.accept_currency) {
    case Const.ACCEPT_CURRENCY.USDT:
    case Const.ACCEPT_CURRENCY.USDC:

      scCurrency = currencyAddresses[camp.network_available][camp.accept_currency].address
      unit = currencyAddresses[camp.network_available][camp.accept_currency].decimal
      break;
    case Const.ACCEPT_CURRENCY.BUSD:
      scCurrency = BSC_SMART_CONTRACT_BUSD_ADDRESS;
      unit = 18;
      break;
    case Const.ACCEPT_CURRENCY.ETH:
    case Const.ACCEPT_CURRENCY.BNB:
    case Const.ACCEPT_CURRENCY.POLYGON:
    case Const.ACCEPT_CURRENCY.AVAX:
      scCurrency = '0x0000000000000000000000000000000000000000';
      unit = 18;
      break;
    default:
      console.log(`Do not found currency support ${camp.accept_currency} of campaignId ${camp.id}`);
      return null
  }
  // call to SC to get rate
  const receipt = await Promise.all([
    poolContract.methods.getOfferedCurrencyRate(scCurrency).call(),
    poolContract.methods.getOfferedCurrencyDecimals(scCurrency).call()
  ]);

  const rate = receipt[0];
  const decimal = receipt[1];
  return [rate, decimal, unit];
}

const getTokenSoldSmartContract = async (pool) => {
  if (!pool.campaign_hash) {
    return 0;
  }

  let poolContract = await getContractInstance(pool)
  if (pool && pool.token_type === Const.TOKEN_TYPE.MYSTERY_BOX) {
    poolContract = await getERC721TokenContractInstance(pool)
  }

  try {
    if (pool.token_type === Const.TOKEN_TYPE.ERC721 && pool.process === Const.PROCESS.ONLY_CLAIM) {
      return await poolContract.methods.tokenClaimed().call();
    }

    if (pool.token_type === Const.TOKEN_TYPE.MYSTERY_BOX) {
      return poolContract.methods.totalSupply().call();
    }

    let tokenSold = await poolContract.methods.tokenSold().call();
    if (pool.token_type === 'erc721') {
      return tokenSold
    }
    const decimal = pool.decimals ? pool.decimals : 18

    tokenSold = new BigNumber(tokenSold).div(new BigNumber(10).pow(decimal)).toFixed();
    return tokenSold;
  }
  catch (e) {
    return 0
  }
};

/**
 * Functions: Calculate Pool Progress
 */
const checkPoolIsFinish = (pool) => {
  const currentTime = moment().unix();
  return (pool.finish_time && currentTime > pool.finish_time);
};

const getProgressWithPools = (pool) => {
  if (!pool) {
    return {
      progress: '0',
      tokenSold: '0',
      totalSoldCoin: '0',
    };
  }

  let tokenSold = pool.tokenSold || pool.token_sold || '0';
  let totalSoldCoin = pool.totalSoldCoin || pool.total_sold_coin || '0';
  let tokenSoldDisplay = pool.tokenSoldDisplay || pool.token_sold_display || '0';
  let progressDisplay = pool.progressDisplay || pool.progress_display || '0';
  let progress = '0';

  const isFinish = checkPoolIsFinish(pool);
  if (isFinish) {
    return {
      progress: '100',
      tokenSold: tokenSold,
      totalSoldCoin: totalSoldCoin,
    }
  }

  // Merge config display with real
  const originTokenSold = tokenSold;
  tokenSold = new BigNumber(tokenSold).plus(tokenSoldDisplay).toFixed();

  // Normal Case
  if (new BigNumber(tokenSold).gt(totalSoldCoin)) { // If tokenSold > totalSoldCoin ==> tokenSold = totalSoldCoin
    tokenSold = totalSoldCoin;
  }

  // Merge config display with real
  const totalSoldCoinDiv = totalSoldCoin > 0 ? totalSoldCoin : 1;
  if (new BigNumber(progressDisplay).gt(0)) { // progressDisplay > 0
    progress = new BigNumber(originTokenSold).div(totalSoldCoinDiv).multipliedBy(100).plus(progressDisplay).toFixed();
  } else {
    progress = new BigNumber(tokenSold).div(totalSoldCoinDiv).multipliedBy(100).toFixed();
  }

  if (new BigNumber(progress).lte(0)) {
    progress = '0';
  }
  if (new BigNumber(progress).gte(new BigNumber(99.9))) {
    progress = '100';
  }

  return {
    progress,
    tokenSold,
    totalSoldCoin,
  }
};

/**
 * Functions: Task Update Pool Status / Token Sold
 * Maintain Pool Status in Tasks:
 *    /app/Task/UpdateClaimablePoolInformationTask.js
 *    /app/Task/UpdatePoolInformationTask.js
 */
const getLastClaimConfig = (poolDetails) => {
  if (poolDetails.campaignClaimConfig && poolDetails.campaignClaimConfig.length > 0) {
    return poolDetails.campaignClaimConfig[poolDetails.campaignClaimConfig.length - 1];
  }
  return null;
};

const getLastClaimConfigTime = (poolDetails) => {
  const lastClaim = getLastClaimConfig(poolDetails);
  if (lastClaim) {
     // +1week
    return new BigNumber(lastClaim.start_time).plus(7 * 24 * 3600).toFixed();
  }
  return null;
};

const getLastActualFinishTime = (poolDetails) => {
  if (poolDetails.finish_time) {
     // +12h
    return new BigNumber(poolDetails.finish_time).plus(12 * 3600).toFixed();
  }
  return null;
};

const getFirstClaimConfig = (poolDetails) => {
  if (poolDetails && poolDetails.campaignClaimConfig && poolDetails.campaignClaimConfig.length > 0) {
    return poolDetails.campaignClaimConfig[0];
  }
  return null;
};

const getPoolStatusByPoolDetail = async (poolDetails, tokenSold) => {
  if (!poolDetails) {
    return {
      status: PoolStatus.TBA,
      tokenSold: tokenSold
    };
  }

  const firstClaimConfig = () => {
    return getFirstClaimConfig(poolDetails);
  };

  const startBuyTimeField = () => {
    return poolDetails.start_time;
  };
  const endBuyTimeField = () => {
    return poolDetails.finish_time;
  };
  const startJoinTimeField = () => {
    return poolDetails.start_join_pool_time;
  };
  const endJoinTimeField = () => {
    return poolDetails.end_join_pool_time;
  };
  const releaseTimeField = () => {
    let releaseTime = poolDetails && poolDetails.release_time;
    const firstClaim = firstClaimConfig();
    if (firstClaim) {
      releaseTime = firstClaim.start_time;
    }
    return releaseTime;
  };

  const startBuyTime = startBuyTimeField() ? new Date(Number(startBuyTimeField()) * 1000) : undefined;
  const endBuyTime = endBuyTimeField() ? new Date(Number(endBuyTimeField()) * 1000) : undefined;
  const startJoinTime = startJoinTimeField() ? new Date(Number(startJoinTimeField()) * 1000) : undefined;
  const endJoinTime = endJoinTimeField() ? new Date(Number(endJoinTimeField()) * 1000) : undefined;
  const releaseTime = releaseTimeField() ? new Date(Number(releaseTimeField()) * 1000) : undefined;

  let data = getProgressWithPools({
    ...poolDetails,
    tokenSold: tokenSold || poolDetails.tokenSold || poolDetails.token_sold || '0',
  });

  tokenSold = data.tokenSold
  const soldProgress = data.progress
  const today = new Date().getTime()

  if (!startJoinTime || !endJoinTime) {
    return {
      status: PoolStatus.TBA,
      tokenSold: tokenSold
    }
  }

  if (poolDetails.token_type === Const.TOKEN_TYPE.MYSTERY_BOX &&
    poolDetails.process && poolDetails.process === Const.PROCESS.ONLY_BUY &&
    startBuyTime && today >= startBuyTime.getTime() &&
    endBuyTime && today <= endBuyTime.getTime()) {
    return {
      status: PoolStatus.SWAP,
      tokenSold: tokenSold
    }
  }

  // Upcoming in case:
  // today < startJoin: wait for whitelist
  // today < endJoin: in whitelist phase
  // today < startBuy: wait for buying
  // buying time: TBA
  if (startJoinTime && today < startJoinTime.getTime()) {
    return {
      status: PoolStatus.UPCOMING,
      tokenSold: tokenSold
    }
  }

  if (endJoinTime && today < endJoinTime.getTime()) {
    return {
      status: PoolStatus.UPCOMING,
      tokenSold: tokenSold
    }
  }

  if (startBuyTime && today < startBuyTime.getTime()) {
    return {
      status: PoolStatus.UPCOMING,
      tokenSold: tokenSold
    }
  }

  if (!startBuyTime || !endBuyTime) {
    return {
      status: PoolStatus.UPCOMING,
      tokenSold: tokenSold
    }
  }

  // Close in case:
  // today > endBuyTime: wait to claim
  // today > releaseTime:
  // Full pool:
  if (endBuyTime && today > endBuyTime.getTime()) {
    return {
      status: PoolStatus.ENDED,
      tokenSold: tokenSold
    }
  }

  if (new BigNumber(soldProgress || 0).gte(new BigNumber(99.9))) {
    return {
      status: PoolStatus.CLOSED,
      tokenSold: tokenSold
    }
  }

  if (releaseTime && endBuyTime &&
    endBuyTime.getTime() < releaseTime.getTime() &&
    today > releaseTime.getTime()) {
    return {
      status: PoolStatus.ENDED,
      tokenSold: tokenSold
    }
  }

  return {
    status: PoolStatus.SWAP,
    tokenSold: tokenSold
  }
};

const getStakingProvider = async () => {
  return networkToWeb3[Const.NETWORK_AVAILABLE.BSC]
}

const getPathExportUsers = (fileName) => {
  return `download/export_users/${fileName}`
}

const getLegendData = () => {
  return LEGEND_DATA.filter(data => { return data.valid === true });
}

const getLegendIdByOwner = (wallet_address) => {
  if (!LEGEND_DATA || !wallet_address) {
    return
  }

  const data = LEGEND_DATA.filter(data => data.wallet_address.toLowerCase() === wallet_address.toLowerCase() && data.valid === true);
  if (!data || data.length < 1) {
    return
  }

  return data[0]
}

const checkIsInPreOrderTime = (poolDetails, currentUserTierLevel) => {
  if (!poolDetails) {
    return false;
  }
  if (currentUserTierLevel < poolDetails.pre_order_min_tier) {
    return false;
  }

  let startPreOrderTime = poolDetails.start_pre_order_time;
  let startBuyTime = poolDetails.start_time;
  if (!startPreOrderTime || !startBuyTime) {
    return false;
  }

  const now = moment().unix();
  if (startPreOrderTime < now && now < startBuyTime) {
    return true;
  }

  return false;
};

const getTokenURI = async ({ address, id, network = Const.NETWORK_AVAILABLE.BSC }) => {
  try {
    const contractToken = new networkToWeb3[network].eth.Contract(ERC721_ABI, address);
    return await contractToken.methods.tokenURI(id).call()
  }
  catch (e) {
    return ''
  }
}

module.exports = {
  randomString,
  doMask,
  maskEmail,
  maskWalletAddress,
  responseSuccess,
  responseNotFound,
  responseErrorInternal,
  responseBadRequest,
  checkSumAddress,
  isAddress,
  paginationArray,
  getERC721TokenContractInstance,
  getUserTierSmartWithCached,
  getUserTierSmart,
  getContractInstance,
  getStakingPoolInstance,
  getStakingPoolsDetail,
  getOfferCurrencyInfo,
  getTokenSoldSmartContract,
  getPoolStatusByPoolDetail,
  getProgressWithPools,
  checkPoolIsFinish,

  getLastClaimConfig,
  getLastClaimConfigTime,
  getLastActualFinishTime,
  getFirstClaimConfig,
  getTiers,
  getPathExportUsers,
  getStakingProvider,
  checkIsInPreOrderTime,

  getLegendData,
  getLegendIdByOwner,

  getMarketplaceInstance,
  getTokenURI,

  getCurrencyAddress,
};
