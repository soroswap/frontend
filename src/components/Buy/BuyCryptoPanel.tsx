import { useState, useEffect } from 'react'
import { FormControl, InputLabel, Select, MenuItem, Container } from '@mui/material'
import { ButtonPrimary } from 'components/Buttons/Button';
import { borderRadius } from 'polished';

interface Options {
  name: string;
  value: string;
}
interface InputPanelProps {
  header: string;
  options: Options[];
  selected: Options;
  setSelected: (value: Options) => void;
}
function InputPanel(props: InputPanelProps) {
  const { header, options, selected, setSelected } = props;
  const inputContainerStyle = {
    mt: 2,
    mb: 4,
    p: 0,
    backgroundColor: '#13141E',
    borderRadius: '12px',
    height: '10vh',
    alignContent: 'center'
  }
  const inputSelectStyle = {
    borderRadius: '32px',
    backgroundColor: '#98A1C014',
    color: 'white',
    fontSize: '1.5rem',
    '& .MuiSelect-icon': {
      color: 'white'
    }
  }
  return (
    <>
      <Container sx={inputContainerStyle} >
        <FormControl sx={inputSelectStyle}>
          <Select
            value={selected.value}
            onChange={(e) => setSelected(options.find((option) => option.value === e.target.value) || options[0])}
          >
            {options.map((option, key) => (
              <MenuItem value={option.value} key={key}>{option.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Container>
    </>
  )
}

function DepositFiatInputPanel() {
  const anchorsArray = [
    { name: 'Stellar test', value: 'https://testanchor.stellar.org/.well-known/stellar.toml' },
    { name: 'MoneyGram', value: 'https://stellar.moneygram.com/.well-known/stellar.toml' },
    { name: 'MyKobo', value: 'https://mykobo.co/.well-known/stellar.toml' },
  ];
  const fiatArray = [
    { name: 'USDC', value: 'USDC' },
    { name: 'EURC', value: 'EURC' },
    { name: 'ARS', value: 'ARS' },
    { name: 'XLM', value: 'XLM' },
    { name: 'CNY', value: 'CNY' }
  ];
  const [selectedFiat, setSelectedFiat] = useState<Options>(fiatArray[0])
  const [selectedAnchor, setSelectedAnchor] = useState<Options>(anchorsArray[0]);

  useEffect(() => {
    console.log('Deposit', [selectedFiat.value, selectedAnchor.value])
  }, [selectedFiat, selectedAnchor])

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <InputPanel header={'Buy'} options={fiatArray} selected={selectedFiat} setSelected={setSelectedFiat}></InputPanel>
      <InputPanel header={'From'} options={anchorsArray} selected={selectedAnchor} setSelected={setSelectedAnchor}></InputPanel>

      <ButtonPrimary onClick={() => {
        console.log('button clicked!')
        alert('button clicked!')
      }}>Buy USDC</ButtonPrimary>
    </>
  )
}

export default DepositFiatInputPanel