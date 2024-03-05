import { DirectMessages } from '../database/database.js';
import decodeJwt from '../universal-scripts/jwt-decode.js';

async function addMessageDirectChannel(req, res) {
  try {
    const decodedJwtData = decodeJwt(req.headers.authorization);
    const senderUsername = decodedJwtData.username;

    const channelId = req.params.id;

    const { message } = req.body;
    if (!message) {
      return res.status(400).send({ message: "Message content is required." });
    }

    const newMessage = {
      message: message,
      timestamp: new Date().toISOString(),
      sender: senderUsername
    };

    const updatedChannel = await DirectMessages.findByIdAndUpdate(
      channelId,
      { $push: { messages: newMessage } },
      { new: true } 
    );

    if (!updatedChannel) {
      return res.status(404).send({ message: "Direct message channel not found." });
    }

    return res.status(200).json({ message: "Message added successfully.", updatedChannel });
  } catch (e) {
    console.error(e);
    res.status(500).send("An error occurred while adding the message.");
  }
}

export default addMessageDirectChannel;
