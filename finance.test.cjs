const test = require("node:test");
const assert = require("node:assert/strict");
const F = require("../finance.js");
const entry = {
  id: "test-1",
  type: "expense",
  description: "Café",
  category: "Alimentação",
  amount: 1050,
  date: "2026-10-01",
};
const backup = (entries) => ({ version: 1, demo: false, entries });
test("converte reais em centavos exatos e rejeita entradas ambíguas ou fora do limite", () => {
  for (const [input, output] of [
    ["0,01", 1],
    ["1.234,56", 123456],
    ["42,5", 4250],
    ["10", 1000],
    ["999.999.999,99", F.MAX_AMOUNT],
  ])
    assert.equal(F.parseAmount(input), output);
  for (const input of [
    "",
    "0",
    "-1",
    "1.50",
    "1,234",
    "12.34,56",
    "NaN",
    "1e3",
    "1000000000",
    "1,2,3",
  ])
    assert.equal(F.parseAmount(input), null);
});
test("calcula saldo e economia sem erro de ponto flutuante em somas", () => {
  assert.deepEqual(
    F.summarize([
      { type: "income", amount: 30 },
      { type: "expense", amount: 10 },
      { type: "expense", amount: 20 },
    ]),
    { income: 30, expense: 30, balance: 0, saving: 0 },
  );
  assert.equal(F.summarize([entry]).saving, null);
  assert.equal(
    F.summarize([{ ...entry, type: "income", amount: 100 }, entry]).balance,
    -950,
  );
});
test("valida datas reais, incluindo anos bissextos", () => {
  for (const date of ["2024-02-29", "2026-10-01", "1900-01-01", "9999-12-31"])
    assert.equal(F.validDate(date), true);
  for (const date of [
    "2026-02-29",
    "2026-04-31",
    "2026-13-01",
    "2026-1-01",
    "1899-12-31",
    undefined,
  ])
    assert.equal(F.validDate(date), false);
});
test("filtra mês, tipo, categoria e busca sem acentos; ordena por data", () => {
  const rows = [
    entry,
    { ...entry, id: "test-2", date: "2026-09-30" },
    {
      ...entry,
      id: "test-3",
      date: "2026-10-02",
      type: "income",
      category: "Freelance",
    },
  ];
  assert.deepEqual(
    F.filterEntries(rows, {
      month: "2026-10",
      search: "CAFE",
      type: "expense",
      category: "Alimentação",
    }),
    [entry],
  );
  assert.deepEqual(
    F.filterEntries(rows, { month: "2026-10" }).map((e) => e.id),
    ["test-3", "test-1"],
  );
});
test("importação rejeita duplicatas, valores inválidos, categorias indevidas e protótipos", () => {
  assert.deepEqual(F.validateData(backup([entry])), backup([entry]));
  for (const altered of [
    { amount: 0 },
    { amount: -1 },
    { amount: 1.5 },
    { type: "__proto__" },
    { category: "Salário" },
    { description: " " },
    { id: "<script>" },
    { date: "2026-02-31" },
  ]) {
    assert.throws(() => F.validateData(backup([{ ...entry, ...altered }])));
  }
  assert.throws(() => F.validateData(backup([entry, entry])));
  assert.throws(() => F.validateData({ version: 2, demo: false, entries: [] }));
  assert.throws(() =>
    F.validateData(backup(Array(F.MAX_ENTRIES + 1).fill(entry))),
  );
});
test("CSV preserva delimitadores, acentos e aspas e neutraliza fórmulas", () => {
  const output = F.csv([{ ...entry, description: '=HYPERLINK("url");Café' }]);
  assert.ok(output.startsWith("\ufeff"));
  assert.ok(output.includes('"\'=HYPERLINK(""url"");Café"'));
  assert.ok(output.includes('"01/10/2026";"Despesa";"10,50"'));
});
