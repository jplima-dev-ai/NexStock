# Auditoria pós-publicação — v0.22.1

## Escopo

Auditoria funcional da versão 0.22.0 publicada no GitHub Pages, seguida de
correções regressivas sem avanço de fase do blueprint.

## Correções

- tradução de ocorrências visíveis de `workspace` na interface em português;
- remoção de notificações antigas durante a troca de idioma;
- localização dos fatos exibidos na Central de Segurança;
- descrição de integridade coerente com IndexedDB ou PostgreSQL/Supabase;
- incremento de versão e cache da PWA para `0.22.1`.

## Evidências

- 566 mensagens equivalentes nos três idiomas;
- 118 testes automatizados aprovados;
- validação completa de release aprovada;
- build do GitHub Pages validado;
- validação e build reproduzidos em clone limpo.

## Decisão

A fase 22 permanece concluída. A fase 23 não foi iniciada nesta rodada porque a
auditoria encontrou defeitos que exigiam uma versão corretiva. Após publicar a
v0.22.1 e confirmar a atualização do service worker, o projeto pode seguir para
a fase 23 do blueprint.
