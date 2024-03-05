import { UserSummary, DirectMessages } from '../database/database.js';
import decodeJwt from '../universal-scripts/jwt-decode.js';
import createDirectMessageAndAddToUsers from './createDirectChannel.js';
export async function friendRequest(req, res) {
    try {
        const decodedJwtData = decodeJwt(req.headers.authorization);
        const requesterUsername = decodedJwtData.username; 
        console.log(req.body);
        const requestedFriendUsername = req.body.username;

        const requestedUser = await UserSummary.findOne({ username: requestedFriendUsername });
        const requesterUser = await UserSummary.findOne({ username: requesterUsername });

        if (!requestedUser) {
            return res.status(404).send({ message: "User not found." });
        }

        if (requestedUser.friendRequest.includes(requesterUsername)) {
            if (!requesterUser.friendPending.includes(requestedFriendUsername)) {
                await UserSummary.updateOne(
                    { username: requesterUsername },
                    { $push: { friendPending: requestedFriendUsername } }
                );
                return res.status(201).send({ message: "Friend request sent successfully." });
            }
            return res.status(400).send({ message: "Friend request already sent." });
        }

        await UserSummary.updateOne(
            { username: requestedFriendUsername },
            { $push: { friendRequest: requesterUsername } }
        );

        await UserSummary.updateOne(
            { username: requesterUsername },
            { $push: { friendPending: requestedFriendUsername } }
        );

        res.status(201).send({ message: "Friend request sent successfully." });
    } catch (e) {
        console.log(e);
        res.status(500).send("An error occurred");
    }
}



export async function acceptFriendRequest(req, res) {
    try {
        const decodedJwtData = decodeJwt(req.headers.authorization);
        const acceptingUserUsername = decodedJwtData.username;
        const requesterUsername = req.body.username;

        let acceptingUser = await UserSummary.findOne({ username: acceptingUserUsername });

        if (!acceptingUser) {
            return res.status(404).send({ message: "Accepting user not found." });
        }

        if (!acceptingUser.friendRequest.includes(requesterUsername)) {
            return res.status(404).send({ message: "Friend request not found." });
        }

        let requesterUser = await UserSummary.findOne({ username: requesterUsername });

        if (!requesterUser) {
            return res.status(404).send({ message: "Requester user not found." });
        }


        if (!requesterUser.friendPending.includes(acceptingUserUsername)) {
            return res.status(400).send({ message: "No pending friend request from this user." });
        }
        await UserSummary.updateOne(
            { username: acceptingUserUsername },
            { $pull: { friendRequest: requesterUsername }, $push: { friends: { name: requesterUsername } } }
        );

        await UserSummary.updateOne(
            { username: requesterUsername },
            { $pull: { friendPending: acceptingUserUsername }, $push: { friends: { name: acceptingUserUsername } } }
        );
        await createDirectMessageAndAddToUsers(acceptingUserUsername, requesterUsername);
        res.status(200).send({ message: "Friend request accepted successfully." });
    } catch (e) {
        console.log(e);
        res.status(500).send("An error occurred");
    }
}


export async function declineFriendRequest(req, res) {
    req.body.username = req.params.username;
    try {
        const decodedJwtData = decodeJwt(req.headers.authorization);
        const decliningUserUsername = decodedJwtData.username;
        const requesterUsername = req.body.username;

        let decliningUser = await UserSummary.findOne({ username: decliningUserUsername });

        if (!decliningUser) {
            return res.status(404).send({ message: "Declining user not found." });
        }

        if (!decliningUser.friendRequest.includes(requesterUsername)) {
            return res.status(404).send({ message: "Friend request not found." });
        }

        let requesterUser = await UserSummary.findOne({ username: requesterUsername });

        if (!requesterUser) {
            return res.status(404).send({ message: "Requester user not found." });
        }

        await UserSummary.updateOne(
            { username: decliningUserUsername },
            { $pull: { friendRequest: requesterUsername } }
        );

        await UserSummary.updateOne(
            { username: requesterUsername },
            { $pull: { friendPending: decliningUserUsername } }
        );

        res.status(200).send({ message: "Friend request declined successfully." });
    } catch (e) {
        console.log(e);
        res.status(500).send("An error occurred");
    }
}
