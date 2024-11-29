import Joi from 'joi'
import _ from 'lodash'
import getError from '../errors/error.mjs';

const addCommentReqSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    movie_id: Joi.string().hex().length(24).required(),
    test: Joi.string().required(),
});

const updateCommentReqSchema = Joi.object({
    commentId: Joi.string().hex().length(24).required(),
    text: Joi.string().required()
 
 })

    //TODO find most imdb rated movies
    // req.body {"year":<number>(optional), "genre":<string>(optional),
    // "acter":<string-regex>(optional), "amount":<number>(mandatary)}
const getRatedMoviesReqSchema = Joi.object({
    year: Joi.number().integer().greater(1887),
    genre: Joi.string(),
    acter: Joi.string(),
    amount: Joi.number().integer().sign("positive").max(100).required(),
});
const objectIdSchema = Joi.string().hex().length(24).label('objectId');

function validate(schema, pathFromRequest ) {
    return (req, res, next) => {
        const { error } = schema.validate(_.get(req, pathFromRequest));
        if (error) {
            next(getError(400, error.details[0].message))
        }
        next();
    }
}
export {  addCommentReqSchema, validate, objectIdSchema, getRatedMoviesReqSchema, updateCommentReqSchema };