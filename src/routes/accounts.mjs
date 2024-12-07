import express from 'express';
import routeHandler from '../middleware/routeHandler.mjs';
import { validate } from '../middleware/validation.mjs';
import { auth, authenticate } from '../middleware/authentication.mjs';
import { addAccountSchema, changePasswordReqSchema, setRoleRequest } from '../middleware/validation.mjs';
import accountsService from '../service/AccountsService.mjs';
import getError from '../errors/error.mjs';
const accounts_route = express.Router();


accounts_route.post("/account", validate(addAccountSchema, "body"), routeHandler(async (req, res) => {
    await accountsService.insertAccount(req.body);
    res.status(204).end();
}))

accounts_route.put("/account", validate(changePasswordReqSchema, "body"), routeHandler(async (req, res) => {
    if (req.user != req.body.username) {
        throw getError(403, "");
    }
    await accountsService.updatePassword(req.body);
    res.status(204).end();
}))

accounts_route.get("/:username", routeHandler(async (req, res) => {
    const result = await accountsService.getAccount(req.params.username);
    res.status(200).json(result);
}, true))

accounts_route.delete("/:username", routeHandler(async (req, res) => {
    await accountsService.deleteAccount(req.params.username);
    res.status(204).end();
}, true));

accounts_route.put("/account/role",
    validate(setRoleRequest, "body"),
    authenticate({
        getAccount(id) {
            const _id = process.env?.SET_ROLE_USERNAME;
            if (_id === id) {
                return { _id, password: process.env?.SET_ROLE_PASSWORD, _encryptedPassword: false }
            }
        }
    }),
    auth(req => req.user, getError(401, "")),
    routeHandler(async (req, res) => {
        await accountsService.setRole(req.body);
        res.status(204).end();
    }))

export default accounts_route 