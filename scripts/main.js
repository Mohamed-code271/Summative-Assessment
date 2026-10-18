var SECTION_NAMES = ["about", "dashboard", "records", "settings"];
var CATEGORY_NAME_PATTERN = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;
var FORM_PAIRS = [
  ["form-description", "err-description"],
  ["form-amount", "err-amount"],
  ["form-category", "err-category"],
  ["form-date", "err-date"]
];


function showSection(name) {
  if (SECTION_NAMES.indexOf(name) === -1) {
    name = "dashboard";
  }
  for (var i = 0; i < SECTION_NAMES.length; i++) {
    var section = byId(SECTION_NAMES[i]);
    if (SECTION_NAMES[i] === name) {
      section.classList.remove("hidden");
    } else {
      section.classList.add("hidden");
    }
  }

  var links = document.querySelectorAll(".nav-item");
  for (var j = 0; j < links.length; j++) {
    if (links[j].getAttribute("href") === "#" + name) {
      links[j].classList.add("active");
      links[j].setAttribute("aria-current", "page");
    } else {
      links[j].classList.remove("active");
      links[j].removeAttribute("aria-current");
    }
  }
}

function handleHashChange() {
  var name = window.location.hash.replace("#", "");
  if (name === "main-content") {   
    return;
  }
  showSection(name);
}


function applyTheme() {
  document.documentElement.setAttribute("data-theme", AppState.theme);
}

function handleThemeToggle() {
  AppState.theme = AppState.theme === "dark" ? "light" : "dark";
  applyTheme();
  saveConfigurationsToLocalStorage();
  showMessage("Switched to " + AppState.theme + " theme.");
}


function announceAfterChange(actionText) {
  var status = getBudgetStatus();
  if (status.over) {
    showMessage(actionText);
    showAlert(status.text);
  } else {
    showMessage(actionText + " " + status.text);
  }
}



function clearFormErrorMessages() {
  for (var i = 0; i < FORM_PAIRS.length; i++) {
    byId(FORM_PAIRS[i][1]).textContent = "";
  }
}


function focusFirstFormError() {
  for (var i = 0; i < FORM_PAIRS.length; i++) {
    if (byId(FORM_PAIRS[i][1]).textContent !== "") {
      byId(FORM_PAIRS[i][0]).focus();
      return;
    }
  }
}

function openForm(record) {
  clearFormErrorMessages();
  byId("form-container").classList.remove("hidden");

  if (record) {
    AppState.editingId = record.id;
    byId("form-title").textContent = "Edit Transaction";
    byId("form-id").value = record.id;
    byId("form-description").value = record.description;
    byId("form-amount").value = record.amount;
    byId("form-category").value = record.category;
    byId("form-date").value = record.date;
  } else {
    AppState.editingId = null;
    byId("form-title").textContent = "Add Transaction";
    byId("transaction-form").reset();
    byId("form-id").value = "";
    byId("form-date").value = formatDateToString(new Date());
  }
  byId("form-description").focus();
}

function closeForm() {
  byId("form-container").classList.add("hidden");
  AppState.editingId = null;
  clearFormErrorMessages();
  byId("btn-open-add").focus();
}

function handleFormSubmit(event) {
  event.preventDefault();

  var data = {
    description: byId("form-description").value,
    amount: byId("form-amount").value,
    category: byId("form-category").value,
    date: byId("form-date").value
  };

  var valid = validateTransactionFormInputs(data.description, data.amount, data.date, data.category);

  if (!valid) {
    showAlert("The form has errors. Please fix them and try again.");
    focusFirstFormError();
    return;
  }

  var message;
  if (AppState.editingId) {
    updateRecord(AppState.editingId, data);
    message = "Transaction updated.";
  } else {
    addRecord(data);
    message = "Transaction added.";
  }

  closeForm();
  renderAll();
  announceAfterChange(message);
}


function handleTableClick(event) {
  var button = event.target.closest("button");
  if (!button) {
    return;
  }
  var id = button.getAttribute("data-id");
  var action = button.getAttribute("data-action");

  if (action === "edit") {
    openForm(findRecordById(id));
  } else if (action === "delete") {
    if (confirm("Delete this transaction?")) {
      deleteRecord(id);
      renderAll();
      byId("btn-open-add").focus();
      announceAfterChange("Transaction deleted.");
    }
  }
}



function handleSearchInput() {
  var input = byId("search-input");
  var error = byId("search-error");
  AppState.searchPattern = input.value;

  if (input.value !== "" && compileRegex(input.value, "g") === null) {
    error.classList.remove("hidden");
    input.setAttribute("aria-invalid", "true");
  } else {
    error.classList.add("hidden");
    input.removeAttribute("aria-invalid");
  }
  renderTable();
}

function handleCaseToggle() {
  AppState.searchCaseInsensitive = byId("search-case").checked;
  saveConfigurationsToLocalStorage();
  renderTable();
}

function handleSortChange() {
  AppState.activeSort = byId("sort-select").value;
  renderTable();
}



