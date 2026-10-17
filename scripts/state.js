var AppState = {
  records: [],
  categories: ["Food", "Books", "Transport", "Entertainment", "Tuition", "Other"],
  activeSort: "date-desc",
  
  budgetCap: 210000, 
  exchangeUSD: 0.00074, 
  exchangeEUR: 0.00068
};

var STORAGE_KEY_RECORDS = "student_tracker_records_data";
var STORAGE_KEY_CONFIG = "student_tracker_config_data";