var REGEX_RULES = {
  descriptionPattern: /^\S(.*\S)?$/,
  amountPattern: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
  datePattern: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|\d|3)$/,
  duplicateWordPattern: /\b(\w+)\s+\1\b/i
};

function validateTransactionFormInputs(descVal, amountVal, dateVal, categoryVal) {
  document.getElementById("err-description").textContent = "";
  document.getElementById("err-amount").textContent = "";
  document.getElementById("err-date").textContent = "";
  document.getElementById("err-category").textContent = "";

  var hasValidationError = false;

  if (!descVal || descVal.trim() === "") {
    document.getElementById("err-description").textContent = "Description text title cannot be empty.";
    hasValidationError = true;
  } else if (!REGEX_RULES.descriptionPattern.test(descVal)) {
    document.getElementById("err-description").textContent = "No leading or trailing spaces allowed.";
    hasValidationError = true;
  } else if (REGEX_RULES.duplicateWordPattern.test(descVal)) {
    document.getElementById("err-description").textContent = "Advanced error rule: Sequential repeating words are forbidden.";
    hasValidationError = true;
  }

  if (!amountVal || amountVal.trim() === "") {
    document.getElementById("err-amount").textContent = "Transaction amount is required.";
    hasValidationError = true;
  } else if (!REGEX_RULES.amountPattern.test(amountVal)) {
    document.getElementById("err-amount").textContent = "Enter a valid positive number (max 2 decimal places).";
    hasValidationError = true;
  } else if (parseFloat(amountVal) <= 0) {
    document.getElementById("err-amount").textContent = "Amount value must be greater than zero.";
    hasValidationError = true;
  }

  if (!dateVal ||! REGEX_RULES.datePattern.test(dateVal)){
    document.getElementById("err-date").textContent="Provides a valid historical date using YYYY-MM-DD layout rules.";
         hasValidationError = true;
  }

  if (!categoryVal || AppState.categories.indexOf(categoryVal)===-1){
    document.getElementById("err-category").textContent = "Please select a standard category from the list.";
      hasValidationError = true;
  }

  return !hasValidationError

}