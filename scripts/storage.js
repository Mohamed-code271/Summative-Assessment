function loadSystemDataFromStorage() {
  try {
    var savedRecordsJson = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (savedRecordsJson) {
      AppState.records = JSON.parse(savedRecordsJson);
    } else {
      AppState.records = [];
    }

    var savedConfigJson = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (savedConfigJson) {
      var parsedConfig = JSON.parse(savedConfigJson);
      AppState.budgetCap = parsedConfig.budgetCap || 150000;
      AppState.exchangeUSD = parsedConfig.exchangeUSD || 0.00074;
      AppState.exchangeEUR = parsedConfig.exchangeEUR || 0.00068;
    }
  } catch (error) {
    console.log("Storage load failed, initializing safe defaults.", error);
  }
}

function saveRecordsToLocalStorage() {
  localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(AppState.records));
}

function saveConfigurationsToLocalStorage() {
  var configPayload = {
    budgetCap: AppState.budgetCap,
    exchangeUSD: AppState.exchangeUSD,
    exchangeEUR: AppState.exchangeEUR
  };
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(configPayload));
}