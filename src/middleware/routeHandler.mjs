import asyncHandler from 'express-async-handler'
export default function routeHandler(func, noValidationRequire = false) {
    return ( (req, res, next) => {
        if (!req.validated && !noValidationRequire) {
            throw { code: 500, text: "Missing validation" }
        };
        asyncHandler(func)(req, res, next);
    })
}