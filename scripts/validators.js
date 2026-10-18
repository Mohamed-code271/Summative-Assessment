var REGEX_RULES = {
  descriptionPattern: /^\S(?:.*\S)?$/,  
  doubleSpacePattern: /\s{2,}/,          
  amountPattern: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
  datePattern: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
  categoryPattern: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
  duplicateWordPattern: /\b(\w+)\s+\1\b/i  // advanced: back-reference
};


var FORM_FIELDS = [
  ["form-description", "err-description"],
  ["form-amount", "err-amount"],
  ["form-category", "err-category"],
  ["form-date", "err-date"]
];

function setFieldError(inputId, errorId, message) {
  document.getElementById(errorId).textContent = message;
  var input = document.getElementById(inputId);
  if (message === "") {
    input.removeAttribute("aria-invalid");
  } else {
    input.setAttribute("aria-invalid", "true");
  }
}

function clearFormErrors() {
  for (var i = 0; i < FORM_FIELDS.length; i++) {
    setFieldError(FORM_FIELDS[i][0], FORM_FIELDS[i][1], "");
  }
}


function validateTransactionFormInputs(descVal, amountVal, dateVal, categoryVal) {
  clearFormErrors();
  var ok = true;

  if (!descVal || descVal.trim() === "") {
    setFieldError("form-description", "err-description", "Description cannot be empty.");
    ok = false;
  } else if (!REGEX_RULES.descriptionPattern.test(descVal)) {
    setFieldError("form-description", "err-description", "No spaces at the start or end.");
    ok = false;
  } else if (REGEX_RULES.doubleSpacePattern.test(descVal)) {
    setFieldError("form-description", "err-description", "Use single spaces between words.");
    ok = false;
  } else if (REGEX_RULES.duplicateWordPattern.test(descVal)) {
    setFieldError("form-description", "err-description", "Repeated words are not allowed (e.g. 'the the').");
    ok = false;
  }

  if (!amountVal || amountVal.trim() === "") {
    setFieldError("form-amount", "err-amount", "Amount is required.");
    ok = false;
  } else if (!REGEX_RULES.amountPattern.test(amountVal)) {
    setFieldError("form-amount", "err-amount", "Enter a number with up to 2 decimal places.");
    ok = false;
  } else if (parseFloat(amountVal) <= 0) {
    setFieldError("form-amount", "err-amount", "Amount must be greater than zero.");
    ok = false;
  }

  if (!dateVal || !REGEX_RULES.datePattern.test(dateVal) || !isRealDateString(dateVal)) {
    setFieldError("form-date", "err-date", "Enter a real date as YYYY-MM-DD.");
    ok = false;
  }

  if (!categoryVal || !REGEX_RULES.categoryPattern.test(categoryVal) ||
      AppState.categories.indexOf(categoryVal) === -1) {
    setFieldError("form-category", "err-category", "Please choose a category from the list.");
    ok = false;
  }

  return ok;
}