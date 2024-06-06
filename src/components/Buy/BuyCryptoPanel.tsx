import { useState, useEffect } from 'react'
import { FormControl, InputLabel, Select, MenuItem, Container } from '@mui/material'
import { ButtonPrimary } from 'components/Buttons/Button';
import { getChallengeTransaction, submitChallengeTransaction } from 'functions/buy/sep10Auth/stellarAuth';
import { useSorobanReact } from '@soroban-react/core';
import { initInteractiveDepositFlow } from 'functions/buy/sep24Deposit/InteractiveDeposit';


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
    },
    '& .MuiSelect-select': {
      color: 'white',
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
    { name: 'Stellar test', value: 'https://testanchor.stellar.org' },
    { name: 'MoneyGram', value: 'https://stellar.moneygram.com' },
    { name: 'MyKobo', value: 'https://mykobo.co' },
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
  const sorobanContext = useSorobanReact()
  const { activeChain, address } = useSorobanReact()

  const sign = async (txn: any) => {
    const signedTransaction = await sorobanContext?.activeConnector?.signTransaction(txn, {
      networkPassphrase: activeChain?.networkPassphrase,
      network: activeChain?.id,
      accountToSign: address
    })
    return signedTransaction;
  }

  const dev = async (homeDomain: string) => {
    //#Auth flow

    //First, we define the anchor home domain
    //const homeDomain = 'https://testanchor.stellar.org'
    console.log(homeDomain)
    //Then, we get the challenge transaction, giving as input the user address to sign and the home domain of the anchor
    const { transaction, network_passphrase } = await getChallengeTransaction({
      publicKey: address! && address,
      homeDomain: homeDomain
    })
    //Once recived the Challenge transaction we sign it with our wallet
    const signedTransaction = await sign(transaction)

    //And submit the signed Challenge transaction to get the JWT
    const submittedTransaction = await submitChallengeTransaction({
      transactionXDR: signedTransaction,
      homeDomain: homeDomain
    })

    //#Interactive Deposit flow
    //We get the url of the interactive deposit flow, giving as input the JWT (Obtained from the authentication flow), the home domain of the anchor and the 
    //asset info from the asset we expect to recieve
    const { url } = await initInteractiveDepositFlow({
      authToken: submittedTransaction,
      homeDomain: homeDomain,
      urlFields: {
        asset_code: 'SRT',
        asset_issuer: 'GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B'
      }
    })

    //once we got the url we open the popup with a callback parameter to get the transaction status
    const interactiveUrl = `${url}&callback=postMessage`
    let popup = window.open(interactiveUrl, 'interactiveDeposit', 'width=450,height=750')

    if (!popup) {
      alert(
        "Popups are blocked. You’ll need to enable popups for this demo to work",
      );
      console.error(
        "Popups are blocked. You’ll need to enable popups for this demo to work",
      )
    }

    popup?.focus()

    window.addEventListener('message', (event) => {
      if (event.origin === homeDomain) {
        console.log(event.data)
        const transaction = event.data.transaction
        if (transaction.status == 'complete')
          popup?.close()
      }
    })
  }

  useEffect(() => {
    console.log('Deposit', [selectedFiat.value, selectedAnchor.value])
  }, [selectedFiat, selectedAnchor])

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <InputPanel header={'Buy'} options={fiatArray} selected={selectedFiat} setSelected={setSelectedFiat}></InputPanel>
      <InputPanel header={'From'} options={anchorsArray} selected={selectedAnchor} setSelected={setSelectedAnchor}></InputPanel>

      <ButtonPrimary onClick={() => { dev(selectedAnchor.value) }}>Buy USDC</ButtonPrimary>
    </>
  )
}

export default DepositFiatInputPanel