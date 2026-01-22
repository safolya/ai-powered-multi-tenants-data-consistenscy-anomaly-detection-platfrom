import { NextFunction, Request, Response } from "express";



export const roleMiddle=async(req:Request,res:Response,next:NextFunction)=>{
      //@ts-ignore
      const role=req.user.role;
      const {tenantid}=req.params;
      console.log("Role in role middleware:", role);
      console.log("Tenant ID in role middleware:", tenantid);
      //@ts-ignore
      if(tenantid===req.user.tenantId){
        if(role==="ADMIN" || role==="MANAGER")
        next();
      }
    else{
        return res.json({
            message:"Admin role required"
        })
    }
}