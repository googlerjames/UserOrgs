// BigQuery project, dataset, and table configuration
const PROJECT_ID = "YOUR_PROJECT_ID"; // Replace with your actual BigQuery project ID
const DATASET_ID = "YOUR_DATASET_ID"; // Replace with your actual BigQuery dataset ID
const TABLE_ID = "YOUR_TABLE_ID"; // Replace with your actual BigQuery table ID

/**
 * Lists all the users in a domain sorted by first name and saves the data to BigQuery.
 */
function listAllUsersAndSaveToBigQuery() {
  // Initialize an empty array to store user data
  var values = [];

  // Page token for iterating through user lists
  var pageToken;

  var page;

  // Loop through pages of users
  do {
    // Retrieve a page of users using Admin Directory API
    page = AdminDirectory.Users.list({
      domain: 'altostrat.com', // Replace 'altostrat.com' with your actual domain
      orderBy: 'givenName', // Sort users by first name
      maxResults: 100, // Limit results per page to 100
      pageToken: pageToken // Use page token for subsequent requests
    });

    // Extract users from the current page
    var users = page.users;

    // Check if any users were found on this page
    if (users) {
      // Loop through each user on the page
      for (var i = 0; i < users.length; i++) {
        var user = users[i]; // Get the current user

        // Extract relevant user information
        var fullName = user.name.fullName;
        var primaryEmail = user.primaryEmail;
        var orgUnitPath = user.orgUnitPath;

        // Create an object with user data for each row in the BigQuery table
        values.push({
          fullName: fullName,
          primaryEmail: primaryEmail,
          orgUnitPath: orgUnitPath
        });
      }
    } else {
      // Log a message if no users were found on this page
      Logger.log('No users found on page.');
    }

    // Update the page token for the next iteration
    pageToken = page.nextPageToken;
  } while (pageToken); // Continue iterating until no more pages are available

  // Create a BigQuery client instance
  const bigquery = BigQueryApp.getService();

  // Define the schema for the BigQuery table
  const schema = bigquery.newTableSchema()
    .addColumn('fullName', 'STRING') // Define a column for full name with data type string
    .addColumn('primaryEmail', 'STRING') // Define a column for primary email with data type string
    .addColumn('orgUnitPath', 'STRING'); // Define a column for org unit path with data type string

  // Create or replace the BigQuery table
  const table = bigquery.createTable(projectId, datasetId, tableId, schema);

  // Insert the collected user data into the BigQuery table
  table.insertRows(values);

  // Log a message indicating successful data insertion
  Logger.log('User data successfully saved to BigQuery.');
}
adding code file
