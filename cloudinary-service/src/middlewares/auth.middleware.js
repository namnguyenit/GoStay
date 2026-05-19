import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { throwError } from "../utils/throwError.js";

const identityServiceUrl = process.env.IDENTITY_SERVICE_URL || "http://localhost:8080";

const client = jwksClient({
    jwksUri: `${identityServiceUrl}/.well-known/jwks.json`,
    cache: true,
    rateLimit: true,
});

function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) {
            return callback(err);
        }

        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    });
}

export const verifyMediaJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme?.toLowerCase() !== "bearer" || !token) {
        return next(throwError("UNAUTHORIZED"));
    }

    jwt.verify(token, getKey, { algorithms: ["RS256"], issuer: "com.gotravel" }, (err, decoded) => {
        if (err || !decoded?.sub) {
            return next(throwError("UNAUTHORIZED"));
        }

        req.headers["x-user-id"] = decoded.sub;
        req.headers["x-user-roles"] = decoded.scope || "";

        next();
    });
};
