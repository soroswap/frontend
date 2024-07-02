import { Tooltip, TooltipProps, styled, tooltipClasses } from 'soroswap-ui';
// import { PropsWithChildren, ReactNode, useEffect, useState } from 'react'
// import Popover, { PopoverProps } from '../Popover'
// import noop from 'utils/noop'

export const MouseoverTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.black,
    width: 'calc(100vw - 16px)',
    cursor: 'default',
    padding: '12px',
    pointerEvents: 'auto',
    color: '#FFFFFF',
    fontWeight: 400,
    fontSize: '12px',
    lineHeight: '16px',
    wordBreak: 'break-word',
    borderRadius: '12px',
    border: '1px solid #293249',
    boxShadow: '0 4px 8px 0 rgba(0,0,0,0.1)',
    maxWidth: 256,
  },
}));

export default Tooltip;

// export enum TooltipSize {
//   ExtraSmall = '200px',
//   Small = '256px',
//   Large = '400px',
// }
// const getPaddingForSize = (size: TooltipSize) => {
//   switch (size) {
//     case TooltipSize.ExtraSmall:
//       return '8px'
//     case TooltipSize.Small:
//       return '12px'
//     case TooltipSize.Large:
//       return '16px 20px'
//   }
// }

// const TooltipContainer = styled("div") <{ size: TooltipSize }>`
//   max-width: ${({ size }) => size};
//   width: calc(100vw - 16px);
//   cursor: default;
//   padding: ${({ size }) => getPaddingForSize(size)};
//   pointer-events: auto;

//   color: ${({ theme }) => theme.palette.primary.main};
//   font-weight: 400;
//   font-size: 12px;
//   line-height: 16px;
//   word-break: break-word;

//   background: ${({ theme }) => theme.palette.background.default};
//   border-radius: 12px;
//   border: 1px solid ${({ theme }) => theme.palette.custom.borderColor};
//   box-shadow: 0 4px 8px 0 0.9;
// `
// // box-shadow: 0 4px 8px 0 ${({ theme }) => transparentize(0.9, theme.shadow1)};

// type TooltipProps = Omit<PopoverProps, 'content'> & {
//   text: ReactNode
//   open?: () => void
//   close?: () => void
//   size?: TooltipSize
//   disabled?: boolean
//   timeout?: number
// }

// // TODO(WEB-2024)
// // Migrate to MouseoverTooltip and move this component inline to MouseoverTooltip
// export default function Tooltip({ text, open, close, disabled, size = TooltipSize.Small, ...rest }: TooltipProps) {
//   return (
//     <Popover
//       content={
//         text && (
//           <TooltipContainer size={size} onMouseEnter={disabled ? noop : open} onMouseLeave={disabled ? noop : close}>
//             {text}
//           </TooltipContainer>
//         )
//       }
//       {...rest}
//     />
//   )
// }
