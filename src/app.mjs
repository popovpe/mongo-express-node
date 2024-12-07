import express from 'express';


import mflix_route from './routes/mflix.mjs';
import accounts_route from './routes/accounts.mjs';
import { auth, authenticate } from './middleware/authentication.mjs';
import accountsService from './service/AccountsService.mjs';
import getError from './errors/error.mjs';


const errorHandler = function (error, req, res, next) {
    const code = error.code ?? 500;
    const text = error.text ?? `Unknown server error ${error}`;
    res.status(code).end(text);
}
const app = express();
const port = process.env.PORT ?? 3500;
app.use(authenticate(accountsService));
app.use(auth(req => req.user, getError(401, ""), {
    "/accounts/account": ["POST"],
    "/accounts/account/role": ["PUT"]
}));
app.use(express.json());
app.use("/mflix", mflix_route);
app.use("/accounts", accounts_route);
app.use(errorHandler);
const server = app.listen(port);
server.on("listening", () => console.log(`Server listening on port ${server.address().port}`));
