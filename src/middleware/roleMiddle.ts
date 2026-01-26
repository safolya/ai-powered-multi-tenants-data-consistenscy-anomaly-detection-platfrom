import { NextFunction, Request, Response } from "express";



export const roleMiddle=async(req:Request,res:Response,next:NextFunction)=>{
      //@ts-ignore
      const {tenantId,role}=req.user;
      console.log("Role in role middleware:", role);
      console.log("Tenant ID in role middleware:", tenantId);
      //@ts-ignore
      
     if(role=="ADMIN" || role=="MANAGER"){
        next();
      }
    else{
        return res.json({
            message:"Admin role required"
        })
    }
}