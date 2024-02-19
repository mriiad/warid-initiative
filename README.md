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

- Go to "warid-app\config.json" and replace the password in the dbConfig with the same one used to connect to the database
- Go to the app's root "warid-app"
- Run `npm install`
- Run `npm start`
- If everything above was done as mentioned, you must see the following message in the logs: "Connected successfully to MongoDB server"

## API Testing

In order to the the routes you can already use POSTMAN to make API calls.
API automated tests will be created later, but as of now, our API can be tests using a REST caller.

Here are some functionalities to test (please replace the port by the one mentioned in the config.json, by default it's 3000):

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

## Contributing

We welcome contributions to improve and enhance the application. Please feel free to open issues for bugs, enhancements, or feature requests. Stay tuned for issues created by the maintainers for specific tasks and improvements.

## Note
Ensure that config.json is ignored in your Git repository to protect sensitive information. Use the following commands as needed:

To ignore changes: git update-index --assume-unchanged ./config.json
To track changes: git update-index --no-assume-unchanged ./config.json

## Contact

For any inquiries or issues, please open an issue on the GitHub repository.

Enjoy contributing to the Warid Initiative Blood Donation Application!

Please make sure to replace <port> in the API call example with the actual port number specified in your config.json file. Additionally, ensure that all the information is accurate and relevant to your project.

Enjoy!
