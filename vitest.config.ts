/// <reference types="vitest" />
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react'
import path from 'path';

export default defineConfig({
    plugins: [tsconfigPaths(), react()],
    test: {
        globals: true,
        passWithNoTests: true,
        environment: 'jsdom',
        setupFiles:[ path.resolve(__dirname, './vitestSetup.ts')],
        onConsoleLog(log: string, type: 'stdout' | 'stderr'): false | void {
            if(type == 'stderr'){
                return false;
            }  
          },
    },
    // ... Specify options here.
})