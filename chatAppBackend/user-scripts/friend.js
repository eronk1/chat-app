import { UserSummary, DirectMessages } from '../database/database.js';
import decodeJwt from '../universal-scripts/jwt-decode.js';
import createDirectMessageAndAddToUsers from './createDirectChannel.js';
import getOrSetCache, {setCache} from '../database/getOrSetCache.js';
import { redisClient } from '../server.js';
import { io } from '../server.js';

function containsSymbols(input) {
    const symbolsRegex = /[^\w\s]/;
    const spaceRegex = /\s/;
    
    return symbolsRegex.test(input) || spaceRegex.test(input);
}
export async function friendRequest(data, ack) {
  const { username, token } = data;

  try {
    const decodedJwtData = decodeJwt(token);
    const requesterUsername = decodedJwtData.username;
    const requestedFriendUsername = username.trim();
    if (containsSymbols(requestedFriendUsername)) {
      return ack({ status: 400, message: "Username cannot contain spaces or symbols" });
    }

    const requestedUser = await getOrSetCache(`userSummary:${requestedFriendUsername}`, async () => await UserSummary.findOne({ username: requestedFriendUsername }));
    const requesterUser = await getOrSetCache(`userSummary:${requesterUsername}`, async () => await UserSummary.findOne({ username: requesterUsername }));

    if (!requestedUser) {
      return ack({ status: 404, message: "User not found." });
    }
    if (requestedUser.friends.some(friend => friend.name === requesterUsername)) {
      return ack({ status: 400, message: `Already Friended to ${requestedFriendUsername}` });
    }
    if (requestedUser.friendRequest.some(friend => friend.name === requesterUsername)) {
      return ack({ status: 400, message: `Friend request already sent to ${requestedFriendUsername}` });
    }

    if (requestedFriendUsername == requesterUsername) {
      return ack({ status: 400, message: "You can't friend yourself sigh." });
    }

    if (requestedUser.friendRequest.includes(requesterUsername)) {
      await setCache(`userSummary:${requesterUsername}`, async() => {
        const updatedUserSummary = await UserSummary.findOneAndUpdate(
          { username: requesterUsername },
          { $pull: { friendPending: requestedFriendUsername }, $push: { friends: { name: requestedFriendUsername } } },
          { new: true, upsert: false }
        );
        return updatedUserSummary || null;
      });

      await setCache(`userSummary:${requestedFriendUsername}`, async() => {
        const updatedUserSummary = await UserSummary.findOneAndUpdate(
          { username: requestedFriendUsername },
          { $pull: { friendRequest: requesterUsername }, $push: { friends: { name: requesterUsername } } },
          { new: true, upsert: false }
        );
        return updatedUserSummary || null;
      });

      await createDirectMessageAndAddToUsers(requesterUsername, requestedFriendUsername);
      return ack({ status: 200, message: `Accepted friend request from ${requestedFriendUsername}.` });
    }

    if (requesterUser.friendRequest.includes(requestedFriendUsername)) {
      return ack({ status: 400, message: "Friend request already sent." });
    }

    let checkFail = false;
    await setCache(`userSummary:${requestedFriendUsername}`, async() => {
      const updatedUserSummary = await UserSummary.findOneAndUpdate(
        { username: requestedFriendUsername },
        { $push: { friendPending: requesterUsername } },
        { new: true, upsert: false }
      );
      return updatedUserSummary || null;
    }, checkFail);

    await setCache(`userSummary:${requesterUsername}`, async() => {
      const updatedUserSummary = await UserSummary.findOneAndUpdate(
        { username: requesterUsername },
        { $push: { friendRequest: requestedFriendUsername } },
        { new: true, upsert: false }
      );
      return updatedUserSummary || null;
    }, checkFail);

    if (checkFail) {
      return ack({ status: 404, message: "User does not exist" });
    }

    const sessionInfoJson = await redisClient.hGet('userSockets', requestedFriendUsername);
    const sessionInfo = JSON.parse(sessionInfoJson);
    console.log('check1')
    Object.values(sessionInfo).forEach(recipientSocketId => {
        console.log('check 1.5')
        io.to(recipientSocketId).emit('friendRequest', {
            sender: requesterUsername
        });
    });
    console.log('check2')
    ack({ status: 201, message: `Friend request sent successfully to ${requestedFriendUsername}.` });
  } catch (e) {
    console.log(e);
    ack({ status: 500, message: "An error occurred" });
  }
};




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
        if (!requesterUser||!requesterUser.friendRequest.includes(acceptingUserUsername)) {
            await setCache(`userSummary:${acceptingUserUsername}`, async() => {
              const updatedUserSummary = await UserSummary.findOneAndUpdate(
                { username: acceptingUserUsername },
                { 
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
            if (!requesterUser.friendRequest.includes(acceptingUserUsername)) {
              return res.status(400).send({ message: "No pending friend request from this user." });
            }
            return res.status(404).send({ message: "Requester user not found." });
        }

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
        if (!decliningUser.friendPending.includes(requesterUsername)) {
          return res.status(404).send({ message: "Friend request not found." });
        }


        const requesterUser = await getOrSetCache(`userSummary:${requesterUsername}`, async () => await UserSummary.findOne({ username: requesterUsername}));

        if (!requesterUser||!requesterUser.friendRequest.includes(decliningUserUsername)) {
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
            if (!requesterUser.friendRequest.includes(decliningUserUsername)) {
              return res.status(404).send({ message: "Friend request not found." });
            }
            return res.status(404).send({ message: "Requester user not found." });
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
        const recipientUser = await getOrSetCache(`userSummary:${recipientUsername}`, async () => await UserSummary.findOne({ username: recipientUsername }));

        if(!recipientUser){
          return res.status(404).send({ message: "Recipient user not found." });
        }
        if (!recipientUser.friendRequest.includes(cancellingUserUsername)) {
          return res.status(404).send({ message: "Friend request not found." });
        }
        const cancellingUser = await getOrSetCache(`userSummary:${cancellingUserUsername}`, async () => await UserSummary.findOne({ username: cancellingUserUsername }));

        if (!cancellingUser||!cancellingUser.friendPending.includes(recipientUsername)) {
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
          if (!cancellingUser) {
            return res.status(404).send({ message: "Cancelling user not found." });
          }
          return res.status(404).send({ message: "Friend request not found." });
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
        const recipientUser = await getOrSetCache(`userSummary:${recipientUsername}`, async () => await UserSummary.findOne({ username: recipientUsername }));
        if (!recipientUser) {
          return res.status(404).send({ message: "Recipient user not found." });
        }
        if (!recipientUser.friends.some(friend => friend.name === removingUserUsername)) {
            return res.status(404).send({ message: "Friend not found." });
        }


        if (!cancellingUser||!cancellingUser.friends.some(friend => friend.name === recipientUsername)) {
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
            if (!cancellingUser) {
              return res.status(404).send({ message: "User not found." });
            }
            return res.status(404).send({ message: "Friend not found." });
        }
        
        
        
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