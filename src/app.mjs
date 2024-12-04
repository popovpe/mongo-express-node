import express from 'express';


import Joi from 'joi';
import  mflix_route  from './routes/mflix.mjs';
import accounts_route from './routes/accounts.mjs';
const errorHandler = function (error, req, res, next) {
    const code = error.code ?? 500;
    const text = error.text ?? `Unknown server error ${error}`;
    res.status(code).end(text);
}
const app = express();
const port = process.env.PORT ?? 3500;
app.use(express.json());
app.use("/mflix", mflix_route);
app.use("/accounts", accounts_route);
app.use(errorHandler);
const server = app.listen(port);
server.on("listening", () => console.log(`Server listening on port ${server.address().port}`));