function handleSaveBudget() {
  var text = byId("settings-budget-cap").value;
  if (!REGEX_RULES.amountPattern.test(text)) {
    showAlert("Enter a valid spending cap, for example 150000.");
    return;
  }
  AppState.budgetCap = parseFloat(text);
  saveConfigurationsToLocalStorage();
  renderAll();
  announceAfterChange("Spending cap updated.");
}

function handleSaveRates() {
  var usd = parseFloat(byId("rate-usd").value);
  var eur = parseFloat(byId("rate-eur").value);
  if (isNaN(usd) || usd <= 0 || isNaN(eur) || eur <= 0) {
    showAlert("Rates must be numbers greater than 0.");
    return;
  }
  AppState.exchangeUSD = usd;
  AppState.exchangeEUR = eur;
  saveConfigurationsToLocalStorage();
  renderAll();
  showMessage("Exchange rates saved.");
}

function handleCurrencyChange() {
  AppState.displayCurrency = byId("display-currency").value;
  saveConfigurationsToLocalStorage();
  renderAll();
  showMessage("Now showing amounts in " + AppState.displayCurrency + ".");
}

function handleSaveCategories() {
  var parts = byId("settings-categories").value.split(",");
  var cleaned = [];

  for (var i = 0; i < parts.length; i++) {
    var name = parts[i].trim();
    if (name === "") {
      continue;
    }
    if (!CATEGORY_NAME_PATTERN.test(name)) {
      showAlert("Invalid category '" + name + "'. Use letters, spaces and hyphens only.");
      return;
    }
    if (cleaned.indexOf(name) === -1) {
      cleaned.push(name);
    }
  }

  if (cleaned.length === 0) {
    showAlert("Please enter at least one category.");
    return;
  }
  AppState.categories = cleaned;
  saveConfigurationsToLocalStorage();
  fillCategorySelect();
  showMessage("Categories saved.");
}

function addMissingCategories() {
  for (var i = 0; i < AppState.records.length; i++) {
    var cat = AppState.records[i].category;
    if (AppState.categories.indexOf(cat) === -1) {
      AppState.categories.push(cat);
    }
  }
  saveConfigurationsToLocalStorage();
  fillCategorySelect();
}

function handleExportJson() {
  downloadTextFile("transactions.json", exportRecordsAsJson(), "application/json");
  showMessage("JSON file downloaded.");
}

function handleExportCsv() {
  downloadTextFile("transactions.csv", exportRecordsAsCsv(), "text/csv");
  showMessage("CSV file downloaded.");
}

function handleImportFile(event) {
  var file = event.target.files[0];
  var feedback = byId("import-validation-feedback");
  feedback.textContent = "";
  if (!file) {
    return;
  }

  var reader = new FileReader();

  reader.onload = function () {
    var data;
    try {
      data = JSON.parse(reader.result);
    } catch (error) {
      feedback.textContent = "That file is not valid JSON.";
      showAlert("Import failed. No data was changed.");
      return;
    }

    var check = validateImportedData(data);
    if (!check.valid) {
      feedback.textContent = check.errors.join(" ");
      showAlert("Import failed. No data was changed.");
      return;
    }

    AppState.records = data;
    saveRecordsToLocalStorage();
    addMissingCategories();
    renderSettingsForm();
    renderAll();
    announceAfterChange("Imported " + data.length + " records.");
  };

  reader.onerror = function () {
    feedback.textContent = "The file could not be read.";
  };

  reader.readAsText(file);
  event.target.value = "";
}



function setupEvents() {
  window.addEventListener("hashchange", handleHashChange);
  byId("theme-toggle").addEventListener("click", handleThemeToggle);

  byId("search-input").addEventListener("input", handleSearchInput);
  byId("search-case").addEventListener("change", handleCaseToggle);
  byId("sort-select").addEventListener("change", handleSortChange);

  byId("btn-open-add").addEventListener("click", function () { openForm(null); });
  byId("btn-cancel-form").addEventListener("click", closeForm);
  byId("transaction-form").addEventListener("submit", handleFormSubmit);
  byId("table-body").addEventListener("click", handleTableClick);

  byId("btn-save-budget").addEventListener("click", handleSaveBudget);
  byId("btn-save-rates").addEventListener("click", handleSaveRates);
  byId("display-currency").addEventListener("change", handleCurrencyChange);
  byId("btn-save-categories").addEventListener("click", handleSaveCategories);

  byId("btn-export-json").addEventListener("click", handleExportJson);
  byId("btn-export-csv").addEventListener("click", handleExportCsv);
  byId("btn-import-file").addEventListener("change", handleImportFile);
}

function init() {
  loadSystemDataFromStorage();
  applyTheme();
  fillCategorySelect();
  renderSettingsForm();
  byId("sort-select").value = AppState.activeSort;
  byId("search-case").checked = AppState.searchCaseInsensitive;
  setupEvents();
  handleHashChange();
  renderAll();

  loadSeedDataIfEmpty(function (wasLoaded) {
    if (wasLoaded) {
      addMissingCategories();
      renderAll();
      showMessage("Sample data loaded.");
    }
  });
}

document.addEventListener("DOMContentLoaded", init);