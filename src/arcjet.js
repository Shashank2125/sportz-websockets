import {detectBot, shield, slidingWindow} from "@arcjet/node";

const arcjetKey=process.env.ARCJET_KEY
const arcjetMode=process.env.ARCJET_MODE === 'DRY_RUN' ? 'DRY_RUN' : 'LIVE';

if(!arcjetKey) throw new Error('ARCJET_KEY environment variable is missing.');


export const httpArcjet=arcjetKey?
    arcjet({
    key: arcjetKey,
        rules:[
            //this shield protect us from common attacks like
            //sql injection and xss with analyzing incoming request
            shield({mode: arcjetMode}),
            detectBot({mode:arcjetMode,allow:['CATEGORY:SEARCH_ENGINE','CATEGORY:PREVIEW']}),
            //rate-limiting window-50 connection request every 10 second
            slidingWindow({mode:arcjetMode,interval:'10s',max:50})
        ]
    }):null;
export const wsArcjet=arcjetKey?
    arcjet({
        rules:[
            //this shield protect us from common attacks like
            //sql injection and xss with analyzing incoming request
            shield({mode: arcjetMode}),
            detectBot({mode:arcjetMode,allow:['CATEGORY:SEARCH_ENGINE','CATEGORY:PREVIEW']}),
            //rate-limiting window-only 5 connection attempt every 2 sec
            slidingWindow({mode:arcjetMode,interval:'2s',max:5})
        ]

    }):null;
export function securityMiddleware(){
    //middleware requires nect parameter
    return async (req,res,next)=>{
        if(!httpArcjet) return next();
        try{
            //arcjet analyze the request and decide to make through or
            //we stop on tracks based above two func rules
            const decision=await httpArcjet.protect(req);

            if(decision.isDenied()) {
                if (decision.reason.isRateLimit()){
                    return res.status(429).json({error:'Too many requests.'});
                }
                return res.status(403).json({error:'Forbidden.'});
            }
            
        }catch (e) {
            console.error('Arcjet middleware error:', e);
            return res.status(503).json({error:'Service Unavailable'});
        }
        //decision is set to allowed
        next();

    }
}