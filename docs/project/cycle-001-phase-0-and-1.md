# Ciclo 001: Fases 0 e 1

Data: 18 de setembro de 2026.

## Fase

Fase 0: Governança. Fase 1: Fundação técnica.

## Objetivo do ciclo

Transformar o blueprint e os assets fornecidos em um projeto governado e em uma
fundação executável, navegável por hash e segura para hospedagem em subdiretório.

## Alterações

- Criado o repositório e a estrutura inicial definida pelo blueprint.
- Adicionados README, changelog, contribuição, licença e backlog governado.
- Registrada em ADR a adoção explícita do pacote de marca v1.2 recebido.
- Preservados os assets oficiais e seus hashes.
- Criados shell semântico, Skip Link, navegação principal e região de conteúdo.
- Implementadas todas as rotas previstas, incluindo parâmetros de produto.
- Implementados Store e EventBus mínimos.
- Adicionado gerenciamento de título, foco e rota não encontrada.
- Adicionados testes unitários, integração HTTP e validação estática.

## Arquivos modificados

Os arquivos novos estão em `index.html`, `css/`, `js/`, `scripts/`, `tests/` e
`docs/`, além dos documentos canônicos na raiz. Os assets foram extraídos do
pacote oficial sem alteração de bytes.

## Testes executados

- `npm run validate`.
- Verificação de sintaxe de todos os arquivos JavaScript e MJS.
- `git diff --check`.
- `sha256sum -c docs/SHA256SUMS.txt`.
- Inspeção de tipo, dimensões e canais de imagem com `file`.

## Testes aprovados

- Oito de oito testes automatizados aprovados.
- Aplicação e módulo principal servidos com HTTP 200 sob `/nexstock/`.
- Recurso inexistente respondeu HTTP 404.
- Todas as rotas estáticas e dinâmicas previstas foram resolvidas.
- Entrada de rota com percent-encoding inválido foi rejeitada sem exceção.
- Todos os hashes do pacote visual foram aprovados.
- Logos, mascote e símbolos confirmados como PNG RGBA nas dimensões declaradas.
- Arquivos JavaScript passaram na verificação de sintaxe.
- Nenhum erro de whitespace foi identificado no diff.

## Bugs encontrados

O primeiro código do roteador poderia lançar exceção diante de um parâmetro com
percent-encoding inválido. A causa era o uso direto de `decodeURIComponent`.
Foi corrigido por rejeição segura da rota e protegido com teste de regressão.

Um anúncio em live region duplicaria potencialmente o título focado após a
navegação. O anúncio foi removido nesta fase; a região permanece disponível para
mudanças futuras que realmente necessitem dela.

## Pendências

- Integração visual completa dos assets pertence à Fase 2.
- Componentes compartilhados pertencem à Fase 3.
- Internacionalização completa pertence à Fase 4.
- IndexedDB e DataProvider pertencem à Fase 5.
- Testes em navegador real, NVDA, zoom de duzentos por cento e matriz responsiva
  ainda não foram executados e não são apresentados como aprovados.

## Gate da Fase 0

APROVADO. Blueprint, documentos canônicos, backlog e decisão sobre os assets
estão persistidos no projeto; nenhuma decisão central deste ciclo depende apenas
da conversa.

## Gate da Fase 1

APROVADO. A estratégia de hash evita reload de servidor, todas as rotas do
blueprint são resolvidas e a aplicação com ES Modules foi servida com sucesso em
`/nexstock/`, comprovado pelo teste de integração.

## Próxima tarefa

Executar a Fase 2: integrar tokens e componentes de marca, aplicar os assets
somente nos locais autorizados e validar dimensões, transparência, contraste e
comportamento nos temas claro e escuro.
