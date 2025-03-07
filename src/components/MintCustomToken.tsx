import { contractInvoke, setTrustline } from 'soroban-react-stellar-wallets-kit';
import { useContext, useEffect, useState } from 'react';
import * as StellarSdk from '@stellar/stellar-sdk';

import { AppContext, SnackbarIconType } from 'contexts';

import { Box, CircularProgress, Stack, Typography } from 'soroswap-ui';
import { CardContent } from 'soroswap-ui';
import { ButtonPrimary } from './Buttons/Button';
import { TextInput } from './Inputs/TextInput';
import WrapStellarAssetModal from './Modals/WrapStellarAssetModal';
import { BodySmall } from './Text';

import { getClassicAssetSorobanAddress } from 'functions/getClassicAssetSorobanAddress';
import { sendNotification } from 'functions/sendNotification';

import BigNumber from 'bignumber.js';
import { getClassicStellarAsset, isAddress, shortenAddress } from 'helpers/address';
import { requiresTrustline } from 'helpers/stellar';
import { bigNumberToI128 } from 'helpers/utils';

import { useAllTokens } from 'hooks/tokens/useAllTokens';
import { findToken, useToken } from 'hooks/tokens/useToken';
import useGetMyBalances from 'hooks/useGetMyBalances';

export function MintCustomToken() {
  const { sorobanContext, refetch } = useGetMyBalances();
  const { server, address } = sorobanContext;
  const admin_account = StellarSdk.Keypair.fromSecret(
    process.env.NEXT_PUBLIC_TEST_TOKENS_ADMIN_SECRET_KEY as string,
  );

  const { SnackbarContext } = useContext(AppContext);
  const { tokensAsMap } = useAllTokens();

  const [buttonText, setButtonText] = useState<string>('Mint custom token');
  const [isMinting, setIsMinting] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSettingTrustline, setIsSettingTrustline] = useState<boolean>(false);
  const [needToSetTrustline, setNeedToSetTrustline] = useState<boolean>(false);
  const [showWrapStellarAssetModal, setShowWrapStellarAssetModal] = useState<boolean>(false);
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [tokenAmount, setTokenAmount] = useState<string | number>('');
  const [tokenSymbol, setTokenSymbol] = useState<string>('');

  const { token, needsWrapping, handleTokenRefresh } = useToken(tokenAddress);

  const handleMint = async () => {
    setIsMinting(true);
    if (!tokenAddress || !tokenAmount) {
      setIsMinting(false);
      throw new Error('Token address or amount is missing');
    }
    const amount = new BigNumber(tokenAmount ?? 0).shiftedBy(7);
    const amountScVal = bigNumberToI128(amount);

    let adminSource, walletSource;
    try {
      adminSource = await server?.getAccount(admin_account.publicKey());
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
        contractAddress: token?.contract as string,
        method: 'mint',
        args: [new StellarSdk.Address(address).toScVal(), amountScVal],
        sorobanContext,
        signAndSend: true,
        secretKey: admin_account.secret(),
      });
      console.log('🚀 « result:', result);
      if (result) {
        setIsMinting(false);
        sendNotification(
          `Minted ${tokenAmount} ${shortenAddress(token?.contract as string)}`,
          'Minted',
          SnackbarIconType.MINT,
          SnackbarContext,
        );
        refetch();
        setTokenAddress('');
        setTokenAmount('');
      }

      handleTokenRefresh();
    } catch (error) {
      console.log('Catch error while minting', error);
      setIsMinting(false);
    }
  };

  const handleSetTrustline = () => {
    setIsSettingTrustline(true);
    console.log('SETTING TRUSTLINE');
    setTrustline({
      tokenSymbol: tokenSymbol,
      tokenAdmin: admin_account.publicKey(),
      sorobanContext,
    })
      .then((resp) => {
        setNeedToSetTrustline(false);
        sendNotification(
          `for ${tokenSymbol}`,
          'Trustline set',
          SnackbarIconType.MINT,
          SnackbarContext,
        );
        setButtonText('Mint custom token');
      })
      .catch((error: any) => {
        setIsSettingTrustline(false);
        console.log('Error setting trustline', error);
      })
      .finally(() => {
        setIsSettingTrustline(false);
      });
  };

  const handleSCA = async () => {
    const wrapToken = needsWrapping;
    const setTrustline = wrapToken == false && needToSetTrustline;
    const mintToken = wrapToken == false && needToSetTrustline == false;
    switch (true) {
      case wrapToken:
        setIsLoading(true);
        console.log(isLoading);
        setShowWrapStellarAssetModal(true);
        setNeedToSetTrustline(true);
        handleTokenRefresh();
        break;
      case setTrustline:
        await handleSetTrustline();
        setNeedToSetTrustline(false);
        handleTokenRefresh();
        break;
      case mintToken:
        handleMint();
        setTokenAmount('');
        setTokenAddress('');
        break;
      default:
        console.log('case not handled');
        break;
    }
  };

  const handleSubmit = async () => {
    const isSCA = getClassicStellarAsset(tokenAddress);
    if (isSCA) {
      handleSCA();
      return;
    }
    if (needToSetTrustline) {
      handleSetTrustline();
    } else {
      if (isAddress(tokenAddress)) {
        handleMint();
      } else {
        console.log('Invalid address || token || asset');
      }
    }
  };

  useEffect(() => {
    const updateTokenInfo = async () => {
      const sorobanAddress = getClassicAssetSorobanAddress(tokenAddress, sorobanContext);
      const newTokenAddress = sorobanAddress ? sorobanAddress : tokenAddress;
      if (isAddress(newTokenAddress)) {
        const tokenInfo = await findToken(newTokenAddress, tokensAsMap, sorobanContext);
        setTokenSymbol(tokenInfo?.code as string);
        const requiresTrust = await requiresTrustline(
          sorobanContext,
          tokenInfo,
          String(tokenAmount),
        );
        if (requiresTrust) {
          setButtonText('Set Trustline');
          setNeedToSetTrustline(true);
        } else if (needsWrapping) {
          setButtonText('Wrap token');
          setNeedToSetTrustline(false);
        } else {
          setButtonText('Mint custom token');
          setNeedToSetTrustline(false);
        }
      } else {
        setButtonText('Mint custom token');
        setNeedToSetTrustline(false);
      }
    };

    updateTokenInfo();
  }, [isMinting, sorobanContext, tokenAddress, tokensAsMap, needsWrapping, tokenAmount]);

  useEffect(() => {
    switch (showWrapStellarAssetModal) {
      case true:
        setIsLoading(true);
        setButtonText('Wrapping token...');
        break;
      case false:
        setTimeout(() => setIsLoading(false), 500);

        break;
    }
  }, [showWrapStellarAssetModal]);

  useEffect(() => {
    switch (isSettingTrustline) {
      case true:
        setIsLoading(true);
        break;
      case false:
        setIsLoading(false);
        break;
    }
  }, [isSettingTrustline]);

  useEffect(() => {
    const sorobanAddress = getClassicAssetSorobanAddress(tokenAddress, sorobanContext);
    const newTokenAddress = sorobanAddress ? sorobanAddress : tokenAddress;
    if (isMinting) {
      setButtonText(`Minting ${shortenAddress(newTokenAddress)}`);
      setIsLoading(true);
      setNeedToSetTrustline(false);
    } else {
      setIsLoading(false);
    }
  }, [isMinting]);

  const getTokensApiUrl = () => {
    const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'https://api.soroswap.finance';

    return `${base}/api/random_tokens`;
  };
  return (
    <CardContent>
      <WrapStellarAssetModal
        isOpen={showWrapStellarAssetModal}
        asset={token}
        onDismiss={() => {
          setShowWrapStellarAssetModal(false);
          setIsLoading(false);
        }}
        onSuccess={() => {
          setShowWrapStellarAssetModal(false);
          handleTokenRefresh();
        }}
      />
      <Typography gutterBottom variant="h5" component="div">
        {'Mint custom token'}
        <BodySmall>
          This tokens can be found in the{' '}
          <a href={getTokensApiUrl()} style={{ color: '#8866DD' }} target="_blank" rel="noreferrer">
            api
          </a>
        </BodySmall>
      </Typography>
      <Stack spacing={1}>
        <TextInput
          placeholder="Token address"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
        />

        <TextInput
          placeholder="Amount"
          value={tokenAmount}
          isNumeric
          onChange={(e) => {
            const value = e.target.value;
            if (typeof value === 'string' && value.match(/^[0-9]*$/)) {
              setTokenAmount(Number(e.target.value));
            } else {
              setTokenAmount(tokenAmount);
            }
          }}
        />
      </Stack>
      <ButtonPrimary onClick={handleSubmit} disabled={isLoading} style={{ marginTop: '24px' }}>
        <Box display="flex" alignItems="center" gap="6px">
          {buttonText}
          {isLoading && <CircularProgress size="18px" />}
        </Box>
      </ButtonPrimary>
    </CardContent>
  );
}
