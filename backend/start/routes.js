'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

const Const = use('App/Common/Const');

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')
Route.get('/', () => 'It\'s working')
Route.get('image/:fileName', 'FileController.getImage');

// /api/v1 --> user
// /api/v2 --> admin

// Webhook
Route.group(() => {
  // Route.post('ico-campaign', 'CampaignController.icoCampaignCreate')
  // Route.post('edit-campaign', 'CampaignController.icoCampaignEdit')
  // Route.post('campaign-status', 'CampaignController.CampaignEditStatus')
  // Route.post('campaign-changed', 'CampaignController.CampaignChanged')
  // Route.post('transaction', 'TransactionController.transactionCreate')
  // Route.post('transaction-refund', 'TransactionController.transactionRefund')
  // Route.post('affiliate-campaign', 'AffiliateCampaignController.affiliateCreate')
  // Route.post('token-claimed', 'TransactionController.tokenClaimed')
  //
  // Route.post('mantra-stake/index-stake-info', 'MantraStakeController.indexStakeInfo');
  // Route.post('reputation/index-stake-info', 'ReputationController.indexStakeInfo');
  Route.get('user/kyc', 'UserController.getKycStatusByErc20Address');
}).prefix('webhook').middleware('checkJwtWebhook');

// GameFI user new route
Route.post('block-pass', 'UserController.kycUpdateStatus').middleware('checkBlockPassSignature');

