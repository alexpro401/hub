'use strict'

const kue = use('Kue');
const Const = use('App/Common/Const');
const UserBalanceSnapshotModel = use('App/Models/UserBalanceSnapshot');
const CampaignModel = use('App/Models/Campaign');
const WinnerListUserModel = use('App/Models/WinnerListUser');
const WhitelistService = use('App/Services/WhitelistUserService');
const UserBalanceSnapshotService = use('App/Services/UserBalanceSnapshotService');
const HelperUtils = use('App/Common/HelperUtils');
const GameFIUtils = use('App/Common/GameFIUtils');

const priority = 'critical'; // Priority of job, can be low, normal, medium, high or critical
const attempts = 5; // Number of times to attempt job if it fails
const remove = true; // Should jobs be automatically removed on completion
const jobFn = job => { // Function to be run on the job before it is saved
  job.backoff()
};

class PickWinnerWithGameFIToken {
  // If this getter isn't provided, it will default to 1.
  // Increase this number to increase processing concurrency.
  static get concurrency() {
    return 5
  }

  // This is required. This is a unique key used to identify this job.
  static get key() {
    return Const.JOB_KEY.PICKUP_RANDOM_WINNER;
  }

  static async getGameFIAddress() {
    if (await RedisUtils.checkExistRedisPoolDetail(0)) {
      const cachedPoolDetail = await RedisUtils.getRedisPoolDetail(0)
      const poolDetail = JSON.parse(cachedPoolDetail)
      return poolDetail.token
    }

    let pool = await GameFIUtils.getGameFIPool(CampaignModel)
    if (!pool) {
      return null;
    }

    return pool.token
  }

  static async fetchTicketBalance(tokenAddress, userAddress) {
    try {
      const token = await HelperUtils.getERC721TokenContractInstance(tokenAddress)
      const ticket = await token.methods.balanceOf.call(userAddress)

      return {
        winnerTicket: ticket,
        isError: false,
      }
    }
    catch (e) {
      console.log('Pick winner with user ', userAddress, ' error ', e)
      return {
        winnerTicket: 0,
        isError: true,
      }
    }
  }

  // This is where the work is done.
  static async handle(data) {
    console.log('PickWinnerWithGameFIToken-job started', data);
    try {
      // get GameFI NFT Ticket address
      const tokenAddress = PickWinnerWithGameFIToken.getGameFIAddress()
      if (!tokenAddress) {
        console.log('GameFI Ticket not found')
        return
      }
      // do snapshot balance
      await PickWinnerWithGameFIToken.doSnapshotBalance(data, tokenAddress);
      // pickup random winner after snapshot all whitelist user balance
      await PickWinnerWithGameFIToken.doPickupRandomWinner(data);
    } catch (e) {
      console.log('Pickup winner has error', e);
      throw e;
    }
  }

  static async doSnapshotBalance(data, tokenAddress) {
    // delete all old snapshot
    const campaignUpdated = await CampaignModel.query().where('id', data.campaign_id).first();
    await campaignUpdated.userBalanceSnapshots().delete();

    // get list whitelist to snapshot balance
    let i = 1;
    let whitelist;
    let isLoopContinue = false;
    do {
      // loop each 10 records to process
      const filterParams = {
        campaign_id: data.campaign_id,
        whitelist_completed: true,
        page: i,
        pageSize: 10
      }

      const whitelistService = new WhitelistService();
      whitelist = await whitelistService.findWhitelistUser(filterParams);

      // loop to get balance of each user on white list
      const whitelistObj = whitelist.toJSON();
      if (whitelistObj.total > 10 * i) {
        isLoopContinue = true;
      } else {
        isLoopContinue = false;
      }
      let userSnapshots = [];
      for (let i = 0; i < whitelistObj.data.length; i++) {
        // get user PKF balance and tier from SC
        const wallet = whitelistObj.data[i].wallet_address;
        const {winnerTicket, isError} = PickWinnerWithGameFIToken.fetchTicketBalance(tokenAddress, wallet)
        let lotteryTicket = 1
        if (!isError) {
          lotteryTicket = winnerTicket
        }

        let userSnapShot = new UserBalanceSnapshotModel();
        userSnapShot.fill({
          campaign_id: data.campaign_id,
          wallet_address: wallet,
          level: 0,
          winner_ticket: winnerTicket,
          lottery_ticket: lotteryTicket,
          pkf_balance: 0,
          pkf_balance_with_weight_rate: 0,
        });
        userSnapshots.push(userSnapShot);
      }
      // save to user_balance_snapshot
      await campaignUpdated.userBalanceSnapshots().saveMany(userSnapshots);
      // increment page
      i++;
    } while (isLoopContinue)
  }

  static async doPickupRandomWinner(data) {
    // delete old winner
    const campaignUpdated = await CampaignModel.query().where('id', data.campaign_id).first();
    await campaignUpdated.winners().delete();
    const userSnapshotService = new UserBalanceSnapshotService();

    let userSnapshots = await userSnapshotService.getAllSnapshotByFiltersWithUser({campaign_id: data.campaign_id});
    userSnapshots = JSON.parse(JSON.stringify(userSnapshots));

    const winners = userSnapshots.filter(u => u.winner_ticket > 0).map(u => {
      const winnerModel = new WinnerListUserModel();
      winnerModel.fill({
        email: u.email,
        wallet_address: u.wallet_address,
        campaign_id: data.campaign_id,
        level: 0,
        lottery_ticket: u.winner_ticket,
      });
      return winnerModel;
    })

    await campaignUpdated.winners().saveMany(winners);
  }

  // Dispatch
  static doDispatch(data) {
    console.log('Dispatch pickup winner with data: ', data);
    kue.dispatch(this.key, data, { priority, attempts, remove, jobFn });
  }
}

module.exports = PickWinnerWithGameFIToken

