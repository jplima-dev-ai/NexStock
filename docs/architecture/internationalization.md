# Internacionalização

O NexStock usa catálogos JSON em `locales/` e o módulo `js/i18n/i18n.js`. O
locale padrão e o fallback são `pt-BR`; os idiomas suportados são `pt-BR`,
`en-US` e `es`.

## Contrato

- Os três catálogos devem ter exatamente as mesmas chaves.
- Mensagens são inseridas com `textContent`; catálogos não aceitam HTML.
- Parâmetros usam a forma `{nome}` e são interpolados como texto.
- Uma chave ausente no locale ativo usa a mensagem de `pt-BR`; se também não
  existir, a própria chave é exibida para tornar o erro observável.
- A troca de idioma atualiza o atributo `lang`, o shell, a rota e o título do
  documento sem recarregar a página.
- A Brand Scene contém texto em português e só pode aparecer em `pt-BR`.
  `en-US` usa o mascote e `es` usa o símbolo, ambos sem texto gravado.

## Validação

`npm run validate` compara as chaves, rejeita mensagens vazias ou HTML nos
catálogos, confere os slogans oficiais e testa o fallback e a regra visual.
