# Política do Release Candidate 2.0

O NexStock está no release candidate `2.0.0-rc.1`. A Fase 77 congela
funcionalidades até a Fase 78 formalizar — ou reprovar — a versão `2.0.0`.

## Alterações permitidas

Somente as categorias abaixo são permitidas no candidato:

- bug;
- segurança;
- acessibilidade;
- performance;
- regressão;
- copy.

Uma alteração deve preservar os contratos local-first, IndexedDB, PWA offline,
GitHub Pages, NexShield, NexCopy e NexMotion. Ela não pode introduzir dependência
de runtime, backend obrigatório, segredo no cliente, nova coleta de dados ou
mudança de domínio sem reabrir o planejamento e registrar ADR quando aplicável.

## Controle de versão e gate

`package.json`, `js/core/version.js` e `service-worker.js` usam exatamente
`2.0.0-rc.1`; o cache PWA é versionado com o mesmo identificador. O gate
`validate:phase-77` exige essa coerência e esta política. A CI executa o gate
em cada publicação para GitHub Pages.

A versão final continua reservada à Fase 78 e depende dos 40 itens do checklist
do blueprint v1.2. Nenhuma aprovação desta fase transforma o RC em release
estável.
