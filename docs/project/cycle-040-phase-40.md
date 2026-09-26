# Ciclo 040 — NexScan

NexScan localiza produtos por NexCode, nome completo ou câmera quando o navegador
oferece acesso à câmera e `BarcodeDetector`. A câmera é um atalho opcional: a
busca/código manual permanece disponível e funcional em dispositivos sem câmera,
permissão ou leitura automática.

Após localizar um produto ativo, o operador pode abrir o cadastro ou iniciar uma
entrada ou saída já preenchida. O fluxo é local, sem IA, sem rede e sem criar
movimentação até a confirmação normal da tela de movimentações.

## Acessibilidade e gate

- Rota focável `#/scan`, formulário rotulado e mensagens de status em texto.
- O vídeo é decorativo para leitor de tela; o estado da câmera e a detecção são
  anunciados pela região de status.
- Ação manual cobre ausência de câmera e possui regressão unitária e E2E.
- O service worker pré-cacheia a rota, serviço e interface do scanner.
