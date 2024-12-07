import express from 'express'
import MflixService from "../service/MflixService.mjs";
import routeHandler from '../middleware/routeHandler.mjs';
import accountsService from '../service/AccountsService.mjs';
import getError from '../errors/error.mjs';

const mflix_route = express.Router();
const PER_MINUTE_REQ_LIMITATION = 5;
const TIME_INTERVAL_FOR_REQUEST_QTY_CHECKING = 60;
const ERROR_LIMIT_EXCEEDED = `limit of requests per ${TIME_INTERVAL_FOR_REQUEST_QTY_CHECKING} sec. for USER exceeded`;


import { addCommentReqSchema, objectIdSchema, getRatedMoviesReqSchema, validate, updateCommentReqSchema } from '../middleware/validation.mjs';
import { auth } from '../middleware/authentication.mjs';

const mflixService = new MflixService(process.env.MONGO_URI, process.env.DB_NAME, process.env.MOVIES_COLLECTION, process.env.COMMENTS_COLLECTION);

async function authRule(req) {
    let isAllowed = false;
    const role = req?.role ?? 'USER';
    if (role === 'PREMIUM_USER') {
        isAllowed = true;
    }
    if (role === 'USER') {
        const requestsForLastPeriod = await accountsService.addReqAndGetReqQuantityForPeriod(req.user, TIME_INTERVAL_FOR_REQUEST_QTY_CHECKING * 1000);
        isAllowed = requestsForLastPeriod <= PER_MINUTE_REQ_LIMITATION
    }
    return isAllowed;
}

mflix_route.use(auth(authRule, getError(403, ERROR_LIMIT_EXCEEDED)));

mflix_route.post("/comments", [
    validate(addCommentReqSchema, "body"),
    routeHandler(async (req, res) => {
        const commentDB = await mflixService.addComment(req.body);
        res.status(201).end(JSON.stringify(commentDB));
    }),
]);
mflix_route.put("/comments", [
    validate(updateCommentReqSchema, "body"),
    routeHandler(async (req, res) => {
        await mflixService.updateComment(req.body);
        res.status(204).end();
    })
]);
mflix_route.delete("/comments/:id", [
    validate(objectIdSchema, "params.id"),
    routeHandler(async (req, res, next) => {
        await mflixService.deleteComment(req.params.id);
        res.status(204).end();
    })
])
mflix_route.get(`/comments/:id`, [
    validate(objectIdSchema, "params.id"),
    routeHandler(async (req, res) => {
        const result = await mflixService.getComment(req.params.id);
        res.status(200).end(JSON.stringify(result));
    })
])
mflix_route.post("/movies/rated", [
    validate(getRatedMoviesReqSchema, "body"),
    routeHandler(async (req, res) => {
        const result = await mflixService.getRatedMovies(req.body);
        res.status(200).end(JSON.stringify(result));
    })
])

export default mflix_route;