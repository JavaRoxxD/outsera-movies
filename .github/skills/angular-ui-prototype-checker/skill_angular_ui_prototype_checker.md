# Skill: `angular-ui-prototype-checker`

## Objetivo
Garantir a fidelidade visual entre os protótipos de referência e os componentes desenvolvidos em Angular, assegurando estabilidade de layout (prevenção de Cumulative Layout Shift), performance de renderização e experiência fluida do usuário em listagens e painéis de dados.

---

## 1. Diretrizes de Conformidade com o Protótipo
Ao revisar ou gerar interfaces baseadas em wireframes/protótipos (ex: Dashboard e Listagem de Filmes), o agente deve validar:

- **Estrutura de Layout Base:**
  - Barra superior fixa (Header) com título da aplicação e contraste escuro.
  - Menu lateral esquerdo (Sidebar) fixo com navegação ativa (`routerLinkActive`) entre as views principais.
  - Responsividade funcional a partir da resolução mínima de `768x1280`.
- **Dashboard (Grid de Painéis):**
  - Disposição em grid responsivo (2 colunas em desktop, empilhado em telas menores).
  - Presença fiel dos 4 painéis obrigatórios:
    1. Anos com múltiplos vencedores (`Year`, `Win Count`).
    2. Top 3 estúdios com mais vitórias (`Name`, `Win Count`).
    3. Intervalo máximo e mínimo de vitórias entre produtores (`Maximum` e `Minimum`).
    4. Busca de filmes vencedores por ano específico (input + botão de busca + tabela de resultados).
- **Listagem de Filmes (Tabela Paginada):**
  - Colunas alinhadas: `ID`, `Year`, `Title` e `Winner?`.
  - Filtros integrados diretamente no cabeçalho das colunas correspondentes (`Year` e `Winner?`).

---

## 2. Regras de Performance e Estabilidade de Tabelas (Anti-Flicker)
Para evitar que a interface "pisque" ou sofra deslocamentos visuais durante requisições HTTP (paginação ou aplicação de filtros), é **obrigatório** seguir as regras abaixo:

### A. Isolamento do Estado de Carregamento (`<tbody>`)
- **Proibido:** Utilizar diretivas condicionais (`@if` / `*ngIf`) que destruam ou escondam a tabela inteira, o cabeçalho (`<thead>`), os filtros ou a paginação (`<tfoot>` / rodapé) durante o carregamento.
- **Obrigatório:** Manter `<thead>` e os controles de paginação sempre montados e estáticos no DOM. Renderizar o indicador de carregamento (skeleton rows ou spinner) **exclusivamente dentro do `<tbody>`**.

### B. Estabilidade Geométrica (CSS)
- Aplicar `table-layout: fixed; width: 100%;` em todas as tabelas de dados.
- Definir larguras explícitas (em `%` ou `px`) para cada coluna (`th` e `td`), garantindo que a largura das células não oscile entre o estado de *loading* e o estado *populado*.
- Definir altura mínima fixa (`min-height` ou `height`) para as linhas de dados e linhas de *skeleton* para evitar saltos verticais na página.
- Tratar textos longos com:
  ```css
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  ```

### C. Otimização de Reatividade e DOM
- Utilizar o control flow moderno `@for` acompanhado obrigatoriamente de uma chave única de rastreamento (`track item.id`) para reaproveitamento eficiente dos nós do DOM.
- Aplicar operadores de controle de fluxo (`debounceTime`, `distinctUntilChanged`, `switchMap`) ou Signals reativos nos campos de filtro para evitar disparos duplicados de requisições HTTP.

---

## 3. Checklist de Validação Rápida (Code Review)
Antes de finalizar qualquer alteração de UI/UX, verificar:
- [ ] O cabeçalho e os filtros permanecem visíveis e clicáveis enquanto a página carrega?
- [ ] As colunas mantêm exatamente a mesma largura durante e após o carregamento?
- [ ] A tabela possui `table-layout: fixed`?
- [ ] O `@for` utiliza `track` por identificador único?
- [ ] A resolução mínima de `768px` não quebra o alinhamento dos cards ou das tabelas?