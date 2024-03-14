import { DirectMessages } from '../database/database.js';
import decodeJwt from '../universal-scripts/jwt-decode.js';
import getOrSetCache from '../database/getOrSetCache.js';

export default async function getUser(req, res) {
    try {
        const channelId = req.params.id;
        if(!channelId || channelId == 'null'){
            return res.status(404).send({ message: "No input value" });
        }
        console.log(channelId);
        console.log(channelId);
        const directMessageChannel = await getOrSetCache(`directMessages:${channelId}`,async () => await DirectMessages.findById(channelId));

        if (!directMessageChannel) {
            return res.status(404).send({ message: "Direct message channel not found." });
        }

        const decodedJwtData = decodeJwt(req.headers.authorization);
        const requestingUsername = decodedJwtData.username;

        if (!directMessageChannel.users.includes(requestingUsername)) {
            return res.status(403).send({ message: "Access denied. User is not part of this direct message channel." });
        }

        return res.status(200).json(directMessageChannel);
    } catch (e) {
        console.log(e);
        res.status(500).send("An error occurred");
    }
}
