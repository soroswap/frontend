import { createSlice } from '@reduxjs/toolkit'

const currentTimestamp = () => new Date().getTime()

export interface UserState {
  selectedWallet?: any

  // the timestamp of the last updateVersion action
  lastUpdateVersionTimestamp?: number

  // userLocale: SupportedLocale | null
  userLocale: any

  // which router should be used to calculate trades
  // userRouterPreference: RouterPreference

  // hides closed (inactive) positions across the app
  userHideClosedPositions: boolean

  // user defined slippage tolerance in bips, used in all txns
  userSlippageTolerance: number | string

  // flag to indicate whether the user has been migrated from the old slippage tolerance values
  userSlippageToleranceHasBeenMigratedToAuto: boolean

  timestamp: number
  URLWarningVisible: boolean
  hideUniswapWalletBanner: boolean
  disabledUniswapX?: boolean
  // undefined means has not gone through A/B split yet
  showSurveyPopup?: boolean
}

function pairKey(token0Address: string, token1Address: string) {
  return `${token0Address};${token1Address}`
}

export const initialState: UserState = {
  selectedWallet: undefined,
  userLocale: null,
  userHideClosedPositions: false,
  userSlippageTolerance: "auto",
  userSlippageToleranceHasBeenMigratedToAuto: true,
  timestamp: currentTimestamp(),
  URLWarningVisible: true,
  hideUniswapWalletBanner: false,
  showSurveyPopup: undefined,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateSelectedWallet(state, { payload: { wallet } }) {
      state.selectedWallet = wallet
    },
    updateUserLocale(state, action) {
      state.userLocale = action.payload.userLocale
      state.timestamp = currentTimestamp()
    },
    updateUserSlippageTolerance(state, action) {
      state.userSlippageTolerance = action.payload.userSlippageTolerance
      state.timestamp = currentTimestamp()
    },
    updateHideClosedPositions(state, action) {
      state.userHideClosedPositions = action.payload.userHideClosedPositions
    },
    updateHideUniswapWalletBanner(state, action) {
      state.hideUniswapWalletBanner = action.payload.hideUniswapWalletBanner
    },
    updateDisabledUniswapX(state, action) {
      state.disabledUniswapX = action.payload.disabledUniswapX
    },
  },
  extraReducers: (builder) => {
    // After adding a new property to the state, its value will be `undefined` (instead of the default)
    // for all existing users with a previous version of the state in their localStorage.
    // In order to avoid this, we need to set a default value for each new property manually during hydration.
    builder.addCase("updateVersion", (state) => {
      // If `selectedWallet` is a WalletConnect v1 wallet, reset to default.
      if (state.selectedWallet) {
        const selectedWallet = state.selectedWallet as string
        if (
          selectedWallet === 'UNIWALLET' ||
          selectedWallet === 'UNISWAP_WALLET' ||
          selectedWallet === 'WALLET_CONNECT'
        ) {
          delete state.selectedWallet
        }
      }

      // If `userSlippageTolerance` is not present or its value is invalid, reset to default
      if (
        typeof state.userSlippageTolerance !== 'number' ||
        !Number.isInteger(state.userSlippageTolerance) ||
        state.userSlippageTolerance < 0 ||
        state.userSlippageTolerance > 5000
      ) {
        // state.userSlippageTolerance = SlippageTolerance.Auto
        state.userSlippageTolerance = 0.5
      } else {
        if (
          !state.userSlippageToleranceHasBeenMigratedToAuto &&
          [10, 50, 100].indexOf(state.userSlippageTolerance) !== -1
        ) {
          // state.userSlippageTolerance = SlippageTolerance.Auto
          state.userSlippageTolerance = 0.5
          state.userSlippageToleranceHasBeenMigratedToAuto = true
        }
      }

      //If `buyFiatFlowCompleted` is present, delete it using filtering
      if ('buyFiatFlowCompleted' in state) {
        //ignoring due to type errors occuring since we now remove this state
        //@ts-ignore
        delete state.buyFiatFlowCompleted
      }

      // If `buyFiatFlowCompleted` is present, delete it using filtering
      if ('buyFiatFlowCompleted' in state) {
        //ignoring due to type errors occuring since we now remove this state
        //@ts-ignore
        delete state.buyFiatFlowCompleted
      }

      //If `buyFiatFlowCompleted` is present, delete it using filtering
      if ('buyFiatFlowCompleted' in state) {
        //ignoring due to type errors occuring since we now remove this state
        //@ts-ignore
        delete state.buyFiatFlowCompleted
      }

      state.lastUpdateVersionTimestamp = currentTimestamp()
    })
  },
})

export const {
  updateSelectedWallet,
  updateHideClosedPositions,
  updateUserLocale,
  updateUserSlippageTolerance,
  updateHideUniswapWalletBanner,
  updateDisabledUniswapX,
} = userSlice.actions
export default userSlice.reducer
