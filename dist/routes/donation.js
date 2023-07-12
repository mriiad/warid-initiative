"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const donation_1 = require("../controllers/donation");
const donationRouter = (0, express_1.Router)();
donationRouter.get('/', (req, res, next) => { });
donationRouter.put('/api/donate', donation_1.donate);
exports.default = donationRouter;
