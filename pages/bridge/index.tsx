import { Box, Paper, styled } from '@mui/material';
import BridgeComponent from 'components/Bridge/BridgeComponent'

import SEO from 'components/SEO';

export default function BridgePage() {
  return (
    <>
      <SEO title="Bridge - Soroswap" description="Soroswap" />
      <Box display="flex" flexDirection="column" alignItems="center" gap="32px" width="100%">
        <BridgeComponent/>
      </Box>
    </>
  );
}
