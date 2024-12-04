import express from 'express';
import routeHandler from '../middleware/routeHandler.mjs';
import { validate } from '../middleware/validation.mjs';
import { addAccountSchema, changePasswoordReqSchema } from '../middleware/validation.mjs';
import AccountsService from '../service/accountsService.mjs';
const accounts_route = express.Router();

const accountsService = new AccountsService(process.env.MONGO_URI, process.env.DB_NAME);

accounts_route.post("/account", validate(addAccountSchema, "body"),routeHandler(async (req, res) => {
    await accountsService.insertAccount(req.body);
    res.status(204).end();
}) )

accounts_route.put("/account", validate(changePasswoordReqSchema, "body"), routeHandler( async (req, res) => {
    await accountsService.updatePassword(req.body);
    res.status(204).end();
}))

accounts_route.get("/:username", routeHandler( async (req, res) => {
    const result = await accountsService.getAccount(req.params.username);
    res.status(200).json(result);
}, true ))

accounts_route.delete("/:username", routeHandler( async (req, res)=>{
    await accountsService.deleteAccount(req.params.username);
    res.status(204).end();
}, true));

export default  accounts_route 