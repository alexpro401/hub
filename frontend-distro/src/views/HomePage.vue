<template>
  <div class="home-wrapper flex flex-col justify-center items-center pb-5">
    <!-- connect wallet -->
    <wallet-connector :show="state.showConnectWallet" @close="state.showConnectWallet = false"/>
    <!-- confirm option 1 -->
    <modal :show="state.showConfirmOption1" @close="state.showConfirmOption1 = false">
      <template #header>
        <div>Confirm vesting option</div>
      </template>
      <template #body>
        <div>
          You are choosing <span class="font-medium text-gamefiGreen-400">Option 1</span>
          <ul class="list-disc mx-4 mt-2">
            <li><div class="text-white font-light">December 10, 2021: Claim 25%</div></li>
            <li><div class="text-white mt-1 font-light">The remaining 50% will claim block-by-block in 6 months starting on December 10, 2021</div></li>
          </ul>
          <hr class="mt-5 border-gray-600">
          <label class="inline-flex items-center">
            <div class="form-control">
              <label class="cursor-pointer flex align-middle items-center select-none mt-3 text-gray-400 text-sm">
                <div><input v-model="state.agree1" type="checkbox" class="cursor-pointer mr-2 mt-1 bg-gray-400 shadow-none"></div>
                <div>I have read and agree to this option</div>
              </label>
            </div>
          </label>
        </div>
      </template>
      <template #footer>
        <div class="grid lg:grid-cols-2 gap-4">
          <button @click.prevent="state.showConfirmOption1 = false" class="px-2 py-1 lg:px-4 lg:py-2 bg-gray-600 text-white font-medium rounded-sm hover:opacity-90">
            Cancel
          </button>
          <button
            :disabled="!state.agree1"
            class="px-2 py-1 lg:px-4 lg:py-2 bg-gamefiGreen-400 text-black font-medium rounded-sm hover:opacity-90"
            :class="{'bg-gray-600 cursor-not-allowed text-white hover:opacity-100': !state.agree1}"
            @click.prevent="confirmOption(1)"
          >
            Confirm
          </button>
        </div>
      </template>
    </modal>
    <!-- confirm option 2 -->
    <modal
      :show="state.showConfirmOption2"
      @close="() => {
        state.showConfirmOption2 = false
        state.reconfirm = false
      }"
    >
      <template #header>
        <div>Confirm vesting option</div>
      </template>
      <template v-if="!state.reconfirm" #body>
        <div>
          You are choosing <span class="font-medium text-gamefiGreen-400">Option 2</span>
          <ul class="list-disc mx-4 mt-2">
            <li><div class="text-white font-light">December 10, 2021: Claim 25%</div></li>
            <li><div class="text-white mt-1 font-light">After that, get 25% Airdrop within 3 days and the remaining 25% will be burned</div></li>
          </ul>
          <hr class="mt-5 border-gray-600">
          <label class="inline-flex items-center">
            <div class="form-control">
              <label class="cursor-pointer flex align-middle items-center select-none mt-3 text-gray-400 text-sm">
                <div><input v-model="state.agree2" type="checkbox" class="cursor-pointer mr-2 mt-1 bg-gray-400 shadow-none"></div>
                <div>I have read and agree to this option</div>
              </label>
            </div>
          </label>
        </div>
      </template>
      <template v-else #body>
        <div>
          You are choosing <span class="font-medium text-gamefiGreen-400">Option 2</span>
          <ul class="list-disc mx-4 mt-2">
            <li><div class="text-white font-light">December 10, 2021: Claim 25%</div></li>
            <li><div class="text-white mt-1 font-light">After that, get 25% Airdrop within 3 days and <span class="text-gamefiGreen-400 font-bold">the remaining 25% will be burned</span></div></li>
          </ul>
          <hr class="mt-5 border-gray-600">
          <div class="mt-5">Are you sure with your choice?</div>
        </div>
      </template>
      <template #footer>
        <div class="grid lg:grid-cols-2 gap-4">
          <button
            class="px-2 py-1 lg:px-4 lg:py-2 bg-gray-600 text-white font-medium rounded-sm hover:opacity-90"
            @click.prevent="() => {
              state.showConfirmOption2 = false
              state.reconfirm = false
            }"
          >
            {{!state.reconfirm ? 'Cancel' : `No, I'm not`}}
          </button>
          <button
            :disabled="!state.reconfirm && !state.agree2"
            class="px-2 py-1 lg:px-4 lg:py-2 bg-gamefiGreen-400 text-black font-medium rounded-sm hover:opacity-90"
            :class="{'bg-gray-600 cursor-not-allowed text-white hover:opacity-100': !state.agree2}"
            @click.prevent="confirmOption(2)"
          >
            {{!state.reconfirm ? 'Confirm' : `Yes, I'm sure`}}
          </button>
        </div>
      </template>
    </modal>
    <!-- countdown -->
    <div class="container text-center uppercase flex justify-center align-middle items-center text-sm">
      Registration ends in
      <img
        class="ml-2"
        src="@/assets/images/icons/dot.svg"
      >
    </div>
    <countdown :deadline="new Date(END_DATE)" @timeout="timeout" />
    <div class="main-content">
      <gamefi-box>
        <template #body>
          <div class="text-2xl font-medium">
            Changing the vesting schedule of $GAFI Public Sale
          </div>
          <div class="mt-5 font-medium">
            Step 1: Select launchpad
          </div>
          <div class="text-sm mt-3">
            <ul class="list-disc mx-4 space-y-2">
              <li><div class="text-white">Select <span class="text-gamefiGreen-400">all the launchpads</span> that you will claim $GAFI.</div></li>
              <li><div class="text-white">Your wallet address on these launchpads must be the same.</div></li>
            </ul>
          </div>
          <div class="mt-4">
            <div class="flex items-center align-middle">
              <div class="mr-3">
                <button
                  class="cursor-pointer h-10 bg-gray-900 rounded overflow-hidden flex flex-col items-center align-middle justify-center select-none"
                  :class="{
                    'border border-gamefiGreen-400': isActivePool('GameFi'),
                    'border border-gray-700': !isActivePool('GameFi'),
                    'border cursor-not-allowed': selectedInfo || state.isTimeout,
                    'opacity-50 border-transparent': (state.isTimeout && !selectedInfo) || (selectedInfo && !isActivePool('GameFi'))
                  }"
                  @click.prevent="selectPool('GameFi')"
                >
                  <img class="h-full" src="@/assets/images/gamefi.png">
                </button>
              </div>
              <div class="mr-3">
                <button
                  class="cursor-pointer h-10 bg-gray-900 rounded overflow-hidden flex flex-col items-center align-middle justify-center select-none"
                  :class="{
                    'border border-gamefiGreen-400': isActivePool('RedKite'),
                    'border border-gray-700': !isActivePool('RedKite'),
                    'border cursor-not-allowed': state.isTimeout || selectedInfo,
                    'opacity-50 border-transparent': (state.isTimeout && !selectedInfo) || (selectedInfo && !isActivePool('RedKite'))
                  }"
                  @click.prevent="selectPool('RedKite')"
                >
                  <img class="h-full" src="@/assets/images/RedKite.png">
                </button>
              </div>
              <div class="mr-3">
                <button
                  class="cursor-pointer h-10 bg-gray-900 rounded overflow-hidden flex flex-col items-center align-middle justify-center select-none"
                  :class="{
                    'border border-gamefiGreen-400': isActivePool('DAO'),
                    'border border-gray-700': !isActivePool('DAO'),
                    'border cursor-not-allowed': state.isTimeout || selectedInfo,
                    'opacity-50 border-transparent': (state.isTimeout && !selectedInfo) || (selectedInfo && !isActivePool('DAO'))
                  }"
                  @click.prevent="selectPool('DAO')"
                >
                  <img class="h-full" src="@/assets/images/DAO.png">
                </button>
              </div>
            </div>
          </div>
          <hr class="mt-5 border-gray-600">
          <div class="mt-5 font-medium">
            Step 2: Connect wallet
          </div>
          <div class="text-sm mt-2">
            <ul class="list-disc mx-4 space-y-2">
              <li><div class="text-white">Connect the wallet that you will use on selected launchpads.</div></li>
              <li><div class="text-white">If you use different wallets on different launchpads, disconnect the current wallet, then repeat from Step 1.</div></li>
            </ul>
          </div>
          <button
            v-if="!wallet"
            class="mt-5 px-2 py-1 lg:px-4 lg:py-2 text-sm font-medium rounded-sm bg-gamefiGreen-400 text-black hover:opacity-90"
            @click.prevent="state.showConnectWallet = true">
            Connect Wallet
          </button>
          <div v-else class="flex w-full flex-col lg:flex-row align-middle items-center text-2xs lg:text-sm mt-5">
            <div class="text-2xs lg:text-sm px-2 py-1 lg:px-4 lg:py-2 bg-gray-900 rounded-sm flex align-middle items-center">
              <img src="@/assets/images/icons/bsc.svg" class="mr-1 lg:mr-2 w-4 h-4 lg:w-6 lg:h-6">
              {{ wallet }}
            </div>
            <button class="text-sm font-medium text-gamefiGreen-400 lg:ml-2" @click.prevent="logout">Disconnect</button>
          </div>
          <hr class="mt-5 border-gray-600">
          <div class="mt-5 font-medium">
            Step 3: Choose a new vesting schedule
          </div>
          <div class="text-sm mt-2">
            <ul class="list-disc mx-4 space-y-2">
              <li><div class="text-white">Please read carefully the information about the two new vesting options  and choose one of them. You will not be able to change the selected option after signing confirmation.</div></li>
              <li><div class="text-white">After the registration period expires, if you do not choose any options, we will default to change your vesting schedule according to <span class="text-gamefiGreen-400 font-bold">Option 1</span>.</div></li>
            </ul>
          </div>
          <!-- <div v-if="!selectedInfo" class="font-medium mt-5">Select Option</div> -->
          <div v-if="state.activeOption" class="font-medium mt-5">Your chosen vesting option: <span class="uppercase text-gamefiGreen-400">option {{state.activeOption}}</span></div>
          <div class="grid lg:grid-cols-2 mt-4 gap-4">
            <!-- option 1 -->
            <box-option :class="{'opacity-50': (selectedInfo || state.isTimeout) && state.activeOption !== 1}" :active="state.activeOption === 1">
              <template #header>
                <div>New vesting schedule</div>
                <div class="text-gamefiGreen-400 font-bold text-xl">
                  Option 1
                </div>
              </template>
              <template #body>
                <div class="text-sm font-light text-gray-300 flex flex-col justify-between h-40" :class="{'h-56': !selectedInfo && !state.isTimeout}">
                  <div>
                    <div class="Text-white mb-4 font-medium">At TGE (September 10, 2021) users were able to claim 25%. The remaining 75% will be distributed according to the new vesting schedule as below:</div>
                    <div class="inline-flex">
                      <img
                        class="w-2 h-2 lg:w-4 lg:h-4"
                        src="@/assets/images/icons/tick.svg"
                      >
                      <div class="ml-2">
                        December 10, 2021: Claim 25%
                      </div>
                    </div>
                    <div class="inline-flex mt-2">
                      <img
                        class="w-2 h-2 lg:w-4 lg:h-4"
                        src="@/assets/images/icons/tick.svg"
                      >
                      <div class="ml-2">
                        The remaining 50% will claim block-by-block in 6 months starting on December 10, 2021
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center justify-center w-full">
                    <button
                      v-if="!selectedInfo && !state.isTimeout"
                      class="px-2 py-1 lg:px-4 lg:py-2 w-full font-medium rounded-sm hover:opacity-90"
                      :class="{
                        'bg-gray-500 text-white cursor-not-allowed hover:opacity-100': selectedInfo,
                        'bg-gamefiGreen-400 text-black': !selectedInfo
                      }"
                      :disabled="selectedInfo"
                      @click.prevent="toggleOptionModal(1)"
                    >
                      {{ walletShort ? 'I choose Option 1' : 'Connect Wallet' }}
                    </button>
                  </div>
                </div>
              </template>
            </box-option>
            <!-- option 2 -->
            <box-option :class="{'opacity-50': (selectedInfo || state.isTimeout) && state.activeOption !== 2}" :active="state.activeOption === 2">
              <template #header>
                <div>New vesting schedule</div>
                <div class="text-gamefiGreen-400 font-bold text-xl">
                  Option 2
                </div>
              </template>
              <template #body>
                <div class="text-sm text-gray-300 font-light flex flex-col justify-between h-40" :class="{'h-56': !selectedInfo && !state.isTimeout}">
                  <div>
                    <div class="Text-white mb-4 font-medium">At TGE (September 10, 2021) users were able to claim 25%. The remaining 75% will be distributed according to the new vesting schedule as below:</div>
                    <div class="inline-flex">
                      <img
                        class="w-2 h-2 lg:w-4 lg:h-4"
                        src="@/assets/images/icons/tick.svg"
                      >
                      <div class="ml-2">
                        December 10, 2021: Claim 25%
                      </div>
                    </div>
                    <div class="inline-flex mt-2">
                      <img
                        class="w-2 h-2 lg:w-4 lg:h-4"
                        src="@/assets/images/icons/tick.svg"
                      >
                      <div class="ml-2">
                        After that, get 25% Airdrop within 3 days and the remaining 25% will be burned
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center justify-center w-full">
                    <button
                      v-if="!selectedInfo && !state.isTimeout"
                      class="px-2 py-1 lg:px-4 lg:py-2 w-full font-medium rounded-sm hover:opacity-90"
                      :class="{
                        'bg-gray-500 text-white cursor-not-allowed hover:opacity-100': selectedInfo,
                        'bg-gamefiGreen-400 text-black': !selectedInfo
                      }"
                      :disabled="selectedInfo"
                      @click.prevent="toggleOptionModal(2)">
                      {{ walletShort ? 'I choose Option 2' : 'Connect Wallet' }}
                    </button>
                  </div>
                </div>
              </template>
            </box-option>
          </div>
        </template>
      </gamefi-box>
    </div>
  </div>
