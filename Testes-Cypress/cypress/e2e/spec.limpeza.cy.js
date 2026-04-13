describe('Limpeza de cadastros', () => {
  it('faz cadastro, login e limpa os dados', () => {
    const novoUsuario = {
      usuario: 'FluxoLimpeza',
      email: 'fluxo.limpeza@gmail.com',
      senha: 'Fluxo@123',
    };

    cy.visitarComUsuarios('cadastro.html', []);

    cy.get('#usuario').type(novoUsuario.usuario);
    cy.get('#email').type(novoUsuario.email);
    cy.get('#senha').type(novoUsuario.senha);
    cy.contains('button', 'Cadastrar').click();

    cy.get('#mensagem').should('contain.text', 'Cadastro realizado com sucesso!');
    cy.window().then((win) => {
      const usuarios = JSON.parse(win.localStorage.getItem('usuarios') || '[]');

      expect(usuarios).to.have.length(1);
      expect(usuarios[0].email).to.eq(novoUsuario.email);
    });

    cy.get('#mensagem a').click();
    cy.url().should('include', 'login.html');

    cy.get('#email').type(novoUsuario.email);
    cy.get('#senha').type(novoUsuario.senha);
    cy.contains('button', 'Entrar').click();

    cy.url().should('include', 'dashboard.html');
    cy.get('#dadosUsuario').should('contain.text', novoUsuario.usuario);

    cy.contains('button', 'Limpar Dados').click();

    cy.url().should('include', 'dashboard.html');

    cy.window().then((win) => {
      expect(win.localStorage.getItem('usuarios')).to.be.null;
    });

    cy.get('#dadosUsuario').should('contain.text', 'Usuário não autenticado');
    cy.get('#logout').should('not.be.visible');
  });
});
