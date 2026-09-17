const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const eventRouter = require('../src/routes/event');
const errorHandler = require('../src/middleware/error-handler');

let mongod;

// Booting a real mongod is not a unit-test-shaped operation: it locates the
// cached binary, spawns the server and connects, and on a cold runner it
// downloads the binary first. Jest's default 5s timeout applies to hooks as
// well as tests, and it left this one so little margin that the suite passed
// only while it held a single spec file -- the run that added a second one
// timed this hook out in both files, before either assertion ran.
const BOOT_TIMEOUT_MS = 120_000;

// The mongoose version is capped in package.json on account of the connect
// below. mongodb 7.6.0 made resolveRuntimeAdapters() async; appendMetadata()
// still swallows the rejection and falls back to empty client metadata, so
// mongod refuses the handshake -- "Missing required sub-document 'driver' in
// the client metadata document" -- and every test here fails in this hook.
// It reproduces under Jest specifically. Upstream: mongodb-memory-server#1026,
// mongoose#16499.

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;
  await mongoose.connect(uri, { dbName: 'testdb' });
}, BOOT_TIMEOUT_MS);

afterAll(async () => {
  // Connected, not merely "not disconnected": if beforeAll failed partway
  // through connecting, readyState is 2, and dropDatabase() then waits for a
  // connection that is never coming -- which is the open handle the failing
  // run reported, and why it left two mongod processes behind for the runner
  // to reap. Stopping the server still runs either way.
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongod) await mongod.stop();
}, BOOT_TIMEOUT_MS);

afterEach(async () => {
  // There is nothing to truncate if the connection never came up, and
  // reaching into connection.db anyway buries the real failure under a
  // TypeError for every test in the file.
  if (mongoose.connection.readyState !== 1) return;
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
