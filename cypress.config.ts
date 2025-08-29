import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'fabfoi',
  defaultCommandTimeout: 24000, // 2x average block time
  chromeWebSecurity: false,
  experimentalMemoryManagement: true, // better memory management, see https://github.com/cypress-io/cypress/pull/25462
  retries: { runMode: process.env.CYPRESS_RETRIES ? +process.env.CYPRESS_RETRIES : 1 },
  video: false, // GH provides 2 CPUs, and cypress video eats one up, see https://github.com/cypress-io/cypress/issues/20468#issuecomment-1307608025
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/{e2e,staging}/**/*.test.{ts,tsx}',
    defaultCommandTimeout: 20000, // Sets the timeout for commands like cy.get() to 10 seconds
    pageLoadTimeout: 60000,       // Sets the timeout for cy.visit() to 60 seconds
    retries: {
      runMode: 9, // Retries failing tests 2 times in CI mode
      openMode: 0 // No retries in interactive mode
    },
    viewportHeight: 768,
    viewportWidth: 1366,
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'cypress/component/**/*.test.{ts,tsx}',
    viewportHeight: 768,
    viewportWidth: 1366,
  },
});
