import MongoConnection from '../mongo/MongoConnection.mjs'
import { ObjectId } from 'mongodb';
import getError from '../errors/error.mjs';
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
        const movieId = await this.#moviesCollection.findOne({_id: commentDb.movie_id});
        if( !movieId ) {
            throw getError(424, "Unable to add a comment for unexisting movie");
        }
        const result = await this.#commentsCollection.insertOne(commentDb);
        commentDb._id = result.insertedId;
        return commentDb;
    }

    async updateComment(updateInfo) {
        const result = await this.#commentsCollection.updateOne({
            _id: ObjectId.createFromHexString(updateInfo.commentId)
        },
            {
                $set:
                {
                    text: updateInfo.text
                }
            });
        if( !result.modifiedCount ) {
            throw  getError(404, "comment not found");
        }
        return result;
    }

    async deleteComment(id) {
        const commentId = ObjectId.createFromHexString(id);
        const result = await this.#commentsCollection.deleteOne({
            _id: commentId
        });
        if(!result.deletedCount) {
            throw  getError(404, "comment not found");
        }
        return result;
    }

    async getComment(id) {
        const result = await this.#commentsCollection.findOne({
            _id: ObjectId.createFromHexString(id)
        });
        if (!result) {
            throw  getError(404, "comment not found");
        }
        return result;
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