import { UserSummary } from '../database/database.js';
import decodeJwt from '../universal-scripts/jwt-decode.js';
export default async function getUserData(req, res) {
    try {
        const decodedJwtData = decodeJwt(req.headers.authorization);
        let findUser = await UserSummary.findOne({ username: decodedJwtData.username });

        if (!findUser) {
            findUser = new UserSummary({
                username: decodedJwtData.username,
            });

            await findUser.save();

            return res.status(201).json(findUser);
        }

        res.status(200).json(findUser);
    } catch (e) {
        console.log(e);
        res.status(500).send("An error occurred");
    }
}
