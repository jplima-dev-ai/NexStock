# Ciclo 022 — Fase 22

## Objetivo

Preparar CI/CD e deploy reproduzível no GitHub Pages, preservando o funcionamento da PWA em subdiretórios.

## Implementação

- workflow oficial do GitHub Pages separado em build e deploy;
- permissões mínimas para conteúdo, Pages e identidade OIDC;
- concorrência controlada para evitar deploys simultâneos;
- validação integral antes da publicação;
- artefato público mínimo na pasta `_site`;
- `.nojekyll` para publicação estática direta;
- caminhos relativos em HTML, módulos, manifest, service worker e cache;
- validação dos arquivos públicos e das versões das Actions;
- ensaio automatizado em repositório temporário e clone limpo;
- manual de configuração, publicação e teste da instalação pública.

## Evidência local

O ensaio de clone limpo executou os 116 testes, gerou `_site` e aprovou a validação específica do GitHub Pages. O artefato não contém testes, scripts, documentação interna nem arquivos de banco.

## Estado do gate

- clone limpo e build reproduzível: aprovado;
- CI/CD e artefato de deploy: implementados e validados localmente;
- deploy em URL pública: pendente, pois o projeto local não possui remoto GitHub;
- instalação da PWA pela URL pública: pendente pelo mesmo motivo.

A fase técnica está pronta para publicação, mas o gate externo só poderá ser encerrado depois que um repositório GitHub for conectado e o workflow for executado com sucesso.
