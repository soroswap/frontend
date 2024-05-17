// cypress/integration/navigation.ts

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