</template>

<script setup>
import GamefiBox from '@/components/GamefiBox.vue'
import BoxOption from '@/components/BoxOption.vue'
import Countdown from '@/components/Countdown.vue'
import Modal from '@/components/Modal.vue'
import WalletConnector from '@/components/WalletConnector.vue'
import { reactive, watch, onMounted } from 'vue'
import useStore from '@/composables/useStore'
import { storeToRefs } from 'pinia'
import useWeb3 from '@/composables/useWeb3'
import { useToast } from 'vue-toastification'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_BASE_URL
const USER_MESSAGE_SIGNATURE = import.meta.env.VITE_USER_MESSAGE_SIGNATURE
const END_DATE = import.meta.env.VITE_END_DATE

const toast = useToast()
const store = useStore()
const { wallet, walletShort, selectedInfo } = storeToRefs(store)

const { account, library, logout } = useWeb3()

const state = reactive({
  showConfirmOption1: false,
  showConfirmOption2: false,
  agree1: false,
  agree2: false,
  activeOption: 0,
  reconfirm: false,
  showConnectWallet: false,
  pools: [],
  rawSignature: '',
  isTimeout: false
})

onMounted(async () => {
  if (!wallet || !wallet.value) {
    state.activeOption = 0
    state.pools = []
    return
  }
  await getSelectedOption()

  if ((state.isTimeout && !selectedInfo.value)) {
    state.activeOption = 1
  }
})
watch([selectedInfo, wallet], () => {
  if (!wallet || !wallet.value) {
    state.activeOption = 0
    state.pools = []
    return
  }
  state.pools = (selectedInfo && selectedInfo.value && selectedInfo.value.pools.split(',')) || []
  if ((state.isTimeout && !selectedInfo.value)) {
    state.activeOption = 1
    return
  }
  state.activeOption = (selectedInfo && selectedInfo.value && selectedInfo.value.option) || 0
})
function selectPool (pool) {
  if (selectedInfo && selectedInfo.value) {
    return
  }
  const index = state.pools ? state.pools.indexOf(pool) : -1
  return index === -1 ? state.pools.push(pool) : state.pools.splice(index, 1)
}

