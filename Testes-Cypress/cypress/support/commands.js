const usuariosPadrao = [
	{ usuario: 'Admin', email: 'admin@gmail.com', senha: '@Usuario321' },
	{ usuario: 'Caio', email: 'caio@gmail.com', senha: '@Usuario321' },
	{ usuario: 'Henedio', email: 'henedio@gmail.com', senha: '@Usuario321' },
	{ usuario: 'user', email: 'user@gmail.com', senha: '@Usuario321' },
	{ usuario: 'teste', email: 'teste@gmail.com', senha: '@Usuario321' },
];

Cypress.Commands.add('visitarComUsuarios', (pagina = 'login.html', usuarios = usuariosPadrao) => {
	cy.visit(pagina, {
		onBeforeLoad(win) {
			win.localStorage.setItem('usuarios', JSON.stringify(usuarios));
			win.sessionStorage.clear();
			win.alert = () => {};
		},
	});
});

Cypress.Commands.add('loginComUsuario', (email, senha, usuarios = usuariosPadrao) => {
	cy.visitarComUsuarios('login.html', usuarios);
	cy.get('#email').clear().type(email);
	cy.get('#senha').clear().type(senha);
	cy.contains('button', 'Entrar').click();
});