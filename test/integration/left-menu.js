describe('Left Menu', () => {
    // beforeEach(() => {
    //     cy.getTestElement('Modal__disclaimer__button__confirm').click();
    // });

    it('divider', () => {
        cy.getTestElement('Main__page__coin__menu__divider')
            .should('be.visible')
            .matchImageSnapshot();
    });
});