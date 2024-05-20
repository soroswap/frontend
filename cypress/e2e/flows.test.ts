// cypress/integration/navigation.ts


//Bridge flow
describe('Bridge flow', () => {
  it('should render the disclaimer', () => {
    cy.visit('/bridge')
    cy.contains('Disclaimer')
  })

  it('should show the content of the disclaimer', () => {
    cy.visit('/bridge')
    cy.get('[data-testid="swap-details-header-row"]').click()
    cy.contains('Bridge Fee: Currently zero fee')
  })
})

// Swap flow
describe('Select tokens & input ammount', () => {
  it('should select token in, select token out and type an input ammount', () => {
    cy.visit('/swap')
    //Select input asset
    cy.get('[data-testid="swap__input__panel"]').within(()=>{
      cy.get('[data-testid="swap__token__select"]').click()
    })
    cy.get('[data-testid="currency__list__XRP"]').click()

    //Select output asset
    cy.get('[data-testid="swap__output__panel"]').within(()=>{
      cy.get('[data-testid="swap__token__select"]').click()
    })
    cy.get('[data-testid="currency__list__XLM"]').click()

    //Output amount
    cy.get('[data-testid="swap__output__panel"]').within(()=>{
      cy.get('.token-amount-input').type('56789')
    })

    //Input amount
    cy.get('[data-testid="swap__input__panel"]').within(()=>{
      cy.get('.token-amount-input').type('32456')
    })


    cy.screenshot()
  })
})


// Navigation flow
describe('Navigation flow', () => {
  it('should render the navbar', () => {
    cy.visit('/')
    const navbar = cy.get('[data-testid="navbar__container"]')
    navbar.should('exist')
  })
  it('should navigate to balances', () => {
    cy.visit('/')
    cy.get('[data-testid="balance__link"]').click()
    cy.wait(1500)
    cy.contains("Your token's balance:")
  })
  it('should navigate to swap', () => {
    cy.visit('/')
    cy.get('a[href*="/swap"]').click()
    cy.wait(1500)
    cy.contains('You sell')
    //Probar botones, dropdown y modal
  })
  it('should navigate to liquidity', () => {
    cy.visit('/')
    cy.get('a[href*="/liquidity"]').click()
    cy.wait(1500)
    cy.contains('List of your liquidity positions')
  })
  it('should navigate to bridge', () => {
    cy.visit('/')
    cy.get('a[href*="/bridge"]').click()
    cy.wait(1500)
    cy.contains('Disclaimer')
    //Probar abrir disclaimer y buscar links
  })
  it('should navigate to info', () => {
    cy.visit('/')
    cy.get('a[href*="https://info.soroswap.finance"]').click()
    cy.wait(1500)
    cy.url().should('eq', 'https://info.soroswap.finance/?network=mainnet')
  })
})