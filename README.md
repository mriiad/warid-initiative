# Warid Initiative Blood Donation Application

The Warid Initiative Blood Donation Application is a project aimed at facilitating blood donation activities for the Warid Initiative association based in Morocco. This application streamlines the process of blood donation, making it easier for donors to contribute and for the association to manage donations.

<p align="center">
  <img src="https://user-images.githubusercontent.com/48014410/192161623-ac0f8553-7efc-4358-8c9c-719d7e9afaa3.png">
</p>

## Getting Started

### Prerequisites

* Node.js and npm installed
* MongoDB account


### Installation and Setup

## Database

- Go to https://www.mongodb.com/ and create an account if you don't have one
- Create a cluster with the name: "warid"
- Go to "Database Access" tab and "Add new database user" (button in top right) with the "Read and write to any database" access
- Enter a custom password or generate one automatically
- Go back to the "Database" tab and then click "Connect"
- Choose the desired connection and copy the connection string
- Replace the <password> in the string the one already submitted when creating the user
- Connect to the database

## Node server

- Copy `.env.example` to `.env` in the repo root and fill in real values (at minimum `DB_USER`, `DB_PASSWORD`, and `JWT_SECRET_KEY`) -- see `.env.example` for what each variable does. The app boots with working defaults for everything even without a `.env` file, but don't rely on those past local development.
- Go to the app's root "warid-app"
- Run `npm install`
- Run `npm start`
- If everything above was done as mentioned, you must see the following message in the logs: "Connected successfully to MongoDB server"

## API Testing

## Swagger / OpenAPI

After starting the backend, the API documentation is available at:

- Swagger UI: `http://localhost:<port>/api-docs`
- OpenAPI JSON: `http://localhost:<port>/api-docs.json`

Use the **Authorize** button in Swagger UI to provide the JWT access token returned by `POST /api/auth/login` when testing protected endpoints.

In order to the the routes you can already use POSTMAN to make API calls.
API automated tests will be created later, but as of now, our API can be tests using a REST caller.

Here are some functionalities to test (please replace the port by the one set via the `PORT` env var, by default it's 3000):

- Signup:
  URL: http://localhost:<port>/api/auth/signup
  PAYLOAD:

```
{
    "username": "username",
    "email": "email@email.com",
    "password": "password",
    "phoneNumber": "0000000000",
}
```

## Deployment

See `DEPLOYMENT.md` for how this app ships to production (a single Docker image, deployed via a Render Blueprint).

## Contributing

We welcome contributions to improve and enhance the application. Please feel free to open issues for bugs, enhancements, or feature requests. Stay tuned for issues created by the maintainers for specific tasks and improvements.

## Note
Configuration lives in environment variables (see `.env.example`), read via `src/utils/config.js`. `.env` is gitignored -- never commit real secrets.

## Contact

For any inquiries or issues, please open an issue on the GitHub repository.

Enjoy contributing to the Warid Initiative Blood Donation Application!

Please make sure to replace <port> in the API call example with the actual port number specified in your `.env` file (`PORT`). Additionally, ensure that all the information is accurate and relevant to your project.

Enjoy!
