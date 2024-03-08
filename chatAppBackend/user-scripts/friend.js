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
        console.log(requestedUser)
        if(requestedFriendUsername == requesterUsername){
            return res.status(400).send({ message: "You can't friend yourself sigh." });
        }
        if (!requestedUser) {
            return res.status(404).send({ message: "User not found." });
        }
        console.log('step 1')

        if (requestedUser.friendRequest.includes(requesterUsername)) {
            console.log('step 1.4')
            console.log(typeof requesterUsername)
            console.log(typeof requestedFriendUsername)
            console.log(requesterUsername)
            await UserSummary.updateOne(
                { username: requesterUsername },
                { 
                    $push: { friends: requestedFriendUsername },
                    $pull: { friendPending: requestedFriendUsername } 
                }
            );
            
            console.log('step 1.5')
            await UserSummary.updateOne(
                { username: requestedFriendUsername },
                { 
                    $push: { friends: requesterUsername },
                    $pull: { friendRequest: requesterUsername } 
                }
            );
            console.log('step 2')
            await createDirectMessageAndAddToUsers(requesterUsername, requestedFriendUsername);

            console.log('step 3')
            return res.status(200).send({ message: "Friend request accepted." });
        }
        if (requesterUser.friendRequest.includes(requestedFriendUsername)) {
            return res.status(400).send({ message: "Friend request already sent." });
        }

        await UserSummary.updateOne(
            { username: requesterUsername },
            { $push: { friendRequest: requestedFriendUsername } }
        );

        console.log('step 4')
        await UserSummary.updateOne(
            { username: requestedFriendUsername },
            { $push: { friendPending: requesterUsername } }
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
export async function cancelFriendRequest(req, res) {
    const cancellingUserUsername = req.params.username; 
    try {
        const decodedJwtData = decodeJwt(req.headers.authorization);
        const recipientUsername = decodedJwtData.username; 

        let cancellingUser = await UserSummary.findOne({ username: cancellingUserUsername });

        if (!cancellingUser) {
            return res.status(404).send({ message: "Cancelling user not found." });
        }

        if (!cancellingUser.friendPending.includes(recipientUsername)) {
            return res.status(404).send({ message: "Friend request not found." });
        }

        let recipientUser = await UserSummary.findOne({ username: recipientUsername });

        if (!recipientUser) {
            return res.status(404).send({ message: "Recipient user not found." });
        }

        await UserSummary.updateOne(
            { username: cancellingUserUsername },
            { $pull: { friendPending: recipientUsername } }
        );

        await UserSummary.updateOne(
            { username: recipientUsername },
            { $pull: { friendRequest: cancellingUserUsername } }
        );

        res.status(200).send({ message: "Friend request cancelled successfully." });
    } catch (e) {
        console.log(e);
        res.status(500).send("An error occurred");
    }
}
