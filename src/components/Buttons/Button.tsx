import { darken } from 'polished';
import { forwardRef } from 'react';
import { Check, ChevronDown } from 'react-feather';
import {
  ButtonBase as MuiButtonBase,
  ButtonProps as ButtonPropsOriginal,
  styled,
  useTheme,
  Theme,
} from 'soroswap-ui';

import { RowBetween } from '../Row';

type ButtonProps = Omit<ButtonPropsOriginal, 'css'>;

const ButtonOverlay = styled('div')`
  background-color: transparent;
  bottom: 0;
  border-radius: inherit;
  height: 100%;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  transition: 150ms ease background-color;
  width: 100%;
`;

type BaseButtonProps = {
  padding?: string;
  width?: string;
  $borderRadius?: string;
  altDisabledStyle?: boolean;
} & ButtonProps;

export const BaseButton = styled(MuiButtonBase, {
  shouldForwardProp: (prop) => prop !== '$borderRadius',
})<BaseButtonProps>`
  padding: ${({ padding }) => padding ?? '16px'};
  width: ${({ width }) => width ?? '100%'};
  font-weight: 500;
  text-align: center;
  border-radius: ${({ $borderRadius }) => $borderRadius ?? '20px'};
  outline: none;
  border: 1px solid transparent;
  color: ${({ theme }) => theme.palette.primary.main};
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: pointer;
  position: relative;
  z-index: 1;
  &:disabled {
    opacity: 50%;
    cursor: auto;
    pointer-events: none;
  }

  will-change: transform;
  transition: transform 450ms ease;
  transform: perspective(1px) translateZ(0);

  > * {
    user-select: none;
  }

  > a {
    text-decoration: none;
  }
`;

export const ButtonPrimary = styled(BaseButton)`
  background-color: ${({ theme }) => theme.palette.customBackground.accentAction};
  font-size: 20px;
  font-weight: 600;
  padding: 16px;
  color: ${({ theme }) => theme.palette.custom.accentTextLightPrimary};
  &:focus {
    box-shadow: 0 0 0 1pt
      ${({ theme }) => darken(0.05, theme.palette.customBackground.accentAction)};
    background-color: ${({ theme }) => darken(0.05, theme.palette.customBackground.accentAction)};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.palette.customBackground.accentAction)};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.1, theme.palette.customBackground.accentAction)};
    background-color: ${({ theme }) => darken(0.1, theme.palette.customBackground.accentAction)};
  }
  &:disabled {
    background-color: ${({ theme, altDisabledStyle, disabled }) =>
      altDisabledStyle
        ? disabled
          ? theme.palette.customBackground.accentAction
          : theme.palette.customBackground.interactive
        : theme.palette.customBackground.interactive};
    color: ${({ altDisabledStyle, disabled, theme }) =>
      altDisabledStyle
        ? disabled
          ? '#FFFFFF'
          : theme.palette.secondary.main
        : theme.palette.secondary.main};
    cursor: auto;
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
  }
`;

export const SmallButtonPrimary = styled(ButtonPrimary)`
  width: auto;
  font-size: 16px;
  padding: ${({ padding }) => padding ?? '8px 12px'};

  border-radius: 12px;
`;

const BaseButtonLight = styled(BaseButton)`
  background-color: ${({ theme }) => theme.palette.customBackground.accentActionSoft};
  color: ${({ theme }) => theme.palette.customBackground.accentAction};
  font-size: 20px;
  font-weight: 600;
`;

export const ButtonGray = styled(BaseButton)`
  background-color: ${({ theme }) => theme.palette.customBackground.bg1};
  color: ${({ theme }) => theme.palette.secondary.main};
  font-size: 16px;
  font-weight: 500;

  &:hover {
    background-color: ${({ theme, disabled }) =>
      !disabled && darken(0.05, theme.palette.customBackground.interactive)};
  }
  &:active {
    background-color: ${({ theme, disabled }) =>
      !disabled && darken(0.1, theme.palette.customBackground.interactive)};
  }
`;

export const ButtonSecondary = styled(BaseButton)`
  border: 1px solid ${({ theme }) => theme.palette.custom.deprecated_primary4};
  color: ${({ theme }) => theme.palette.customBackground.accentAction};
  background-color: transparent;
  font-size: 16px;
  border-radius: 12px;
  padding: ${({ padding }) => (padding ? padding : '10px')};

  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.palette.custom.deprecated_primary4};
    border: 1px solid ${({ theme }) => theme.palette.custom.deprecated_primary3};
  }
  &:hover {
    border: 1px solid ${({ theme }) => theme.palette.custom.deprecated_primary3};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.palette.custom.deprecated_primary4};
    border: 1px solid ${({ theme }) => theme.palette.custom.deprecated_primary3};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
  a:hover {
    text-decoration: none;
  }
`;

