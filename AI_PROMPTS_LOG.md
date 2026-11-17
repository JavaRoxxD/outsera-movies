# Registro de interações com IA

## Etapa 1 — Contratos e acesso à API

- **Resumo do prompt:** Iniciar o teste técnico Angular do Golden Raspberry Awards entregando somente a arquitetura de pastas sugerida, interfaces TypeScript para os retornos da API, um `MovieService` com chamadas HTTP tipadas e tratamento básico de erros, e o primeiro registro de uso de IA.
- **Decisões técnicas:** Organizar funcionalidades compartilhadas sob `src/app/core/models` e `src/app/core/services`; manter contratos independentes para listagem paginada, anos, estúdios, intervalos de produtores e vencedores anuais; preservar os nomes e estruturas reais observados na API, incluindo `Count`; usar `HttpClient`, parâmetros HTTP e observables tipados, mantendo o `HttpErrorResponse` original após registrar o contexto do erro; configurar o provider HTTP na aplicação standalone.
- **Arquivos criados/alterados:** `src/app/core/models/movie.model.ts`, `src/app/core/services/movie.service.ts`, `src/app/app.config.ts`, `AI_PROMPTS_LOG.md`.

## Etapa 2 — Layout base e roteamento

- **Resumo do prompt:** Configurar rotas lazy para Dashboard e Listagem, implementar cabeçalho, menu lateral com navegação ativa e conteúdo responsivo, criar placeholders standalone e registrar a etapa.
- **Decisões técnicas:** Usar `loadComponent` para carregar os placeholders standalone e redirecionar a rota vazia para `/dashboard`; manter os nomes de arquivos e a extensão SCSS já adotados pelo projeto (`app.ts`, `app.html`, `app.scss`); fixar o cabeçalho e a sidebar em telas largas, adaptar a largura para resoluções menores e converter o menu em navegação horizontal em telas estreitas; fornecer o router no teste do app e atualizar as expectativas da navegação.
- **Arquivos criados/alterados:** `src/app/app.routes.ts`, `src/app/app.ts`, `src/app/app.html`, `src/app/app.scss`, `src/app/app.spec.ts`, `src/app/features/dashboard/dashboard.component.ts`, `src/app/features/movies/movie-list.component.ts`, `src/styles.scss`, `AI_PROMPTS_LOG.md`.

## Etapa 3 — Dashboard

- **Resumo do prompt:** Implementar os quatro painéis do Dashboard com dados da API: anos com múltiplos vencedores, top 3 estúdios, intervalos máximo/mínimo de produtores e busca de vencedores por ano; criar layout responsivo e registrar esta etapa.
- **Decisões técnicas:** Usar Signals para dados, carregamento, erros e resultado da busca; limitar os estúdios com cópia ordenada por `winCount` decrescente e `.slice(0, 3)`; combinar formulário HTML com `type="number"` e submissão para suportar clique e Enter; usar `switchMap` para cancelar buscas anuais anteriores e `takeUntilDestroyed` para encerrar assinaturas ao destruir o componente; exibir estados inicial, vazio, carregando e erro; dividir o dashboard em template e SCSS próprios e cobrir os quatro painéis e a busca com testes HTTP.
- **Arquivos criados/alterados:** `src/app/features/dashboard/dashboard.component.ts`, `src/app/features/dashboard/dashboard.component.html`, `src/app/features/dashboard/dashboard.component.scss`, `src/app/features/dashboard/dashboard.component.spec.ts`, `AI_PROMPTS_LOG.md`.

## Etapa 4 — Listagem de filmes

- **Resumo do prompt:** Implementar a listagem de filmes com colunas de identificação, ano, título e vencedor; filtros por ano e vencedor; paginação server-side; estados de carregamento e vazio; e registro desta etapa.
- **Decisões técnicas:** Reutilizar o `MovieService` e `MoviePageResponse`; manter ano e vencedor em Signals e combinar as alterações dos filtros e da página em um fluxo RxJS com `debounceTime(300)`, `distinctUntilChanged` e `switchMap`; enviar o tamanho da página junto aos filtros e retornar à página zero quando um filtro muda; exibir os metadados paginados, badges Yes/No, carregamento, erro e estado vazio; usar layout de tabela com rolagem horizontal em telas menores e testar requisições e filtros com `HttpTestingController`.
- **Arquivos criados/alterados:** `src/app/features/movies/movie-list.component.ts`, `src/app/features/movies/movie-list.component.html`, `src/app/features/movies/movie-list.component.scss`, `src/app/features/movies/movie-list.component.spec.ts`, `AI_PROMPTS_LOG.md`.

## Etapa 5 — Testes unitários e documentação final

- **Resumo do prompt:** Completar os testes unitários do serviço e de um componente com mock, produzir documentação profissional de instalação, execução, testes e metodologia de IA, e consolidar o histórico de todas as etapas.
- **Decisões técnicas:** Manter Vitest, já configurado pelo builder de testes do Angular CLI, em vez de introduzir Jasmine/Karma ou Jest; testar todos os endpoints do `MovieService`, parâmetros de paginação e preservação do filtro booleano `false`; adicionar teste da listagem usando `MovieService` mockado e verificar renderização, debounce e filtros combinados; documentar pré-requisitos compatíveis com o ambiente validado (Node.js 24.22.1 e npm 11.19.1); registrar com transparência que o desenvolvimento foi feito nesta sessão, sem delegação a agentes externos ou autônomos.
- **Arquivos criados/alterados:** `src/app/core/services/movie.service.spec.ts`, `src/app/features/movies/movie-list.component.mock.spec.ts`, `README.md`, `AI_PROMPTS_LOG.md`.
- **Validação final:** `npm run build` concluído com sucesso; `npm test -- --watch=false` aprovado com 11 testes em 5 arquivos.

## Etapa 6 — Estabilidade visual da listagem

- **Resumo do prompt:** Refatorar a Movie List para evitar que a tabela, seus cabeçalhos, filtros e paginação pisquem durante mudanças de página ou filtros, mantendo layout estável e renderização eficiente.
- **Decisões técnicas:** Aplicar `table-layout: fixed`, largura total e larguras percentuais via `colgroup`; truncar conteúdo de células com ellipsis; manter tabela, cabeçalho/filtros e paginação fora das condições de loading; limitar o estado carregando a 15 linhas skeleton de altura fixa no `tbody`; preservar os dados e metadados anteriores enquanto uma nova requisição está em andamento; manter `@for` rastreado por `movie.id`; testar a identidade estável do `table`, `thead` e paginação durante a requisição.
- **Arquivos criados/alterados:** `src/app/features/movies/movie-list.component.ts`, `src/app/features/movies/movie-list.component.html`, `src/app/features/movies/movie-list.component.scss`, `src/app/features/movies/movie-list.component.spec.ts`, `AI_PROMPTS_LOG.md`.
- **Validação:** `npm run build` concluído com sucesso; `npm test -- --watch=false` aprovado com 11 testes em 5 arquivos.
