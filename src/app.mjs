import express from 'express';
import MflixService from './service/MflixService.mjs'
const app = express();
const port = process.env.PORT ?? 3500;
const mflixService = new MflixService(process.env.MONGO_URI, process.env.DB_NAME, process.env.MOVIES_COLLECTION, process.env.COMMENTS_COLLECTION);

app.use(express.json());
app.post("/mflix/comments", async (req, res) => {
    const commentDB = await mflixService.addComment(req.body);
    res.status(201).end(JSON.stringify(commentDB));
})
app.put("/mflix/comments", async (req, res) => {
    await mflixService.updateComment(req.body);
    res.status(204).end();
});
app.delete("/mflix/comments/:id", async (req, res) => {
    await mflixService.deleteComment(req.params.id);
    res.status(204).end();
})
app.get(`/mflix/comments/:id`, async (req, res) => {
    const result = await mflixService.getComment(req.params.id);
    res.status(200).end(JSON.stringify(result));
})
app.post("/mflix/movies/rated", async (req, res) => {
    //TODO find most imdb rated movies
   // req.body {"year":<number>(optional), "genre":<string>(optional),
   // "acter":<string-regex>(optional), "amount":<number>(mandatary)}
   const result = await mflixService.getRatedMovies(req.body);
   res.status(200).end(JSON.stringify(result));
})
 
const server = app.listen(port);
server.on("listening", () => console.log(`Server listening on port ${server.address().port}`));