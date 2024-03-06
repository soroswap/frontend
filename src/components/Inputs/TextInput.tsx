import { InputBase, styled } from '@mui/material';

const CustomInput = styled(InputBase)`
  background-color: transparent;
  width: 100%;
  border: ${({ theme }) => `1px solid ${theme.palette.customBackground.accentAction}`}; 
  color: ${({ theme }) => theme.palette.primary.main}; 
  border-radius: 20px; 
  padding: 8px; 
`;

interface SwapButtonProps {
  placeholder?: string;
  type?: string;
  value?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isNumeric? : boolean;
}

export function TextInput({
  placeholder,
  type,
  value,
  onChange,
  isNumeric = false
}: SwapButtonProps) { 
  const inputProps = isNumeric ? { min: 0, max: 9999999999999999, maxLength: 20, pattern:/^[0-9]$/ } : {};
  return (
    <CustomInput
      inputProps={inputProps}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
    />
  );
}
