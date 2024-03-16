import { UserSummary, DirectMessages } from '../database/database.js';
import decodeJwt from '../universal-scripts/jwt-decode.js';
import {getOrSetCacheSpecial} from '../database/getOrSetCache.js';

export default async function getUserData(req, res) {
    try {
        const userDetails = decodeJwt(req.headers.authorization);

        let userDocument = await getOrSetCacheSpecial(`userSummary:${userDetails.username}`, async () => {
            const doc = await UserSummary.findOne({ username:userDetails.username });
            
            if (doc) {
                console.log('Document found');
                return doc;
            } else {
                if(!userDetails) return 'missing user data access token';
                const userSummaryData = {
                    username: userDetails.username,
                    age: userDetails.age,
                    gender: userDetails.gender,
                    preferredName: userDetails.preferredName
                };
                let newDoc = new UserSummary(userSummaryData);
                console.log('new document ', newDoc);
                await newDoc.save();
                return newDoc;
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