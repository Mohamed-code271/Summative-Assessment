var AppState = {
  records: [],
  categories: ["Food", "Books", "Transport", "Entertainment", "Fees", "Tuition", "Other"],
  activeSort: "date-desc",
  searchPattern: "",
  searchCaseInsensitive: true,
  budgetCap: 210000,
  displayCurrency: "RWF",
  exchangeUSD: 0.00074,
  exchangeEUR: 0.00068,
  theme: "light",
  editingId: null
};

var STORAGE_KEY_RECORDS = "student_tracker_records_data";
var STORAGE_KEY_CONFIG = "student_tracker_config_data";

function generateRecordId() {
  var biggestNumber = 0;
  for (var i = 0; i < AppState.records.length; i++) {
    var numberPart = parseInt(AppState.records[i].id.slice(4), 10);
    if (!isNaN(numberPart) && numberPart > biggestNumber) {
      biggestNumber = numberPart;
    }
  }
  var nextNumber = String(biggestNumber + 1);
  while (nextNumber.length < 4) {
    nextNumber = "0" + nextNumber;
  }
  return "rec_" + nextNumber;
}

function formatDateToString(dateObject) {
  var year = dateObject.getFullYear();
  var month = dateObject.getMonth() + 1;
  var day = dateObject.getDate();
  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }
  return year + "-" + month + "-" + day;
}

function findRecordById(id) {
  for (var i = 0; i < AppState.records.length; i++) {
    if (AppState.records[i].id === id) {
      return AppState.records[i];
    }
  }
  return null;
}

function addRecord(data) {
  var now = new Date().toISOString();
  var newRecord = {
    id: generateRecordId(),
    description: data.description,
    amount: parseFloat(data.amount),
    category: data.category,
    date: data.date,
    createdAt: now,
    updatedAt: now
  };
  AppState.records.push(newRecord);
  saveRecordsToLocalStorage();
  return newRecord;
}

function updateRecord(id, data) {
  var record = findRecordById(id);
  if (record === null) {
    return null;
  }
  record.description = data.description;
  record.amount = parseFloat(data.amount);
  record.category = data.category;
  record.date = data.date;
  record.updatedAt = new Date().toISOString();
  saveRecordsToLocalStorage();
  return record;
}

function deleteRecord(id) {
  var keptRecords = [];
  for (var i = 0; i < AppState.records.length; i++) {
    if (AppState.records[i].id !== id) {
      keptRecords.push(AppState.records[i]);
    }
  }
  var somethingWasDeleted = keptRecords.length < AppState.records.length;
  AppState.records = keptRecords;
  saveRecordsToLocalStorage();
  return somethingWasDeleted;
}

function compareRecords(a, b) {
  var parts = AppState.activeSort.split("-");
  var field = parts[0];
  var direction = parts[1];
  var result = 0;

  if (field === "amount") {
    result = a.amount - b.amount;
  } else if (field === "description") {
    result = a.description.localeCompare(b.description);
  } else {
    if (a.date < b.date) {
      result = -1;
    } else if (a.date > b.date) {
      result = 1;
    }
  }

  if (direction === "desc") {
    result = result * -1;
  }
  return result;
}

function getSortedRecords(list) {
  var copy = list.slice();
  copy.sort(compareRecords);
  return copy;
}

function getTotalExpenses() {
  var total = 0;
  for (var i = 0; i < AppState.records.length; i++) {
    total = total + AppState.records[i].amount;
  }
  return total;
}

function getTopCategory() {
  var totals = {};
  for (var i = 0; i < AppState.records.length; i++) {
    var record = AppState.records[i];
    if (totals[record.category] === undefined) {
      totals[record.category] = 0;
    }
    totals[record.category] = totals[record.category] + record.amount;
  }

  var topCategory = "N/A";
  var topAmount = 0;
  for (var category in totals) {
    if (totals[category] > topAmount) {
      topCategory = category;
      topAmount = totals[category];
    }
  }
  return topCategory;
}

function getLast7DaysTotals() {
  var days = [];
  for (var i = 6; i >= 0; i--) {
    var day = new Date();
    day.setDate(day.getDate() - i);
    days.push({ date: formatDateToString(day), total: 0 });
  }

  for (var r = 0; r < AppState.records.length; r++) {
    var record = AppState.records[r];
    for (var d = 0; d < days.length; d++) {
      if (days[d].date === record.date) {
        days[d].total = days[d].total + record.amount;
      }
    }
  }
  return days;
}

function convertFromBase(amountInRwf) {
  if (AppState.displayCurrency === "USD") {
    return amountInRwf * AppState.exchangeUSD;
  }
  if (AppState.displayCurrency === "EUR") {
    return amountInRwf * AppState.exchangeEUR;
  }
  return amountInRwf;
}