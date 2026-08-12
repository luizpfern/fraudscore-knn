# Detecção de Fraude com k-NN

Projeto acadêmico (TCC) de Ciência da Computação para detectar fraude em transações financeiras. O núcleo é um classificador por vizinhança (**k-NN**): cada transação nova é comparada, por similaridade, a uma base histórica já rotulada, e a proporção de fraude entre os vizinhos mais próximos vira um **score de risco**.

Nesta versão há a **estrutura do projeto e o esqueleto do código** (assinaturas, JSDoc e `TODO`s). A implementação completa do algoritmo e das fórmulas de normalização virá nas próximas etapas.

## Pré-requisitos

O projeto usa **Node.js via NVM**, sempre na LTS ativa mais recente. O arquivo `.nvmrc` documenta essa intenção (`lts/*`).

> **Importante (Windows):** o [nvm-windows](https://github.com/coreybutler/nvm-windows) **não** lê `.nvmrc` automaticamente e **não** aceita `nvm use` sem argumento nem o alias `lts/*`. Use os comandos da seção Windows abaixo.

### Windows (nvm-windows)

```powershell
nvm install lts
nvm use lts
```

### Linux / macOS (nvm-sh)

```bash
nvm install --lts
nvm use
```

Confirme a versão:

```bash
node --version
npm --version
```

## Instalação

```bash
npm install
```

## Formato dos CSVs

Os arquivos ficam em `dados/`. A base de referência e o CSV de entrada compartilham as mesmas colunas, **exceto** que o de entrada **não** possui a coluna `fraude`.

| Campo | Tipo | Observação |
| --- | --- | --- |
| `id_transacao` | texto | Identificador único |
| `data_hora` | timestamp ISO | Ex.: `2026-03-14T02:35:00` |
| `valor` | decimal | Valor da transação |
| `forma_pagamento` | categórico | `pix`, `cartao_credito`, `cartao_debito`, `boleto`, `ted` |
| `parcelas` | inteiro | Quantidade de parcelas |
| `categoria_estabelecimento` | categórico | Ex.: `alimentacao`, `eletronicos`, `servicos`, `vestuario` |
| `canal` | categórico | `online`, `presencial` |
| `id_cliente` | texto | Identificador do cliente |
| `id_estabelecimento` | texto | Identificador do estabelecimento |
| `primeira_compra_estabelecimento` | booleano | `true`/`false` ou `1`/`0` |
| `fraude` | `0` ou `1` | **Apenas** no CSV de referência |

Exemplo de linha da base de referência (`dados/referencia.csv`):

```csv
TX-REF-002,2026-01-11T02:15:00,3499.00,cartao_credito,12,eletronicos,online,CLI-1002,EST-2002,true,1
```

Exemplo de linha do CSV de entrada (`dados/entrada.csv`):

```csv
TX-IN-001,2026-03-14T02:35:00,4200.00,cartao_credito,12,eletronicos,online,CLI-9001,EST-3001,true
```

## Como rodar

### 1. Pré-processamento

Gera as constantes de normalização e os vetores da base histórica em `armazenamento/processado/`.

```bash
npm run preprocess
```

Ou informando outro CSV de referência:

```bash
npm run preprocess -- --referencia=dados/referencia.csv
```

Esse passo **precisa ser executado antes de qualquer análise**. Só é necessário rodá-lo de novo se a base de referência mudar.

Artefatos gerados:

- `armazenamento/processado/constantes-normalizacao.json`
- `armazenamento/processado/vetores-referencia.json`

### 2. Análise

Avalia transações novas com k-NN, usando o cache já processado (não recalcula constantes).

```bash
npm run analyze
```

Com caminho explícito do CSV de entrada:

```bash
npm run analyze -- --entrada=dados/entrada.csv
```

Parâmetros opcionais:

```bash
npm run analyze -- --entrada=dados/entrada.csv --k=7 --limiar=0.4 --formato=json
```

| Parâmetro | Padrão | Descrição |
| --- | --- | --- |
| `--entrada` | `dados/entrada.csv` | CSV de transações novas |
| `--k` | `5` | Número de vizinhos |
| `--limiar` | `0.5` | Score >= limiar → suspeita |
| `--formato` | `json` | `json` ou `csv` |

### Resultados

Os relatórios da análise são gravados em `resultados/` (arquivo com carimbo de data/hora). Cada item traz, no mínimo:

- `idTransacao`
- `score` (proporção de fraude entre os vizinhos)
- `decisao` (`aprovada` ou `suspeita`)
- `vizinhos` (IDs e rótulos usados na decisão — explicabilidade)

## Qualidade de código

```bash
npm run lint
npm run format
```

## Arquitetura (resumo)

```
scripts/          → CLI (argv + logs). Não contém regra de negócio.
src/pipeline/     → Orquestra os fluxos (funções exportadas reutilizáveis).
src/dados/        → Leitura e validação de CSV.
src/preprocessamento/ → Constantes, vetorização e persistência JSON.
src/algoritmo/    → Distância euclidiana e k-NN.
src/config/       → Caminhos e parâmetros padrão.
src/utils/        → Logger e erros de domínio.
```

A lógica de negócio fica isolada em `src/pipeline/` (`preprocessar` e `analisar`). Esses módulos **não** leem `process.argv` nem escrevem em `console` diretamente — recebem caminhos/opções e um callback opcional de progresso. Assim, no futuro, dá para expô-los como endpoints HTTP (Express ou similar) **sem reescrever** a lógica: basta adicionar uma camada de rotas por cima.

## Observação acadêmica

O algoritmo k-NN e as fórmulas de normalização/vetorização serão implementados manualmente (sem bibliotecas de ML prontas), pois são o núcleo do trabalho. Os arquivos em `src/algoritmo/` e `src/preprocessamento/` já estão preparados com assinaturas, JSDoc e comentários `TODO`.
