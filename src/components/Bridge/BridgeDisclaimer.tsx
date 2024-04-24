import { FiberManualRecord, Notifications } from '@mui/icons-material';
import {
  List,
  ListItem,
  ListItemIcon,
  Typography,
  keyframes,
  styled,
  useTheme,
} from '@mui/material';
import AnimatedDropdown from 'components/AnimatedDropdown';
import Column from 'components/Column';
import { RowBetween, RowFixed } from 'components/Row';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown } from 'react-feather';

const StyledHeaderRow = styled(RowBetween)<{ disabled: boolean; open: boolean }>`
  padding: 0;
  align-items: center;
  cursor: ${({ disabled }) => (disabled ? 'initial' : 'pointer')};
`;

const RotatingArrow = styled(ChevronDown)<{ open?: boolean }>`
  transform: ${({ open }) => (open ? 'rotate(180deg)' : 'none')};
  transition: transform 0.1s linear;
`;

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const DisclaimerDetailsWrapper = styled('div')`
  padding-top: 12px;
`;

const Wrapper = styled(Column)`
  background: ${({ theme }) => theme.palette.background.default};
  border-radius: 16px;
  padding: 12px 16px;
  overflow: hidden;
`;

const accentColor = {color: '#B295F8'};

export default function BridgeDisclaimerDropdown() {
  const theme = useTheme();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Wrapper>
      <StyledHeaderRow
        data-testid="swap-details-header-row"
        onClick={() => setShowDetails(!showDetails)}
        disabled={false}
        open={showDetails}
      >
        <RowFixed style={{ opacity: 0.4 }} gap="8px" fontWeight="500">
          <Notifications />
          Disclaimer
        </RowFixed>
        <RowFixed>
          <RotatingArrow stroke={theme.palette.custom.textTertiary} open={showDetails} />
        </RowFixed>
      </StyledHeaderRow>
      <AnimatedDropdown open={showDetails}>
        <DisclaimerDetailsWrapper data-testid="advanced-swap-details">
          <List>
            {[
              'Bridge Fee: Currently zero fee, transitioning to 0.1% per transaction soon.',
              'Security deposit: 0.5% of the transaction amount locked, returned after successful issue/redeem.',
              <>
                Total issuable amount (in USD): 50000 USD. Join our vault operator program, more{' '}
                <Link
                  style={accentColor}
                  target="_blank"
                  className="text-primary ml-1"
                  href="https://pendulum.gitbook.io/pendulum-docs/build/spacewalk-stellar-bridge/operating-a-vault"
                  rel="noreferrer"
                >
                  here.
                </Link>
              </>,
              <>
                Estimated time for issuing: In a minute after submitting the Stellar payment to the
                vault. Contact{' '}
                <Link
                  style={accentColor}
                  href="https://t.me/pendulum_chain"
                  target="_blank"
                  rel="noreferrer"
                  className="mx-1 text-primary"
                >
                  support 
                </Link>
                {' '}if your transaction is still pending after 10 minutes.
              </>,
            ].map((text, index) => (
              <ListItem
                key={index}
                sx={{
                  px: 2,
                  py: 0.4,
                  opacity: 0.5,
                }}
                style={{textWrap:'pretty'}}
              >
                <ListItemIcon sx={{ minWidth: '20px' }}>
                  <FiberManualRecord sx={{ fontSize: 'x-small', color: 'action.active' }} />
                </ListItemIcon>
                <Typography variant="body2" component="p">
                  {text}
                </Typography>
              </ListItem>
            ))}
          </List>
        </DisclaimerDetailsWrapper>
      </AnimatedDropdown>
    </Wrapper>
  );
}
