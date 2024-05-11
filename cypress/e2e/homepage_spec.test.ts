// cypress/integration/homepage_spec.ts

describe('Homepage', () => {
    it('should load successfully', () => {
      cy.visit('/') // visit the homepage
  
      // replace 'Your App' with an actual text or element on your homepage
      cy.contains('Swap') // check if the text 'Swap' is on the page
    })
    it('should show the connect wallet modal with all wallets', () => {
      cy.visit('/')
      cy.get('[data-testid="primary-button"]').click().then(() => {
        console.log('Button was clicked');
      });;
      cy.contains('Freighter Wallet')
      cy.contains('XBull Wallet')
      cy.contains('Lobstr Wallet')
    })
  })