# Ciclo 071 — UX Refinement

Fase 71. Release alvo: v1.9.0 Professional Polish. A revisão dos fluxos de
onboarding, cadastro de produto, movimentação, simulação, configurações,
backup, offline e troca de idioma identificou um atrito no cadastro: uma falha
de produto podia ser apresentada como falha de imagem. O formulário agora
expõe um resumo focável dos campos inválidos, com links que levam ao controle
correspondente, e usa a mensagem correta para erros de produto.

Não há mudança de modelo, migração, escrita adicional, regra de estoque,
AuditLog, IndexedDB, backup/restauração, PWA ou GitHub Pages. A validação de
imagem continua local e a descrição continua obrigatória quando há arquivo.

## Gate

APROVADO — nenhum fluxo central possui atrito grave conhecido.
