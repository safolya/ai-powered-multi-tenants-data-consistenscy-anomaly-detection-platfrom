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


const app = express();
app.use(cookieParser());
app.use(express.json())

const PORT = process.env.PORT || 3000;

const secret = process.env.JWT_SECRET;


// app.post("/signup", async (req, res) => {

//     try {
//         const { email, password } = req.body;

//         const existingUser = await prisma.users.findUnique({
//             where: { email }
//         })

//         if (existingUser) {
//             return res.json({
//                 message: "User Already exist, Please login",
//             })
//         }

//         const domain = email.split("@")[1];

//         console.log(domain);

//         const existingTenants = await prisma.tenants.findUnique({
//             where: { domain: domain }
//         })

//         if (!existingTenants) {
//             const tenant = await prisma.tenants.create({
//                 data: {
//                     name: domain.split(".")[0],
//                     domain: domain
//                 }
//             })

//             const hashedPass = await bcrypt.hash(password, 10);

//             const user = await prisma.users.create({
//                 data: {
//                     email: email,
//                     password: hashedPass as unknown as string
//                 }
//             })

//             const role = await prisma.role.create({
//                 data: {
//                     role: "ADMIN"
//                 }
//             })

//             const membership = await prisma.user_Tenants.create({
//                 data: {
//                     userId: user.id,
//                     roleId: role.id,
//                     tenantId: tenant.id
//                 }
//             })


//             res.json({
//                 message: "Success, please login",
//                 membership
//             })


//         } else {
//             return res.json({
//                 message: "similar domain org is already present.. wait for invitation"
//             })
//         }

//     } catch (error: any) {
//         res.json({
//             message: error.message || "Internal Server Error"
//         })
//     }
// })

// app.post("/login", async (req, res) => {
//     const { email, password } = req.body;
//     const existinguser = await prisma.users.findUnique({
//         where: { email }
//     })

//     if (!existinguser) {
//         return res.json({
//             message: "Email is not registered, Please signup"
//         })
//     }

//     const pass = await bcrypt.compare(password, existinguser.password as string);

//     if (!pass) {
//         return res.json({
//             message: "Incorrect Credentials"
//         })
//     }


//     const membership = await prisma.user_Tenants.findMany({
//         where: { userId: existinguser.id },
//         include: {
//             role: true,
//             tenant: true
//         }
//     })

//     if (membership.length === 0) {
//         return res.json({
//             message: "You don't have any membership"
//         })
//     };


//     const acitveMembership = membership[0];

//     const token = jwt.sign({
//         userId: existinguser.id,
//         tenatId: acitveMembership?.tenantId,
//         role: acitveMembership?.role.role
//     }, secret as string)


//     res.cookie("token", token, {
//         httpOnly: true,
//         secure: false,
//         sameSite: "lax",
//         maxAge: 24 * 60 * 60 * 1000
//     });


//     res.json({
//         message: "Success",
//         existinguser,
//         token
//     })

// })


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
