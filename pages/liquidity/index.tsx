import { styled, useMediaQuery, useTheme } from '@mui/material';
import { useSorobanReact } from '@soroban-react/core';
import { ButtonPrimary } from 'components/Buttons/Button';
import { AutoColumn } from 'components/Column';
import LiquidityPoolInfoModal from 'components/Liquidity/LiquidityPoolInfoModal';
import { LPPercentage } from 'components/Liquidity/styleds';
import CurrencyLogo from 'components/Logo/CurrencyLogo';
import { Dots } from 'components/Pool/styleds';
import { AutoRow } from 'components/Row';
import SettingsTab from 'components/Settings';
import { BodySmall, SubHeader } from 'components/Text';
import { LpTokensObj, getLpTokens } from 'functions/getLpTokens';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import SEO from '../../src/components/SEO';

const PageWrapper = styled(AutoColumn)`
  position: relative;
  background: ${({ theme }) => `linear-gradient(${theme.palette.customBackground.bg2}, ${
    theme.palette.customBackground.bg2
  }) padding-box,
              linear-gradient(150deg, rgba(136,102,221,1) 0%, rgba(${
                theme.palette.mode == 'dark' ? '33,29,50,1' : '255,255,255,1'
              }) 35%, rgba(${
                theme.palette.mode == 'dark' ? '33,29,50,1' : '255,255,255,1'
              }) 65%, rgba(136,102,221,1) 100%) border-box`};
  border: 1px solid transparent;
  border-radius: 16px;
  padding: 32px;
  transition: transform 250ms ease;
  max-width: 875px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

const LPTokensContainer = styled('div')`
  width: calc(100% + 64px);
  background-color: ${({ theme }) => theme.palette.customBackground.surface};
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 32px;
  gap: 24px;
`;

const LPCard = styled('div')`
  background-color: ${({ theme }) => theme.palette.customBackground.bg1};
  border-radius: 16px;
  width: 100%;
  min-height: 86px;
  padding: 16px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const StatusWrapper = styled('div')`
  background-color: ${({ theme }) => theme.palette.customBackground.accentAction};
  font-size: 20px;
  font-weight: 600;
  padding: 16px;
  color: ${({ theme }) => theme.palette.custom.accentTextLightPrimary};
  width: 100%;
  max-width: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
`;

export default function LiquidityPage() {
  const sorobanContext = useSorobanReact();
  const { address } = sorobanContext;
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const v2IsLoading = false;
  const noLiquidity = false;
  const isCreate = false;

  const [lpTokens, setLpTokens] = useState<LpTokensObj[]>();
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedLP, setSelectedLP] = useState<LpTokensObj>();

  useEffect(() => {
    getLpTokens(sorobanContext).then((resp) => {
      setLpTokens(resp);
    });
  }, [sorobanContext]);

  const handleLPClick = (obj: LpTokensObj) => {
    setSelectedLP(obj);
    setModalOpen(true);
  };

  return (
    <>
      <SEO title="Liquidity - Soroswap" description="Soroswap Liquidity Pool" />
      <PageWrapper>
        <div style={{ width: '100%' }}>
          <AutoRow style={{ justifyContent: 'space-between' }}>
            <SubHeader>Your liquidity</SubHeader>
            <SettingsTab autoSlippage={0.5} />
          </AutoRow>
          <div>
            <BodySmall>List of your liquidity positions</BodySmall>
          </div>
        </div>
        {!address ? (
          <LPTokensContainer>
            <BodySmall color={theme.palette.custom.accentTextLightSecondary} textAlign="center">
              <>Connect to a wallet to view your liquidity.</>
            </BodySmall>
          </LPTokensContainer>
        ) : v2IsLoading ? (
          <LPTokensContainer>
            <BodySmall color={theme.palette.custom.accentTextLightSecondary} textAlign="center">
              <Dots>
                <>Loading</>
              </Dots>
            </BodySmall>
          </LPTokensContainer>
        ) : lpTokens && lpTokens?.length > 0 ? (
          <LPTokensContainer>
            {lpTokens.map((obj: any, index: number) => (
              <LPCard onClick={() => handleLPClick(obj)} key={index}>
                <AutoRow gap={'2px'}>
                  <CurrencyLogo currency={obj.token_0} size={isMobile ? '16px' : '24px'} />
                  <CurrencyLogo currency={obj.token_1} size={isMobile ? '16px' : '24px'} />
                  <SubHeader>
                    {obj.token_0.symbol} - {obj.token_1.symbol}
                  </SubHeader>
                  <LPPercentage>{obj.lpPercentage}%</LPPercentage>
                </AutoRow>
                <StatusWrapper>{obj.status}</StatusWrapper>
              </LPCard>
            ))}
          </LPTokensContainer>
        ) : (
          <LPTokensContainer>
            <BodySmall color={theme.palette.custom.accentTextLightSecondary} textAlign="center">
              <>No liquidity found.</>
            </BodySmall>
          </LPTokensContainer>
        )}
        <ButtonPrimary onClick={() => router.push('/liquidity/add')}>+ Add Liquidity</ButtonPrimary>
      </PageWrapper>
      <LiquidityPoolInfoModal
        selectedLP={selectedLP}
        isOpen={isModalOpen}
        onDismiss={() => setModalOpen(false)}
      />
    </>
  );
}
