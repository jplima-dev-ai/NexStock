# Ciclo 075 — Data Upgrade Certification

Fase 75. Release alvo: v2.0.0 Calm Intelligence. Um fixture de workspace
v1.0.0 representa dados históricos de workspace, categoria, fornecedor,
produto, movimento, auditoria e configuração. A certificação valida o backup
legado e o resultado atual, exige a mesma identidade e compara cada registro
anterior por store e identificador. Ausência ou alteração de um dado legado
interrompe o processo com erro explícito.

As migrações IndexedDB permanecem exclusivamente aditivas. Não há escrita sobre
o workspace durante a certificação, migração de conteúdo, remoção de stores,
alteração de Blob de mídia, mudança de backup/restauração, rede obrigatória ou
dependência de backend. O teste também confirma falhas para movimento removido
e quantidade de produto alterada silenciosamente.

## Gate

APROVADO — workspace v1.0.0 → estrutura atual sem perda silenciosa.
