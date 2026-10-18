function loadSystemDataFromStorage() {
  // try/catch: if something inside "try" breaks, the code
  // inside "catch" runs instead of crashing the whole app.
  try {
    // --- Records ---
    var savedRecordsText = localStorage.getItem(STORAGE_KEY_RECORDS); // text or null

    if (savedRecordsText) {
      var savedRecords = JSON.parse(savedRecordsText); // text -> real data

      // Only accept it if it is really a list (array)
      if (Array.isArray(savedRecords)) {
        AppState.records = savedRecords;
      } else {
        AppState.records = [];
      }
    } else {
      AppState.records = []; // nothing saved yet
    }

    // --- Settings ---
    var savedConfigText = localStorage.getItem(STORAGE_KEY_CONFIG);

    if (savedConfigText) {
      var config = JSON.parse(savedConfigText);

      // We use "typeof ... === 'number'" instead of "||" so that
      // a saved value of 0 is kept and not replaced by the default.
      if (typeof config.budgetCap === "number") {
        AppState.budgetCap = config.budgetCap;
      }
      if (typeof config.exchangeUSD === "number") {
        AppState.exchangeUSD = config.exchangeUSD;
      }
      if (typeof config.exchangeEUR === "number") {
        AppState.exchangeEUR = config.exchangeEUR;
      }

      // Categories must be a list with at least one item
      if (Array.isArray(config.categories) && config.categories.length > 0) {
        AppState.categories = config.categories;
      }

      // Only accept currencies we know about
      if (config.displayCurrency === "RWF" ||
          config.displayCurrency === "USD" ||
          config.displayCurrency === "EUR") {
        AppState.displayCurrency = config.displayCurrency;
      }

      if (config.theme === "light" || config.theme === "dark") {
        AppState.theme = config.theme;
      }

      if (typeof config.searchCaseInsensitive === "boolean") {
        AppState.searchCaseInsensitive = config.searchCaseInsensitive;
      }
    }

    return true;

  } catch (error) {
    // Something went wrong (for example the saved text was damaged).
    // Log it and start with an empty list instead of crashing.
    console.error("Could not load saved data. Using defaults.", error);
    AppState.records = [];
    return false;
  }
}


function saveRecordsToLocalStorage() {
  try {
   
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(AppState.records));
    return true;
  } catch (error) {
    console.error("Could not save records.", error);
    return false;
  }
}

function saveConfigurationsToLocalStorage() {
  try {
    var settingsToSave = {
      budgetCap: AppState.budgetCap,
      exchangeUSD: AppState.exchangeUSD,
      exchangeEUR: AppState.exchangeEUR,
      categories: AppState.categories,
      displayCurrency: AppState.displayCurrency,
      theme: AppState.theme,
      searchCaseInsensitive: AppState.searchCaseInsensitive
    };

    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(settingsToSave));
    return true;
  } catch (error) {
    console.error("Could not save settings.", error);
    return false;
  }
}

function loadSeedDataIfEmpty(whenFinished) {
  
  if (AppState.records.length > 0) {
    whenFinished(false);
    return;
  }

  fetch("seed.json")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("seed.json was not found");
      }
      return response.json(); 
    })
    .then(function (data) {
      var check = validateImportedData(data);

      if (check.valid) {
        AppState.records = data;
        saveRecordsToLocalStorage();
        whenFinished(true);  
      } else {
        console.error("seed.json has problems:", check.errors);
        whenFinished(false);
      }
    })
    .catch(function (error) {
      
      console.error("Could not load seed data.", error);
      whenFinished(false);
    });
}



function isRealDateString(dateText) {
  var parts = dateText.split("-"); 
  var year = parseInt(parts[0], 10);
  var month = parseInt(parts[1], 10);
  var day = parseInt(parts[2], 10);

  var date = new Date(year, month - 1, day);

  return date.getFullYear() === year &&
         date.getMonth() === month - 1 &&
         date.getDate() === day;
}


function validateImportedData(data) {
  var errors = [];


  if (!Array.isArray(data)) {
    return { valid: false, errors: ["The file must contain a list of records."] };
  }
  if (data.length === 0) {
    return { valid: false, errors: ["The file has no records."] };
  }

  var seenIds = {}; 

  
  for (var i = 0; i < data.length; i++) {
    var rec = data[i];
    var label = "Record " + (i + 1) + ": "; 

    
    if (typeof rec !== "object" || rec === null || Array.isArray(rec)) {
      errors.push(label + "must be an object.");
      continue; 
    }

    
    if (typeof rec.id !== "string" || rec.id === "") {
      errors.push(label + "missing id.");
    } else if (seenIds[rec.id] === true) {
      errors.push(label + "duplicate id '" + rec.id + "'.");
    } else {
      seenIds[rec.id] = true;
    }


    if (typeof rec.description !== "string" ||
        !REGEX_RULES.descriptionPattern.test(rec.description)) {
      errors.push(label + "invalid description.");
    }

    
    if (typeof rec.amount !== "number" || !isFinite(rec.amount) || rec.amount <= 0) {
      errors.push(label + "amount must be a number above 0.");
    }


    if (typeof rec.category !== "string" || rec.category === "") {
      errors.push(label + "missing category.");
    }


    if (typeof rec.date !== "string" ||
        !REGEX_RULES.datePattern.test(rec.date) ||
        !isRealDateString(rec.date)) {
      errors.push(label + "invalid date (use YYYY-MM-DD).");
    }


    if (typeof rec.createdAt !== "string" || typeof rec.updatedAt !== "string") {
      errors.push(label + "missing createdAt or updatedAt.");
    }
  }


  return {
    valid: errors.length === 0,
    errors: errors.slice(0, 5)
  };
}

function exportRecordsAsJson() {
  return JSON.stringify(AppState.records, null, 2);
}


function escapeCsvField(value) {
  var text = String(value);

  
  if (/[",\n\r]/.test(text)) {
    return '"' + text.replace(/"/g, '""') + '"';
  }
  return text;
}


function exportRecordsAsCsv() {
  
  var lines = ["id,description,amount,category,date,createdAt,updatedAt"];

  for (var i = 0; i < AppState.records.length; i++) {
    var r = AppState.records[i];

    var oneRow = [
      escapeCsvField(r.id),
      escapeCsvField(r.description),
      escapeCsvField(r.amount),
      escapeCsvField(r.category),
      escapeCsvField(r.date),
      escapeCsvField(r.createdAt),
      escapeCsvField(r.updatedAt)
    ];

    lines.push(oneRow.join(",")); 
  }

  return lines.join("\n"); 
}

function downloadTextFile(filename, text, mimeType) {
  var blob = new Blob([text], { type: mimeType });
  var url = URL.createObjectURL(blob);

  var link = document.createElement("a");
  link.href = url;
  link.download = filename; 
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}