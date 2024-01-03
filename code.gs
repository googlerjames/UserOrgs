/*
 * THIS IS SAMPLE CODE
 *
 * Copyright 2024 Google
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * Author James Ferreira
 */


// BigQuery project, dataset, and table configuration
const PROJECT_ID = "YOUR_PROJECT_ID"; // Replace with your actual BigQuery project ID
const DATASET_ID = "YOUR_DATASET_ID"; // Replace with your actual BigQuery dataset ID. If the dataset does not exist one will be created
const TABLE_ID = "YOUR_TABLE_ID" // Replace with your Table ID. If the Table does not exist one will be created
const DOMAIN = "" //Replace with your domain ex: altostrat.com
const APPEND = false //Will use insert/update if false


/**
 * Uploads a single sheet to BigQuery.
 *
 * 
 * @return {string} status - Returns the status of the job.
 */
function DirectoryToBigQuery() {
  
  // Initialize an empty array to store user data
  var people = [];

  // Page token for iterating through user lists
  var pageToken;
  var page;

  // Loop through pages of users
  do {
    // Retrieve a page of users using Admin Directory API
    page = AdminDirectory.Users.list({
      domain: DOMAIN, 
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
        var fullName = '"'+user.name.fullName+'"';
        var primaryEmail = '"'+user.primaryEmail+'"';
        var orgUnitPath = '"'+user.orgUnitPath+'"';

        // Create an object with user data for each row in the BigQuery table
        people.push([fullName,primaryEmail,orgUnitPath]);
      }
    } else {
      // Log a message if no users were found on this page
      Logger.log('No users found on page.');
    }

    // Update the page token for the next iteration
    pageToken = page.nextPageToken;
  } while (pageToken); // Continue iterating until no more pages are available

  try {
    createDatasetIfDoesntExist(PROJECT_ID, DATASET_ID);
  } catch (e) {
    return `${e}: Please verify your "Project ID" exists and you have permission to edit BigQuery`;
  }

  // Create the BigQuery load job config. For more information, see:
  // https://developers.google.com/apps-script/advanced/bigquery
  let loadJob = {
    configuration: {
      load: {
        destinationTable: {
          projectId: PROJECT_ID,
          datasetId: DATASET_ID,
          tableId: TABLE_ID
        },
        schema: {
          fields: [
            {name: 'fullName', type: 'STRING'},
            {name: 'primaryEmail', type: 'STRING'},
            {name: 'orgUnitPath', type: 'STRING'}
          ]
        },
        autodetect: true,  // Infer schema from contents.
        writeDisposition: APPEND ? 'WRITE_APPEND' : 'WRITE_TRUNCATE',
      }
    }
  };

  // BigQuery load jobs can only load files, so we need to transform our
  // rows (matrix of values) into a blob (file contents as string).
  // For convenience, we convert the rows into a CSV data string.
  // https://cloud.google.com/bigquery/docs/loading-data-local
  let csvRows = people
  let csvData = csvRows.map(values => values.join(',')).join('\n');
  let blob = Utilities.newBlob(csvData, 'application/octet-stream');

  // Run the BigQuery load job.
  try {
    BigQuery.Jobs.insert(loadJob, PROJECT_ID, blob);
  } catch (e) {
    return e;
  }

  Logger.log(
    'Load job started. Click here to check your jobs: ' +
    `https://console.cloud.google.com/bigquery?project=${PROJECT_ID}&page=jobs`
  );

  // The status of a successful run contains the timestamp.
  return `Last run: ${new Date()}`;
}



/**
 * Creates a dataset if it doesn't exist, otherwise does nothing.
 *
 * @param {string} projectId - Google Cloud Project ID.
 * @param {string} datasetId - BigQuery Dataset ID.
 */
function createDatasetIfDoesntExist(projectId, datasetId) {
  try {
    BigQuery.Datasets.get(projectId, datasetId);
  } catch (err) {
    let dataset = {
      datasetReference: {
        projectId: projectId,
        datasetId: datasetId,
      },
    };
    BigQuery.Datasets.insert(dataset, projectId);
    Logger.log(`Created dataset: ${projectId}:${datasetId}`);
  }
}

