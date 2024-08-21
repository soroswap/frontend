// cypress/integration/navigation.ts


//Bridge flow
describe('Bridge flow', () => {
  it('should render the disclaimer', () => {
    cy.visit('/bridge');
    cy.contains('Disclaimer');
  });

  it('should show the content of the disclaimer', () => {
    cy.visit('/bridge');
    cy.get('[data-testid="swap-details-header-row"]').click();
    cy.contains('Bridge Fee: Currently zero fee');
  });
});

// Swap flow
describe('Select tokens & input amount', () => {
  it('should navigate to swap', () => {
    cy.visit('/swap');
    cy.contains('You sell');
  });
  it('should select token in', () => {
    cy.visit('/swap');
    cy.get('[data-testid="swap__input__panel"]').within(() => {
      cy.get('[data-testid="swap__token__select"]').click();
    });
    cy.get('[data-testid="token-search-input"]').type('usdc');
    cy.get('[data-testid="currency__list__USDC"]').click();
  });
  it('should select token out', () => {
    cy.visit('/swap');
    cy.get('[data-testid="swap__output__panel"]').within(() => {
      cy.get('[data-testid="swap__token__select"]').click();
    });
    cy.get('[data-testid="token-search-input"]').type('xlm');
    cy.get('[data-testid="currency__list__XLM"]').click();
  });
  it('should type an input amount & wait for output amount', () => {
    cy.visit('/swap');
    //Select input asset
    cy.get('[data-testid="swap__input__panel"]').within(() => {
      cy.get('[data-testid="swap__token__select"]').click();
    });
    cy.get('[data-testid="token-search-input"]').type('usdc');
    cy.get('[data-testid="currency__list__USDC"]').click();

    //Select output asset
    cy.get('[data-testid="swap__output__panel"]').within(() => {
      cy.get('[data-testid="swap__token__select"]').click();
    });
    cy.get('[data-testid="currency__list__XLM"]').click();

    //Input amount
    cy.get('[data-testid="swap__input__panel"]').within(() => {
      cy.get('.token-amount-input').type('32456');
    });
    //await for calcs
    cy.wait(5000);

    //Get the output amount
    cy.get('[data-testid="swap__output__panel"]').within(() => {
      cy.get('.token-amount-input').invoke('val').as('outputAmount');
    });
    cy.get('@outputAmount').should('not.be.empty');
    cy.get('@outputAmount').should('have.length.greaterThan', 7);
  });
  it('should display more details of the swap in dropdown', () => {
    cy.visit('/swap');
    //Select input asset
    cy.get('[data-testid="swap__input__panel"]').within(() => {
      cy.get('[data-testid="swap__token__select"]').click();
    });
    cy.get('[data-testid="token-search-input"]').type('usdc');
    cy.get('[data-testid="currency__list__USDC"]').click();

    //Select output asset
    cy.get('[data-testid="swap__output__panel"]').within(() => {
      cy.get('[data-testid="swap__token__select"]').click();
    });
    cy.get('[data-testid="currency__list__XLM"]').click();

    //Input amount
    cy.get('[data-testid="swap__input__panel"]').within(() => {
      cy.get('.token-amount-input').type('32456');
    });

    //await for calcs
    cy.wait(2500);

    //Get the output amount
    cy.get('[data-testid="swap-output-input-panel"]').invoke('val').as('outputAmount');

    cy.get('@outputAmount').should('not.be.empty');
    cy.get('@outputAmount').should('have.length.greaterThan', 7);

    //Show more details
    cy.get('[data-testid="swap-details-header-row"]').click();

    cy.contains('Price Impact');
    cy.contains('Expected output');
    cy.contains('Path');

    cy.get('[data-testid="swap__details__priceImpact"]').as('priceImpact');
    cy.get('[data-testid="swap__details__expectedOutput"]').as('expectedOutput');
    cy.get('[data-testid="swap__details__path"]').as('path');

    cy.get('@priceImpact').should('exist');
    cy.get('@expectedOutput').should('exist');
    cy.get('@path').should('exist');
    cy.contains('Price Impact')
    cy.contains('Expected output')
    cy.contains('Path')
    
    cy.get('[data-testid="swap__details__priceImpact"]').as('priceImpact')
    cy.get('[data-testid="swap__details__expectedOutput"]').as('expectedOutput')
    cy.get('[data-testid="swap__details__path"]').as('path')
    cy.get('[data-testid="swap__details__platform"]').as('platform')
    
    cy.get('@priceImpact').should('exist')
    cy.get('@expectedOutput').should('exist')
    cy.get('@path').should('exist')
    cy.get('@platform').should('exist')

    cy.get('@priceImpact').contains('%');
    cy.get('@expectedOutput').contains('XLM');
    cy.get('@path').contains('XLM');
    cy.get('@path').contains('USDC');
  });
});

