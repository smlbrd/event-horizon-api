# Event Horizon Api

This API is hosted online [here]([https://event-horizon-api-nuzf.onrender.com/api](https://event-horizon-api.up.railway.app/api/).

> Note: It is a free tier of hosting, so it may take up to a minute to spin up for the first time.

## Setup Instructions

1. **Clone the repository:**

   ```
   git clone https://github.com/smlbrd/event-horizon-api.git
   cd event-horizon-api
   ```

2. **Install dependencies:**

   To install the dependencies required to operate this project, run the following terminal command:

   ```
   npm install
   ```

3. **Set up environment variables:**

   To copy the `.env.example` file, run the following terminal command:

   ```
   cp .env.example
   ```

   Edit the name of this file and update it with your own database details.

   For testing, create `.env.test` and update the contents with your test database details.

   > **NOTE:** Never commit your `.env` files to version control. The `.env.example` file is safe to commit and shows others what variables are required.

4. **Set up and seed databases:**

   To create the databases for this project, run the following terminal command:

   ```
   npm run setup-dbs
   ```

   To seed the databases with data, run the following terminal command:

   ```
   npm run seed
   ```

5. **Run the application:**

   To interface with the API using a tool like Postman, and make data requests to run the following terminal command:

   ```
   npm start
   ```

   ## API Usage

   - Base URL: `http://localhost:3000/api`
   - Example request: `GET /api/events` will return a list of all events in the database.

   Making a GET request to `/api` will return a document detailing all available endpoints and their intended usage.

6. **Run tests:**

   The test database will be reseeded automatically for each test case. The test suite can be run with the following command:

   ```
   npm test
   ```
