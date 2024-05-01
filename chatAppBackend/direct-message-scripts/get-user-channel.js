import { DirectMessages } from '../database/database.js';
import decodeJwt from '../universal-scripts/jwt-decode.js';
import getOrSetCache from '../database/getOrSetCache.js';
export const getDirectMessagesIncrement = 10;
export default async function getUser(req, res) {
    try {
        const channelId = req.params.id;
        if(!channelId || channelId == 'null'){
            return res.status(404).send({ message: "No input value" });
        }
        console.log('start very pro debug');
        const getDirectMessageChannel = async () =>{
            let directMessages =  await DirectMessages.findOne(
                { _id: channelId },
                { messages: { $slice: -getDirectMessagesIncrement } }
            );
            const isLast = directMessages.messages.length < getDirectMessagesIncrement;
    
            directMessages['last'] = isLast;
            return directMessages;
        };
        const directMessageChannel = await getDirectMessageChannel();

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
