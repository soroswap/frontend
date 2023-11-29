import React from "react";
import { Provider } from 'react-redux';
import { ThemeProvider } from "@mui/material";
import {screen, render} from '@testing-library/react'
import { expect, test, it, describe } from 'vitest'

import MySorobanReactProvider from "soroban/MySorobanReactProvider";
import store from '../src/state'
import { theme } from '../src/themes';
import { SwapComponent } from '../src/components/Swap/SwapComponent';

describe('Swap Page GUI', ()=>{
    render(
        <Provider store={store}>
            <ThemeProvider theme={theme('dark')}>
                <MySorobanReactProvider>
                    <SwapComponent/>
                </MySorobanReactProvider>
            </ThemeProvider>
        </Provider>
    )
    test('The container panel exists', ()=>{
        const panel = screen.getByTestId('Swap__panel')
        expect(panel).toBeDefined()
    })
    test('There are 2 token selectors', ()=>{
        const token_selectors = screen.getAllByTestId('Swap__Panel__Selector')
        expect(token_selectors.length).toBe(2)
    })
    test('The connect wallet button exists', ()=>{
        const connect_button = screen.getByText('Connect Wallet')
        expect(connect_button).toBeDefined()
    })
})