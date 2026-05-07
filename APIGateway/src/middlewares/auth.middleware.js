import jwt  from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import NodeCache from "node-cache";


const client = jwksClient({
    jwksUri: '${process.env.IDENTITY_SERVICE_URL}/.well-known/jwks.json',
    cache: true,
    rateLimit:true,
});


function getKey(headers,callback){
    client.getSigningKey(header.kid, function(err,key){
        if(err){
            return callback(err);
        }
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    });
}


// lưu trạng thái của user trong 5 phút
const userCache = new Cache(
    {
        stdTTL: 300
    }
)





export const verifyJWT = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json(
            {
                status: "401",
                success: false,
                message: "Vui lòng cung cấp token",

            }
        )
    }

    jwt.verify(token, getKey , { algorithms: ["RS256"] }, async (err, decoded) => {
        if (err){
            return res.status(403).json({
                status: "403",
                success: false,
                message: "Token không hợp lệ"
            })
        }
        const userId=decoded.sub;
        const role = decoded.scope;
        try{
            
        }
    })
}