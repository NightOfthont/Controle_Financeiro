# Clareza — Controle financeiro pessoal

Um site em português brasileiro para organizar receitas e despesas. Feito com HTML, CSS e JavaScript puros, sem dependências de execução ou etapa de compilação.

## 1. Prepare os arquivos

Crie uma pasta chamada `clareza` e coloque estes arquivos nela, mantendo os nomes:

```text
clareza/
├── index.html             # Estrutura e formulários
├── styles.css             # Visual e adaptação a celulares
├── finance.js             # Cálculos, validação e exportação CSV
├── app.js                 # Interface, gráficos e armazenamento
├── favicon.svg            # Ícone da aba
├── README.md              # Este guia
└── tests/
    └── finance.test.cjs   # Testes das regras financeiras
```

`finance.js` deve ser carregado antes de `app.js`, como já está no HTML. Os scripts usam `defer` para aguardar a leitura da página.

## 2. Abra o site

Para experimentar, abra `index.html` em um navegador atual (Chrome, Edge, Firefox ou Safari). Para usar o armazenamento de forma consistente, prefira um servidor local com endereço fixo.

**Com Python 3 instalado:** abra o terminal dentro da pasta `clareza` e execute:

```bash
python3 -m http.server 3000 --bind 127.0.0.1
```

No Windows, se `python3` não estiver disponível, use `py -m http.server 3000 --bind 127.0.0.1`.

Acesse **http://localhost:3000**. Para encerrar o servidor, pressione `Ctrl+C` no terminal. Outra opção é abrir a pasta no VS Code e usar a extensão Live Server.

O aplicativo não exige Node.js. As fontes do Google são opcionais: sem internet, o navegador usa fontes locais. Nenhum serviço recebe seus lançamentos.

## 3. Comece a usar

1. Na primeira abertura, você verá **dados de exemplo**, identificados por uma faixa acima dos cartões. Eles servem para explorar a interface.
2. Clique em **Começar do zero** e confirme para remover todos os exemplos. Esse botão também remove lançamentos que você tenha adicionado enquanto a demonstração está ativa.
3. Clique em **Novo lançamento**. Escolha **Receita** ou **Despesa**.
4. Preencha descrição, valor em reais, data e categoria. Use vírgula nos centavos: `123,45` ou `1.234,56`. Valores aceitos: R$ 0,01 a R$ 999.999.999,99.
5. Clique em **Salvar lançamento**. O resumo e os gráficos serão atualizados. O mês do lançamento será selecionado automaticamente.
6. Selecione outro mês pelas setas ou clicando no período. Em **Lançamentos**, busque por descrição e filtre por tipo ou categoria. Use os ícones do lápis e da lixeira para editar ou excluir.
7. Em **Relatórios**, acompanhe os últimos seis meses e a distribuição de despesas.
8. O botão do olho oculta valores na interface para facilitar o uso em telas compartilhadas. Ele não criptografa os dados.

## 4. Entenda os números

- **Receitas:** soma das entradas com data no mês selecionado.
- **Despesas:** soma das saídas com data no mês selecionado.
- **Saldo do mês:** receitas menos despesas. Não inclui saldo de meses anteriores.
- **Taxa de economia:** `(receitas − despesas) ÷ receitas × 100`. Se não houver receitas, aparece um traço. Pode ser negativa.
- **Evolução financeira:** receitas e despesas dos seis meses terminando no mês selecionado.
- **Despesas por categoria:** as três maiores categorias; as demais ficam agrupadas.

Todos os lançamentos do mês entram no resumo, inclusive datas futuras. Não há distinção entre pago e pendente. Os filtros de busca, tipo e categoria afetam a tabela e o CSV; os cartões e gráficos sempre mostram o mês completo. Na visão geral, a tabela mostra os cinco registros mais recentes do filtro. Valores são armazenados em **centavos inteiros**, evitando erros em somas de dinheiro.

## 5. Salve e restaure seus dados

Os dados ficam em `localStorage`, na chave `clareza.finance.v1`, somente no navegador e endereço utilizados. O salvamento ocorre a cada inclusão, edição ou exclusão. Se o navegador recusar o salvamento, o aplicativo exibe um erro e não confirma a alteração.

- **Exportar → Lançamentos filtrados (.csv):** abre em Excel, LibreOffice ou Google Sheets; usa ponto e vírgula como separador. Exporta todos os resultados dos filtros, mesmo quando a visão geral mostra apenas cinco.
- **Exportar → Backup completo (.json):** salva todos os meses e lançamentos.
- **Exportar → Restaurar backup (.json):** escolha um backup gerado pelo aplicativo e confirme. A restauração **substitui** os dados atuais. Arquivos inválidos são rejeitados antes da substituição. Limites: 5 MB e 10.000 lançamentos.

Faça backups regularmente. Limpar os dados do navegador, mudar de endereço/porta ou usar outro perfil muda o armazenamento disponível. Navegação privada pode descartar os dados ao encerrar a sessão. CSV não é importável pelo aplicativo; use JSON para restauração. Exportações contêm os valores completos, mesmo com o olho ativado.

Este é um controle pessoal local. Não há conta de usuário, conexão bancária, servidor de dados nem sincronização entre dispositivos. Evite usar um perfil de navegador compartilhado para seus registros pessoais.

## 6. Personalize o código

- **HTML:** altere títulos, textos e a estrutura das seções em `index.html`.
- **CSS:** ajuste as cores em `:root` no início de `styles.css`. As regras `@media` adaptam a página a telas menores.
- **Categorias:** edite `categories` em `finance.js`. Categorias de backups anteriores precisam continuar na lista para serem aceitas; exporte seus dados antes de alterar essa estrutura.
- **Comportamento:** `app.js` conecta os eventos dos botões, renderiza os gráficos SVG e salva os dados. `render()` atualiza a tela após uma mudança.
- **Regras:** `finance.js` concentra parsing de valores, validação de datas, resumos e validação de backups. Se mudar o formato dos dados, implemente uma migração antes de mudar a versão.

## 7. Verifique seu código

Opcionalmente, com Node.js 18 ou superior instalado, execute na pasta do projeto:

```bash
node --test tests/finance.test.cjs
node --check app.js
node --check finance.js
```

Faça também um teste no navegador: comece do zero, crie uma receita de R$ 100,00 e uma despesa de R$ 25,50 no mesmo mês. O saldo deve ser R$ 74,50. Recarregue a página e confira a persistência. Edite, filtre, exporte um backup e restaure-o. Confira também a apresentação no celular.

## 8. Publique, se desejar

O projeto funciona em hospedagem estática. Envie `index.html`, `styles.css`, `finance.js`, `app.js`, `favicon.svg` e `README.md` para a mesma pasta pública em um serviço de hospedagem. Use HTTPS. Não precisa de comando de build. Os registros permanecem no navegador de cada pessoa; publicar os arquivos não publica seus lançamentos. Ao mudar do endereço local para o endereço publicado, exporte e restaure o backup para transferir seus dados.
