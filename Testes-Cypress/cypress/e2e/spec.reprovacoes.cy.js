const usuariosPadrao = [
    { usuario: 'Admin', email: 'admin@gmail.com', senha: '@Usuario321' },
    { usuario: 'Caio', email: 'caio@gmail.com', senha: '@Usuario321' },
    { usuario: 'Henedio', email: 'henedio@gmail.com', senha: '@Usuario321' },
    { usuario: 'user', email: 'user@gmail.com', senha: '@Usuario321' },
    { usuario: 'teste', email: 'teste@gmail.com', senha: '@Usuario321' },
];

const dadosValidos = {
    usuario: 'Caio',
    email: 'henediodeteste@gmail.com',
    senha: 'Senha@123',
};

function tentarCadastro(overrides = {}) {
    const dados = { ...dadosValidos, ...overrides };

    cy.visitarComUsuarios('cadastro.html', usuariosPadrao);
    cy.get('#usuario').clear().type(dados.usuario);
    cy.get('#email').clear().type(dados.email);
    cy.get('#senha').clear().type(dados.senha);
    cy.contains('button', 'Cadastrar').click();
}

describe('Cadastro - validações de reprovação', () => {
    const cenarios = [
                {
            nome: 'Erro por preencher apenas senha',
            overrides: { usuario: ' ', email: ' ', senha: '12345' },
            mensagem: 'Preencha todos os campos.',
        },
                        {
            nome: 'Erro por preencher apenas nome e senha',
            overrides: { usuario: 'User', email: ' ', senha: '12345' },
            mensagem: 'Preencha todos os campos.',
        },
        {
                    nome: 'Erro por preencher apenas e-mail e senha',
            overrides: { usuario: ' ', email: 'user@gmail.com', senha: '12345' },
            mensagem: 'Preencha todos os campos.',
        },

        {
            nome: 'reprova usuário com menos de 3 caracteres',
            overrides: { usuario: 'ch' },
            mensagem: 'Usuário muito curto.',
        },
        {
            nome: 'reprova usuário com espaço',
            overrides: { usuario: 'novo usuario' },
            mensagem: 'Usuário não pode ter espaços.',
        },
        {
            nome: 'reprova e-mail com espaço',
            overrides: { email: 'novo usuario@gmail.com' },
            mensagem: 'E-mail não pode ter espaços.',
        },
        {
            nome: 'reprova e-mail sem arroba',
            overrides: { email: 'novousuariogmail.com' },
            mensagem: 'E-mail inválido.',
        },
        {
            nome: 'reprova formato de e-mail sem domínio final',
            overrides: { email: 'novo@usuario' },
            mensagem: 'Formato de e-mail inválido.',
        },
        {
            nome: 'reprova e-mail já cadastrado',
            overrides: { email: 'admin@gmail.com' },
            mensagem: 'E-mail já cadastrado.',
        },
        {
            nome: 'reprova senha sem número',
            overrides: { usuario: 'Caiaovieira', email: 'henediowoawod@gmail.com', senha: 'Senhasem@' },
            mensagem: 'Senha precisa de número',
        },
        {
            nome: 'reprova senha sem maiúscula',
            overrides: { usuario: 'Henedio', email: 'Caioehenedio@gmail.com', senha: 'senha@123' },
            mensagem: 'Senha precisa de letra maiúscula.',
        },
        {
            nome: 'reprova senha sem caractere especial',
            overrides: { usuario: 'CAAAAAAIIO', email: 'henediotestando@gmail.com', senha: 'Senha123' },
            mensagem: 'Senha precisa de caractere especial.',
        },
        {
            nome: 'reprova senha contendo o usuário',
            overrides: { usuario: 'Caio', senha: 'Caio@321' },
            mensagem: 'Senha não pode conter o usuário.',
        },
                {
            nome: 'reprova senha curta',
            overrides: { usuario: 'Henedio', email: 'Caiiiio@gmail.com', senha: '1234' },
            mensagem: 'Senha muito curta.',
        },
        
    ];

    cenarios.forEach(({ nome, overrides, mensagem }) => {
        it(nome, () => {
            tentarCadastro(overrides);
            
            cy.get('#mensagem').should('contain.text', mensagem);
            cy.get('#mensagem').should('have.class', 'erro');
            cy.window().then((win) => {
                const usuarios = JSON.parse(win.localStorage.getItem('usuarios') || '[]');
            
                expect(usuarios).to.have.length(5);
            });
        });
    });
});