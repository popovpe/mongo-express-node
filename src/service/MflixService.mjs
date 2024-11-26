import MongoConnection from '../mongo/MongoConnection.mjs'
import { ObjectId } from 'mongodb';
export default class MflixService {
    #moviesCollection;
    #commentsCollection;
    #connection;
    constructor(uri, dbName, moviesCollection, commentsCollection) {
        this.#connection = new MongoConnection(uri, dbName);
        this.#moviesCollection = this.#connection.getCollection(moviesCollection);
        this.#commentsCollection = this.#connection.getCollection(commentsCollection);

    }

    shutdown() {
        this.#connection.closeConnection();
    }

    async addComment(commentDto) {
        const commentDb = this.#toComment(commentDto);
        const result = await this.#commentsCollection.insertOne(commentDb);
        commentDb._id = result.insertedId;
        return commentDb;
    }

    async updateComment(updateInfo) {
        return await this.#commentsCollection.updateOne({
            _id: ObjectId.createFromHexString(updateInfo.commentId)
        },
            {
                $set:
                {
                    text: updateInfo.text
                }
            });
    }

    async deleteComment(id) {
        const commentId = ObjectId.createFromHexString(id);
        const result = await this.#commentsCollection.deleteOne({
            _id: commentId
        });
        return result;
    }

    async getComment(id) {
        return await this.#commentsCollection.findOne({
            _id: ObjectId.createFromHexString(id)
        });
    }

    async getRatedMovies( queryDto ) {
        const queryObj = this.#constructQueryObject(queryDto);
        return await this.#moviesCollection.aggregate(queryObj).toArray();
    }

    #toComment(commentDto) {
        const movieId = ObjectId.createFromHexString(commentDto.movie_id);
        return { ...commentDto, 'movie_id': movieId };

    }

    #constructQueryObject({ year, genre, acter, amount }) {
        //TODO find most imdb rated movies
        // req.body {"year":<number>(optional), "genre":<string>(optional),
        // "acter":<string-regex>(optional), "amount":<number>(mandatary)}
        const matchObj = {
            ...year && { 'year': year },
            ...genre && { 'genres': genre },
            ...acter && {
                'cast': {
                    '$regex': acter
                }
            }
        };

        return [
            {
                '$match': matchObj
            }, {
                '$sort': {
                    'imdb.rating': -1
                }
            }, {
                '$limit': amount
            }
        ];
    }

}