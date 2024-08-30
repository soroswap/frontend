import Expand from 'components/Expand';
import QuestionHelper from 'components/QuestionHelper';
import Row, { RowBetween } from 'components/Row';
import { BodySmall } from 'components/Text';
import { AppContext } from 'contexts';
import { useRouterSDK } from 'functions/generateRoute';
import React, { useContext, useEffect, useState } from 'react'
import { Box, styled, Switch, SwitchProps, Typography, useTheme } from 'soroswap-ui';


export const CustomSwitch = styled((props: SwitchProps) => (
  <Switch sx={{ my: 1 }} focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  alignContent: 'center',
  alignItems: 'center',
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 3,
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#8866DD',
      '& .MuiSwitch-thumb:before': {
        backgroundColor: '#8866DD',
        borderRadius: 32,
      },
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.background.paper,
        opacity: 1,
        border: 0,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: 'rgba(136, 102, 221, 0.25)',
    width: 20,
    height: 20,
    '&:before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
    },
  },
  '& .MuiSwitch-track': {
    borderRadius: 32,
    backgroundColor: theme.palette.background.paper,
    opacity: 1,
  },
}));


const firstLetterUppercase = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
const ProtocolsSettings = () => {
  const { resetRouterSdkCache } = useRouterSDK();
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { protocolsStatus, setProtocolsStatus } = useContext(AppContext).Settings;

  const switchProtocolValue = (key: string) => {
    const newProtocolsStatus = protocolsStatus.map((protocol) => {
      if (protocol.key === key) {
        return {
          key: protocol.key,
          value: !protocol.value,
        };
      }
      return protocol;
    });
    const hasTrueValue = newProtocolsStatus.some((protocol) => protocol.value);
    if (hasTrueValue) {
      setProtocolsStatus(newProtocolsStatus);
      resetRouterSdkCache();
    }
    else return;
  }

  return (

    <Expand
      testId="protocols-settings"
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
      header={
        <Row width="auto">
          <Typography color={theme.palette.secondary.main}>Protocols</Typography>
          <QuestionHelper
            text={
              <div>
                The protocols Soroswap.finance will use to calculate the most efficient path for your transaction.
              </div>
            }
          />
        </Row>
      }
      button={<></>}
    >
      <RowBetween gap="md" width={'100%'}>
        <Box sx={{ ml: 2 }} width={'100%'} >
          {protocolsStatus.map((option, index) => {
            return (
              <Row key={index} gap="4px" justify='space-between' align='center'>
                <BodySmall fontWeight={100} color={theme.palette.secondary.main} >{firstLetterUppercase(option.key)}</BodySmall>
                <CustomSwitch checked={option.value} onClick={() => { switchProtocolValue(option.key) }} color="secondary" />
              </Row>
            )
          })}
        </Box>
      </RowBetween>

    </Expand>

  )
}

export default ProtocolsSettings
