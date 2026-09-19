# Ciclo 024 — Fase 24

## Objetivo

Comprovar os 35 critérios do blueprint, corrigir lacunas de release e publicar
o código como NexStock v1.0.0.

## Lacuna corrigida

O serviço de reset já existia e possuía testes, mas a rota Configurações não
oferecia uma interface para acioná-lo. A versão 1.0 adiciona confirmação
acessível, bloqueio durante a operação, anúncio de sucesso e retorno ao Painel.

## Evidências

- matriz dos 35 critérios em `docs/releases/v1.0.0.md`;
- gate automatizado em `scripts/validate-v1-release.mjs`;
- suíte completa, build do Pages e clone limpo;
- histórico manual com NVDA informado pelo usuário;
- URL pública já existente, com atualização da versão pendente de publicação pelo titular do repositório.

## Gate

O código-fonte e o artefato de publicação atendem aos 35 critérios. A versão
`1.0.0` fica pronta para ser enviada ao repositório. A confirmação visual da
nova versão pública ocorre após o deploy do titular.
