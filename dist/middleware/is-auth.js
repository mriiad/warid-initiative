"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuth = void 0;
const user_1 = require("../models/user");
const config = require('../../config.json');
const jwt = require('jsonwebtoken');
const isAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.cookies;
        if (!token) {
            return next('Please login to access the data');
        }
        const verify = yield jwt.verify(token, config.authConfig.SECRET_KEY);
        req.user = yield user_1.User.findById(verify.id);
        next();
    }
    catch (error) {
        return next(error);
    }
});
exports.isAuth = isAuth;
