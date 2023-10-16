import { TokenType } from '../../interfaces'
import AssetLogo, { AssetLogoBaseProps } from './AssetLogo'

export default function CurrencyLogo(
  props: AssetLogoBaseProps & {
    currency?: TokenType | null
  }
) {

  return (
    <AssetLogo
      address={props.currency?.address}
      symbol={props.currency?.symbol}
      logoURI={props.currency?.logoURI}
      {...props}
    />
  )
}
