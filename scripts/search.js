function compileRegex(input, flags) {
  try {
    return input ? new RegExp(input, flags) : null;
  } catch (error) {
    return null;
  }
}


function getSearchRegex() {
  var flags = AppState.searchCaseInsensitive ? "gi" : "g";
  return compileRegex(AppState.searchPattern, flags);
}


function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}


function highlightMatches(text, re) {
  text = String(text);
  if (!re) {
    return escapeHtml(text);
  }

  var result = "";
  var lastIndex = 0;
  var match;
  re.lastIndex = 0;

  while ((match = re.exec(text)) !== null) {
    if (match[0] === "") {   
      re.lastIndex++;
      continue;
    }
    result += escapeHtml(text.slice(lastIndex, match.index));
    result += "<mark>" + escapeHtml(match[0]) + "</mark>";
    lastIndex = match.index + match[0].length;
  }

  return result + escapeHtml(text.slice(lastIndex));
}

function filterRecords(list, re) {
  if (!re) {
    return list;
  }
  var found = [];
  for (var i = 0; i < list.length; i++) {
    var r = list[i];
    var amountText = convertFromBase(r.amount).toFixed(2);
    if (r.date.search(re) !== -1 ||
        r.description.search(re) !== -1 ||
        r.category.search(re) !== -1 ||
        amountText.search(re) !== -1) {
      found.push(r);
    }
  }
  return found;
}