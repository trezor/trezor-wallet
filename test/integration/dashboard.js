describe('Dashboard page', () => {
    beforeEach(() => {
        cy.viewport(1366, 768);
        cy.visit('/');
    });

    it('header', () => {
        cy.getTestElement('Main__page__device__header')
            .should('be.visible')
            .matchImageSnapshot();
    });

    it('content', () => {
        cy.getTestElement('Dashboard__page__content')
            .should('be.visible')
            .matchImageSnapshot();
    });
});