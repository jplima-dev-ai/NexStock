# Publicação no GitHub Pages

## Pré-requisitos

- repositório GitHub conectado ao projeto;
- branch principal chamada `main`;
- GitHub Pages configurado para usar GitHub Actions como origem;
- GitHub Actions habilitado no repositório.

## Pipeline

O arquivo `.github/workflows/pages.yml` executa automaticamente:

1. checkout limpo do repositório;
2. configuração do Node.js 22;
3. suíte completa com `npm run validate`;
4. geração do artefato com `npm run build:pages`;
5. validação do artefato com `npm run validate:pages`;
6. upload exclusivo da pasta `_site`;
7. publicação no ambiente protegido `github-pages`.

O deploy acontece em cada envio para `main` e também pode ser iniciado manualmente na página Actions do GitHub.

## Configuração inicial no GitHub

1. Abra o repositório.
2. Entre em “Settings”.
3. Entre em “Pages”.
4. Em “Build and deployment”, selecione “GitHub Actions” como origem.
5. Envie a versão validada para a branch `main`.
6. Acompanhe o workflow “Validate and deploy GitHub Pages”.

## Validação pública

Depois do primeiro deploy:

1. abra a URL informada pelo job de publicação;
2. confirme que a tela de boas-vindas aparece;
3. altere o idioma entre português, inglês e espanhol;
4. crie um espaço de trabalho e um produto de teste;
5. recarregue a página e confirme que os dados locais permanecem;
6. coloque o navegador offline e recarregue a aplicação;
7. use a opção do navegador para instalar o NexStock;
8. abra o aplicativo instalado e confirme que ele inicia dentro do escopo correto.

## Segurança do workflow

O job de validação possui somente leitura do conteúdo. As permissões `pages: write` e `id-token: write` existem apenas no job de deploy. Nenhum token, segredo administrativo ou chave Supabase é incluído no artefato público.
