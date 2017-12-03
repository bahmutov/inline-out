it('works', () => {
  cy.visit('test/index.html')
  cy
    .window()
    .its('foo')
    .should('be.a', 'function')
  cy
    .window()
    .invoke('foo')
    .should('equal', 'foo')
})