export const ButtonOutlined = styled(BaseButton)`
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.palette.customBackground.accentAction};
  color: ${({ theme }) => theme.palette.primary.main};
  font-size: 20px;
  font-weight: 600;
  padding: 16px;

  &:hover {
    box-shadow: 0 0 0 1px
      ${({ theme }) => darken(0.05, theme.palette.customBackground.accentAction)};
  }
  &:active {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.palette.customBackground.bg4};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`;

export const ButtonEmpty = styled(BaseButton)`
  background-color: transparent;
  color: ${({ theme }) => theme.palette.customBackground.accentAction};
  display: flex;
  justify-content: center;
  align-items: center;

  &:focus {
    text-decoration: underline;
  }
  &:hover {
    text-decoration: none;
  }
  &:active {
    text-decoration: none;
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`;

export const ButtonText = styled(BaseButton)`
  padding: 0;
  width: fit-content;
  background: none;
  text-decoration: none;
  &:focus {
    text-decoration: underline;
  }
  &:hover {
    opacity: 0.9;
  }
  &:active {
    text-decoration: underline;
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`;

const ButtonConfirmedStyle = styled(BaseButton)`
  background-color: ${({ theme }) => theme.palette.customBackground.bg3};
  color: ${({ theme }) => theme.palette.primary.main};
  /* border: 1px solid ${({ theme }) => theme.palette.customBackground.accentSuccess}; */

  &:disabled {
    opacity: 50%;
    background-color: ${({ theme }) => theme.palette.customBackground.interactive};
    color: ${({ theme }) => theme.palette.secondary.main};
    cursor: auto;
  }
`;

const ButtonErrorStyle = styled(BaseButton)`
  background-color: ${({ theme }) => theme.palette.error.main};
  border: 1px solid ${({ theme }) => theme.palette.error.main};

  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.05, theme.palette.error.main)};
    background-color: ${({ theme }) => darken(0.05, theme.palette.error.main)};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.palette.error.main)};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.1, theme.palette.error.main)};
    background-color: ${({ theme }) => darken(0.1, theme.palette.error.main)};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
    box-shadow: none;
    background-color: ${({ theme }) => theme.palette.error.main};
    border: 1px solid ${({ theme }) => theme.palette.error.main};
  }
`;

export function ButtonConfirmed({
  confirmed,
  altDisabledStyle,
  ...rest
}: { confirmed?: boolean; altDisabledStyle?: boolean } & ButtonProps) {
  if (confirmed) {
    return <ButtonConfirmedStyle {...rest} />;
  } else {
    return <ButtonPrimary {...rest} altDisabledStyle={altDisabledStyle} />;
  }
}

export function ButtonError({ error, ...rest }: { error?: boolean } & BaseButtonProps) {
  if (error) {
    return <ButtonErrorStyle {...rest} />;
  } else {
    return <ButtonPrimary {...rest} />;
  }
}

export function ButtonDropdown({
  disabled = false,
  children,
  ...rest
}: { disabled?: boolean } & ButtonProps) {
  return (
    <ButtonPrimary {...rest} disabled={disabled}>
      <RowBetween>
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
        <ChevronDown size={24} />
      </RowBetween>
    </ButtonPrimary>
  );
}

export function ButtonDropdownLight({
  disabled = false,
  children,
  ...rest
}: { disabled?: boolean } & ButtonProps) {
  return (
    <ButtonOutlined {...rest} disabled={disabled}>
      <RowBetween>
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
        <ChevronDown size={24} />
      </RowBetween>
    </ButtonOutlined>
  );
}

const ActiveOutlined = styled(ButtonOutlined)`
  border: 1px solid;
  border-color: ${({ theme }) => theme.palette.customBackground.accentAction};
`;

const Circle = styled('div')`
  height: 17px;
  width: 17px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.palette.customBackground.accentAction};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CheckboxWrapper = styled('div')`
  width: 20px;
  padding: 0 10px;
  position: absolute;
  top: 11px;
  right: 15px;
`;

const ResponsiveCheck = styled(Check)`
  size: 13px;
