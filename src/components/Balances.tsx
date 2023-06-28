import React, {FunctionComponent} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Typography } from '@mui/material';

import { useSorobanReact } from '@soroban-react/core';
import { accountIdentifier } from '@soroban-react/utils';
import { useContractValue } from '@soroban-react/contracts'

import {currencies} from '../currencies'
import {Constants} from '../constants'

import {formatAmount} from '../utils'


export function Balances({balancesBigNumber}:{balancesBigNumber: any}) {
    const sorobanContext = useSorobanReact()
    
    let user, balancesFormated

    
    if (sorobanContext.address) {
      user = accountIdentifier(sorobanContext.address)
      //const balancesBigNumber = useBalances(user);

      const decimals = useContractValue({ 
        contractId: Constants.TokenId_1,
        method: 'decimals',
        sorobanContext: sorobanContext
      })

      
      
      const tokenDecimals = decimals?.result && (decimals.result?.u32() ?? 7)

      balancesFormated = {
        userBalance_1: formatAmount(balancesBigNumber.userBalance_1, tokenDecimals),
        userBalance_2: formatAmount(balancesBigNumber.userBalance_2, tokenDecimals),
        liquidityPoolBalance_1: formatAmount(balancesBigNumber.liquidityPoolBalance_1, tokenDecimals),
        liquidityPoolBalance_2: formatAmount(balancesBigNumber.liquidityPoolBalance_2, tokenDecimals)
        }

    }

  // const isLoading = (): boolean | undefined => {
  //   if(balances) {return (
  //     balances?.userBalance_1?.loading ||
  //     balances?.userBalance_2?.loading ||
  //     balances?.liquidityPoolBalance_1?.loading ||
  //     balances?.liquidityPoolBalance_2?.loading ||
  //     balances?.decimals?.loading
       
  //   )}
  //   else return false
  // }





  //   try{ decimals = useContractValue({ 
  //     contractId: Constants.TokenId_1,
  //     method: 'decimals',
  //     sorobanContext
  //   }).result}
  // catch(error){console.log("Error when getting decimals: ", error)}


  //   try{ userBalance_1 = scvalToBigNumber(useContractValue({
  //             contractId: Constants.TokenId_1,
  //             method: 'balance',
  //             params: [user],
  //             sorobanContext
  //           })?.result)}
  //   catch(error){console.log("Error when getting userBalance_1: ", error)}
    
  //   try{ userBalance_2 = scvalToBigNumber(useContractValue({
  //     contractId: Constants.TokenId_2,
  //     method: 'balance',
  //     params: [user],
  //     sorobanContext
  //       })?.result)}
  //   catch(error){console.log("Error when getting userBalance_2: ", error)}

  //   try{ liquidityPoolBalance_1 = scvalToBigNumber(useContractValue({
  //     contractId: Constants.TokenId_1,
  //     method: 'balance',
  //     params: [contractIdentifier(Constants.LiquidityPoolId)],
  //     sorobanContext
  //       })?.result)}
  //   catch(error){console.log("Error when getting liquidityPoolBalance_1: ", error)}

  //   try{ liquidityPoolBalance_2 = scvalToBigNumber(useContractValue({
  //     contractId: Constants.TokenId_2,
  //     method: 'balance',
  //     params: [contractIdentifier(Constants.LiquidityPoolId)],
  //     sorobanContext
  //       })?.result)}
  //   catch(error){console.log("Error when getting liquidityPoolBalance_2: ", error)}
    
    
    return (

    <Card sx={{ maxWidth: 345 }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Balances
        </Typography>
        {false ? (<p>Loading...</p>) : (  
          <div>
            <p>Your wallet balances:</p>
            <p>{currencies[0].shortlabel} : {balancesFormated?.userBalance_1}</p>
            <p>{currencies[1].shortlabel} : {balancesFormated?.userBalance_2}</p>
            <p></p>
            <p>Liquidity Pool Balances:</p>
            <p>{currencies[0].shortlabel} : {balancesFormated?.liquidityPoolBalance_1}</p>
            <p>{currencies[1].shortlabel} : {balancesFormated?.liquidityPoolBalance_2}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  1845559424
}