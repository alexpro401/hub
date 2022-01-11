'use strict'

const Redis = use('Redis');

/*
  Mysterious Box
 */
const getRedisKeyMysteriousBoxes = (filterParams) => {
  return `mysterious_boxes_${
      filterParams.limit
    }_${filterParams.page}_${
      filterParams.title
    }_${
      filterParams.campaign_status
    }_${
      filterParams.network_available
    }_${
      filterParams.symbol
    }_${
      filterParams.start_time
    }_${
      filterParams.finish_time
    }_${
      filterParams.registed_by
    }_${
      filterParams.is_display
    }`
};

const getRedisMysteriousBoxes = async () => {
  return await Redis.get(getRedisKeyMysteriousBoxes());
};

const setRedisMysteriousBoxes = async (filterParams, data) => {
  if (!data || data.length < 1) {
    return
  }

  await Redis.set(getRedisKeyMysteriousBoxes(filterParams), JSON.stringify(data));
};

const existRedisMysteriousBoxes = async (filterParams) => {
  return await Redis.exists(getRedisKeyMysteriousBoxes(filterParams));
};

const deleteRedisMysteriousBoxes = (filterParams) => {
  let redisKey = getRedisKeyMysteriousBoxes(filterParams);
  if (Redis.exists(redisKey)) {
    Redis.del(redisKey);
  }
};

const deleteAllRedisMysteriousBoxes = () => {
  Redis.keys('mysterious_boxes_*').then((keys) => {
    const pipeline = Redis.pipeline()
    keys.forEach((key) => {
      console.log('del', key)
      pipeline.del(key)
    })

    return pipeline.exec()
  })
}

module.exports = {
  // mysterious boxes
  getRedisMysteriousBoxes,
  setRedisMysteriousBoxes,
  existRedisMysteriousBoxes,
  deleteRedisMysteriousBoxes,
  deleteAllRedisMysteriousBoxes
};
