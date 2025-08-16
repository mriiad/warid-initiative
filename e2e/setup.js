const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const eventRouter = require('../src/routes/event');
const errorHandler = require('../src/middleware/error-handler');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;
  await mongoose.connect(uri, { dbName: 'testdb' });
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongod) await mongod.stop();
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

function buildApp() {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());
  app.use(eventRouter);
  app.use(errorHandler);
  return app;
}

global.__buildApp = buildApp;
