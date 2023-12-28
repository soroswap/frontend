import React from "react";
import { expect, test, it, describe } from 'vitest'
import {screen, render} from '@testing-library/react'

import { SwapComponent } from '../src/components/Swap/SwapComponent';
import MySorobanReactProvider from "soroban/MySorobanReactProvider";
import { ThemeProvider } from "@mui/material";
import { theme } from '../src/themes';
import SwapPage from "../pages";

describe('swap Page', ()=>{
    test('should render the page', ()=>{
        render(
            <ThemeProvider theme={theme('dark')}>
                <MySorobanReactProvider>
                    <SwapPage/>
                </MySorobanReactProvider>
            </ThemeProvider>
        )

    })
})