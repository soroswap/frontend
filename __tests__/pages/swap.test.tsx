import { Provider } from 'react-redux';
import { ThemeProvider } from "@mui/material";
import {screen, render} from '@testing-library/react'
import { expect, test, describe} from 'vitest'


import MySorobanReactProvider from "soroban/MySorobanReactProvider";
import store from '../../src/state'
import { theme } from '../../src/themes';
import { SwapComponent } from '../../src/components/Swap/SwapComponent';

describe('Swap Page GUI', ()=>{
    beforeEach(()=>{
        render(
            <Provider store={store}>
                <ThemeProvider theme={theme('dark')}>
                    <MySorobanReactProvider>
                        <SwapComponent/>
                    </MySorobanReactProvider>
                </ThemeProvider>
            </Provider>
        )
    })
    test('The container panel exists', ()=>{
        const panel = screen.getByTestId('Swap__panel')
        expect(panel).toBeDefined()
    })
    test('There are 2 token selectors', async ()=>{
        const token_selectors = await screen.findAllByTestId('Swap__Panel__Selector')
        expect(token_selectors.length).toBe(2)
    })
    test('The wallet button exists', async ()=>{
        const connect_button = await screen.findByText('Install Freighter')
        expect(connect_button).toBeDefined()
    })
})