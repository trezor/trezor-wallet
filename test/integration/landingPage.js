describe('Landing Page', () => {
    beforeEach(() => {
        cy.visit('http://localhost:8081/#/');
        cy.get('[data-test=beta-disclaimer-button]').click();
    });

    it('top menu', () => {
        cy.get('[data-test=top-menu]')
            .should('be.visible')
            .matchImageSnapshot();
    });

    it('main text', () => {
        cy.get('[data-test=landing-main-title]')
            .should('be.visible')
            .matchImageSnapshot();
    });

    it('footer', () => {
        cy.get('[data-test=footer]')
            .should('be.visible')
            .matchImageSnapshot();
    });
});