function byId(id) {
  return document.getElementById(id);
}

function formatMoney(amountInRwf) {
  var value = convertFromBase(amountInRwf);
  return AppState.displayCurrency + " " + value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}


function showMessage(text) {
  var box = byId("aria-status");
  box.textContent = "";
  
  setTimeout(function () { box.textContent = text; }, 50);
}


function showAlert(text) {
  var box = byId("aria-alert");
  box.textContent = "";
  setTimeout(function () { box.textContent = text; }, 50);
}


function getMonthTotal() {
  var prefix = formatDateToString(new Date()).slice(0, 7); 
  var total = 0;
  for (var i = 0; i < AppState.records.length; i++) {
    if (AppState.records[i].date.indexOf(prefix) === 0) {
      total = total + AppState.records[i].amount;
    }
  }
  return total;
}

function getBudgetStatus() {
  var spent = getMonthTotal();
  var cap = AppState.budgetCap;

  if (spent > cap) {
    return {
      over: true,
      text: "Over budget by " + formatMoney(spent - cap) +
            " (monthly limit " + formatMoney(cap) + ")."
    };
  }
  return {
    over: false,
    text: formatMoney(cap - spent) + " remaining of this month's limit."
  };
}


function renderChart() {
  var chart = byId("trend-chart");
  var days = getLast7DaysTotals();
  var max = 0;
  var i;

  for (i = 0; i < days.length; i++) {
    if (days[i].total > max) {
      max = days[i].total;
    }
  }

  chart.innerHTML = "";
  var summary = [];

  for (i = 0; i < days.length; i++) {
    var percent = max > 0 ? (days[i].total / max) * 100 : 0;

    var wrapper = document.createElement("div");
    wrapper.className = "chart-bar-wrapper";

    var bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.setAttribute("data-height", percent);
    bar.title = days[i].date + ": " + formatMoney(days[i].total);

    var label = document.createElement("span");
    label.className = "chart-label";
    label.textContent = days[i].date.slice(5); // "MM-DD"

    wrapper.appendChild(bar);
    wrapper.appendChild(label);
    chart.appendChild(wrapper);

    summary.push(days[i].date + ": " + formatMoney(days[i].total));
  }

  // Set heights after a tiny delay so the CSS transition animates the bars
  setTimeout(function () {
    var bars = chart.querySelectorAll(".chart-bar");
    for (var b = 0; b < bars.length; b++) {
      bars[b].style.height = bars[b].getAttribute("data-height") + "%";
    }
  }, 30);

  byId("chart-accessible-summary").textContent =
    "Spending over the last 7 days. " + summary.join(". ") + ".";
}

function renderDashboard() {
  byId("stat-count").textContent = AppState.records.length;
  byId("stat-total").textContent = formatMoney(getTotalExpenses());
  byId("stat-top-category").textContent = getTopCategory();

  var status = getBudgetStatus();
  var banner = byId("budget-alert-banner");
  byId("budget-alert-text").textContent = status.text;
  banner.classList.remove("hidden");
  if (status.over) {
    banner.classList.add("danger");
  } else {
    banner.classList.remove("danger");
  }

  renderChart();
}


function renderTable() {
  var body = byId("table-body");
  var re = getSearchRegex();
  var rows = getSortedRecords(filterRecords(AppState.records, re));

  if (rows.length === 0) {
    body.innerHTML = '<tr><td colspan="5" class="text-center">No transactions found.</td></tr>';
    return;
  }

  var html = "";
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    var amountText = convertFromBase(r.amount).toFixed(2);
    var safeName = escapeHtml(r.description);

    html += "<tr>" +
      "<td>" + highlightMatches(r.date, re) + "</td>" +
      "<td>" + highlightMatches(r.description, re) + "</td>" +
      "<td>" + highlightMatches(r.category, re) + "</td>" +
      '<td class="text-right">' + AppState.displayCurrency + " " +
        highlightMatches(amountText, re) + "</td>" +
      '<td class="text-center">' +
        '<button type="button" class="btn btn-secondary" data-action="edit" data-id="' +
          escapeHtml(r.id) + '" aria-label="Edit ' + safeName + '">Edit</button> ' +
        '<button type="button" class="btn btn-danger" data-action="delete" data-id="' +
          escapeHtml(r.id) + '" aria-label="Delete ' + safeName + '">Delete</button>' +
      "</td></tr>";
  }
  body.innerHTML = html;
}



function fillCategorySelect() {
  var select = byId("form-category");
  var previous = select.value;
  select.innerHTML = "";

  for (var i = 0; i < AppState.categories.length; i++) {
    var option = document.createElement("option");
    option.value = AppState.categories[i];
    option.textContent = AppState.categories[i];
    select.appendChild(option);
  }

  if (previous && AppState.categories.indexOf(previous) !== -1) {
    select.value = previous;
  }
}

function renderSettingsForm() {
  byId("settings-budget-cap").value = AppState.budgetCap;
  byId("rate-usd").value = AppState.exchangeUSD;
  byId("rate-eur").value = AppState.exchangeEUR;
  byId("display-currency").value = AppState.displayCurrency;
  byId("settings-categories").value = AppState.categories.join(", ");
}



function renderAll() {
  renderDashboard();
  renderTable();
}