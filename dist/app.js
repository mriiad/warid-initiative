"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const donor_1 = __importDefault(require("./routes/donor"));
const config = require('../config.json');
const dbConfig = config.dbConfig;
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use(donor_1.default);
console.log('config', config.dbConfig);
mongoose_1.default
    .connect(`${dbConfig.host}://${dbConfig.user}:${dbConfig.user}@${dbConfig.name}.b1dcpqn.mongodb.net/?retryWrites=true&w=majority`)
    .then((result) => {
    console.log('Connected successfully to MongoDB server');
    app.listen(config.port);
})
    .catch((err) => {
    console.log(err);
});
