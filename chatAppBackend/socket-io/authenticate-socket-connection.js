import { io } from "../server";
import 'dotenv/config.js';
import jwt from "jsonwebtoken";

export function socketAuthMiddleware(socket, next) {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error: Token not provided'));
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return next(new Error('Authentication error: Token is invalid'));
        }

        socket.userData = decoded; 
        next(); 
    });
}