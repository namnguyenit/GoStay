import jwt  from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import NodeCache from "node-cache";
import { buildErorRespone, GatewayError} from "../utils/response.helper.js";

const client = jwksClient({
    jwksUri: `${process.env.IDENTITY_SERVICE_URL}/.well-known/jwks.json`,
    cache: true,
    rateLimit:true,
});


function getKey(header,callback){
    client.getSigningKey(header.kid, function(err,key){
        if(err){
            return callback(err);
        }
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    });
}

// lưu trạng thái của user trong 5 phút
const userCache = new NodeCache(
    {
        stdTTL: 300
    }
)


export const verifyJWT = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return buildErorRespone(res, GatewayError.MISSING_TOKEN);
    }

    jwt.verify(token, getKey , { algorithms: ["RS256"] }, async (err, decoded) => {
        if (err){
            return  buildErorRespone(res, GatewayError.INVALID_TOKEN);
        }
        const userId=decoded.sub;
        const roles = decoded.scope;
        try{
            let isAlow = userCache.get(userId);

            if (isAlow == undefined){
                const response = await fetch(`${process.env.IDENTITY_SERVICE_URL}/api/users/internal/${userId}/status`);
                if (!response.ok){
                    throw new Error("Lỗi gọi Identity Service")
                }
                const data = await response.json();
                isAlow = data.data.isActive;

                userCache.set(userId, isAlow);
            }
            if (!isAlow){
                return res.status(403).json({
                    status: "403",
                    success: false,
                    message: "Tài khoản bị vô hiệu hóa hoặc xóa đi"
                })

            }
            req.headers['x-user-id']= userId;
            req.headers['x-user-roles']= roles;
            next();
        }catch (error){
            console.error("Lỗi Internal Gateway",error);
            return buildErorRespone(res, GatewayError.INTERNAL_ERROR);
        }
    })
}
