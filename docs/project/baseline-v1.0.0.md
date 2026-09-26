# Baseline reproduzível do NexStock v1.0.0

## Escopo congelado

A versão `1.0.0` é a base funcional para a jornada do blueprint v1.2. O código
continua local-first, utiliza IndexedDB como provider padrão, aceita Supabase
somente como provider opcional e gera um site estático compatível com GitHub
Pages.

## Fontes canônicas

1. `NEXSTOCK-BLUEPRINT-v1.2.md`, com precedência para a evolução pós-1.0.
2. `NEXSTOCK-BLUEPRINT-v1.1.md`, preservado para requisitos não alterados.
3. ADRs, CHANGELOG, testes e documentação técnica do repositório.

## Reprodução local

Pré-requisito: Node.js 20 ou superior.

```bash
npm test
npm run validate
npm run build:pages
npm run validate:pages
npm run verify:clean
```

O último comando cria um repositório temporário limpo, executa a validação,
gera o artefato estático e valida o pacote de GitHub Pages.

## Estado verificado na Fase 25

- 120 testes automatizados aprovados.
- validação integrada aprovada, incluindo domínio, i18n, acessibilidade
  estrutural, PWA, segurança, responsividade e banco;
- build estático e validação do artefato aprovados;
- clone limpo reproduzível aprovado;
- versões de `package.json`, núcleo, service worker e cache alinhadas em
  `1.0.0`;
- ambos os blueprints presentes no repositório.

## Limitações da evidência

- O ambiente automatizado não executa NVDA, JAWS, Narrator, VoiceOver,
  TalkBack ou Orca.
- A integração Supabase real depende de projeto e credenciais públicas do
  titular; a baseline valida contrato, configuração, mapeamento e SQL.
- O deploy externo permanece responsabilidade do repositório conectado ao
  GitHub Pages.

Esses limites não foram convertidos em aprovação. A Fase 26 adicionará execução
E2E em navegador real, axe e fluxos de IndexedDB, idiomas, temas, teclado e
offline.
