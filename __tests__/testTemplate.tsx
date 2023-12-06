//import testing and mockup tools
import { Provider } from 'react-redux';
import { ThemeProvider } from "@mui/material";
import {screen, render} from '@testing-library/react'
import { expect, test, describe } from 'vitest'

import prettier from 'prettier'

//import import components and required files to test
import MySorobanReactProvider from "soroban/MySorobanReactProvider";
import store from '../src/state'
import { theme } from '../src/themes';
import { SwapComponent } from '../src/components/Swap/SwapComponent';

//Define the test scope
describe('Swap Page GUI', ()=>{
    //Create a JSdom to test
    render(
        //Wrap your component to be tested in the required providers
        <Provider store={store}>
            <ThemeProvider theme={theme('dark')}>
                <MySorobanReactProvider>
                    <SwapComponent/>
                </MySorobanReactProvider>
            </ThemeProvider>
        </Provider>
    )
    //write tests
    test('print formatted document body on console', async () => {
        const html = document.body.outerHTML;
        const formattedHTML = await prettier.format(html, { parser: 'html' });
        console.log(formattedHTML);
    })
    test('The container panel exists', ()=>{
        //select an element by testID
        const panel = screen.getByTestId('Swap__panel')
        //test the element
        expect(panel).toBeDefined()
    })
    test('The connect wallet button exists', ()=>{
        //select element by display text
        const connect_button = screen.getByText('Connect Wallet')
        //test the element
        expect(connect_button).toBeDefined()
    })
})