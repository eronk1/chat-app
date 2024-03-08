import { UserSummary } from '../database/database.js';
import decodeJwt from '../universal-scripts/jwt-decode.js';
export default async function getUserData(req, res) {
    try {
        const decodedJwtData = decodeJwt(req.headers.authorization);
        const filter = { username: decodedJwtData.username };
        const update = { $setOnInsert: { username: decodedJwtData.username } };
        const options = { new: true, upsert: true }; 

        let userDocument = await UserSummary.findOneAndUpdate(filter, update, options);

        const statusCode = userDocument.wasNew ? 201 : 200; 

        res.status(statusCode).json(userDocument);
    } catch (e) {
        console.log(e);
        res.status(500).send("An error occurred");
    }
}