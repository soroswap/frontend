import { Box, CircularProgress, Typography } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import { contractInvoke, setTrustline } from '@soroban-react/contracts';
import { useSorobanReact } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { AppContext, SnackbarIconType } from 'contexts';
import { sendNotification } from 'functions/sendNotification';
import { isAddress, shortenAddress } from 'helpers/address';
import { requiresTrustline } from 'helpers/stellar';
import { bigNumberToI128 } from 'helpers/utils';
import { useKeys } from 'hooks';
import { useAllTokens } from 'hooks/tokens/useAllTokens';
import { findToken } from 'hooks/tokens/useToken';
import { useContext, useEffect, useState } from 'react';
import * as StellarSdk from 'stellar-sdk';
import { ButtonPrimary } from './Buttons/Button';
import { TextInput } from './Inputs/TextInput';
import { BodySmall } from './Text';

export function MintCustomToken() {
  const sorobanContext = useSorobanReact();
  const { server, address } = sorobanContext;
  const { admin_public, admin_secret } = useKeys(sorobanContext);
  const { SnackbarContext } = useContext(AppContext);
  const { tokensAsMap } = useAllTokens();

  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [tokenAmount, setTokenAmount] = useState<number>();
  const [isMinting, setIsMinting] = useState(false);
  const [buttonText, setButtonText] = useState<string>('Mint custom token');
  const [needToSetTrustline, setNeedToSetTrustline] = useState<boolean>(false)
  const [tokenSymbol, setTokenSymbol] = useState<string>('')

  const handleMint = async () => {
    setIsMinting(true);

    const amount = new BigNumber(tokenAmount ?? 0).shiftedBy(7);
    const amountScVal = bigNumberToI128(amount);

    let adminSource, walletSource;

    try {
      adminSource = await server?.getAccount(admin_public);
    } catch (error) {
      alert('Your wallet or the token admin wallet might not be funded');
      setIsMinting(false);
      return;
    }

    if (!address) {
      return;
    }
    if (!adminSource) {
      return;
    }

    try {
      let result = await contractInvoke({
        contractAddress: tokenAddress,
        method: 'mint',
        args: [new StellarSdk.Address(address).toScVal(), amountScVal],
        sorobanContext,
        signAndSend: true,
        secretKey: admin_secret,
      });
      console.log('🚀 « result:', result);

      if (result) {
        setIsMinting(false);
        sendNotification(
          `Minted ${tokenAmount} ${shortenAddress(tokenAddress)}`,
          'Minted',
          SnackbarIconType.MINT,
          SnackbarContext,
        );
        setTokenAddress('');
        setTokenAmount(0);
      }

      //This will connect again the wallet to fetch its data
      sorobanContext.connect();
    } catch (error) {
      console.log(error)
      setIsMinting(false);
    }
  };

  const handleSetTrustline = () => {
    console.log("SETTING TRUSTLINE")
    setTrustline({
      tokenSymbol: tokenSymbol,
      tokenAdmin: admin_public,
      sorobanContext
    }).then((resp) => {
      setNeedToSetTrustline(false)
      setButtonText("Mint custom token")
    }).catch((error: any) => {
      console.log("Error setting trustline",error)
    })
  }

  const handleSubmit = () => {
    if (needToSetTrustline) {
      handleSetTrustline()
    } else {
      if (isAddress(tokenAddress)) {
        handleMint()
      } else {
        console.log("type token address first")
      }
    }
  }

  useEffect(() => {
    const updateTokenInfo = async () => {
      if (isAddress(tokenAddress)) {
        const tokenInfo = await findToken(tokenAddress, tokensAsMap, sorobanContext);
        setTokenSymbol(tokenInfo?.symbol as string);
  
        const requiresTrust = await requiresTrustline(tokenAddress, sorobanContext);
        if (requiresTrust) {
          setButtonText("Set Trustline");
          setNeedToSetTrustline(true);
        } else {
          setButtonText("Mint custom token");
          setNeedToSetTrustline(false);
        }
      } else {
        setButtonText("Mint custom token");
        setNeedToSetTrustline(false);
      }
  
      if (isMinting) {
        setButtonText(`Minting ${shortenAddress(tokenAddress)}`);
        setNeedToSetTrustline(false);
      }
    };
  
    updateTokenInfo();
  }, [isMinting, sorobanContext, tokenAddress, tokensAsMap]);

  const getTokensApiUrl = () => {
    const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'https://api.soroswap.finance';

    return `${base}/api/random_tokens`;
  };
  return (
    <CardContent>
      <Typography gutterBottom variant="h5" component="div">
        {'Mint custom token'}
        <BodySmall>
          This tokens can be found in the{' '}
          <a href={getTokensApiUrl()} style={{ color: '#8866DD' }} target="_blank" rel="noreferrer">
            api
          </a>
        </BodySmall>
      </Typography>

      <TextInput
        placeholder="Token address"
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value)}
      />

      <TextInput
        placeholder="Amount"
        type="number"
        value={tokenAmount}
        onChange={(e) => setTokenAmount(Number(e.target.value))}
      />
      <ButtonPrimary
        onClick={handleSubmit}
        disabled={isMinting}
        style={{ marginTop: '24px' }}
      >
        <Box display="flex" alignItems="center" gap="6px">
          {buttonText}
          {isMinting && (
            <CircularProgress size="18px" />
          )}
        </Box>
      </ButtonPrimary>
    </CardContent>
  );
}
