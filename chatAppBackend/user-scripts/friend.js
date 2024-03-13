import { UserSummary, DirectMessages } from '../database/database.js';
import decodeJwt from '../universal-scripts/jwt-decode.js';
import createDirectMessageAndAddToUsers from './createDirectChannel.js';
import getOrSetCache, {setCache} from '../database/getOrSetCache.js';

function containsSymbols(input) {
    const symbolsRegex = /[^\w\s]/;
    const spaceRegex = /\s/;
    
    return symbolsRegex.test(input) || spaceRegex.test(input);
}
export async function friendRequest(req, res) {
    try {
        const decodedJwtData = decodeJwt(req.headers.authorization);
        const requesterUsername = decodedJwtData.username; 
        const requestedFriendUsername = req.body.username.trim();
        if(containsSymbols(requestedFriendUsername)){
            return res.status(400).send({ message: "Username cannot contain spaces or symbols" });
        }

        const requestedUser = await getOrSetCache(`userSummary:${requestedFriendUsername}`, async () => await UserSummary.findOne({ username: requestedFriendUsername }));
        const requesterUser = await getOrSetCache(`userSummary:${requesterUsername}`, async () => await UserSummary.findOne({ username: requesterUsername}));
        console.log(requestedUser)
        if (!requestedUser) {
            return res.status(404).send({ message: "User not found." });
        }
        if (requestedUser.friends.some(friend => friend.name === requesterUsername)) {
            return res.status(400).send({ message: `Already Friended to ${requestedFriendUsername}` });
        }
        if (requestedUser.friendRequest.some(friend => friend.name === requesterUsername)) {
          return res.status(400).send({ message: `Friend request already sent to ${requestedFriendUsername}` });
        }
        
        if(requestedFriendUsername == requesterUsername){
            return res.status(400).send({ message: "You can't friend yourself sigh." });
        }
        console.log('step 1')

        if (requestedUser.friendRequest.includes(requesterUsername)) {
            console.log('step 1.4')
            console.log(requesterUsername)
            console.log(requestedFriendUsername)
            await setCache(`userSummary:${requesterUsername}`, async() => {
              console.log('step 1.533')
                const updatedUserSummary = await UserSummary.findOneAndUpdate(
                    { username: requesterUsername },
                    { 
                        $push: { friends: {name: requestedFriendUsername} }
                    },
                  {
                    new: true, 
                    upsert: false 
                  }
                );
                console.log('step 1.11123213123213533')
                if (updatedUserSummary) {
                  return updatedUserSummary;
                } else {
                  console.log('No document found with the specified criteria.');
                }
              });
            
            console.log('step 1.5')
            await setCache(`userSummary:${requestedFriendUsername}`, async() => {
                const updatedUserSummary = await UserSummary.findOneAndUpdate(
                    { username: requestedFriendUsername },
                    { 
                        $pull: { friendRequest: requesterUsername }, 
                        $push: { friends: {name: requestedFriendUsername} }
                    },
                  {
                    new: true, 
                    upsert: false 
                  }
                );
            
                if (updatedUserSummary) {
                  return updatedUserSummary;
                } else {
                  console.log('No document found with the specified criteria.');
                }
              });
            console.log('step 2')
            await createDirectMessageAndAddToUsers(requesterUsername, requestedFriendUsername);

            console.log('step 3')
            return res.status(200).send({ message: "Friend request accepted." });
        }
        if (requesterUser.friendRequest.includes(requestedFriendUsername)) {
            return res.status(400).send({ message: "Friend request already sent." });
        }
        let checkFail = false;
        await setCache(`userSummary:${requestedFriendUsername}`, async() => {
            const updatedUserSummary = await UserSummary.findOneAndUpdate(
            
            { username: requestedFriendUsername },
            { $push: { friendPending: requesterUsername } },
              {
                new: true, 
                upsert: false 
              }
            );
        
            if (updatedUserSummary) {
              return updatedUserSummary;
            } else {
              console.log('No document found with the specified criteria.');
              return null;
            }
          },checkFail);
          await setCache(`userSummary:${requesterUsername}`, async() => {
            const updatedUserSummary = await UserSummary.findOneAndUpdate(
                
            { username: requesterUsername },
            { $push: { friendRequest: requestedFriendUsername } },
              {
                new: true, 
                upsert: false 
              }
            );
        
            if (updatedUserSummary) {
              return updatedUserSummary;
            } else {
              console.log('No document found with the specified criteria.');
              return null;
            }
          },checkFail);
          if(checkFail){
            return res.status(404).send({ message: "User does not exist" });
          }

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

        let acceptingUser = await getOrSetCache(`userSummary:${acceptingUserUsername}`, async () => await UserSummary.findOne({ username: acceptingUserUsername}));
        console.log('ao 0')
        if (!acceptingUser) {
            return res.status(404).send({ message: "Accepting user not found." });
        }

        if (!acceptingUser.friendPending.includes(requesterUsername)) {
            return res.status(404).send({ message: "Friend request not found." });
        }
        console.log('ao 1')
        const requesterUser = await getOrSetCache(`userSummary:${requesterUsername}`, async () => await UserSummary.findOne({ username: requesterUsername}));
        console.log('ao 2')
        if (!requesterUser) {
            return res.status(404).send({ message: "Requester user not found." });
        }
        console.log('ao 3')

        if (!requesterUser.friendRequest.includes(acceptingUserUsername)) {
            return res.status(400).send({ message: "No pending friend request from this user." });
        }
        console.log('ao 4')
        await setCache(`userSummary:${acceptingUserUsername}`, async() => {
          console.log(requesterUsername)
            const updatedUserSummary = await UserSummary.findOneAndUpdate(
              { username: acceptingUserUsername },
              { 
                $push: { friends: {name: requesterUsername} },
                $pull: { friendPending: requesterUsername } 
              },
              {
                new: true, 
                upsert: false 
              }
            );
              
            if (updatedUserSummary) {
              return updatedUserSummary;
            } else {
              console.log('No document found with the specified criteria.');
            }
          });
        
        console.log('step 1.5')
        await setCache(`userSummary:${requesterUsername}`, async() => {
            const updatedUserSummary = await UserSummary.findOneAndUpdate(
                { username: requesterUsername },
                { 
                    $push: { friends: {name: acceptingUserUsername} },
                    $pull: { friendRequest: acceptingUserUsername } 
                },
              {
                new: true, 
                upsert: false 
              }
            );
        
            if (updatedUserSummary) {
              return updatedUserSummary;
            } else {
              console.log('No document found with the specified criteria.');
            }
          });
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

        let decliningUser = await getOrSetCache(`userSummary:${decliningUserUsername}`, async () => await UserSummary.findOne({ username: decliningUserUsername}));

        if (!decliningUser) {
            return res.status(404).send({ message: "Declining user not found." });
        }


        const requesterUser = await getOrSetCache(`userSummary:${requesterUsername}`, async () => await UserSummary.findOne({ username: requesterUsername}));

        if (!requesterUser) {
            return res.status(404).send({ message: "Requester user not found." });
        }
        if (!requesterUser.friendRequest.includes(decliningUserUsername)) {
          return res.status(404).send({ message: "Friend request not found." });
        }

        await setCache(`userSummary:${decliningUserUsername}`, async() => {
            const updatedUserSummary = await UserSummary.findOneAndUpdate(
                
            { username: decliningUserUsername },
            { $pull: { friendPending: requesterUsername } },
              {
                new: true, 
                upsert: false 
              }
            );
        
            if (updatedUserSummary) {
              return updatedUserSummary;
            } else {
              console.log('No document found with the specified criteria.');
            }
          });
          await setCache(`userSummary:${requesterUsername}`, async() => {
            const updatedUserSummary = await UserSummary.findOneAndUpdate(
                
            { username: requesterUsername },
            { $pull: { friendRequest: decliningUserUsername } },
              {
                new: true, 
                upsert: false 
              }
            );
        
            if (updatedUserSummary) {
              return updatedUserSummary;
            } else {
              console.log('No document found with the specified criteria.');
            }
          });

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

        const cancellingUser = await getOrSetCache(`userSummary:${cancellingUserUsername}`, async () => await UserSummary.findOne({ username: cancellingUserUsername }));

        if (!cancellingUser) {
            return res.status(404).send({ message: "Cancelling user not found." });
        }

        if (!cancellingUser.friendPending.includes(recipientUsername)) {
            return res.status(404).send({ message: "Friend request not found." });
        }

        const recipientUser = await getOrSetCache(`userSummary:${recipientUsername}`, async () => await UserSummary.findOne({ username: recipientUsername }));

        if (!recipientUser) {
            return res.status(404).send({ message: "Recipient user not found." });
        }
        await setCache(`userSummary:${cancellingUserUsername}`, async() => {
            const updatedUserSummary = await UserSummary.findOneAndUpdate(
                
                { username: cancellingUserUsername },
                { $pull: { friendPending: recipientUsername } },
              {
                new: true, 
                upsert: false 
              }
            );
        
            if (updatedUserSummary) {
              return updatedUserSummary;
            } else {
              console.log('No document found with the specified criteria.');
            }
          });
          await setCache(`userSummary:${recipientUsername}`, async() => {
            const updatedUserSummary = await UserSummary.findOneAndUpdate(
                
            { username: recipientUsername },
            { $pull: { friendRequest: cancellingUserUsername } },
              {
                new: true, 
                upsert: false 
              }
            );
        
            if (updatedUserSummary) {
              return updatedUserSummary;
            } else {
              console.log('No document found with the specified criteria.');
            }
          });

        res.status(200).send({ message: "Friend request cancelled successfully." });
    } catch (e) {
        console.log(e);
        res.status(500).send("An error occurred");
    }
}
export async function removeFriend(req, res){
    console.log('step 1')
    const removingUserUsername = req.params.username;
    try {
        const decodedJwtData = decodeJwt(req.headers.authorization);
        const recipientUsername = decodedJwtData.username; 
        console.log('step 2')
        const cancellingUser = await getOrSetCache(`userSummary:${removingUserUsername}`, async () => await UserSummary.findOne({ username: removingUserUsername }));

        if (!cancellingUser) {
            return res.status(404).send({ message: "User not found." });
        }
        console.log('step 3')

        if (!cancellingUser.friends.some(friend => friend.name === recipientUsername)) {
            return res.status(404).send({ message: "Friend not found." });
        }
        console.log('step 4')
        const recipientUser = await getOrSetCache(`userSummary:${recipientUsername}`, async () => await UserSummary.findOne({ username: recipientUsername }));
        console.log('step 5')
        if (!recipientUser) {
            return res.status(404).send({ message: "Recipient user not found." });
        }
        console.log('step 6')

        await setCache(`userSummary:${removingUserUsername}`, async() => {
            const updatedUserSummary = await UserSummary.findOneAndUpdate(
                { username: removingUserUsername },
                { $pull: { friends: {name: recipientUsername} } },
              {
                new: true, 
                upsert: false 
              }
            );
        
            if (updatedUserSummary) {
              return updatedUserSummary;
            } else {
              console.log('No document found with the specified criteria.');
            }
          });
          await setCache(`userSummary:${recipientUsername}`, async() => {
            const updatedUserSummary = await UserSummary.findOneAndUpdate(
                { username: recipientUsername },
                { $pull: { friends: {name: removingUserUsername} } },
              {
                new: true, 
                upsert: false 
              }
            );
        
            if (updatedUserSummary) {
              return updatedUserSummary;
            } else {
              console.log('No document found with the specified criteria.');
            }
          });
        console.log('step 8')
        res.status(200).send({ message: "Friend removed successfully." });
    } catch (e) {
        console.log('step 9')
        console.log(e);
        res.status(500).send("An error occurred");
    }
}