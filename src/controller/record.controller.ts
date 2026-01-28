import { Request, Response } from "express";
import * as recordService from "../services/record.service"

export const create = async (req: Request, res: Response) => {
    try {
        const { type, key, value } = req.body;
        //@ts-ignore
        const { tenantId, userId, role } = req.user

        const result = await recordService.create({
            type,
            key,
            value,
            tenantId,
            userId,
            role
        })

        res.status(200).json({
            message: "Successful",
            record: result.result.record,
            track: result.result.change_track
        })

    } catch (error: any) {
        if (error.message === "NOT ALLOWED") {
            return res.status(409).json({
                success: false,
                message: "Not allowed"
            });
        }

        console.error("Record error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}


export const update = async (req: Request, res: Response) => {
    try {
        //@ts-ignore
        const { tenantId, userId, role } = req.user
        const { recordId } = req.params
        const { value } = req.body

        const result = recordService.update({
            tenantId,
            userId,
            role,
            recordId: recordId as string,
            value
        })

        res.status(200).json({
            message: "Successful",
            updatedrecord:(await result).result.updatedRecord,
            track: (await result).result.change_track
        })

    } catch (error:any) {
       if (error.message === "CROSS TENANT-ACCESS DENIED") {
            return res.status(409).json({
                success: false,
                message: "Cross tenant-access denied"
            });
        }

        else if(error.message === "NOT ALLOWED TO UPDATE THIS TYPE") {
            return res.status(409).json({
                success: false,
                message: "Not allowed to update this record type"
            });
        }

        console.error("Record error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }

}

export const deleteRec=async(req:Request,res:Response)=>{
   try {
         //@ts-ignore
        const { tenantId, userId, role } = req.user
        const { recordId } = req.params;

        const result=recordService.deleterec({
            tenantId,
            userId,
            role,
            recordId: recordId as string
        })

        res.status(200).json({
            message:"Successfull",
            track:(await result).result.change_track,
            record:(await result).result.existingRecord
        })

   } catch (error:any) {
        if (error.message === "CROSS TENANT-ACCESS DENIED") {
            return res.status(409).json({
                success: false,
                message: "Cross tenant-access denied"
            });
        }

        else if(error.message === "NOT ALLOWED TO DELETE") {
            return res.status(409).json({
                success: false,
                message: "Not allowed to delete"
            });
        }

        else if(error.message === "NO RECORD FOUND"){
            return res.status(409).json({
                success: false,
                message: "No record found"
            });
        }

        console.error("Record error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
   }
}

export const rollbackRec=async(req:Request,res:Response)=>{
    try {
        //@ts-ignore
        const { tenantId, userId, role } = req.user;
        const{trackId}=req.params;

        const result=recordService.rollback({
            tenantId, userId, role,trackId:trackId as string
        })

        res.status(200).json({
            message:"Succesfully Rollback",
            restoredRecord:(await result).result.restoredRecord,
            trackLog:(await result).result.rollbackLog
        })


    } catch (error:any) {
        if (error.message === "CROSS TENANT-ACCESS DENIED") {
            return res.status(409).json({
                success: false,
                message: "Cross tenant-access denied"
            });
        }

        else if(error.message === "NO AUDIT LOG") {
            return res.status(409).json({
                success: false,
                message: "No audit found"
            });
        }

        else if(error.message === "NO RECORD FOUND"){
            return res.status(409).json({
                success: false,
                message: "Record no longer exist"
            });
        }

        console.error("Record error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}