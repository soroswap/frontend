import { AppContext } from 'contexts';
import { Box, Typography, useTheme } from '@mui/material';
import { Input, InputContainer } from '../Input';
import QuestionHelper from 'components/QuestionHelper';
import React, { useContext } from 'react';

export default function MaxHopsSettings() {
  const theme = useTheme();

  const { Settings } = useContext(AppContext);
  const { maxHops, setMaxHops } = Settings;

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap="2px">
          <Typography color={theme.palette.secondary.main}>Max Hops</Typography>
          <QuestionHelper
            text={
              <div>The maximum number of hops the router will make to find the best route.</div>
            }
          />
        </Box>
        <Box width={100}>
          <InputContainer gap="md">
            <Input
              type="number"
              min={1}
              max={10}
              value={maxHops}
              onChange={(e) => {
                setMaxHops(parseInt(e.target.value));
              }}
            />
          </InputContainer>
        </Box>
      </Box>
    </>
  );
}
