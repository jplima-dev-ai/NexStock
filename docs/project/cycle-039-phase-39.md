# Ciclo 039 — Product Media

## Entrega

Produtos podem receber uma imagem opcional em JPEG, PNG ou WebP, de até 5 MB.
O arquivo é validado e mantido como Blob no IndexedDB, separado do registro do
produto. A prévia usa thumbnail local quando o navegador consegue gerá-la e a
imagem original permanece disponível offline.

## Acessibilidade e segurança

- o campo “Descrição da imagem” é visível, associado à ajuda e exigido quando
  uma nova imagem é escolhida;
- a imagem é apresentada com esse texto alternativo; o produto continua
  plenamente funcional sem imagem;
- formatos fora da lista e arquivos vazios ou grandes demais são recusados;
- o controle para remover a imagem existente é explícito e não é acionado por
  uma troca de tela ou falha de prévia.

## Arquitetura e backup

`MediaProvider` separa a interface da persistência; a implementação local usa
o store `media` indexado por workspace e produto. O backup serializa mídia
somente em seu próprio manifesto, nunca como Base64 no produto, e a reconstrói
como Blob na restauração.
