import { TokenType } from '../../interfaces'
import AssetLogo, { AssetLogoBaseProps } from './AssetLogo'

export default function CurrencyLogo(
  props: AssetLogoBaseProps & {
    currency?: TokenType | null
  }
) {

  return (
    <AssetLogo
      address={props.currency?.contract}
      symbol={props.currency?.code}
      icon={props.currency?.icon}
      {...props}
    />
  )
}
