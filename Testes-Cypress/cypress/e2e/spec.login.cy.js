const usuariosIndex = [
    { usuario: 'Admin', email: 'admin@gmail.com', senha: '@Usuario321' },
    { usuario: 'Caio', email: 'caio@gmail.com', senha: '@Usuario321' },
    { usuario: 'Henedio', email: 'henedio@gmail.com', senha: '@Usuario321' },
    { usuario: 'user', email: 'user@gmail.com', senha: '@Usuario321' },
    { usuario: 'teste', email: 'teste@gmail.com', senha: '@Usuario321' },
];

function acessarLoginComCadastrosDaIndex() {
    cy.visit('index.html');
    cy.url({ timeout: 8000 }).should('include', 'login.html');
    cy.window().then((win) => {
        const usuarios = JSON.parse(win.localStorage.getItem('usuarios') || '[]');

        expect(usuarios).to.have.length(5);
        expect(usuarios.map((usuario) => usuario.email)).to.deep.equal(
            usuariosIndex.map((usuario) => usuario.email)
        );
    });
}

describe('Login com cadastros da index', () => {
    beforeEach(() => {
        acessarLoginComCadastrosDaIndex();
    });

    it('autentica um usuário cadastrado automaticamente pelo index', () => {
        cy.get('#email').clear().type('admin@gmail.com');
        cy.get('#senha').clear().type('@Usuario321');
        cy.contains('button', 'Entrar').click();

        cy.url().should('include', 'dashboard.html');
        cy.window().its('sessionStorage').invoke('getItem', 'usuarioLogado').should('eq', 'Admin');
        cy.get('#dadosUsuario').should('contain.text', 'Admin');
        cy.get('#dadosUsuario').should('contain.text', 'admin@gmail.com');
    });

    it('reprova login com senha incorreta de um usuário cadastrado', () => {
        cy.get('#email').clear().type('caio@gmail.com');
        cy.get('#senha').clear().type('senhaErrada123!');
        cy.contains('button', 'Entrar').click();

        cy.url().should('include', 'login.html');
        cy.window().its('sessionStorage').invoke('getItem', 'usuarioLogado').should('be.null');
    });
});