`;

export function ButtonRadioChecked({
  active = false,
  children,
  ...rest
}: { active?: boolean } & ButtonProps) {
  const theme = useTheme();

  if (!active) {
    return (
      <ButtonOutlined $borderRadius="12px" padding="12px 8px" {...rest}>
        <RowBetween>{children}</RowBetween>
      </ButtonOutlined>
    );
  } else {
    return (
      <ActiveOutlined {...rest} padding="12px 8px" $borderRadius="12px">
        <RowBetween>
          {children}
          <CheckboxWrapper>
            <Circle>
              <ResponsiveCheck size={13} stroke={'#FFFFFF'} />
            </Circle>
          </CheckboxWrapper>
        </RowBetween>
      </ActiveOutlined>
    );
  }
}

export enum ButtonSize {
  small,
  medium,
  large,
}
export enum ButtonEmphasis {
  high,
  promotional,
  highSoft,
  medium,
  low,
  warning,
  destructive,
  failure,
}
interface BaseThemeButtonProps {
  size: ButtonSize;
  emphasis: ButtonEmphasis;
}

function pickThemeButtonBackgroundColor({
  theme,
  emphasis,
}: {
  theme: Theme;
  emphasis: ButtonEmphasis;
}) {
  switch (emphasis) {
    case ButtonEmphasis.high:
      return theme.palette.customBackground.accentAction;
    case ButtonEmphasis.promotional:
      return theme.palette.customBackground.accentActionSoft;
    case ButtonEmphasis.highSoft:
      return theme.palette.customBackground.accentActionSoft;
    case ButtonEmphasis.low:
      return 'transparent';
    case ButtonEmphasis.warning:
      return theme.palette.customBackground.accentWarningSoft;
    case ButtonEmphasis.destructive:
      return theme.palette.customBackground.accentCritical;
    case ButtonEmphasis.failure:
      return theme.palette.customBackground.accentFailureSoft;
    case ButtonEmphasis.medium:
    default:
      return theme.palette.customBackground.interactive;
  }
}
function pickThemeButtonFontSize({ size }: { size: ButtonSize }) {
  switch (size) {
    case ButtonSize.large:
      return '20px';
    case ButtonSize.medium:
      return '16px';
    case ButtonSize.small:
      return '14px';
    default:
      return '16px';
  }
}
function pickThemeButtonLineHeight({ size }: { size: ButtonSize }) {
  switch (size) {
    case ButtonSize.large:
      return '24px';
    case ButtonSize.medium:
      return '20px';
    case ButtonSize.small:
      return '16px';
    default:
      return '20px';
  }
}
function pickThemeButtonPadding({ size }: { size: ButtonSize }) {
  switch (size) {
    case ButtonSize.large:
      return '16px';
    case ButtonSize.medium:
      return '10px 12px';
    case ButtonSize.small:
      return '8px';
    default:
      return '10px 12px';
  }
}
function pickThemeButtonTextColor({ theme, emphasis }: { theme: Theme; emphasis: ButtonEmphasis }) {
  switch (emphasis) {
    case ButtonEmphasis.high:
    case ButtonEmphasis.promotional:
      return theme.palette.customBackground.accentAction;
    case ButtonEmphasis.highSoft:
      return theme.palette.customBackground.accentAction;
    case ButtonEmphasis.low:
      return theme.palette.secondary.main;
    case ButtonEmphasis.warning:
      return theme.palette.customBackground.accentWarning;
    case ButtonEmphasis.destructive:
      return theme.palette.custom.accentTextDarkPrimary;
    case ButtonEmphasis.failure:
      return theme.palette.error.main;
    case ButtonEmphasis.medium:
    default:
      return theme.palette.primary.main;
  }
}

const BaseThemeButton = styled('button')<BaseThemeButtonProps>`
  align-items: center;
  background-color: ${pickThemeButtonBackgroundColor};
  border-radius: 16px;
  border: 0;
  color: ${pickThemeButtonTextColor};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  font-size: ${pickThemeButtonFontSize};
  font-weight: 600;
  gap: 12px;
  justify-content: center;
  line-height: ${pickThemeButtonLineHeight};
  padding: ${pickThemeButtonPadding};
  position: relative;
  transition: 150ms ease opacity;
  user-select: none;

  :active {
    ${ButtonOverlay} {
      background-color: ${({ theme }) => theme.palette.custom.stateOverlayPressed};
    }
  }
  :focus {
    ${ButtonOverlay} {
      background-color: ${({ theme }) => theme.palette.custom.stateOverlayPressed};
    }
  }
  :hover {
    ${ButtonOverlay} {
      background-color: ${({ theme }) => theme.palette.custom.stateOverlayHover};
    }
  }
  :disabled {
    cursor: default;
    opacity: 0.6;
  }
  :disabled:active,
  :disabled:focus,
  :disabled:hover {
    ${ButtonOverlay} {
      background-color: transparent;
    }
  }
`;

interface ThemeButtonProps extends React.ComponentPropsWithoutRef<'button'>, BaseThemeButtonProps {}
type ThemeButtonRef = HTMLButtonElement;

export const ThemeButton = forwardRef<ThemeButtonRef, ThemeButtonProps>(function ThemeButton(
  { children, ...rest },
  ref,
) {
  return (
    <BaseThemeButton {...rest} ref={ref}>
      <ButtonOverlay />
      {children}
    </BaseThemeButton>
  );
});

export const ButtonLight = ({ children, ...rest }: BaseButtonProps) => {
  return (
    <BaseButtonLight {...rest}>
      <ButtonOverlay />
      {children}
    </BaseButtonLight>
  );
};
