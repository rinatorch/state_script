// Create state names list
var stateNames = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];

// Create state abbreviations list
var stateAbbreviations = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  var menu = ui.createMenu('State Script');

// Build submenus
  var countiesSubMenu = ui.createMenu('Get Counties');

// Add a submenu for each state
  for (var i = 0; i < stateNames.length; i++) {
    countiesSubMenu.addItem(stateNames[i], 'populateCounties_' + stateNames[i].replace(/\s+/g, '_'));
  }

  var statesSubMenu = ui.createMenu('Get States');
  statesSubMenu.addItem('Print State Names', 'printStateNames');
  statesSubMenu.addItem('Print State Abbreviations', 'printStateAbbreviations');

  menu.addSubMenu(countiesSubMenu);
  menu.addSubMenu(statesSubMenu);
  menu.addItem('Print All', 'printCountiesAndStates');

// Add menu to the UI
  menu.addToUi();
}




// Create function to print counties and states
function printCountiesAndStates() {
   var ui = SpreadsheetApp.getUi();

// Add a message when user prints all. It takes a moment.
  var loadingMessage = "Take a breather. Fetching all counties and states.";
  var loadingAlert = ui.alert("This may take a moment", loadingMessage, ui.ButtonSet.OK);
  var sheet = SpreadsheetApp.getActiveSheet();
  var cell = sheet.getActiveCell();

// Clear any existing cell contents
  cell.clear();

// Set the cell values for headers
  cell.setValue("State Names");
  cell.offset(0, 1).setValue("County Names");

// Create variables to store county and state names
  var allCountyNames = [];
  var allStateNames = [];

// Add in DC
  stateNames.push("District of Columbia");

// Loop through all states
  for (var i = 0; i < stateNames.length; i++) {
    var stateName = stateNames[i];

// Define the API's base url
    var baseUrl = "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/georef-united-states-of-america-county/records?select=coty_name&order_by=coty_name";

// Define the query parameters as an object
    var queryParams = {
      where: "ste_name = '" + stateName + "'",
      limit: 100, // Adjust the limit as needed
    };

    do {

// Build the complete API URL with parameters
      var apiUrl = baseUrl + "&" + encodeQueryData(queryParams);

      var response = UrlFetchApp.fetch(apiUrl);

// Check for a successful response (HTTP status code 200)
      if (response.getResponseCode() === 200) {

// Parse the JSON response
        var json = response.getContentText();
        var data = JSON.parse(json);

// Extract county names from the API response
        var countyNames = data.results.map(function (result) {
          return result.coty_name[0]; // Extract the first item from the array
        });

// Add state names to the allStateNames array
        allStateNames = allStateNames.concat(Array(countyNames.length).fill(stateName));

// Add county names to the allCountyNames array
        allCountyNames = allCountyNames.concat(countyNames);

// Update the query parameters for pagination
        queryParams.offset = queryParams.offset ? queryParams.offset + 100 : 100;
      } else {
        Logger.log("API request failed with status code: " + response.getResponseCode());
        break;
      }
    } while (countyNames.length === 100); // Continue paging through as long as there are 100 results
  }

// Combine state names and county names into an array
  var combinedData = [];
  for (var j = 0; j < allStateNames.length; j++) {
    combinedData.push([allStateNames[j], allCountyNames[j]]);
  }

// Get the currently selected cell
  var dataCell = cell.offset(1, 0);

// Write the to spreadsheet
  dataCell.offset(0, 0, combinedData.length, 2).setValues(combinedData);
}


// Function to encode query parameters
function encodeQueryData(data) {
  var ret = [];
  for (var d in data) {
    ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
  }
  return ret.join('&');
}


function populateCounties_common(stateName) {
// Define the base URL for the API call
  var baseUrl = "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/georef-united-states-of-america-county/records?select=coty_name&order_by=coty_name";

// Define the query parameters as an object
  var queryParams = {
    where: "ste_name = '" + stateName + "'",
    limit: 100, // Adjust the limit as needed
  };

  var allCountyNames = []; // To store all county names

  do {
    // Build the complete URL with query parameters
    var apiUrl = baseUrl + "&" + encodeQueryData(queryParams);

    // Make the API GET request
    var response = UrlFetchApp.fetch(apiUrl);

    // Check for a successful response (HTTP status code 200)
    if (response.getResponseCode() === 200) {
      // Parse the JSON response
      var json = response.getContentText();
      var data = JSON.parse(json);

      // Extract county names from the API response
      var countyNames = data.results.map(function (result) {
        return result.coty_name[0]; // Extract the first item from the array
      });

      allCountyNames = allCountyNames.concat(countyNames); // Add to the list of all county names

      // Update the query parameters for pagination
      queryParams.offset = queryParams.offset ? queryParams.offset + 100 : 100;

    } else {
      Logger.log("API request failed with status code: " + response.getResponseCode());
      break; // Exit the loop on API request failure
    }
  } while (countyNames.length === 100); // Continue pagination as long as there are 100 results

  // Get the currently selected cell
  var sheet = SpreadsheetApp.getActiveSheet();
  var cell = sheet.getActiveCell();

  // Clear any existing content in the selected cell
  cell.setValue(stateName + ' Counties').offset(1, 0).clearDataValidations();

  // Write all county names to separate cells, stacked vertically
  for (var i = 0; i < allCountyNames.length; i++) {
    cell.offset(i + 1, 0).setValue(allCountyNames[i]);
  }
}

