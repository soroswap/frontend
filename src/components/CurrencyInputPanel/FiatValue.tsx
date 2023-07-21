import { styled } from "@mui/material";
import { LoadingBubble } from "../Tokens/loading";
import React from "react";
import Row from "../Row";
import { BodySmall } from "../Text";
import { MouseoverTooltip } from "../Tooltip";

const FiatLoadingBubble = styled(LoadingBubble)`
  border-radius: 4px;
  width: 4rem;
  height: 1rem;
`

export function FiatValue({
  fiatValue,
}: {
  fiatValue: { data?: number; isLoading: boolean }
}) {

  if (fiatValue.isLoading) {
    return <FiatLoadingBubble />
  }

  return (
    <Row gap="sm">
      <BodySmall>
        {fiatValue.data ? (
          Number(fiatValue.data)
        ) : (
          <MouseoverTooltip title={"Not enough liquidity to show accurate USD value."} placement="right"><span>-</span></MouseoverTooltip>
        )}
      </BodySmall>
    </Row>
  )
}
