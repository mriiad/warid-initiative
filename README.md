# warid-initiative

A blood donation application for "Warid Initiative" association based in Morocco

<p align="center">
  <img src="https://user-images.githubusercontent.com/48014410/192161623-ac0f8553-7efc-4358-8c9c-719d7e9afaa3.png">
</p>

Follow these steps to run the project locally after pulling it:

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
    "firstName": "First Name",
    "lastName": "Last Name",
    "birthDate": "2002-12-09",
    "email": "email@email.com",
    "gender": "male",
    "password": "password",
    "phoneNumber": "0000000000",
    "bloodGroup": "Aplus",
    "lastDonationDate": "2022-01-01",
    "donationType": "blood"
}
```

## Contributing

Some issues will be created soon in order to improve/fix some parts of the project, so stay tuned

NB:
The config.json must be ignored by running the following git command:
`git update-index --assume-unchanged ./config.json`

To be able to commit a change on it, make sure not to forget your mongodb access username and password and run the following command to make it tracked and committable:
`git update-index --no-assume-unchanged ./config.json`

Enjoy!
