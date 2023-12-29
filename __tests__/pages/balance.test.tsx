import { Provider } from 'react-redux';
import { ThemeProvider } from "@mui/material";
import {screen, render} from '@testing-library/react'
import { expect, test, it, describe } from 'vitest'

import MySorobanReactProvider from "soroban/MySorobanReactProvider";
import store from '../../src/state'
import { theme } from '../../src/themes';
import { Balances } from "components/Balances";

describe('Balance Page GUI', ()=>{
    render(
        <Provider store={store}>
            <ThemeProvider theme={theme('dark')}>
                <MySorobanReactProvider>
                    <Balances/>
                </MySorobanReactProvider>
            </ThemeProvider>
        </Provider>
    )
    test('The connect wallet button exists', ()=>{
        const connect_button = screen.getByText('Connect Wallet')
        expect(connect_button).toBeDefined()
    })
})