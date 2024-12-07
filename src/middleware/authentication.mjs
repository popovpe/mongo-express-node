import bcrypt from 'bcrypt'
import _ from 'lodash';
import getError from '../errors/error.mjs';
import expressAsyncHandler from 'express-async-handler';
const BASIC = "Basic ";
export function authenticate(accountingService) {
    return async (req, res, next) => {
        delete req.user;
        delete req.role;
        const authHeader = req.header("Authorization")
        if (authHeader) {
            if (authHeader.startsWith(BASIC)) {
                await basicAuth(authHeader, req, accountingService)
            }
        }
        next();
    }
}
export function auth(reqIsAllowed, e, skipReq) {
    return expressAsyncHandler(async (req, res, next) => {
        const methodsArray = skipReq?.[Object.keys(skipReq).find(e => e.startsWith(req.path))];
        const authNotRequired = methodsArray && (!methodsArray.length || methodsArray.includes(req.method));
        const reqAllowed = await reqIsAllowed(req);
        if (!authNotRequired && !reqAllowed) {
            throw e;
        }
        next();
    }
    )
}


async function basicAuth(authHeader, req, accountingService) {
    const userPasswordBase64 = authHeader.substring(BASIC.length);
    const userPasswordAscii = Buffer.from(userPasswordBase64, 'base64').toString("ascii");
    const userPasswordTokens = userPasswordAscii.split(":");
    try {
        const account = await accountingService.getAccount(userPasswordTokens[0]);
        if (account) {
            let passwordIsCorrect = false;
            if (account?._plainTextPassword === true && userPasswordTokens[1] === account.password) {
                passwordIsCorrect = true;
            } else if ( await bcrypt.compare(userPasswordTokens[1], account.password) ) {
                passwordIsCorrect = true;
            }
            if (passwordIsCorrect) {
                req.user = account._id;
                req.role = account.role ?? 'USER';
            }
        }
    } catch (error) {

    }


}