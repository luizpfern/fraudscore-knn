# Interface desktop (Electron + React)

Janela gráfica para o mesmo fluxo do CLI: processar a base de referência, analisar transações novas e visualizar scores com os vizinhos do k-NN.

A lógica **não é reimplementada aqui**. O processo principal do Electron importa `src/pipeline/executarPreprocessamento.js` e `src/pipeline/executarAnalise.js` da raiz do repositório.

## Pré-requisitos

1. Node.js LTS (o mesmo do CLI).
2. Dependências do projeto CLI já instaladas na raiz (`npm install` em `fraudscore-knn/`), porque o pipeline usa `csv-parse` de lá.

## Como rodar (desenvolvimento)

```powershell
cd desktop
npm install
npm run dev
```

O diálogo nativo escolhe os CSVs em qualquer pasta do computador. Os exemplos `dados/referencia.csv` e `dados/entrada.csv` servem como ponto de partida, mas não são obrigatórios.

Se o npm bloquear scripts de instalação e o Electron não abrir, baixe o binário uma vez:

```powershell
node node_modules/electron/install.js
```


## Telas

1. **Base de referência** — seleciona o CSV rotulado e processa (ou reusa o cache em `armazenamento/processado/`).
2. **Analisar transações** — seleciona o CSV novo, ajusta `k` e o limiar, dispara o k-NN.
3. **Resultados** — cards, gráficos de padrão (hora e forma de pagamento), tabela expansível com vizinhos. Há um botão para abrir a pasta `resultados/` no explorador.

## Segurança

O React (renderer) roda com `contextIsolation: true` e `nodeIntegration: false`. Arquivos e pipeline só são acessados no processo principal, via `preload` (`window.api`).