function printStates() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var cell = sheet.getActiveCell();

  var allStates = stateNames.concat("District of Columbia").concat(stateAbbreviations);
  var values = allStates.map(function(state) {
    return [state];
  });

  var range = cell.offset(1, 0, allStates.length, 1);
  range.setValues(values);
}

function printStateNames() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var cell = sheet.getActiveCell();

  // Clear any existing content in the selected cell
  cell.clear();

  // Set the cell value to "States"
  cell.setValue("States");

  // Sort the state names alphabetically
  var sortedStateNames = stateNames.concat("District of Columbia").sort();

  var values = sortedStateNames.map(function (state) {
    return [state];
  });

  var range = cell.offset(1, 0, values.length, 1);
  range.setValues(values);
}

function printStateAbbreviations() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var cell = sheet.getActiveCell();

  // Clear any existing content in the selected cell
  cell.clear();

  // Set the cell value to "Abbreviations"
  cell.setValue("Abbreviations");

  // Sort the state abbreviations alphabetically
  var sortedStateAbbreviations = stateAbbreviations.sort();

  var values = sortedStateAbbreviations.map(function (abbr) {
    return [abbr];
  });

  var range = cell.offset(1, 0, values.length, 1);
  range.setValues(values);
}


// Populate each state. It's not sophisticated, but it gets the job done.

function populateCounties_Alabama() {
  populateCounties_common('Alabama');
}

function populateCounties_Alaska() {
  populateCounties_common('Alaska');
}

function populateCounties_Arizona() {
  populateCounties_common('Arizona');
}

function populateCounties_Arkansas() {
  populateCounties_common('Arkansas');
}

function populateCounties_California() {
  populateCounties_common('California');
}

function populateCounties_Colorado() {
  populateCounties_common('Colorado');
}

function populateCounties_Connecticut() {
  populateCounties_common('Connecticut');
}

function populateCounties_Delaware() {
  populateCounties_common('Delaware');
}

function populateCounties_Florida() {
  populateCounties_common('Florida');
}

function populateCounties_Georgia() {
  populateCounties_common('Georgia');
}

function populateCounties_Hawaii() {
  populateCounties_common('Hawaii');
}

function populateCounties_Idaho() {
  populateCounties_common('Idaho');
}

function populateCounties_Illinois() {
  populateCounties_common('Illinois');
}

function populateCounties_Indiana() {
  populateCounties_common('Indiana');
}

function populateCounties_Iowa() {
  populateCounties_common('Iowa');
}

function populateCounties_Kansas() {
  populateCounties_common('Kansas');
}

function populateCounties_Kentucky() {
  populateCounties_common('Kentucky');
}

function populateCounties_Louisiana() {
  populateCounties_common('Louisiana');
}

function populateCounties_Maine() {
  populateCounties_common('Maine');
}

function populateCounties_Maryland() {
  populateCounties_common('Maryland');
}

function populateCounties_Massachusetts() {
  populateCounties_common('Massachusetts');
}

function populateCounties_Michigan() {
  populateCounties_common('Michigan');
}

function populateCounties_Minnesota() {
  populateCounties_common('Minnesota');
}

function populateCounties_Mississippi() {
  populateCounties_common('Mississippi');
}

function populateCounties_Missouri() {
  populateCounties_common('Missouri');
}

function populateCounties_Montana() {
  populateCounties_common('Montana');
}

function populateCounties_Nebraska() {
  populateCounties_common('Nebraska');
}

function populateCounties_Nevada() {
  populateCounties_common('Nevada');
}

function populateCounties_New_Hampshire() {
  populateCounties_common('New Hampshire');
}

function populateCounties_New_Jersey() {
  populateCounties_common('New Jersey');
}

function populateCounties_New_Mexico() {
  populateCounties_common('New Mexico');
}

function populateCounties_New_York() {
  populateCounties_common('New York');
}

function populateCounties_North_Carolina() {
  populateCounties_common('North Carolina');
}

function populateCounties_North_Dakota() {
  populateCounties_common('North Dakota');
}

function populateCounties_Ohio() {
  populateCounties_common('Ohio');
}

function populateCounties_Oklahoma() {
  populateCounties_common('Oklahoma');
}

function populateCounties_Oregon() {
  populateCounties_common('Oregon');
}

function populateCounties_Pennsylvania() {
  populateCounties_common('Pennsylvania');
}

function populateCounties_Rhode_Island() {
  populateCounties_common('Rhode Island');
}

function populateCounties_South_Carolina() {
  populateCounties_common('South Carolina');
}

function populateCounties_South_Dakota() {
  populateCounties_common('South Dakota');
}

function populateCounties_Tennessee() {
  populateCounties_common('Tennessee');
}

function populateCounties_Texas() {
  populateCounties_common('Texas');
}

function populateCounties_Utah() {
  populateCounties_common('Utah');
}

function populateCounties_Vermont() {
  populateCounties_common('Vermont');
}

function populateCounties_Virginia() {
  populateCounties_common('Virginia');
}

function populateCounties_Washington() {
  populateCounties_common('Washington');
}

function populateCounties_West_Virginia() {
  populateCounties_common('West Virginia');
}

function populateCounties_Wisconsin() {
  populateCounties_common('Wisconsin');
}

function populateCounties_Wyoming() {
  populateCounties_common('Wyoming');
}
