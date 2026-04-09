const usuariosPadrao = [
  { usuario: 'Admin', email: 'admin@gmail.com', senha: '@Usuario321' },
  { usuario: 'Caio', email: 'caio@gmail.com', senha: '@Usuario321' },
  { usuario: 'Henedio', email: 'henedio@gmail.com', senha: '@Usuario321' },
  { usuario: 'user', email: 'user@gmail.com', senha: '@Usuario321' },
  { usuario: 'teste', email: 'teste@gmail.com', senha: '@Usuario321' },
];

describe('Autenticação', () => {
  it('faz login com credenciais válidas e abre o dashboard', () => {
    cy.visitarComUsuarios('login.html', usuariosPadrao);

    cy.get('#email').type('admin@gmail.com');
    cy.get('#senha').type('@Usuario321');
    cy.contains('button', 'Entrar').click();

    cy.url().should('include', 'dashboard.html');
    cy.get('#dadosUsuario').should('contain.text', 'Admin');
    cy.get('#dadosUsuario').should('contain.text', 'admin@gmail.com');
    cy.window().its('sessionStorage').invoke('getItem', 'usuarioLogado').should('eq', 'Admin');
  });

  it('bloqueia login com senha incorreta', () => {
    cy.visitarComUsuarios('login.html', usuariosPadrao);

    cy.get('#email').type('admin@gmail.com');
    cy.get('#senha').type('senhaErrada123!');
    cy.contains('button', 'Entrar').click();

    cy.url().should('include', 'login.html');
    cy.window().its('sessionStorage').invoke('getItem', 'usuarioLogado').should('be.null');
  });
});

describe('Cadastro', () => {
  it('cadastra um novo usuário com sucesso', () => {
    cy.visitarComUsuarios('cadastro.html', usuariosPadrao);

    cy.get('#usuario').type('NovoUsuario');
    cy.get('#email').type('novo.usuario@gmail.com');
    cy.get('#senha').type('Novo@12345');
    cy.contains('button', 'Cadastrar').click();

    cy.get('#mensagem').should('contain.text', 'Cadastro realizado com sucesso!');
    cy.window().then((win) => {
      const usuarios = JSON.parse(win.localStorage.getItem('usuarios') || '[]');

      expect(usuarios).to.have.length(6);
      expect(usuarios.some((usuario) => usuario.email === 'novo.usuario@gmail.com')).to.be.true;
    });
  });

  it('impede cadastro com e-mail duplicado', () => {
    cy.visitarComUsuarios('cadastro.html', usuariosPadrao);

    cy.get('#usuario').type('OutroUsuario');
    cy.get('#email').type('admin@gmail.com');
    cy.get('#senha').type('Outro@12345');
    cy.contains('button', 'Cadastrar').click();

    cy.get('#mensagem').should('contain.text', 'E-mail já cadastrado.');
    cy.window().then((win) => {
      const usuarios = JSON.parse(win.localStorage.getItem('usuarios') || '[]');

      expect(usuarios).to.have.length(5);
    });
  });
});

describe('Dashboard e listagem', () => {
  beforeEach(() => {
    cy.loginComUsuario('admin@gmail.com', '@Usuario321');
  });

  it('faz logout ao clicar em Sair', () => {
    cy.contains('button', 'Sair').click();

    cy.url().should('include', 'login.html');
    cy.window().its('sessionStorage').invoke('getItem', 'usuarioLogado').should('be.null');
  });

  it('limpa os dados cadastrados e mostra usuário deslogado', () => {
    cy.contains('button', 'Limpar Dados').click();

    cy.url().should('include', 'dashboard.html');
    cy.get('#dadosUsuario').should('contain.text', 'Usuário não autenticado');
    cy.get('#logout').should('not.be.visible');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('usuarios')).to.be.null;
    });
  });

  it('abre a página de usuários cadastrados', () => {
    cy.contains('button', 'Visualizar Usuários').click();

    cy.url().should('include', 'usuarios.html');
    cy.get('table').should('be.visible');
    cy.get('table tr').should('have.length', 6);
    cy.contains('td', 'admin@gmail.com').should('be.visible');
  });
});