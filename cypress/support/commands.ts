declare global {
  namespace Cypress {
    interface Chainable {
      connectFreighterWallet(): Chainable<Element>;
      selectUSDCAndTriggerSwap(): Chainable<Element>;
    }
  }
}

Cypress.Commands.add('connectFreighterWallet', () => {
  cy.get('[data-testid="primary-button"]').click();

  cy.contains('Detected');

  cy.contains('Freighter Wallet').click();

  cy.get('[data-testid="primary-button"]').contains('Select a token');
});

Cypress.Commands.add('selectUSDCAndTriggerSwap', () => {
  cy.contains('Select token').click();

  cy.contains('USDC').click();

  cy.get('[data-testid="primary-button"]').contains('Enter an amount');

  cy.get('.token-amount-input').first().type('1');

  cy.get('[data-testid="primary-button"]').contains('Swap').click();

  cy.contains('Confirm swap').click();

  cy.contains('Waiting for confirmation');
});

export {};
