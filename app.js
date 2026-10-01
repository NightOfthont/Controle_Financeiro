"use strict";
const F = window.Finance;
const $ = (selector) => document.querySelector(selector);
const STORAGE_KEY = "clareza.finance.v1";
const paths = {
  wallet:
    '<path d="M20 8V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v11H5a3 3 0 0 1-3-3V6m18 7h-5v4h5m-4-2h.01"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  arrows: '<path d="M3 7h17m-4-4 4 4-4 4M21 17H4m4-4-4 4 4 4"/>',
  chart: '<path d="M4 3v17h17M8 15l4-5 4 2 5-7"/>',
  sparkles:
    '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM20 2v4m-2-2h4"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4m0 3h.01"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  "eye-off":
    '<path d="m3 3 18 18M10.6 5.1 12 5c6.5 0 10 7 10 7a20 20 0 0 1-3 4M6 6a22 22 0 0 0-4 6s3.5 7 10 7a11 11 0 0 0 5-1M10 10a3 3 0 0 0 4 4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  "chevron-left": '<path d="m14 6-6 6 6 6"/>',
  "chevron-right": '<path d="m10 6 6 6-6 6"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  "arrow-right": '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  "arrow-up": '<path d="M6 18 18 6M6 6h12v12"/>',
  "arrow-down": '<path d="M18 6 6 18m0-12v12h12"/>',
  pie: '<path d="M21 13a9 9 0 1 1-10-10v10h10ZM15 3a8 8 0 0 1 6 6h-6V3Z"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  x: '<path d="m6 6 12 12M6 18 18 6"/>',
  edit: '<path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14v6Z"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  bag: '<rect x="4" y="7" width="16" height="14" rx="2"/><path d="M8 7V6a4 4 0 0 1 8 0v1"/>',
  home: '<path d="m3 10 9-7 9 7v11H3V10Zm6 11v-8h6v8"/>',
  coffee:
    '<path d="M3 8h13v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8Zm13 1h2a3 3 0 0 1 0 6h-2M6 3v2m4-2v2"/>',
  car: '<path d="m5 8 2-5h10l2 5M3 8h18v10H3V8Zm2 10v3m14-3v3M6 12h2m8 0h2"/>',
  briefcase:
    '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12a24 24 0 0 0 18 0m-9 0v3"/>',
  heart:
    '<path d="M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-4 5 3 11 8 15 5-4 12-10 8-15Z"/>',
  book: '<path d="M12 5C9 3 5 3 2 4v16c4-1 7-1 10 1 3-2 6-2 10-1V4c-3-1-7-1-10 1v16"/>',
};
const icon = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.wallet}</svg>`;
const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
document.querySelectorAll("[data-icon]").forEach((element) => {
  element.innerHTML = icon(element.dataset.icon);
});
const now = new Date();
const localDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
let month = localDate(now).slice(0, 7);
let view = "overview";
let privateMode = false;
let editingId = null;
let persistedSnapshot = null;
let storageProblem = false;
let toastTimeout;
const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const money = (cents) =>
  privateMode ? "R$ •••••" : moneyFormatter.format(cents / 100);
function monthOffset(base, offset) {
  const [year, m] = base.split("-").map(Number);
  const date = new Date(year, m - 1 + offset, 1, 12);
  return localDate(date).slice(0, 7);
}
function createDemo() {
  const entries = [];
  const items = [
    ["Salário mensal", "income", "Salário", 580000, 1],
    ["Projeto de identidade visual", "income", "Freelance", 145000, 8],
    ["Aluguel", "expense", "Moradia", 165000, 5],
    ["Supermercado", "expense", "Alimentação", 42890, 12],
    ["Internet de casa", "expense", "Moradia", 9990, 10],
    ["Café com amigos", "expense", "Alimentação", 6850, 18],
    ["Combustível", "expense", "Transporte", 22000, 16],
    ["Cinema no fim de semana", "expense", "Lazer", 6400, 20],
    ["Tênis novo", "expense", "Compras", 24990, 22],
    ["Almoço de domingo", "expense", "Alimentação", 12400, 25],
    ["Curso de fotografia", "expense", "Educação", 15900, 9],
    ["Plano de saúde", "expense", "Saúde", 28000, 6],
  ];
  for (let i = -5; i <= 0; i++) {
    const m = monthOffset(month, i);
    items.forEach(([description, type, category, amount, day], j) => {
      const factor =
        i === 0
          ? 1
          : type === "income"
            ? [0.76, 0.91, 0.83, 0.96, 0.88][i + 5]
            : [0.89, 0.78, 1.09, 0.83, 0.95][i + 5];
      entries.push({
        id: `demo-${i + 5}-${j}`,
        description,
        type,
        category,
        amount: Math.round(amount * factor),
        date: `${m}-${String(day).padStart(2, "0")}`,
      });
    });
  }
  return { version: 1, demo: true, entries };
}
function notify(message, error = false) {
  clearTimeout(toastTimeout);
  $("#toast").textContent = message;
  $("#toast").classList.toggle("error", error);
  $("#toast").hidden = false;
  toastTimeout = setTimeout(
    () => {
      $("#toast").hidden = true;
    },
    error ? 10000 : 4500,
  );
}
function loadData() {
  try {
    persistedSnapshot = localStorage.getItem(STORAGE_KEY);
    if (persistedSnapshot === null) {
      const initial = createDemo();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      persistedSnapshot = JSON.stringify(initial);
      storageProblem = false;
      return initial;
    }
    const loaded = F.validateData(JSON.parse(persistedSnapshot));
    storageProblem = false;
    return loaded;
  } catch {
    storageProblem = true;
    notify(
      "Não foi possível carregar os dados. Verifique o armazenamento do navegador ou restaure um backup.",
      true,
    );
    return { version: 1, demo: false, entries: [] };
  }
}
let data = loadData();
function commit(next, allowRecovery = false) {
  if (storageProblem && !allowRecovery) {
    notify(
      "Redefina o armazenamento ou restaure um backup antes de salvar.",
      true,
    );
    return false;
  }
  try {
    if (localStorage.getItem(STORAGE_KEY) !== persistedSnapshot) {
      data = loadData();
      render();
      notify(
        "Os dados mudaram em outra aba. Revise os lançamentos e tente novamente.",
        true,
      );
      return false;
    }
    const validated = F.validateData(next);
    const serialized = JSON.stringify(validated);
    localStorage.setItem(STORAGE_KEY, serialized);
    persistedSnapshot = serialized;
    data = validated;
    storageProblem = false;
    render();
    return true;
  } catch (error) {
    notify(
      error instanceof DOMException
        ? "Não foi possível salvar. Verifique o espaço e as permissões do navegador."
        : error.message,
      true,
    );
    return false;
  }
}
function monthlyEntries(selectedMonth = month) {
  return F.filterEntries(data.entries, { month: selectedMonth });
}
function filteredEntries() {
  return F.filterEntries(data.entries, {
    month,
    type: $("#type-filter").value,
    category: $("#category-filter").value,
    search: $("#search").value,
  });
}
function renderSummary() {
  const stats = F.summarize(monthlyEntries());
  const cards = [
    [
      "Saldo do mês",
      stats.balance,
      "wallet",
      "featured",
      "Receitas menos despesas",
      "",
    ],
    [
      "Receitas",
      stats.income,
      "arrow-down",
      "",
      `${monthlyEntries().filter((e) => e.type === "income").length} receitas no período`,
      "Entrada",
    ],
    [
      "Despesas",
      stats.expense,
      "arrow-up",
      "expense-card",
      `${monthlyEntries().filter((e) => e.type === "expense").length} despesas no período`,
      "Saída",
    ],
    [
      "Taxa de economia",
      null,
      "pie",
      "saving-card",
      "Do total das suas receitas",
      "",
    ],
  ];
  $("#summary-grid").innerHTML = cards
    .map(
      ([label, value, glyph, className, description, badge]) =>
        `<article class="summary-card ${className}"><div class="summary-label">${label}<span class="card-icon">${icon(glyph)}</span></div><div class="summary-value">${value === null ? (privateMode ? "••• %" : stats.saving === null ? "—" : stats.saving.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%") : money(value)}</div><div class="summary-description">${badge ? `<span class="badge">${badge}</span>` : icon("chart")}${description}</div></article>`,
    )
    .join("");
}
function renderEvolution() {
  const months = Array.from({ length: 6 }, (_, i) => monthOffset(month, i - 5));
  const summaries = months.map((m) => F.summarize(monthlyEntries(m)));
  const largest = Math.max(
    ...summaries.flatMap((s) => [s.income, s.expense]),
    10000,
  );
  const step = 10 ** Math.floor(Math.log10(largest));
  const maximum = Math.ceil(largest / step) * step;
  const width = 560,
    height = 194,
    left = 57,
    right = 16,
    top = 12,
    bottom = 29;
  const x = (i) => left + (i * (width - left - right)) / 5;
  const y = (amount) =>
    height - bottom - (amount / maximum) * (height - top - bottom);
  let svg = "";
  for (let i = 0; i <= 4; i++) {
    const value = (maximum * i) / 4;
    const label = privateMode
      ? "•••"
      : (value / 100).toLocaleString("pt-BR", {
          notation: "compact",
          maximumFractionDigits: 1,
        });
    svg += `<line class="chart-grid" x1="${left}" x2="${width - right}" y1="${y(value)}" y2="${y(value)}"/><text class="chart-label" text-anchor="end" x="${left - 11}" y="${y(value) + 3}">${label}</text>`;
  }
  const incomePoints = summaries
    .map((s, i) => `${x(i)},${y(s.income)}`)
    .join(" ");
  svg += `<defs><linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#99b781" stop-opacity=".2"/><stop offset="100%" stop-color="#99b781" stop-opacity=".01"/></linearGradient></defs><polygon points="${left},${y(0)} ${incomePoints} ${x(5)},${y(0)}" fill="url(#area-fill)"/>`;
  for (const [key, color] of [
    ["expense", "#d5b176"],
    ["income", "#78966b"],
  ]) {
    svg += `<polyline points="${summaries.map((s, i) => `${x(i)},${y(s[key])}`).join(" ")}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linejoin="round"/>`;
    summaries.forEach((s, i) => {
      svg += `<circle cx="${x(i)}" cy="${y(s[key])}" r="3" fill="white" stroke="${color}" stroke-width="1.8"><title>${months[i]}: ${key === "income" ? "Receitas" : "Despesas"} ${money(s[key])}</title></circle>`;
    });
  }
  months.forEach((m, i) => {
    const label = new Date(m + "-01T12:00:00")
      .toLocaleDateString("pt-BR", { month: "short" })
      .replace(".", "");
    svg += `<text class="chart-label" text-anchor="middle" x="${x(i)}" y="${height - 5}">${label.charAt(0).toUpperCase() + label.slice(1)}</text>`;
  });
  const accessible = summaries
    .map(
      (s, i) =>
        `${months[i]}: receitas ${money(s.income)}, despesas ${money(s.expense)}`,
    )
    .join("; ");
  $("#evolution-chart").innerHTML =
    `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHTML(accessible)}">${svg}</svg>`;
}
function renderCategories() {
  const expenses = monthlyEntries().filter((entry) => entry.type === "expense");
  const total = F.summarize(expenses).expense;
  const groups = Object.entries(
    expenses.reduce((result, entry) => {
      result[entry.category] = (result[entry.category] || 0) + entry.amount;
      return result;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const displayed = groups.slice(0, 3);
  if (groups.length > 3)
    displayed.push([
      "Demais categorias",
      groups.slice(3).reduce((sum, group) => sum + group[1], 0),
    ]);
  const colors = ["#7c9566", "#b9c99f", "#dccba8", "#e7ece1"];
  let offset = 0;
  const gradient = displayed
    .map(([, amount], i) => {
      const start = offset;
      offset += (amount / total) * 100;
      return `${colors[i]} ${start}% ${offset}%`;
    })
    .join(",");
  $("#category-chart").innerHTML =
    `<div class="donut-row"><div class="donut" style="background:${total ? `conic-gradient(${gradient})` : "#eef2e9"}" role="img" aria-label="Total de despesas: ${escapeHTML(money(total))}"><div class="donut-center"><small>Total de despesas</small><strong>${money(total)}</strong></div></div></div>${total ? `<div class="category-legend">${displayed.map(([name, amount], i) => `<div class="category-line"><i class="legend-dot" style="background:${colors[i]}"></i><span>${name}</span><span class="category-percent">${privateMode ? "•••" : ((amount / total) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%"}</span></div>`).join("")}</div>` : '<p class="category-empty">Sem despesas neste mês.<br>Um novo começo para suas finanças.</p>'}`;
}
const categoryIcons = {
  Salário: "briefcase",
  Freelance: "briefcase",
  Alimentação: "coffee",
  Moradia: "home",
  Transporte: "car",
  Compras: "bag",
  Lazer: "sparkles",
  Saúde: "heart",
  Educação: "book",
};
function renderTable() {
  const entries = filteredEntries();
  const visible = view === "overview" ? entries.slice(0, 5) : entries;
  $("#transactions-body").innerHTML = visible
    .map(
      (entry) =>
        `<tr><td><div class="transaction-name"><span class="transaction-icon ${entry.type}">${icon(categoryIcons[entry.category] || "wallet")}</span><span title="${escapeHTML(entry.description)}">${escapeHTML(entry.description)}</span></div></td><td><span class="category-tag">${entry.category}</span></td><td>${entry.date.split("-").reverse().join("/")}</td><td><span class="type-badge ${entry.type === "income" ? "income-text" : "expense-text"}">${entry.type === "income" ? "Receita" : "Despesa"}</span></td><td class="amount-cell"><span class="amount-value ${entry.type === "expense" ? "expense-text" : ""}">${privateMode ? money(entry.amount) : (entry.type === "income" ? "+ " : "− ") + money(entry.amount)}</span></td><td><div class="row-actions"><button class="icon-button" data-edit="${entry.id}" aria-label="Editar ${escapeHTML(entry.description)}" title="Editar">${icon("edit")}</button><button class="icon-button" data-delete="${entry.id}" aria-label="Excluir ${escapeHTML(entry.description)}" title="Excluir">${icon("trash")}</button></div></td></tr>`,
    )
    .join("");
  $("#empty-state").hidden = visible.length > 0;
  const hasFilters =
    $("#search").value ||
    $("#type-filter").value !== "all" ||
    $("#category-filter").value !== "all";
  $("#empty-message").textContent = hasFilters
    ? "Tente outra busca ou ajuste os filtros."
    : "Registre sua primeira receita ou despesa usando “Novo lançamento”.";
  $("#table-count").textContent =
    `Mostrando ${visible.length} de ${entries.length} lançamentos`;
}
function render() {
  const title = {
    overview: "Visão geral",
    transactions: "Lançamentos",
    reports: "Relatórios",
    help: "Como usar",
  }[view];
  $("#page-title").textContent = title;
  $("#breadcrumb-label").textContent = title;
  $("#page-subtitle").textContent = {
    overview: "Um olhar sobre suas finanças. Mais controle para suas escolhas.",
    transactions: "Organize cada entrada e saída. Seu dinheiro, nos detalhes.",
    reports: "Entenda seus hábitos e acompanhe a evolução do seu dinheiro.",
    help: "Tudo o que você precisa para começar com mais clareza.",
  }[view];
  document.querySelectorAll("[data-view]").forEach((link) => {
    link.classList.toggle("active", link.dataset.view === view);
    if (link.dataset.view === view) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  const date = new Date(month + "-01T12:00:00");
  const label = date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  $("#month-label").textContent =
    label.charAt(0).toUpperCase() + label.slice(1);
  $("#month-picker").value = month;
  $("#previous-month").disabled = month <= "1900-01";
  $("#next-month").disabled = month >= "9999-12";
  $("#nav-count").textContent = data.entries.length;
  $("#demo-banner").hidden = !data.demo && !storageProblem;
  $("#demo-banner>div>span:last-child").innerHTML = storageProblem
    ? "O armazenamento precisa de atenção. <strong>Restaure um backup ou redefina para começar.</strong>"
    : "Explore à vontade. <strong>Você está vendo dados de exemplo.</strong>";
  $("#clear-demo").textContent = storageProblem
    ? "Redefinir armazenamento ↗"
    : "Começar do zero ↗";
  $("#summary-grid").hidden = view === "help";
  $("#analytics").hidden = !["overview", "reports"].includes(view);
  $("#transactions-panel").hidden = !["overview", "transactions"].includes(
    view,
  );
  $("#help-panel").hidden = view !== "help";
  $(".toolbar").hidden = view === "help";
  $("#table-title").textContent =
    view === "overview" ? "Últimos lançamentos" : "Todos os lançamentos";
  $("#see-all").hidden = view !== "overview";
  renderSummary();
  renderEvolution();
  renderCategories();
  renderTable();
}
function populateCategories(type, value) {
  const select = $("#transaction-form").elements.category;
  select.replaceChildren(
    ...F.categories[type].map((category) => new Option(category, category)),
  );
  if (value) select.value = value;
}
function openForm(id = null) {
  const form = $("#transaction-form");
  form.reset();
  editingId = id;
  $("#form-error").textContent = "";
  const entry = id ? data.entries.find((item) => item.id === id) : null;
  if (id && !entry) {
    notify("Este lançamento não está mais disponível.", true);
    return;
  }
  $("#dialog-title").textContent = entry
    ? "Editar lançamento"
    : "Novo lançamento";
  form.elements.type.value = entry?.type || "expense";
  populateCategories(form.elements.type.value, entry?.category);
  form.elements.description.value = entry?.description || "";
  form.elements.amount.value = entry
    ? (entry.amount / 100).toFixed(2).replace(".", ",")
    : "";
  form.elements.date.value =
    entry?.date ||
    (month === localDate(now).slice(0, 7) ? localDate(now) : month + "-01");
  $("#transaction-dialog").showModal();
  form.elements.description.focus();
}
function confirmAction(title, message, actionLabel = "Confirmar") {
  const dialog = $("#confirm-dialog");
  $("#confirm-title").textContent = title;
  $("#confirm-message").textContent = message;
  $("#confirm-action").textContent = actionLabel;
  dialog.returnValue = "";
  dialog.showModal();
  return new Promise((resolve) =>
    dialog.addEventListener(
      "close",
      () => resolve(dialog.returnValue === "confirm"),
      { once: true },
    ),
  );
}
$("#new-transaction").addEventListener("click", () => openForm());
document
  .querySelectorAll(".close-dialog")
  .forEach((button) =>
    button.addEventListener("click", () => $("#transaction-dialog").close()),
  );
$("#transaction-form").addEventListener("change", (event) => {
  if (event.target.name === "type") populateCategories(event.target.value);
});
$("#transaction-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const amount = F.parseAmount(form.elements.amount.value);
  const description = form.elements.description.value.trim();
  if (
    !description ||
    amount === null ||
    !F.validDate(form.elements.date.value)
  ) {
    $("#form-error").textContent =
      "Preencha a descrição, uma data válida e um valor de R$ 0,01 a R$ 999.999.999,99. Use vírgula para os centavos (ex.: 123,45).";
    return;
  }
  const entry = {
    id: editingId || crypto.randomUUID(),
    description,
    amount,
    date: form.elements.date.value,
    type: form.elements.type.value,
    category: form.elements.category.value,
  };
  const nextEntries = editingId
    ? data.entries.map((item) => (item.id === editingId ? entry : item))
    : [...data.entries, entry];
  const previousMonth = month;
  month = entry.date.slice(0, 7);
  if (commit({ ...data, entries: nextEntries })) {
    $("#transaction-dialog").close();
    $("#search").value = "";
    $("#type-filter").value = "all";
    $("#category-filter").value = "all";
    renderTable();
    notify(
      editingId
        ? "Lançamento atualizado."
        : "Lançamento salvo. Um passo a mais na sua organização!",
    );
  } else {
    month = previousMonth;
    render();
  }
});
$("#transactions-body").addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit]");
  if (editButton) {
    openForm(editButton.dataset.edit);
    return;
  }
  const deleteButton = event.target.closest("[data-delete]");
  if (!deleteButton) return;
  const id = deleteButton.dataset.delete;
  const entry = data.entries.find((item) => item.id === id);
  if (
    entry &&
    (await confirmAction(
      "Excluir lançamento?",
      `“${entry.description}” será removido dos seus registros. Essa ação não pode ser desfeita.`,
      "Excluir lançamento",
    ))
  ) {
    if (
      commit({
        ...data,
        entries: data.entries.filter((item) => item.id !== id),
      })
    )
      notify("Lançamento excluído.");
  }
});
$("#clear-demo").addEventListener("click", async () => {
  if (
    await confirmAction(
      "Começar do zero?",
      "Todos os lançamentos atuais, incluindo os que você adicionou, serão removidos. Exporte um backup antes de continuar se quiser guardá-los.",
      "Limpar lançamentos",
    )
  ) {
    if (commit({ version: 1, demo: false, entries: [] }, true))
      notify("Tudo pronto. Seu espaço agora começa com você.");
  }
});
function changeMonth(next) {
  if (!/^\d{4}-\d{2}$/.test(next) || !F.validDate(next + "-01")) return;
  month = next;
  render();
}
$("#previous-month").addEventListener("click", () =>
  changeMonth(monthOffset(month, -1)),
);
$("#next-month").addEventListener("click", () =>
  changeMonth(monthOffset(month, 1)),
);
$("#month-picker").min = "1900-01";
$("#month-picker").max = "9999-12";
$("#month-picker").addEventListener("change", (event) =>
  changeMonth(event.target.value),
);
$("#search").addEventListener("input", renderTable);
$("#type-filter").addEventListener("change", renderTable);
$("#category-filter").addEventListener("change", renderTable);
Object.values(F.categories)
  .flat()
  .forEach((category) =>
    $("#category-filter").add(new Option(category, category)),
  );
$("#privacy-toggle").addEventListener("click", () => {
  privateMode = !privateMode;
  $("#privacy-toggle").setAttribute("aria-pressed", String(privateMode));
  $("#privacy-toggle").setAttribute(
    "aria-label",
    privateMode ? "Mostrar valores" : "Ocultar valores",
  );
  $("#privacy-toggle").title = privateMode
    ? "Mostrar valores"
    : "Ocultar valores";
  $("#privacy-toggle").innerHTML = icon(privateMode ? "eye-off" : "eye");
  render();
});
function route() {
  view =
    {
      "#visao-geral": "overview",
      "#lancamentos": "transactions",
      "#relatorios": "reports",
      "#como-usar": "help",
    }[location.hash] || "overview";
  render();
}
window.addEventListener("hashchange", route);
$("#see-all").addEventListener("click", () => {
  location.hash = "lancamentos";
});
function download(content, name, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $(".export-menu").open = false;
}
$("#export-csv").addEventListener("click", () => {
  const entries = filteredEntries();
  if (!entries.length) {
    notify("Não há lançamentos nos filtros atuais para exportar.");
    return;
  }
  download(
    F.csv(entries),
    `clareza-lancamentos-${month}.csv`,
    "text/csv;charset=utf-8",
  );
  notify(`${entries.length} lançamentos exportados.`);
});
$("#export-json").addEventListener("click", () => {
  download(
    JSON.stringify(data, null, 2),
    `clareza-backup-${localDate(new Date())}.json`,
    "application/json",
  );
  notify("Backup exportado. Guarde o arquivo em um local seguro.");
});
$("#import-json").addEventListener("click", () => {
  $(".export-menu").open = false;
  $("#import-file").click();
});
$("#import-file").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  event.target.value = "";
  if (!file) return;
  try {
    if (file.size > 5 * 1024 * 1024)
      throw new Error("O backup deve ter no máximo 5 MB.");
    const imported = F.validateData(JSON.parse(await file.text()));
    if (
      await confirmAction(
        "Restaurar backup?",
        `Os ${imported.entries.length} lançamentos deste arquivo substituirão todos os registros atuais. Exporte um backup antes de continuar se quiser guardá-los.`,
        "Restaurar backup",
      )
    ) {
      if (commit(imported, true)) notify("Backup restaurado com sucesso.");
    }
  } catch (error) {
    notify(
      error instanceof SyntaxError
        ? "Este arquivo não é um backup JSON válido."
        : error.message,
      true,
    );
  }
});
window.addEventListener("storage", (event) => {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  $("#transaction-dialog").close();
  $("#confirm-dialog").close("cancel");
  data = loadData();
  render();
  notify("Dados atualizados a partir de outra aba.");
});
$("#today").textContent = now.toLocaleDateString("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
route();
