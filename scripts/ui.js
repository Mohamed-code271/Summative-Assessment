function byId(id) {
  return document.getElementById(id);
}

function setText(id, text) {
  byId(id).textContent = String(text);
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

function formatNumber(amountRwf) {
  return convertFromBase(amountRwf).toFixed(2);
}

function formatMoney(amountRwf) {
  return AppState.displayCurrency + " " + formatNumber(amountRwf);
}

function renderStats() {
  setText("stat-count", AppState.records.length);
  setText("stat-total", formatMoney(getTotalExpenses()));
  setText("stat-top-category", getTopCategory());
}

function renderChart() {
  var days = getLast7DaysTotals();
  var biggest = 0;
  var html = "";
  var summary = "Spending over the last 7 days: ";

  for (var i = 0; i < days.length; i++) {
    if (days[i].total > biggest) {
      biggest = days[i].total;
    }
  }

  for (var j = 0; j < days.length; j++) {
    var percent = biggest === 0 ? 0 : (days[j].total / biggest) * 100;
    var label = days[j].date.slice(5); // "MM-DD"
    html += '<div class="chart-bar-wrapper">' +
            '<div class="chart-bar" data-height="' + percent + '"></div>' +
            '<span class="chart-label">' + label + '</span></div>';
    summary += label + ": " + formatMoney(days[j].total) + (j < days.length - 1 ? ", " : ".");
  }

  var chart = byId("trend-chart");
  chart.innerHTML = html;
  setText("chart-accessible-summary", summary);


  setTimeout(function () {
    var bars = chart.querySelectorAll(".chart-bar");
    for (var k = 0; k < bars.length; k++) {
      bars[k].style.height = bars[k].getAttribute("data-height") + "%";
    }
  }, 30);
}

function getBudgetStatus() {
  var total = getTotalExpenses();
  var cap = AppState.budgetCap;

  if (total > cap) {
    return { over: true,
             text: "Over budget by " + formatMoney(total - cap) + " (cap " + formatMoney(cap) + ")." };
  }
  return { over: false,
           text: "Remaining budget: " + formatMoney(cap - total) + " of " + formatMoney(cap) + "." };
}

function renderBudget() {
  var status = getBudgetStatus();
  var banner = byId("budget-alert-banner");

  setText("budget-alert-text", status.text);
  banner.classList.remove("hidden");
  if (status.over) {
    banner.classList.add("danger");
  } else {
    banner.classList.remove("danger");
  }
}


function renderTable() {
  var re = getSearchRegex();
  var list = getSortedRecords(filterRecords(AppState.records, re));
  var html = "";

  if (list.length === 0) {
    html = '<tr><td colspan="5" class="text-center">No transactions found.</td></tr>';
  }

  for (var i = 0; i < list.length; i++) {
    var r = list[i];
    var safeId = escapeHtml(r.id);
    var safeName = escapeHtml(r.description);

    html += "<tr>" +
      '<td data-label="Date">' + highlightMatches(r.date, re) + "</td>" +
      '<td data-label="Description">' + highlightMatches(r.description, re) + "</td>" +
      '<td data-label="Category">' + highlightMatches(r.category, re) + "</td>" +
      '<td data-label="Amount" class="text-right">' + AppState.displayCurrency + " " +
        highlightMatches(formatNumber(r.amount), re) + "</td>" +
      '<td data-label="Actions" class="text-center">' +
        '<button type="button" class="btn btn-secondary" data-action="edit" data-id="' + safeId +
          '" aria-label="Edit ' + safeName + '">Edit</button> ' +
        '<button type="button" class="btn btn-danger" data-action="delete" data-id="' + safeId +
          '" aria-label="Delete ' + safeName + '">Delete</button>' +
      "</td></tr>";
  }

  byId("table-body").innerHTML = html;
}



function fillCategorySelect() {
  var select = byId("form-category");
  var html = '<option value="">Select a category</option>';
  for (var i = 0; i < AppState.categories.length; i++) {
    var name = escapeHtml(AppState.categories[i]);
    html += '<option value="' + name + '">' + name + "</option>";
  }
  select.innerHTML = html;
}

function renderSettingsForm() {
  byId("settings-budget-cap").value = AppState.budgetCap;
  byId("rate-usd").value = AppState.exchangeUSD;
  byId("rate-eur").value = AppState.exchangeEUR;
  byId("display-currency").value = AppState.displayCurrency;
  byId("settings-categories").value = AppState.categories.join(", ");
}

function renderAll() {
    renderStats();
    renderChart();
    renderBudget();
    renderTable();
}