function isActivePool (pool) {
  return state.pools && state.pools.indexOf(pool) !== -1
}
async function confirmOption (option) {
  switch (option) {
    case 1:
      if (!state.agree1) {
        return
      }

      await submitOption(1)

      state.showConfirmOption1 = false
      break
    case 2:
      if (!state.reconfirm && !state.agree2) {
        return
      }

      if (!state.reconfirm) {
        state.reconfirm = true
        return
      }

      await submitOption(2)

      state.showConfirmOption2 = false
      state.reconfirm = false
      break
    default:
      break
  }
}

function toggleOptionModal (option) {
  if (!walletShort.value) {
    state.showConnectWallet = true
    return
  }

  if (!state.pools.length) {
    toast.error('Please select at least one launchpad!')
    return
  }

  switch (option) {
    case 1:
      state.showConfirmOption1 = true
      break
    case 2:
      state.showConfirmOption2 = true
      break
  }
}

function signMessage () {
  return library.value.getSigner(account.value).signMessage(USER_MESSAGE_SIGNATURE)
}

async function getSelectedOption () {
  if (!wallet || !wallet.value) {
    return
  }
  await axios.post(`${BASE_URL}/api/v1/vesting/gamefi/${wallet.value}`).then(res => {
    if (!res || !res.data) {
      return
    }

    store.updateSelectedOption(res.data.data)
  })
}

async function submitOption (option) {
  if (!state.pools.length) {
    toast.error('Choose at least one launchpad!')
    state.reconfirm = false
    return
  }

  await signMessage().then(rawSignature => {
    state.rawSignature = rawSignature
  }).catch(e => {
    toast.error(e.message)
    state.reconfirm = false
  })

  const payload = {
    option,
    pools: state.pools.join(',')
  }

  const config = {
    headers: {
      msgsignature: USER_MESSAGE_SIGNATURE
    }
  }

  toast.info('Submitting...')
  await axios.post(`${BASE_URL}/api/v1/vesting/gamefi?signature=${state.rawSignature}&wallet_address=${wallet.value}`, payload, config)
    .then(res => {
      if (!res || !res.data || res.data.status !== 200) {
        toast.error(res.data.message || 'Something wrong')
        state.reconfirm = false
        return
      }

      toast.success('Success')
      getSelectedOption()
    })
    .catch(e => {
      toast.error(e.message)
    })
}

function timeout () {
  state.isTimeout = true
}
</script>

<style lang="scss" scoped>
.home-wrapper {
  margin-top: 3rem;
}

.main-content {
  max-width: 55rem;
}

.list-disc {
  color: #72F34B !important;
}
</style>
