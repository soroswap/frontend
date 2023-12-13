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
}

export function TextInput({
  placeholder,
  type,
  value,
  onChange
}: SwapButtonProps) {

  return (
    <CustomInput
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
    />
  );
}
