const SCRIPT_VERSION = "novus-mini-game-tracking-v2";

const REQUIRED_HEADERS = [
  "SessionId",
  "Timestart",
  "Timeend",
  "Timestamp",
  "Name",
  "Position",
  "GameRole",
  "Age",
  "District",
  "Phone",
  "Consent"
];

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, version: SCRIPT_VERSION }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents || "{}");
  const headers = ensureHeaders(sheet);
  const eventName = data.event || "submit";
  const sessionId = String(data.sessionId || Utilities.getUuid());
  const now = new Date();

  const rowInfo = ensureSessionRow(sheet, headers, sessionId, parseDate(data.timestart) || now);
  const rowValues = rowInfo.values;

  if (eventName === "start") {
    setIfEmpty(rowValues, headers, "Timestart", parseDate(data.timestart) || now);
  }

  if (eventName === "end" || eventName === "decline" || eventName === "submit") {
    setIfEmpty(rowValues, headers, "Timestart", parseDate(data.timestart) || now);
    setIfEmpty(rowValues, headers, "Timeend", parseDate(data.timeend) || now);
  }

  if (eventName === "submit") {
    setValue(rowValues, headers, "Timestamp", now);
    setValue(rowValues, headers, "Name", data.name || "");
    setValue(rowValues, headers, "Position", data.position || "");
    setValue(rowValues, headers, "GameRole", data.gameRole || "");
    setValue(rowValues, headers, "Age", data.age || "");
    setValue(rowValues, headers, "District", data.district || "");
    setValue(rowValues, headers, "Phone", data.phone || "");
    setValue(rowValues, headers, "Consent", data.consent || "");
  }

  sheet.getRange(rowInfo.rowNumber, 1, 1, headers.length).setValues([rowValues]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(REQUIRED_HEADERS);
    return REQUIRED_HEADERS.slice();
  }

  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(String);
  const missingHeaders = REQUIRED_HEADERS.filter(function (header) {
    return headers.indexOf(header) === -1;
  });

  if (missingHeaders.length) {
    sheet.getRange(1, headers.length + 1, 1, missingHeaders.length).setValues([missingHeaders]);
    return headers.concat(missingHeaders);
  }

  return headers;
}

function ensureSessionRow(sheet, headers, sessionId, timestart) {
  const rowNumber = findSessionRow(sheet, headers, sessionId);

  if (rowNumber) {
    const values = sheet.getRange(rowNumber, 1, 1, headers.length).getValues()[0];
    setValue(values, headers, "SessionId", sessionId);
    setIfEmpty(values, headers, "Timestart", timestart);
    return { rowNumber: rowNumber, values: values };
  }

  const values = new Array(headers.length).fill("");
  setValue(values, headers, "SessionId", sessionId);
  setValue(values, headers, "Timestart", timestart);
  sheet.appendRow(values);

  return {
    rowNumber: sheet.getLastRow(),
    values: values
  };
}

function findSessionRow(sheet, headers, sessionId) {
  const sessionColumn = headers.indexOf("SessionId") + 1;
  const lastRow = sheet.getLastRow();

  if (!sessionColumn || lastRow < 2) {
    return 0;
  }

  const values = sheet.getRange(2, sessionColumn, lastRow - 1, 1).getValues();

  for (let index = 0; index < values.length; index += 1) {
    if (String(values[index][0]) === sessionId) {
      return index + 2;
    }
  }

  return 0;
}

function setValue(rowValues, headers, header, value) {
  const index = headers.indexOf(header);

  if (index !== -1) {
    rowValues[index] = value;
  }
}

function setIfEmpty(rowValues, headers, header, value) {
  const index = headers.indexOf(header);

  if (index !== -1 && !rowValues[index]) {
    rowValues[index] = value;
  }
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
