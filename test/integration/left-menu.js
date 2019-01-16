describe('Left Menu', () => {
    beforeEach(() => {
        cy.visit('https://localhost:8080/#/');
        cy.getTestElement('Modal__disclaimer__button__confirm').click();
    });

    it('divider', () => {
        cy.getTestElement('Main__page__coin__menu__divider')
            .should('be.visible')
            .matchImageSnapshot();
    });
});