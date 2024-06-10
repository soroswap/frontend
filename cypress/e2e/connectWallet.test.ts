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
          // Add other methods as needed
        };

        // Create a spy on console.log
        cy.spy(win.console, 'log').as('consoleLog');
      },
    });
    cy.get('[data-testid="primary-button"]').click();
    cy.contains('Detected');
    cy.contains('Freighter Wallet').click();
    cy.get('@consoleLog').should('have.been.calledWithMatch', 'wallet');
    cy.get('@consoleLog').should('have.been.calledWithMatch', 'Changing connector to ');

    // Get the window object
    cy.window().then((win: any) => {
      // Get the spy from the window object
      const consoleLog = win.console.log;
      var logs = [];
      for (let i = 0; i < consoleLog.callCount; i++) {
        // Get the i-th call to the spy
        const call = consoleLog.getCall(i);

        // Get the arguments of the call
        const callArgs = call.args;

        // Log the arguments using cy.log()
        cy.log(`Call ${i} args: ${JSON.stringify(callArgs)}`);
        console.log(`Call ${i} args: ${JSON.stringify(callArgs)}`);
        logs.push(`Call ${i} args: ${JSON.stringify(callArgs)}`);
      }
      //write logs to a file on cypress/logs/logs.txt
      cy.writeFile('cypress/logs/logs.txt', logs.join('\n'));
      cy.screenshot();
    });
    // cy.contains('Public Key: publicKey')
  });
});
