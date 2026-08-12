# Detecção de Fraude com k-NN

Projeto acadêmico (TCC) de Ciência da Computação para detectar fraude em transações financeiras. O núcleo é um classificador por vizinhança (**k-NN**): cada transação nova é comparada, por similaridade, a uma base histórica já rotulada, e a proporção de fraude entre os vizinhos mais próximos vira um **score de risco**.

## Como funciona

O sistema tem **dois processos independentes**:

```
dados/referencia.csv
        │
        ▼
┌───────────────────┐     gera      ┌──────────────────────────────────────┐
│  npm run preprocess│ ──────────► │ armazenamento/processado/             │
│  (pré-processar)   │              │  • constantes-normalizacao.json       │
└───────────────────┘              │  • vetores-referencia.json            │
                                    └──────────────────┬───────────────────┘
                                                       │ lê (não recalcula)
dados/entrada.csv                                      │
        │                                              │
        ▼                                              ▼
┌───────────────────┐     gera      ┌──────────────────────────────────────┐
│  npm run analyze   │ ──────────► │ resultados/analise-<timestamp>.json  │
│  (analisar)        │              │  (score, decisão e vizinhos)         │
└───────────────────┘              └──────────────────────────────────────┘
```

1. **Pré-processamento** — lê a base histórica rotulada, calcula constantes de normalização, transforma cada transação em um vetor numérico e grava tudo em disco. Rode de novo **somente** se `dados/referencia.csv` mudar.
2. **Análise** — carrega esses artefatos, vetoriza cada transação nova com as **mesmas** constantes, encontra os *k* vizinhos mais próximos e calcula o score de fraude.

### Ideia do algoritmo

- Cada transação vira um **ponto** em um espaço de 8 números (features).
- A distância entre dois pontos é a **distância euclidiana**.
- Entre os *k* vizinhos mais próximos da base histórica, conta-se quantos são fraude.
- `score = fraudes_entre_vizinhos / k`
- Se `score >= limiar` → **suspeita**; senão → **aprovada**.

### Dimensões do vetor

| Índice | Feature |
| --- | --- |
| `[0]` | Valor normalizado (min-max) |
| `[1]` | Hora do dia (0–1) |
| `[2]` | Dia da semana (0–1; 0=domingo … 6=sábado) |
| `[3]` | Taxa de risco da forma de pagamento |
| `[4]` | Parcelas normalizadas (min-max) |
| `[5]` | Taxa de risco da categoria do estabelecimento |
| `[6]` | Taxa de risco do canal |
| `[7]` | Primeira compra no estabelecimento (`1` ou `0`) |

## Pré-requisitos

O projeto usa **Node.js via NVM**. O arquivo `.nvmrc` documenta a intenção de usar a LTS (`lts/*`).

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

## Formato dos CSVs de entrada

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

```bash
npm run preprocess
```

Ou com outro CSV de referência:

```bash
npm run preprocess -- --referencia=dados/referencia.csv
```

**Obrigatório antes da primeira análise.** Só rode de novo se a base de referência mudar.

### 2. Análise

```bash
npm run analyze
```

Com parâmetros:

```bash
npm run analyze -- --entrada=dados/entrada.csv --k=5 --limiar=0.5 --formato=json
```

| Parâmetro | Padrão | Descrição |
| --- | --- | --- |
| `--entrada` | `dados/entrada.csv` | CSV de transações novas |
| `--k` | `5` | Número de vizinhos |
| `--limiar` | `0.5` | Score >= limiar → suspeita |
| `--formato` | `json` | `json` ou `csv` |

## Arquivos gerados

### Pré-processamento (`npm run preprocess`)

| Entrada | Script / módulos | Saída |
| --- | --- | --- |
| `dados/referencia.csv` | `scripts/preprocessar.js` → `src/pipeline/executarPreprocessamento.js` | `armazenamento/processado/constantes-normalizacao.json` |
| | (usa `calculadoraConstantes`, `vetorizador`, `armazenamento`) | `armazenamento/processado/vetores-referencia.json` |

#### `constantes-normalizacao.json`

Estatísticas e taxas de risco calculadas **só** com a base histórica. São reutilizadas na análise para manter a mesma escala.

