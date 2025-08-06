import jwt from 'jsonwebtoken'; // Import jsonwebtoken for token generation
import secret from './config.js'; // Import the configuration file
const SECERET_KEY = secret.jwt_secret; // Get the secret key from the configuration
// Token expiration time

const createToken = async (data, expireTime = '24h') => {

    return new Promise((resolve, reject) => {
        jwt.sign(data, SECERET_KEY, { expiresIn: expireTime }, (err, token) => {
            if (err) return reject(err);
            resolve(token);
        });
    });
};

const verifyToken = async (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, SECERET_KEY, (err, decoded) => {
            if (err) return reject(err);
            resolve(decoded);
        });

    });
};

export { createToken, verifyToken }; // Export the functions for use in other files