import express from 'express'
import asyncHandler from 'express-async-handler';
import MflixService from "../service/MflixService.mjs";
import routeHandler from '../middleware/routeHandler.mjs'
const mflix_route = express.Router();

import { addCommentReqSchema, objectIdSchema, getRatedMoviesReqSchema, validate, updateCommentReqSchema } from '../middleware/validation.mjs';

const mflixService = new MflixService(process.env.MONGO_URI, process.env.DB_NAME, process.env.MOVIES_COLLECTION, process.env.COMMENTS_COLLECTION);


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