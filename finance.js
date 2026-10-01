/* Regras financeiras compartilhadas pela aplicação e pelos testes. */
(function (root) {
  "use strict";
  const categories = {
    income: ["Salário", "Freelance", "Investimentos", "Outras receitas"],
    expense: [
      "Alimentação",
      "Moradia",
      "Transporte",
      "Compras",
      "Lazer",
      "Saúde",
      "Educação",
      "Outras despesas",
    ],
  };
  const MAX_AMOUNT = 99999999999;
  const MAX_ENTRIES = 10000;
  function parseAmount(value) {
    // Entrada brasileira: 1.234,56 ou 1234,56. Todos os cálculos usam centavos.
    const text = String(value).trim();
    if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(text)) return null;
    const [whole, fraction = ""] = text.replaceAll(".", "").split(",");
    const amount = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
    return Number.isSafeInteger(amount) && amount > 0 && amount <= MAX_AMOUNT
      ? amount
      : null;
  }
  function validDate(value) {
    if (
      typeof value !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      value < "1900-01-01" ||
      value > "9999-12-31"
    )
      return false;
    const date = new Date(value + "T12:00:00Z");
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    );
  }
  function validateData(data) {
    if (
      !data ||
      data.version !== 1 ||
      typeof data.demo !== "boolean" ||
      !Array.isArray(data.entries) ||
      data.entries.length > MAX_ENTRIES
    )
      throw new Error(
        "Backup incompatível ou limite de 10.000 lançamentos excedido.",
      );
    const ids = new Set();
    const entries = data.entries.map((entry) => {
      if (
        !entry ||
        typeof entry.id !== "string" ||
        !/^[\w-]{1,80}$/.test(entry.id) ||
        ids.has(entry.id) ||
        !["income", "expense"].includes(entry.type) ||
        !categories[entry.type].includes(entry.category) ||
        typeof entry.description !== "string" ||
        !entry.description.trim() ||
        entry.description.length > 100 ||
        !Number.isSafeInteger(entry.amount) ||
        entry.amount <= 0 ||
        entry.amount > MAX_AMOUNT ||
        !validDate(entry.date)
      ) {
        throw new Error(
          "O arquivo contém um lançamento inválido. Nenhum dado foi substituído.",
        );
      }
      ids.add(entry.id);
      return {
        id: entry.id,
        type: entry.type,
        description: entry.description.trim(),
        amount: entry.amount,
        date: entry.date,
        category: entry.category,
      };
    });
    return { version: 1, demo: data.demo, entries };
  }
  function summarize(entries) {
    let income = 0,
      expense = 0;
    for (const entry of entries) {
      if (entry.type === "income") income += entry.amount;
      else expense += entry.amount;
    }
    return {
      income,
      expense,
      balance: income - expense,
      saving: income > 0 ? ((income - expense) / income) * 100 : null,
    };
  }
  function filterEntries(
    entries,
    { month, type = "all", category = "all", search = "" },
  ) {
    const normalize = (value) =>
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("pt-BR");
    const query = normalize(search.trim());
    return entries
      .filter(
        (entry) =>
          entry.date.startsWith(month + "-") &&
          (type === "all" || entry.type === type) &&
          (category === "all" || entry.category === category) &&
          normalize(entry.description).includes(query),
      )
      .sort(
        (a, b) =>
          b.date.localeCompare(a.date) ||
          a.description.localeCompare(b.description, "pt-BR"),
      );
  }
  function csv(entries) {
    const cell = (value) => {
      let text = String(value);
      if (/^[\s]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text))
        text = "'" + text;
      return '"' + text.replaceAll('"', '""') + '"';
    };
    const lines = [
      ["Descrição", "Categoria", "Data", "Tipo", "Valor (R$)"],
      ...entries.map((entry) => [
        entry.description,
        entry.category,
        entry.date.split("-").reverse().join("/"),
        entry.type === "income" ? "Receita" : "Despesa",
        (entry.amount / 100).toFixed(2).replace(".", ","),
      ]),
    ];
    return "\ufeff" + lines.map((row) => row.map(cell).join(";")).join("\r\n");
  }
  const api = {
    categories,
    MAX_AMOUNT,
    MAX_ENTRIES,
    parseAmount,
    validDate,
    validateData,
    summarize,
    filterEntries,
    csv,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Finance = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
