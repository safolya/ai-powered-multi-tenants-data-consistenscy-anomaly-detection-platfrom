import { prisma } from "../../lib/prisma"
import { Prisma,Record_type } from '../../generated/prisma/browser';

interface CreateData{
  tenantId:string,
  userId:string
  role:string,
  value:Prisma.InputJsonValue,
  key:string
  type:Record_type,
}

const allowedRolesByType: Record<string, string[]> = {
            INVENTORY: ["ADMIN", "MANAGER"],
            PRICES: ["ADMIN", "MANAGER"],
            CONFIG: ["ADMIN"],
            LIMIT: ["ADMIN"]
        };

export const create = async ({ type,
    key,
    value,
    tenantId,
    userId,
    role }:CreateData) => {
    
        if (!allowedRolesByType[type]?.includes(role)) {
            throw new Error("NOT ALLOWED");
        }


        const result = await prisma.$transaction(async (tx) => {
            //create record
            const record = await tx.records.create({
                data: {
                    tenantId: tenantId,
                    type: type,
                    key: key,
                    value: value
                }
            });

            const change_track = await tx.change_track.create({
                data: {
                    recordId: record?.id,
                    tenantId: tenantId as unknown as string,
                    oldval: Prisma.JsonNull,
                    newval: record.value ?? Prisma.JsonNull,
                    action: "CREATE",
                    //@ts-ignore
                    changeBy: userId
                }
            })

            return { record, change_track }

        },{
        maxWait: 5000, // 5s max wait to start transaction
        timeout: 10000, // 10s max transaction time
      })

        return{result}
}


//UPDATE

interface UpdateData{
  tenantId:string,
  userId:string,
  role:string,
  value:Prisma.InputJsonValue,
  recordId:string,
}

export const update=async({tenantId, userId, role, recordId, value}:UpdateData)=>{
     const result = await prisma.$transaction(async (tx) => {
        const existingRecord = await prisma.records.findUnique({
            where: { id: recordId as string }
        })

        if (!existingRecord) {
            throw new Error ("NO RECORD")
        }

        if (existingRecord.tenantId != tenantId) {
            throw new Error("CROSS TENANT-ACCESS DENIED")
        }

        if (!allowedRolesByType[existingRecord.type]?.includes(role)) {
            throw new Error("NOT ALLOWED TO UPDATE THIS TYPE");
        }

        const oldValue = existingRecord.value;

        const updatedRecord = await tx.records.update({
            where: { id: recordId as string },
            data: {
                value: value
            }
        })

        const change_track = await tx.change_track.create({
            data:{
                tenantId:tenantId,
                recordId:updatedRecord.id,
                changeBy:userId,
                action:"UPDATE",
                oldval:oldValue ?? Prisma.JsonNull,
                newval:updatedRecord.value ?? Prisma.JsonNull
            }
        })

        return {change_track,updatedRecord}

    },{
        maxWait: 5000, // 5s max wait to start transaction
        timeout: 10000, // 10s max transaction time
      })

    return{result}

}

interface DeleteData{
  tenantId:string,
  userId:string,
  role:string,
  recordId:string,
}

export const deleterec=async({tenantId,userId,role,recordId}:DeleteData)=>{

    const result=await prisma.$transaction(async(tx)=>{
        const existingRecord = await tx.records.findUnique({
            where: { id: recordId as string }
        })

        
        if (!existingRecord) {
            throw new Error("NO RECORD FOUND")
        }
        
        if (existingRecord.tenantId != tenantId) {
            throw new Error("CROSS TENANT-ACCESS DENIED")
        }


        const oldvalue=existingRecord.value;

            const change_track = await tx.change_track.create({
            data:{
                tenantId:tenantId,
                recordId:existingRecord.id,
                changeBy:userId,
                action:"DELETE",
                oldval:oldvalue ?? Prisma.JsonNull,
                newval:Prisma.JsonNull
            }
        })

        if(role=="ADMIN"){

            const deleteRecord=await tx.records.update({
                where:{id:recordId as string},
                data:{deleteAt:new Date()}
            })

        }else{
            throw new Error("NOT ALLOWED TO DELETE");
        }
          
        return{change_track,existingRecord}

     },{
        maxWait: 5000, // 5s max wait to start transaction
        timeout: 10000, // 10s max transaction time
      })

     return{result}
}