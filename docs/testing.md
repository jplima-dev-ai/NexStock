# Testes e gates de qualidade

## Validação completa

```bash
npm run validate
```

O comando verifica estrutura estática, identidade visual, design system,
idiomas, persistência, perfis, produtos, movimentações, dashboard, insights,
narrativa, simulações, campos, módulos, busca, segurança, PWA, responsividade,
banco de dados, portfólio e testes automatizados.

## GitHub Pages

```bash
npm run build:pages
npm run validate:pages
npm run verify:clean
```

O primeiro comando cria `_site`. O segundo valida o artefato e o workflow. O
terceiro reproduz validação e build a partir de um clone temporário limpo.

## Verificação manual mínima

1. Abra Boas-vindas e acesse a Visita guiada sem criar dados.
2. Percorra as seis etapas por teclado e confirme títulos e exemplos.
3. Troque entre os três idiomas e confirme que a rota é preservada.
4. Crie um espaço de demonstração e confirme os cinco produtos no Painel.
5. Abra e feche a Paleta de Comandos com `Control + K` e `Escape`.
6. Ative o Shield Test Mode e confirme os cinco resultados.
7. Verifique o modo offline somente depois de uma carga online completa.
