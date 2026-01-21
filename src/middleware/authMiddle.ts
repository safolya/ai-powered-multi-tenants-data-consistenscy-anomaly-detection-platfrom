import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const secret = process.env.JWT_SECRET;

export const authMiddle=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const token=req.cookies.token;
        console.log("Token in middleware:", token);
    if(!token){
        return res.json({
            message:"Login first"
        })
    }

    const decode=jwt.verify(token,secret as string);
    if(decode){
        //@ts-ignore
        req.user={
            //@ts-ignore
            userId:decode.userId,
            //@ts-ignore
            tenatId:decode.tenantId,
            //@ts-ignore
            role:decoded.role
        }
        next()
    }else{
        res.json({
            message:"Login first"
        })
    }
    } catch (error:any) {
        res.json({
            messgae:error.message
        })
    }
    
}