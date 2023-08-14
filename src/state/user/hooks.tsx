// import JSBI from 'jsbi'
import { useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import {
    updateUserSlippageTolerance,
} from './reducer'
// import { SlippageTolerance } from './types'

export enum SlippageTolerance {
    Auto = 'auto',
}
/**
 * Return the user's slippage tolerance, from the redux store, and a function to update the slippage tolerance
 */
export function useUserSlippageTolerance(): [
    number | SlippageTolerance.Auto,
    (slippageTolerance: number | SlippageTolerance.Auto) => void
] {
    const userSlippageToleranceRaw = useAppSelector((state) => {
        return state.user.userSlippageTolerance
    })

    // TODO(WEB-1985): Keep `userSlippageTolerance` as Percent in Redux store and remove this conversion
    const userSlippageTolerance = useMemo(
        () =>
            userSlippageToleranceRaw === SlippageTolerance.Auto
                ? SlippageTolerance.Auto
                // : new Percent(userSlippageToleranceRaw, 10_000),
                : userSlippageToleranceRaw,
        [userSlippageToleranceRaw]
    )

    const dispatch = useAppDispatch()
    const setUserSlippageTolerance = useCallback(
        (userSlippageTolerance: number | SlippageTolerance.Auto) => {
            let value: SlippageTolerance.Auto | number
            try {
                value =
                    userSlippageTolerance === SlippageTolerance.Auto
                        ? SlippageTolerance.Auto
                        // : JSBI.toNumber(userSlippageTolerance.multiply(10_000).quotient)
                        : userSlippageTolerance
            } catch (error) {
                value = SlippageTolerance.Auto
            }
            dispatch(
                updateUserSlippageTolerance({
                    userSlippageTolerance: value,
                })
            )
        },
        [dispatch]
    )

    return [userSlippageTolerance, setUserSlippageTolerance]
}

/**
 *Returns user slippage tolerance, replacing the auto with a default value
 * @param defaultSlippageTolerance the value to replace auto with
 */
export function useUserSlippageToleranceWithDefault(defaultSlippageTolerance: number): number {
    const [allowedSlippage] = useUserSlippageTolerance()
    return allowedSlippage === SlippageTolerance.Auto ? defaultSlippageTolerance : allowedSlippage
}
