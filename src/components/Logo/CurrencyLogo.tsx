import { TokenType } from '../../interfaces'
import AssetLogo, { AssetLogoBaseProps } from './AssetLogo'

export default function CurrencyLogo(
  props: AssetLogoBaseProps & {
    currency?: TokenType | null
  }
) {
  return (
    <AssetLogo
      address={props.currency?.token_address}
      symbol={props.currency?.token_symbol}
      {...props}
    />
  )
}
