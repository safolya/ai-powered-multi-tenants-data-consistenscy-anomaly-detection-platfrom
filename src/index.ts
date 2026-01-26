import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import cookieParser from 'cookie-parser';
import { authMiddle } from './middleware/authMiddle';
import { roleMiddle } from './middleware/roleMiddle';
import { Prisma } from '../generated/prisma/browser';
import authRoutes from './routes/auth.routes';
import recordRoutes from './routes/record.routes';

const app = express();
app.use(cookieParser());
app.use(express.json())

const PORT = process.env.PORT || 3000;

const secret = process.env.JWT_SECRET;

app.use("/api/v1/auth",authRoutes)
app.use("/api/v1/record",recordRoutes)

// app.post("/records/", authMiddle, roleMiddle, async (req, res) => {
//     try {
//         const { type, key, value } = req.body;
//         //@ts-ignore
//         const { tenantId, userId, role } = req.user

//         const allowedRolesByType: Record<string, string[]> = {
//             INVENTORY: ["ADMIN", "MANAGER"],
//             PRICES: ["ADMIN", "MANAGER"],
//             CONFIG: ["ADMIN"],
//             LIMIT: ["ADMIN"]
//         };


//         if (!allowedRolesByType[type]?.includes(role)) {
//             return res.status(403).json({ message: "Not allowed" });
//         }


//         const result = await prisma.$transaction(async (tx) => {
//             //create record
//             const record = await tx.records.create({
//                 data: {
//                     tenantId: tenantId,
//                     type: type,
//                     key: key,
//                     value: value
//                 }
//             });

//             const change_track = await tx.change_track.create({
//                 data: {
//                     recordId: record?.id,
//                     tenantId: tenantId as unknown as string,
//                     oldval: Prisma.JsonNull,
//                     newval: record.value ?? Prisma.JsonNull,
//                     action: "CREATE",
//                     //@ts-ignore
//                     changeBy: userId
//                 }
//             })

//             return { record, change_track }

//         })

//         res.json({
//             message: "Succesfull",
//             result
//         })

//     } catch (error: any) {
//         res.json({
//             message: error.message
//         })
//     }
// })

// app.put("/:recordId/update",authMiddle,roleMiddle, async (req, res) => {
//     //@ts-ignore
//     const { tenantId, userId, role } = req.user
//     const { recordId } = req.params
//     const { value } = req.body

//     const result = await prisma.$transaction(async (tx) => {
//         const existingRecord = await prisma.records.findUnique({
//             where: { id: recordId as string }
//         })

//         if (!existingRecord) {
//             return res.json({
//                 message: "There is no existing record"
//             })
//         }

//         if (existingRecord.tenantId != tenantId) {
//             throw new Error("Cross tenant-Access denied")
//         }

//         const allowedRolesByType: Record<string, string[]> = {
//             INVENTORY: ["ADMIN", "MANAGER"],
//             PRICES: ["ADMIN", "MANAGER"],
//             CONFIG: ["ADMIN"],
//             LIMIT: ["ADMIN"]
//         };

//         if (!allowedRolesByType[existingRecord.type]?.includes(role)) {
//             throw new Error("Not allowed to update this record type");
//         }

//         const oldValue = existingRecord.value;

//         const updatedRecord = await tx.records.update({
//             where: { id: recordId as string },
//             data: {
//                 value: value
//             }
//         })

//         const change_track = await tx.change_track.create({
//             data:{
//                 tenantId:tenantId,
//                 recordId:updatedRecord.id,
//                 changeBy:userId,
//                 action:"UPDATE",
//                 oldval:oldValue ?? Prisma.JsonNull,
//                 newval:updatedRecord.value ?? Prisma.JsonNull
//             }
//         })

//         return {change_track,updatedRecord}

//     })
      
//     res.json({
//         message: "Successfully updated",
//         result
//     })

// })

// app.delete("/:recordId/delete", authMiddle,roleMiddle,async(req,res)=>{

//    try {
//     const {recordId}=req.params
//      //@ts-ignore
//      const {tenantId,userId,role}=req.user
    
//      const result=await prisma.$transaction(async(tx)=>{
//         const existingRecord = await tx.records.findUnique({
//             where: { id: recordId as string }
//         })

        
//         if (!existingRecord) {
//             throw new Error("No record Found")
//         }
        
//         if (existingRecord.tenantId != tenantId) {
//             throw new Error("Cross tenant-Access denied")
//         }


//         const oldvalue=existingRecord.value;

//         if(role=="ADMIN"){

//             const deleteRecord=await tx.records.delete({
//                 where:{id:recordId as string}
//             })

//         }else{
//             throw new Error("Not allowed to delete");
//         }

//           const change_track = await tx.change_track.create({
//             data:{
//                 tenantId:tenantId,
//                 recordId:existingRecord.id,
//                 changeBy:userId,
//                 action:"DELETE",
//                 oldval:oldvalue ?? Prisma.JsonNull,
//                 newval:Prisma.JsonNull
//             }
//         })
          
//         return{change_track}

//      })

//      res.json({
//         message:"Successfully Deleted record",
//         result
//      })
//    } catch (err:any) {
//         return res.status(400).json({
//       message: err.message || "Delete failed"
//     });
//    }
// })


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
