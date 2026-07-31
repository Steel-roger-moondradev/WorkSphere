import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import sql from "../utils/db.js";

interface User{
    user_id:number,
    name:string,
    email:string,
    phone_number:string,
    role_user:string,
    bio:string|null,
    resume:string|null,
    profile_pic:string|null,
    profile_pic_public_key:string|null,
    resume_public_id:string|null,
    subscription:string|null,
    skills:string[],
}

export interface authenticatedRequest extends Request{
    user?:User
}

export const isAuth =async(req:authenticatedRequest,res:Response,next:NextFunction):Promise<void>=>{
    try{
        const authHeader=req.headers.authorization;
        if(!authHeader||!authHeader.startsWith("Bearer ")){
            res.status(401).json({
                message:"Authorization header is missing or invalid"
            })
            return;
        }
        const token=authHeader?.split(" ")[1];
        const decodePayload=jwt.verify(
            token as string,
            process.env.JWT_SECRET as string,
        ) as JwtPayload;

        if(!decodePayload){
            res.status(401).json({
                message:"Invalid Token",
            })
            return;
        }
        
        const users=await sql`
        SELECT u.user_id,u.name,u.email,u.phone_number,u.role,u.bio,u.resume,
        u.profile_pic,u.subscription,ARRAY_AGG(s.name) FILTER(WHERE s.name IS NOT NULL) as skills FROM users u 
        LEFT JOIN users_skills us ON us.user_id=u.user_id LEFT JOIN skills s ON s.skill_id=us.skill_id
        WHERE u.user_id=${decodePayload.id}
        GROUP BY u.user_id
        `;
        if(users.length===0){
            res.status(400).json({
                message:"User does not exist",
            })
            return;
        }
        const user=users[0];
        user.skill=user.skills||[]
        req.user=user as User;
        next();
    }
    catch(error:any){
         res.status(401).json({
        message:"Invalid or expired token"
    })
    }
    
}
