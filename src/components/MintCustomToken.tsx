import { Box, CircularProgress, Typography } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import { contractInvoke } from '@soroban-react/contracts';
import { useSorobanReact } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { AppContext, SnackbarIconType } from 'contexts';
import { sendNotification } from 'functions/sendNotification';
import { shortenAddress } from 'helpers/address';
import { bigNumberToI128 } from 'helpers/utils';
import { useKeys } from 'hooks';
import { useContext, useState } from 'react';
import * as StellarSdk from 'stellar-sdk';
import { ButtonPrimary } from './Buttons/Button';
import { TextInput } from './Inputs/TextInput';
import { BodySmall } from './Text';

export function MintCustomToken() {
  const sorobanContext = useSorobanReact();
  const { server, address } = sorobanContext;
  const { admin_public, admin_secret } = useKeys(sorobanContext);
  const { SnackbarContext } = useContext(AppContext);

  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [tokenAmount, setTokenAmount] = useState<number>();
  const [isMinting, setIsMinting] = useState(false);

  const handleMint = async () => {
    setIsMinting(true);

    const amount = new BigNumber(tokenAmount as number).shiftedBy(7);
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
      setIsMinting(false);
    }
  };

  const getButtonTxt = () => {
    if (isMinting)
      return (
        <Box display="flex" alignItems="center" gap="6px">
          Minting {shortenAddress(tokenAddress)} <CircularProgress size="18px" />
        </Box>
      );
    return `Mint custom token`;
  };

  const isButtonDisabled = () => {
    if (isMinting) return true;
    return false;
  };

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
        onClick={handleMint}
        disabled={isButtonDisabled()}
        style={{ marginTop: '24px' }}
      >
        {getButtonTxt()}
      </ButtonPrimary>
    </CardContent>
  );
}