Route.group(() => {
  // home
  Route.get('home/performance', 'HomeController.getPerformance');
  Route.get('home/performances', 'HomeController.getPerformances');
  Route.post('home/subscribe', 'HomeController.subscribe');
  Route.post('vesting/gamefi', 'HomeController.createVestingOption').middleware(['checkSignature']);
  Route.post('vesting/gamefi/:address', 'HomeController.getVestingOption');
  Route.get('legend/:id', 'HomeController.getLegendImages');
  Route.get('tokenomics', 'HomeController.getTokenomics');
  Route.get('nft/metagod-ticket/:id', 'HomeController.getMetaGodTicketDetail');
  Route.get('nft/:nft/:id', 'HomeController.getNFTDetail');

  // Aggregator
  Route.get('aggregator', 'AggregatorController.getAggregator');
  Route.get('aggregator/get-like', 'AggregatorController.getLikeById');
  Route.get('aggregator/liked/:address', 'AggregatorController.getLikeByAddress');
  Route.get('aggregator/slug/:slug', 'AggregatorController.findAggregatorBySlug');
  Route.post('aggregator/like/:id', 'AggregatorController.setFavourite');
  Route.get('aggregator/:id', 'AggregatorController.findAggregator');
  Route.get('project-info/:id', 'AggregatorController.findProject');
  Route.get('tokenomics/:id', 'AggregatorController.findTokenomic');

  // pool
  Route.get('pool/:campaignId', 'PoolController.getPoolPublic');
  Route.get('pool/owner/:address', 'MarketplaceController.getMyNFTByAddress');
  Route.get('pool/:campaignId/total-participants', 'WhiteListSubmissionController.getTotalWhitelistSubmissions')

  Route.get('pool/:campaignId/top-bid', 'PoolController.getTopBid');
  Route.get('pool/:campaignId/tiers', 'TierController.getTiers');
  Route.get('pool/:campaignId/winners', 'WinnerListUserController.getWinnerAndReserveList');
  Route.get('pool/:campaignId/user/:walletAddress/current-tier', 'UserController.getCurrentTier');
  Route.get('pool/:campaignId/check-exist-winner', 'WinnerListUserController.checkExistWinner').validator('CheckUserWinnerExist');
  Route.get('pool/:campaignId/check-picked-winner', 'WinnerListUserController.checkPickedWinner');
  Route.get('pool/:campaignId/claim-configs', 'ClaimConfigController.getListClaimConfig');
  Route.get('pool/:campaignId/user/:walletAddress/claimable-amount', 'ClaimConfigController.getClaimableAmount');
  Route.get('pool/:campaignId/nft-order', 'NFTOrderController.getOrder');
  Route.post('pool/:campaignId/nft-order', 'NFTOrderController.order').middleware(['checkSignature']);
  Route.post('pool/:campaignId/whitelist-apply-box', 'WhiteListSubmissionController.applyWhitelistSubmissionBox');

  // pools
  Route.get('pools', 'PoolController.getPoolList');
  Route.get('pools/token-type', 'PoolController.getPoolByTokenType');
  Route.get('pools/top-pools', 'PoolController.getTopPools');
  Route.get('pools/user/:walletAddress/joined-pools', 'PoolController.getJoinedPools');
  Route.get('pools/v2/upcoming-pools', 'PoolController.getUpcomingPools');
  Route.get('pools/v2/featured-pools', 'PoolController.getFeaturedPools');

  Route.get('pools/active-pools', 'PoolController.getActivePoolsV3');
  Route.get('pools/next-to-launch-pools', 'PoolController.getNextToLaunchPoolsV3');
  Route.get('pools/upcoming-pools', 'PoolController.getUpcomingPoolsV3');
  Route.get('pools/current-pools', 'PoolController.getCurrentPoolsV3');
  Route.get('pools/latest-pools', 'PoolController.getLatestPools');
  Route.get('pools/complete-sale-pools', 'PoolController.getCompleteSalePoolsV3');
  Route.get('pools/mysterious-box', 'PoolController.getMysteriousBoxPoolsV3');
  Route.get('pools/total-completed-pools', 'PoolController.countTotalCompleteSalePoolsV3');
  Route.get('pools/count-pools', 'PoolController.getCountPools');

  // user
  Route.get('user/profile', 'UserController.profile').middleware(['maskInfoNonAuthorized']);
  Route.get('user/tier-info', 'UserController.tierInfo').middleware(['maskEmailAndWallet']);
  Route.post('user/deposit', 'CampaignController.deposit').middleware(['checkSignature']);
  Route.post('user/deposit-box', 'CampaignController.depositBox').middleware(['checkSignature']);
  Route.post('user/auction-box', 'CampaignController.auctionBox').middleware(['checkSignature']);
  Route.post('user/claim', 'CampaignController.claim').middleware(['checkSignature']);
  Route.post('user/refund', 'CampaignController.refundIDOToken').middleware(['checkSignature']);
  Route.post('user/claim-refund', 'CampaignController.claimRefundIDOToken').middleware(['checkSignature']);

  Route.put('user/update-profile', 'UserController.updateProfile').middleware(['checkSignature']);

  Route.get('user/check-wallet-address', 'UserAuthController.checkWalletAddress');
  Route.post('user/check-active', 'UserController.checkUserActive');
  Route.post('user/join-campaign', 'CampaignController.joinCampaign').middleware(['checkSignature']);
  // Route.get('user/whitelist-search/:campaignId', 'WhiteListUserController.search');
  Route.get('user/whitelist-apply/previous', 'WhiteListSubmissionController.getPreviousWhitelistSubmissionV2');
  Route.get('user/whitelist-apply/:campaignId', 'WhiteListSubmissionController.getWhitelistSubmission');
  Route.post('user/whitelist-apply/:campaignId', 'WhiteListSubmissionController.addWhitelistSubmission');
  Route.get('user/winner-list/:campaignId', 'WinnerListUserController.getWinnerListPublic').middleware(['maskEmailAndWallet']);
  Route.get('user/winner-search/:campaignId', 'WinnerListUserController.search').middleware(['maskEmailAndWallet']);
  Route.get('user/counting/:campaignId', 'CampaignController.countingJoinedCampaign');
  Route.get('user/check-join-campaign/:campaignId', 'CampaignController.checkJoinedCampaign');
  Route.post('user/apply-join-campaign/:campaignId', 'WhiteListSubmissionController.applyAndJoinCampaign').middleware(['checkSignature']);

  // reputation
  // Route.get('reputation/points/:walletAddress', 'ReputationController.getReputationPoint');
  // Route.get('reputation/histories/:walletAddress', 'ReputationController.getReputationHistory');

  // Staking pool
  Route.get('staking-pool', 'StakingPoolController.getPublicPoolList');
  Route.get('staking-pool/top-staked', 'StakingPoolController.getTopUserStaked');
  Route.get('staking-pool/legend-snapshots', 'StakingPoolController.getLegendSnapshots');
  Route.get('staking-pool/legend-current', 'StakingPoolController.getLegendCurrentStaked');

  // Tiers
  Route.get('get-tiers', 'TierSettingController.getTiersSetting');

  // Marketplace
  Route.get('marketplace/first-edition-collections', 'MarketplaceController.getFirstEditionCollections');
  Route.get('marketplace/top-collections', 'MarketplaceController.getTopCollections');
  Route.get('marketplace/collections', 'MarketplaceController.getCollections');
  Route.get('marketplace/hot-offers', 'MarketplaceController.getHotOffers');
  Route.get('marketplace/discover', 'MarketplaceController.discover');
  Route.get('marketplace/activities', 'MarketplaceController.getActivities');
  Route.get('marketplace/collections/support', 'MarketplaceController.getSupportCollections');

  Route.get('marketplace/collection/:address', 'MarketplaceController.getCollection');
  Route.get('marketplace/collection/:address/items', 'MarketplaceController.getCollectionItems');
  Route.get('marketplace/collection/:address/activities', 'MarketplaceController.getCollectionActivities');
  Route.post('marketplace/collection/:address/:id', 'MarketplaceController.getNFTInfo');
  Route.get('marketplace/offers/:address/:id', 'MarketplaceController.getOffersOfNFT');
  Route.get('marketplace/offers/:address', 'MarketplaceController.getMyOffers');
  Route.get('marketplace/listings/:address', 'MarketplaceController.getMyListings');
  Route.get('marketplace/owner/:slug', 'MarketplaceController.getMyNFT');

  Route.get('/boxes:id([0-9]+)', 'HomeController.getNFTBox');
  Route.get('/boxes/:id([0-9]+)', 'HomeController.getNFTBox');
}).prefix('api/v1');

