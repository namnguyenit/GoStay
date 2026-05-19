import { throwError} from "../utils/throwError.js";



export const rbacMedia = (actionType) =>{
    return (req, res, next) => {
        try {
            const userRoles = req.headers["x-user-roles"]||'';
            let {folder} = req.body;

            if (userRoles.includes("INTERNAL_SERVICE")){
                if (!folder){
                    folder = "internal-uploads";
                }
            }else if (userRoles.includes("ADMIN")){
                if (!folder){
                    folder = "admin-uploads";
                }
            }else if(userRoles.includes("HOST") || userRoles.includes("ENTERPRISE")){
                if(!folder){
                    return next(throwError("MISSING_FOLDER"));
                }
            }else if(userRoles.includes("USER")){
                if (actionType === 'secure'){
                    return next(throwError("FORBIDDEN"));
                }
                folder = (actionType === 'bulk') ? 'reviews' :'avatar';
            }else {
                return next(throwError("FORBIDDEN"));
            }
            req.body.folder = folder;
            next();
        } catch(err){
            next(err)
        }
    }
}
