# Ciclo 020 — Fase 20

## Objetivo

Revisar integralmente a copy e a internacionalização em português do Brasil, inglês dos Estados Unidos e espanhol, mantendo clareza, consistência e acessibilidade.

## Implementação

- revisão dos catálogos completos nos três idiomas;
- remoção de mensagens provisórias sobre fases futuras;
- linguagem mais direta nos estados, erros e orientações;
- contadores escritos de forma segura para singular e plural;
- tradução consistente de termos de interface e segurança;
- preservação dos nomes próprios das funcionalidades NexStock;
- verificação de paridade das variáveis interpoladas entre idiomas;
- detecção de chaves literais usadas no código e ausentes nos catálogos;
- cobertura obrigatória de títulos e descrições de todas as rotas;
- bloqueio automatizado de copy obsoleta e grupos críticos ausentes.

## Acessibilidade

As mensagens mantêm contexto suficiente fora da interface visual, evitam nomes acessíveis montados por concatenação e descrevem estados sem depender de cor. A revisão considera textos longos, leitores de tela e recuperação autônoma após erros.

## Gate

Os 563 textos possuem as mesmas chaves e os mesmos parâmetros nos três idiomas. Nenhuma chave conhecida está ausente nos fluxos principais, e a suíte completa permanece aprovada.
