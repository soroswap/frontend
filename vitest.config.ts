/// <reference types="vitest" />
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        onConsoleLog(log: string, type: 'stdout' | 'stderr'){
           return
        }, 
        passWithNoTests: true,
        environment: 'jsdom'
      },
      // ... Specify options here.
})