import { buildMediaAccess } from "../utils/mediaOwnership.js";



export const rbacMedia = (actionType) =>{
    return (req, res, next) => {
        try {
            req.body = req.body || {};
            req.mediaAccess = buildMediaAccess(req, actionType);
            req.body.folder = req.mediaAccess.folder;
            next();
        } catch(err){
            next(err)
        }
    }
}
