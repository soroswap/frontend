import { ThemeProvider } from "@mui/material";
import {screen, render} from '@testing-library/react'
import { expect, test, it, describe } from 'vitest'

import MySorobanReactProvider from "soroban/MySorobanReactProvider";
import { theme } from '../../themes';
import Header from 'components/Layout/Header';

describe('Header component', ()=>{
    render(
        <ThemeProvider theme={theme('dark')}>
            <MySorobanReactProvider>
                <Header isDrawerOpen={false} setDrawerOpen={()=>{}}/>
            </MySorobanReactProvider>
        </ThemeProvider>
    )
    
    test('The navbar is rendered', ()=>{
        const navbar = screen.getByTestId('nav')
        expect(navbar).toBeDefined()
    })
    const expected_links = ['balance', 'swap', 'liquidity']
    test('All the navbar links are rendered', ()=>{
        const links = screen.getAllByTestId('nav-link')
        expect(links.length).toBe(expected_links.length)
    })
})