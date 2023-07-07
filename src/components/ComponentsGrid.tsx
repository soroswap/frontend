import React from "react";
import Grid from "@mui/material/Grid";
// import { Swap } from "./Swap";
import { Mint } from "./Mint";
import { Balances } from "./Balances";
import { ChooseTokens } from "./ChooseTokens";

export default function ComponentsGrid() {
  return (
    <Grid
      container
      columns={{ xs: 4, sm: 8, md: 10 }}
      direction="row"
      alignItems="center"
      justifyContent="center"
    >
      <Balances />
      <Mint />
      <ChooseTokens isLiquidity={true}/>
      <ChooseTokens isLiquidity={false}/>
      {/* <Swap balancesBigNumber={undefined} /> */}
    </Grid>
  );
}