// GameFI admin new route
Route.group(() => {
  Route.post('upload-avatar', 'FileController.uploadAvatar');

  // KYC
  Route.put('active-kyc', 'UserController.activeKyc');

  // Pool
  Route.post('pool/create', 'PoolController.createPool');
  Route.post('pool/:campaignId/update', 'PoolController.updatePool');
  Route.get('pool/:campaignId', 'PoolController.getPoolAdmin');
  Route.post('pool/:campaignId/deploy-success', 'PoolController.updateDeploySuccess');
  Route.post('pool/:campaignId/change-display', 'PoolController.changeDisplay');
  Route.post('pool/:campaignId/change-public-winner-status', 'PoolController.changePublicWinnerStatus');
  Route.post('pool/:campaignId/upload-winners', 'PoolController.uploadWinners');

  // Participants
  Route.get('pool/:campaignId/participants', 'WhiteListUserController.getParticipants');
  Route.put('pool/:campaignId/whitelist-submission/:walletAddress', 'WhiteListSubmissionController.updateWhitelistSubmission');
  Route.delete('pool/:campaignId/participants/:walletAddress/delete', 'WhiteListUserController.deleteWhiteList');
  Route.post('pool/winner-random/:campaignId/:number', 'WhiteListUserController.getRandomWinners');
  Route.post('pool/:campaignId/whitelist-submission/batch/verify', 'WhiteListSubmissionController.verifyBatchWhitelistSubmission');
  Route.post('pool/:campaignId/whitelist-submission/batch/approve-all', 'WhiteListSubmissionController.approveAllWhitelistSubmission');
  Route.post('pool/:campaignId/whitelist-submission/batch/approve', 'WhiteListSubmissionController.approveBatchWhitelistSubmission');
  Route.post('pool/:campaignId/whitelist-submission/:walletAddress/verify', 'WhiteListSubmissionController.verifyWhitelistSubmission');

  // Winners
  Route.get('pool/:campaignId/winners', 'WinnerListUserController.getWinnerListAdmin');
  Route.delete('pool/:campaignId/winners/:walletAddress/delete', 'WinnerListUserController.deleteWinner');
  Route.post('pool/:campaignId/winners/add-to-winner', 'WinnerListUserController.addParticipantsToWinner');

  // Reserve
  Route.get('pool/:campaignId/reserves', 'ReservedListController.getReservedList');
  Route.post('pool/:campaignId/reserves/add', 'ReservedListController.addReserveUser');
  Route.delete('pool/:campaignId/reserves/:walletAddress/delete', 'ReservedListController.deleteReserve');
  Route.post('pool/reserves/update-setting', 'ReservedListController.updateReserveSetting');
  Route.get('pool/reserves/setting', 'ReservedListController.reserveSetting');

  Route.get('profile', 'AdminController.profile').middleware(['auth:admin', 'checkRole']);
  // Route.post('change-password', 'AdminController.changePassword').middleware(['checkSignature', 'auth:admin', 'checkRole']);
  Route.post('update-profile', 'AdminController.updateProfile').middleware(['auth:admin', 'checkRole']).validator('UpdateProfile');
  // Route.post('transaction-create', 'TransactionController.transactionAdd').middleware(['auth:admin']);

  Route.get('users', 'UserController.userList').middleware(['auth:admin']);
  Route.post('users/export-user-list', 'UserController.exportUsers').middleware(['auth:admin']);
  Route.post('users/export-whitelist', 'UserController.exportSnapshotWhitelist').middleware(['auth:admin']);
  Route.post('users/download/:id', 'UserController.downloadUsers').middleware(['auth:admin']);
  Route.get('users/export-files', 'UserController.getExportFiles').middleware(['auth:admin']);

  Route.get('admins', 'AdminController.adminList').middleware(['auth:admin']);
  Route.get('admins/:id', 'AdminController.adminDetail').middleware(['auth:admin']);
  Route.post('admins', 'AdminController.create').middleware(['auth:admin']);
  Route.put('admins/:id', 'AdminController.update').middleware(['auth:admin']);


  Route.get('kyc-users', 'UserController.kycUserList').middleware(['auth:admin']);
  Route.get('kyc-users/:id', 'UserController.kycUserDetail').middleware(['auth:admin']);
  Route.post('kyc-users', 'UserController.kycUserCreate').middleware(['auth:admin']);
  Route.put('kyc-users/:id', 'UserController.kycUserUpdate').middleware(['auth:admin']);
  Route.put('kyc-users/:id/change-kyc', 'UserController.kycUserChangeIsKyc').middleware(['auth:admin']);

  Route.post('deposit-admin', 'CampaignController.depositAdmin').middleware(['auth:admin']);

  // whitelist
  Route.get('/whitelist', 'CaptchaWhitelistController.get')
  Route.post('/whitelist', 'CaptchaWhitelistController.set')
  Route.delete('/whitelist', 'CaptchaWhitelistController.remove')

  // Staking pool
  Route.post('staking-pool/create', 'StakingPoolController.createPool');
  Route.post('staking-pool/:stakingPoolId/update', 'StakingPoolController.updatePool');
  Route.get('staking-pool', 'StakingPoolController.getPoolList');
  Route.get('staking-pool/:stakingPoolId', 'StakingPoolController.getPool');
  Route.post('staking-pool/:stakingPoolId/change-display', 'StakingPoolController.changeDisplay');

  // Aggregator
  Route.post('aggregator/create', 'AggregatorController.aggregatorCreate');
  Route.post('aggregator/set-show/:id', 'AggregatorController.setShowStatus');
  Route.post('aggregator/tokenomic/:id', 'AggregatorController.tokenomicsInsert');
  Route.post('aggregator/project/:id', 'AggregatorController.projectInsert');
  Route.post('aggregator/tokenomic/update/:id', 'AggregatorController.tokenomicsUpdate');
  Route.post('aggregator/project/update/:id', 'AggregatorController.projectUpdate');
  Route.post('aggregator/:id', 'AggregatorController.aggregatorUpdate');
  Route.get('aggregator', 'AggregatorController.getAggregatorAdmin');
  Route.get('aggregator/:id', 'AggregatorController.findAggregator');
  Route.get('project-info/:id', 'AggregatorController.findProject');
  Route.get('tokenomics/:id', 'AggregatorController.findTokenomic');
  Route.delete('aggregator/:id', 'AggregatorController.removeGame');

  // Marketplace Collections
  Route.post('collections/create', 'MarketplaceController.collectionCreate');
  Route.post('collections/:id', 'MarketplaceController.collectionUpdate');
  Route.get('collections', 'MarketplaceController.getCollectionsAdmin');
  Route.get('collections/:id', 'MarketplaceController.findCollection');
  Route.post('collections/change-display/:id', 'MarketplaceController.changeDisplay');
  Route.delete('collections/:id', 'MarketplaceController.removeCollection');
}).prefix('api/v2/admin').middleware(['auth:admin', 'checkAdminJwtSecret']);

