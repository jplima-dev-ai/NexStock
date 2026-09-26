# NexCopy

## Objetivo

NexCopy torna explícitos o dado esperado, seu significado, a consequência de
uma ação e a forma de recuperar um erro. A voz é direta, humana e operacional.

## Contrato dos campos

Campos importantes combinam quatro elementos quando aplicáveis:

1. rótulo que nomeia o dado;
2. ajuda que explica significado ou consequência;
3. exemplo fictício que demonstra formato sem sugerir dado real;
4. erro que informa o ocorrido, a causa provável e a próxima ação.

Ajuda, exemplo e erro são associados ao controle por `aria-describedby`. O
placeholder não substitui nenhum desses elementos.

## Ações e confirmações

Botões nomeiam a operação, como “Salvar produto” e “Confirmar entrada de cinco
unidades”. Confirmações importantes descrevem o efeito sobre registros, listas
e histórico antes da execução.

## Estados de conteúdo

Estados vazios são classificados como primeiro uso, resultado filtrado,
situação positiva, recurso indisponível ou dados insuficientes. Carregamento,
offline, sucesso, aviso e erro possuem texto próprio e anúncios proporcionais.

## Tooltips

Nenhuma instrução necessária para concluir um fluxo depende de tooltip. Dicas
ocultas ou o atributo HTML `title` não são usados como fonte exclusiva de
significado. Explicações essenciais ficam visíveis e acessíveis por leitura
linear.

## Contexto de experiência

O modo guiado mantém ajuda, exemplos e explicações adicionais visíveis. O modo
compacto preserva a ajuda essencial e reduz exemplos e conteúdo complementar,
sem remover campos, ações ou capacidade operacional.

O contexto usa `experienceMode` e `profileKey` do espaço de trabalho já
persistido. Não existe preferência paralela. Exemplos de produto, localização,
descrição e motivo de movimentação se adaptam aos perfis Tecnologia,
Cosméticos, Moda, Alimentos e Personalizado.

## Glossário e terminologia

A rota `#/glossary` oferece busca e definições de nove termos operacionais. A
mesma estrutura de chaves existe em português, inglês e espanhol, protegida por
validação de paridade. Definições descrevem comportamento implementado e não
promessas futuras.
