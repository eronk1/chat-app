import { UserSummary, DirectMessages } from '../database/database.js';
import decodeJwt from '../universal-scripts/jwt-decode.js';
import {getOrSetCacheSpecial} from '../database/getOrSetCache.js';

export default async function getUserData(req, res) {
    try {
        const decodedJwtData = decodeJwt(req.headers.authorization);
        const filter = { username: decodedJwtData.username };
        const update = { $setOnInsert: { username: decodedJwtData.username } };
        const options = { new: true, upsert: true };

        let userDocument = await getOrSetCacheSpecial(`userSummary:${decodedJwtData.username}`, async () => {
            const doc = await UserSummary.findOneAndUpdate(filter, update, options);
            
            if (doc) {
                console.log('Document found or inserted');
                return doc;
            } else {
                console.log('Unexpected behavior: Document not found or inserted');
                return null;
            }
        });

        if (!userDocument) {
            return res.status(404).send("User not found and could not be created");
        }

        console.log(userDocument);
        res.status(200).json(userDocument);
    } catch (e) {
        console.log(e);
        res.status(500).send("An error occurred");
    }
}