Route.group(() => {
  Route.post('/login', 'AuthAdminController.login').validator('Login').middleware('checkSignature');
  // Route.post('/register', 'AuthAdminController.adminRegister').validator('Register').middleware('checkSignature');
  // Route.get('confirm-email/:token', 'AdminController.confirmEmail'); // Confirm email when register
  // Route.post('forgot-password', 'AdminController.forgotPassword').validator('ForgotPassword').middleware('checkSignature');
  Route.get('check-wallet-address', 'AuthAdminController.checkWalletAddress');
  Route.post('check-wallet-address', 'AuthAdminController.checkWalletAddress');
  Route.get('check-token/:token', 'AdminController.checkToken');
  // Route.post('reset-password/:token', 'AdminController.resetPassword').validator('ResetPassword').middleware('checkSignature');

}).prefix('api/v2/admin').middleware(['typeAdmin', 'checkPrefix', 'formatEmailAndWallet']);

Route.group(() => {
  Route.get('pool/:campaignId/tiers', 'TierController.getTiers');

  Route.get('contract/campaign-factories', 'ContractController.campaignFactories')
  Route.get('contract/campaigns', 'ContractController.campaigns')
  // Route.post('campaign-create', 'CampaignController.campaignCreate')
  Route.get('campaigns', 'CampaignController.campaignList')
  Route.get('campaign-new', 'CampaignController.campaignNew')
  Route.get('campaigns/:campaign', 'CampaignController.campaignShow')
  Route.get('campaign-delete/:walletAddress/:campaign', 'CampaignController.campaignDelete')
  Route.get('transactions', 'TransactionController.transactionList')

  Route.post('asset-tokens', 'AssetTokenController.create')
  Route.get('asset-tokens/:contract', 'AssetTokenController.list')
  Route.delete('asset-tokens/delete/:id', 'AssetTokenController.remove')
  Route.get('affiliate-campaign/:token', 'AffiliateCampaignController.affiliateList')

  // Route.get('my-campaign', 'CampaignController.myCampaign')
  // Route.get('my-campaign/:status', 'CampaignController.myCampaign').middleware('checkStatus');
}).prefix('/api/v2').middleware(['auth:admin', 'checkAdminJwtSecret']);

Route.post(':type/check-max-usd', 'UserBuyCampaignController.checkBuy').middleware(['checkPrefix', 'auth', 'checkJwtSecret']);
