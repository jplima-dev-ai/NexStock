# Modelo de segurança

## Escopo

O NexStock descreve controles verificáveis e não promete segurança absoluta.
O modelo protege integridade de estoque, isolamento de dados, conteúdo exibido
e configuração do provider.

## Controles

- NexShield valida quantidade, relações e regras de domínio.
- Texto não confiável entra pela propriedade `textContent`.
- URLs externas aceitam apenas HTTP e HTTPS.
- NexCode, serial e lote possuem regras de unicidade.
- Movimentações gravam produto, movimento e auditoria atomicamente.
- IndexedDB isola dados por espaço de trabalho.
- PostgreSQL usa constraints compostas, RLS, papéis e RPC transacional.
- O frontend rejeita conexões HTTP e chaves administrativas do Supabase.
- A política CSP bloqueia scripts inline, objetos e origens não declaradas.

## Shield Test Mode

A rota `#/shield-test` executa cinco testes em memória: estoque negativo,
NexCode duplicado, serial duplicado, HTML não confiável e URL perigosa. O modo
não recebe o DataProvider e não grava no espaço de trabalho real.

## Segredos

Nunca coloque service-role, senha, token administrativo ou segredo no HTML,
JavaScript, repositório ou captura de tela.
