import express from 'express';
import MflixService from './service/MflixService.mjs'
import asyncHandler from 'express-async-handler';
import { addCommentReqSchema, objectIdSchema, getRatedMoviesReqSchema, validate, updateCommentReqSchema } from './middleware/validation.mjs';
import Joi from 'joi';
const errorHandler = function (error, req, res, next) {
    const code = error.code ?? 500;
    const text = error.text ?? `Unknown server error ${error}`;
    res.status(code).end(text);
}
const app = express();
const port = process.env.PORT ?? 3500;
const mflixService = new MflixService(process.env.MONGO_URI, process.env.DB_NAME, process.env.MOVIES_COLLECTION, process.env.COMMENTS_COLLECTION);

app.use(express.json());

app.post("/mflix/comments", [
    validate(addCommentReqSchema, "body"),
    asyncHandler(async (req, res) => {
        const commentDB = await mflixService.addComment(req.body);
        res.status(201).end(JSON.stringify(commentDB));
    })
]);
app.put("/mflix/comments", [
    validate(updateCommentReqSchema,"body"),
    asyncHandler(async (req, res) => {
    await mflixService.updateComment(req.body);
    res.status(204).end();
})
]);
app.delete("/mflix/comments/:id", [
    validate(objectIdSchema, "params.id"),
    asyncHandler(async (req, res, next) => {
        await mflixService.deleteComment(req.params.id);
        res.status(204).end();
    })
])
app.get(`/mflix/comments/:id`, [
    validate(objectIdSchema, "params.id"),
    asyncHandler(async (req, res) => {
        const result = await mflixService.getComment(req.params.id);
        res.status(200).end(JSON.stringify(result));
    })
])
app.post("/mflix/movies/rated", [
    validate(getRatedMoviesReqSchema, "body"),
    asyncHandler(async (req, res) => {
        const result = await mflixService.getRatedMovies(req.body);
        res.status(200).end(JSON.stringify(result));
    })
])
app.use(errorHandler);
const server = app.listen(port);
server.on("listening", () => console.log(`Server listening on port ${server.address().port}`));
