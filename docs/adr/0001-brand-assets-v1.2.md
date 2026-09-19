# ADR 0001: adotar o pacote de marca recebido como v1.2

Status: aceito em 18 de setembro de 2026.

## Contexto

O blueprint v1.1 referencia `NexStock-Brand-Assets-v1.1.zip`. O pacote fornecido
ao início do desenvolvimento tem nome externo v1.2 e seu manifesto interno
declara versão 1.2. O README interno ainda usa o título v1.1 e informa que os
arquivos são derivados corrigidos dessa versão.

## Decisão

Adotar os bytes do pacote recebido como a fonte visual operacional mais recente,
sem renomear os arquivos internos nem alterar as regras de uso do blueprint.
Registrar a divergência de nomenclatura em vez de reinterpretá-la silenciosamente.

## Consequências

- A integridade será validada pelos hashes fornecidos no próprio pacote.
- Os caminhos de assets permanecem exatamente os definidos pelo blueprint.
- Uma troca futura de pacote exigirá novo ADR ou changelog explícito.
