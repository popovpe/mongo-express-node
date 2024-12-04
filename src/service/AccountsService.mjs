import MongoConnection from '../mongo/MongoConnection.mjs'
import bcrypt from 'bcrypt';
import getError from '../errors/error.mjs';

const USERNAME_NOT_FOUND = "Username not found";
const DB_ERROR = "DB error occured";
const ACCOUNTS_COLLECTION_NAME = "accounts";

export default class AccountsService {
    #accounts;

    constructor(uri, dbName) {
        this.#accounts = new MongoConnection(uri, dbName).getCollection( ACCOUNTS_COLLECTION_NAME );
    }

    async insertAccount(account) {
        const accountDb = this.#toAccountDb(account);
        try {
            await this.#accounts.insertOne(accountDb);
        } catch (error) {
            if (error?.code == 11000) {
                throw getError(409, "Duplicate username");
            } else {
                throw getError(500, DB_ERROR);
            }
        }

    }
    async updatePassword({ username, password }) {
        const passwordHash = bcrypt.hashSync(password, 10);
        let result;
        try {
            result = await this.#accounts.updateOne({ _id: username }, { $set: { password: passwordHash } });
        } catch (error) {
            throw getError(500, DB_ERROR);
        }
        if (!result.modifiedCount) {
            throw getError(404, USERNAME_NOT_FOUND);
        }

    }

    async getAccount(username) {
        let result;
        try {
            result = await this.#accounts.findOne({ _id: username });
        } catch (error) {
            throw getError(500, DB_ERROR);
        }
        if (!result) {
            throw getError(404, USERNAME_NOT_FOUND);
        }
        return result;
    }
    async deleteAccount(username) {
        try {
            const result = await this.#accounts.deleteOne({ _id: username });
            if (!result.deletedCount) {
                throw getError(404, USERNAME_NOT_FOUND);
            }
        } catch (e) {
            if (e?.code === 404 ) {
                throw e;
            } else {
                throw getError(500, DB_ERROR)
            }
        }
    }

    #toAccountDb({ username, email, password }) {
        const result = { _id: username, email };
        result.password = bcrypt.hashSync(password, 10);
        return result;
    }

}