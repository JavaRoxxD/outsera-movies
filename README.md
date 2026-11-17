# Golden Raspberry Awards — Frontend

Aplicação Angular para explorar os indicados e vencedores do Golden Raspberry Awards (Framboesa de Ouro), consumindo a API pública da Outsera.

## Visão geral

A aplicação reúne um dashboard com estatísticas dos vencedores e uma listagem paginada de filmes com filtros por ano e status de vencedor. Os dados são carregados sob demanda da API:

`https://challenge.outsera.tech/api/movies`

### Funcionalidades

- **Dashboard:** anos com múltiplos vencedores, três estúdios com mais vitórias, maiores e menores intervalos entre vitórias de produtores e busca de vencedores por ano.
- **Movie List:** listagem paginada no servidor, filtro por ano com debounce e filtro por status de vencedor.
- **Navegação:** rotas lazy-loaded para Dashboard e Movie List, com layout responsivo.
- **Estados de interface:** carregamento, erro e ausência de resultados.

## Tecnologias e arquitetura

- Angular 22 com componentes standalone e rotas lazy-loaded.
- TypeScript em modo estrito e interfaces para os contratos da API.
- Signals para estado reativo dos componentes.
- RxJS para requisições HTTP, cancelamento de buscas e debounce dos filtros.
- SCSS para estilos responsivos.
- Vitest, por meio do Angular CLI, para testes unitários.

```text
src/app/
├── core/
│   ├── models/movie.model.ts
│   └── services/movie.service.ts
├── features/
│   ├── dashboard/
│   └── movies/
├── app.routes.ts
└── app.ts
```

O `MovieService` centraliza as chamadas HTTP. Cada funcionalidade mantém seus templates, estilos e testes próximos ao componente correspondente.

### Endpoints utilizados

| Endpoint | Uso |
| --- | --- |
| `GET /movies?page=0&size=15` | Listagem paginada e filtrada |
| `GET /movies/yearsWithMultipleWinners` | Anos com múltiplos vencedores |
| `GET /movies/studiosWithWinCount` | Vitórias por estúdio |
| `GET /movies/maxMinWinIntervalForProducers` | Intervalos de vitórias por produtor |
| `GET /movies/winnersByYear?year=YYYY` | Filmes vencedores de um ano |

Na listagem, a API recebe o índice de página começando em zero, o tamanho da página e, quando aplicável, os filtros `year` e `winner`.

## Pré-requisitos

- Node.js 24.x (validado com 24.22.1).
- npm 11.x (validado com 11.19.1).
- Angular CLI 22.2.7. O CLI global é opcional ao usar os scripts npm do projeto.

Para instalar o Angular CLI globalmente:

```bash
npm install --global @angular/cli@22.2.7
```

## Instalação e execução

Na raiz do projeto:

```bash
npm install
npm start
```

A aplicação ficará disponível em `http://localhost:4200/`. Também é possível iniciar o servidor com `ng serve` quando o Angular CLI estiver instalado globalmente.

## Build de produção

```bash
npm run build
```

Os artefatos são gerados no diretório `dist/outsera-movies`.

## Testes unitários

Os testes utilizam Vitest através do builder de testes do Angular CLI. Para executar uma vez, sem modo watch:

```bash
npm test -- --watch=false
```

Também é possível executar `ng test` (ou `npm test`) para iniciar o runner. A suíte cobre os parâmetros e endpoints do `MovieService`, o dashboard, a paginação e os filtros da listagem, incluindo um teste do componente com o serviço mockado.

## Metodologia de Desenvolvimento com IA

O assistente de IA foi utilizado como apoio ao fluxo de arquitetura e implementação, trabalhando em etapas delimitadas: definição dos contratos e serviço, layout e rotas, dashboard, listagem e, por fim, testes e documentação. As sugestões foram verificadas contra os formatos reais da API e validadas com o build e os testes do projeto.

O desenvolvimento ocorreu nesta sessão, sem delegação a agentes externos ou autônomos. As decisões, prompts e arquivos afetados estão documentados em [`AI_PROMPTS_LOG.md`](./AI_PROMPTS_LOG.md), mantendo um histórico auditável do uso de IA.
