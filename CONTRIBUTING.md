# Contribuindo com o NexStock

## Antes de alterar

1. Leia o blueprint e os ADRs relevantes.
2. Identifique a fase e o gate afetados.
3. Preserve a arquitetura `UI → serviços → DataProvider → provider`.
4. Verifique impactos em acessibilidade, i18n, offline, segurança e integridade.

## Convenções

- Arquivos em `kebab-case`.
- Funções e variáveis em `camelCase`.
- Classes em `PascalCase`.
- Constantes em `UPPER_SNAKE_CASE`.
- Custom properties CSS com prefixo `--ns-`.
- Commits seguem os prefixos definidos no blueprint.

## Validação

Execute antes de propor uma mudança:

```bash
npm run validate
```

Mudanças de interface também exigem verificação por teclado. Testes com NVDA,
quando executados, devem registrar navegador, fluxo, resultado e limitações.

## Segurança

Não inclua segredos. Não use `eval`, `new Function` ou HTML arbitrário vindo de
entrada externa. Ações de estoque devem preservar as invariantes do NexShield.
