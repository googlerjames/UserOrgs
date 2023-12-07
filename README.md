## Code Explanation

This Apps Script code retrieves a list of users in a domain and stores their information in a BigQuery table. Here's a breakdown of the code:

**1. Configuration:**

* The code defines three constants: `PROJECT_ID`, `DATASET_ID`, and `TABLE_ID`. Replace these placeholders with your actual BigQuery project ID, dataset ID, and table ID to ensure data gets saved to the correct location.

* You will also need to add the AdminDirectory and BigQuery Advanced services from the menu in Apps Script 


**2. Function `listAllUsersAndSaveToBigQuery`:**

* This function retrieves all users from the domain 'altostrat.com' and saves their data to BigQuery.
* It uses the Admin Directory API to fetch users in pages of 100 users each.
* For each user, it extracts their full name, primary email, and organization unit path.
* The extracted data is stored in an array of objects, with each object representing one user.

**3. BigQuery Operations:**

* The code creates a BigQuery client instance using `BigQueryApp.getService()`.
* It defines a schema for the BigQuery table with three columns: `fullName`, `primaryEmail`, and `orgUnitPath`. The data type for each column is specified as `STRING`.
* The function checks if the BigQuery table already exists. If it doesn't exist, it creates the table with the specified schema using `createTable`.
* Finally, it inserts the collected user data into the BigQuery table using `insertRows`.


**Note:**

* You may need to enable billing for your Google Cloud Platform project to use these APIs.
* Remember to replace the placeholder values in the code with your actual IDs and credentials.

**Additional Resources:**

* Google Apps Script documentation: [https://developers.google.com/apps-script](https://developers.google.com/apps-script)
* BigQuery API documentation: [https://cloud.google.com/bigquery/docs/reference/rest](https://cloud.google.com/bigquery/docs/reference/rest)
* Admin Directory API documentation: [https://developers.google.com/admin-sdk/directory/v1/guides](https://developers.google.com/admin-sdk/directory/v1/guides)
