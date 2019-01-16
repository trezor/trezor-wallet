describe('Not initialized page', () => {
    beforeEach(() => {
        cy.viewport(1366, 768);
        cy.visit('/');
    });

    it('header', () => {
        cy.getTestElement('Main__page__device__header')
            .should('be.visible')
            .matchImageSnapshot();
    });

    it('body', () => {
        cy.getTestElement('Page__device__not__initialized')
            .should('be.visible')
            .matchImageSnapshot();
    });
});