describe('Input & output amount validation', () => {
  it('should type an input amount & wait for output amount', () => {
    cy.visit('/swap');
    //Select output asset
    cy.get('[data-testid="swap__output__panel"]').within(() => {
      cy.get('[data-testid="swap__token__select"]').click();
    });
    cy.get('[data-testid="token-search-input"]').type('usdc');
    cy.get('[data-testid="currency__list__USDC"]').click();

    //Input amount
    cy.get('[data-testid="swap__input__panel"]').within(() => {
      cy.get('.token-amount-input').type('1');
    });
    //await for calcs
    cy.wait(5000);
    cy.screenshot()
    //Get the output amount
    cy.get('[data-testid="swap-output-input-panel"]').invoke('val').as('outputAmount');
    //Get the input amount
    cy.get('[data-testid="swap-input-input-panel"]').invoke('val').as('inputAmount');

    //Validate type in
    cy.get('@inputAmount').should('eq', '1');
    
    cy.get('[data-testid="swap-output-input-panel"]').invoke('val')
    .then((outputAmount: any) => {
       //reselect input asset
      cy.get('[data-testid="swap__input__panel"]').within(() => {
        cy.get('[data-testid="swap__token__select"]').click();
      });
      cy.get('[data-testid="token-search-input"]').type('usdc');
      cy.get('[data-testid="currency__list__USDC"]').click();
       //Input amount
      cy.get('[data-testid="swap__output__panel"]').within(() => {
        cy.get('.token-amount-input').type('{backspace}');
        cy.get('.token-amount-input').type('{backspace}');
        cy.get('.token-amount-input').type('1');
      });
      cy.wait(2500);
      cy.screenshot()
      cy.get('[data-testid="swap-input-input-panel"]').invoke('val').then((inputAmount: any)=>{
        const belowOutput = Math.floor(parseFloat(outputAmount) * 0.5);
        const aboveOutput = Math.ceil(parseFloat(outputAmount) * 1.5);
        expect(parseFloat(inputAmount)).within(belowOutput, aboveOutput)
      })
    })

  })
});

describe('Slippage tolerance config', ()=>{
  it('should change slippage tolerance', ()=>{
    cy.visit('/swap');
    cy.get('[data-testid="open-settings-dialog-button"]').click();
    cy.get('[data-testid="max-slippage-settings"]').click();
    cy.get('[data-testid="slippage-input"]').type('1.05');
    cy.get('[data-testid="max-slippage-settings"]').contains('1.05%');
  })
  it('Show display an alert if slippage is too high', ()=>{
    cy.visit('/swap');
    cy.get('[data-testid="open-settings-dialog-button"]').click();
    cy.get('[data-testid="max-slippage-settings"]').click();
    cy.get('[data-testid="slippage-input"]').type('10');
    cy.get('[data-testid="max-slippage-settings"]').contains('10%');
    cy.get('[data-testid="slippage-alert"]').should('exist');
    cy.get('[data-testid="slippage-alert-too-high"]').should('exist');
  })
  it('Show display an alert if slippage is too low', ()=>{
    cy.visit('/swap');
    cy.get('[data-testid="open-settings-dialog-button"]').click();
    cy.get('[data-testid="max-slippage-settings"]').click();
    cy.get('[data-testid="slippage-input"]').type('0.01');
    cy.get('[data-testid="max-slippage-settings"]').contains('0.01%');
    cy.get('[data-testid="slippage-alert"]').should('exist');
    cy.get('[data-testid="slippage-alert-too-low"]').should('exist');
  })
  it('should keep the slippage tolerance after closing the settings', ()=>{
    cy.visit('/swap');
    cy.get('[data-testid="open-settings-dialog-button"]').click();
    cy.get('[data-testid="max-slippage-settings"]').click();
    cy.get('[data-testid="slippage-input"]').type('1.05');
    cy.get('[data-testid="open-settings-dialog-button"]').click();
    cy.get('[data-testid="max-slippage-settings"]').should('not.exist');
    cy.get('[data-testid="open-settings-dialog-button"]').click();
    cy.get('[data-testid="max-slippage-settings"]').should('exist')
    cy.get('[data-testid="max-slippage-settings"]').contains('1.05%');
  })
  it('Should set the slippage tolerance to auto when pressing "auto" button', ()=>{
    cy.visit('/swap');
    cy.get('[data-testid="open-settings-dialog-button"]').click();
    cy.get('[data-testid="max-slippage-settings"]').click();
    cy.get('[data-testid="slippage-input"]').type('1.05');
    cy.get('[data-testid="max-slippage-settings"]').contains('1.05%');
    cy.get('[data-testid="slippage-auto-button"]').click();
    cy.get('[data-testid="max-slippage-settings"]').contains('Auto');
  })
})
// Navigation flow
describe('Navigation flow', () => {
  it('should render the navbar', () => {
    cy.visit('/');
    const navbar = cy.get('[data-testid="navbar__container"]');
    navbar.should('exist');
  });
  it('should navigate to balances', () => {
    cy.visit('/');
    cy.get('[data-testid="navbar__container"]').click();
    cy.wait(500);
    cy.contains('Balance').click();
    cy.wait(1500);
    cy.contains("Your token's balance:");
  });
  it('should navigate to swap', () => {
    cy.visit('/bridge');
    cy.get('[data-testid="navbar__container"]').click();
    cy.wait(500);
    cy.contains('Swap').click();
    cy.wait(1500);
    cy.contains('You sell');
  });
  it('should navigate to liquidity', () => {
    cy.visit('/');
    cy.get('[data-testid="navbar__container"]').click();
    cy.wait(500);
    cy.contains('Liquidity').click();
    cy.wait(1500);
    cy.contains('List of your liquidity positions');
  });
  it('should navigate to bridge', () => {
    cy.visit('/');
    cy.get('[data-testid="navbar__container"]').click();
    cy.wait(500);
    cy.contains('Bridge').click();
    cy.wait(1500);
    cy.contains('Disclaimer');
  });
  it('should navigate to info', () => {
    cy.visit('/');
    cy.get('[data-testid="navbar__container"]').click();
    cy.wait(500);
    cy.contains('Info').click();
    cy.wait(1500);
    cy.url().should('match', /https:\/\/info\.soroswap\.finance\//);
  });
});
