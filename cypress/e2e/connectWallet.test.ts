// cypress/integration/connectWallet.ts

describe('Connect Wallet', () => {
  it('should log the wallet', () => {
    cy.visit('/', {
      onBeforeLoad: (win: any) => {
        win.freighter = {
          isConnected: () => true,
          getPublicKey: () =>
            Promise.resolve('GCHR5WWPDFF3U3HP2NA6TI6FCQPYEWS3UOPIPJKZLAAFM57CEG4ZYBWP'),
          signTransaction: () => Promise.resolve('signedTransaction'),
          connect: () => console.log("GG"),
          getAddress: () => console.log("GG"),
          requestAccess: () => console.log("GG")
          // Add other methods as needed
        };

        // Create a spy on console.log
        cy.spy(win.console, 'log').as('consoleLog');
      },
    });
    
    // Click the wallet button to open the modal
    cy.get('[data-testid="wallet-button"]').click();
    
    // Get the shadow root of the stellar-wallets-modal
    cy.get('stellar-wallets-modal')
      .shadow()
      .find('dialog.dialog-modal')
      .should('be.visible');

    // Find and click the Freighter wallet option inside the shadow DOM
    cy.get('stellar-wallets-modal')
      .shadow()
      .find('.wallets-body__item')
      .contains('Freighter')
      .should('be.visible')
      .click();
    
    // // Verify the console logs
    // cy.get('@consoleLog').should('have.been.calledWithMatch', 'wallet');
  });
});
