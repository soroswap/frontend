import BigNumber from 'bignumber.js'

export const formatAmount = (value: BigNumber, decimals = 7): string => {
  return value.shiftedBy(decimals * -1).toNumber().toLocaleString()
}