| Campo | Conteúdo |
| --- | --- |
| `valor` | `min`, `max`, `media`, `desvioPadrao` do valor das transações |
| `parcelas` | Idem para o número de parcelas |
| `formaPagamento` | Taxa de fraude por forma (`pix`, `cartao_credito`, …) = fraudes ÷ total naquela forma |
| `categoriaEstabelecimento` | Taxa de fraude por categoria |
| `canal` | Taxa de fraude por canal (`online`, `presencial`) |
| `taxaFraudeGlobal` | Proporção geral de fraude na base (ex.: `0.375` = 37,5%) |

Exemplo (trecho):

```json
{
  "valor": { "min": 45, "max": 5100, "media": 1499.175, "desvioPadrao": 1794.82 },
  "formaPagamento": { "pix": 0, "cartao_credito": 1, "boleto": 1 },
  "canal": { "online": 0.6, "presencial": 0 },
  "taxaFraudeGlobal": 0.375
}
```

#### `vetores-referencia.json`

Lista com **uma entrada por linha** da base histórica, já convertida em vetor numérico.

| Campo | Conteúdo |
| --- | --- |
| `idTransacao` | ID original da transação |
| `fraude` | Rótulo `0` (legítima) ou `1` (fraude) |
| `vetor` | Array de 8 números (ver tabela de dimensões acima) |

Exemplo (trecho):

```json
[
  {
    "idTransacao": "TX-REF-002",
    "fraude": 1,
    "vetor": [0.683, 0.094, 0, 1, 1, 1, 0.6, 1]
  }
]
```

### Análise (`npm run analyze`)

| Entrada | Script / módulos | Saída |
| --- | --- | --- |
| `dados/entrada.csv` | `scripts/analisar.js` → `src/pipeline/executarAnalise.js` | `resultados/analise-<timestamp>.json` (ou `.csv`) |
| + JSONs do pré-processamento | (usa `vetorizador`, `knn`, `distancia`) | |

A análise **não** recalcula constantes: só carrega o que já está em `armazenamento/processado/`.

#### `resultados/analise-<timestamp>.json`

Um objeto por transação avaliada.

| Campo | Conteúdo |
| --- | --- |
| `idTransacao` | ID da transação nova |
| `score` | Proporção de vizinhos fraudulentos (0 a 1) |
| `decisao` | `aprovada` ou `suspeita` |
| `vizinhos` | Os *k* vizinhos usados na decisão (explicabilidade) |
| `vizinhos[].idTransacao` | ID na base de referência |
| `vizinhos[].fraude` | Rótulo desse vizinho (`0` ou `1`) |
| `vizinhos[].distancia` | Distância euclidiana até a transação avaliada |

Exemplo (trecho):

```json
{
  "idTransacao": "TX-IN-001",
  "score": 0.6,
  "decisao": "suspeita",
  "vizinhos": [
    { "idTransacao": "TX-REF-007", "fraude": 1, "distancia": 0.306 },
    { "idTransacao": "TX-REF-002", "fraude": 1, "distancia": 1.010 }
  ]
}
```

Se `--formato=csv`, o relatório em `resultados/` traz as colunas `id_transacao`, `score` e `decisao` (sem a lista detalhada de vizinhos).

## Qualidade de código

```bash
npm run lint
npm run format
```

## Arquitetura

```
scripts/              → CLI (argv + logs). Não contém regra de negócio.
src/pipeline/         → Orquestra os fluxos (`preprocessar` e `analisar`).
src/dados/            → Leitura e validação de CSV.
src/preprocessamento/ → Constantes, vetorização e persistência JSON.
src/algoritmo/        → Distância euclidiana e k-NN.
src/config/           → Caminhos, k e limiar padrão.
src/utils/            → Logger e erros de domínio.
```

A lógica de negócio fica isolada em `src/pipeline/`. Esses módulos **não** leem `process.argv` nem escrevem em `console` diretamente — recebem caminhos/opções e um callback opcional de progresso. No futuro, dá para expô-los como endpoints HTTP **sem reescrever** a lógica: basta adicionar uma camada de rotas por cima.

## Observação acadêmica

O algoritmo k-NN e as fórmulas de normalização/vetorização são implementados **manualmente** (sem bibliotecas de ML prontas), pois são o núcleo do trabalho.
