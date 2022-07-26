export enum TOKEN_TYPE {
    ERC721 = 'erc721',
    ERC20 = 'erc20',
    Box = 'box',
}

export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
export const RECAPTCHA_SITE_KEY_HUB = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY_HUB
export const PANCAKE_GAFI_SWAP_URL = process.env.NEXT_PUBLIC_PANCAKE_GAFI_SWAP_URL
export const KUCOIN_GAFI_SWAP_URL = process.env.NEXT_PUBLIC_KUCOIN_GAFI_SWAP_URL
export const GATE_GAFI_SWAP_URL = process.env.NEXT_PUBLIC_GATE_GAFI_SWAP_URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL + '/api/v1'
export const API_CMS_URL = process.env.NEXT_CMS_URL
export const GUILD_API_BASE_URL = process.env.NEXT_PUBLIC_GUILD_BASE_URL
export const GAME_HUB_START_TIME = process.env.NEXT_PUBLIC_GAME_HUB_START_TIME
export const GAME_HUB_GG_CALENDAR_EVENT = process.env.NEXT_PUBLIC_GAME_HUB_GG_CALENDAR_EVENT
export const INTERNAL_BASE_URL = process.env.NEXT_BASE_URL
export const NEXT_TRACKING_SERVICE_URL = process.env.NEXT_TRACKING_SERVICE_URL
export const CATVENTURE_GG_CALENDAR_EVENT = process.env.NEXT_PUBLIC_CATVENTURE_GG_CALENDAR_EVENT
export const CATVENTURE_API_BASE_URL = process.env.NEXT_CATVENTURE_BASE_URL

export const CLAIM_TYPE = {
  0: 'On GameFi.org',
  1: 'Airdrop',
  2: 'External Website',
  3: 'TBA'
}

export const CMC_ASSETS_DOMAIN = 's2.coinmarketcap.com'
export const CMC_ASSETS_DOMAIN_CHART = 's3.coinmarketcap.com'
export const defaultTitle = 'GameFi.org – A one-stop destination for web3 gaming'
export const defaultDescription = 'We aim to build digital communities and manage virtual economies for mainstream adoption.'
