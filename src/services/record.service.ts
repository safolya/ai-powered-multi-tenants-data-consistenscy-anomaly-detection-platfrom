import { prisma } from "../../lib/prisma"
import { buildAIFeatures } from "../utils/ai.featureBuider";
import axios from "axios";
import { Prisma, Record_type } from '../../generated/prisma/browser';



interface RecordsData {
    tenantId: string,
}

export const records = async ({ tenantId }: RecordsData) => {
    const records = await prisma.records.findMany({
        where: {
            tenantId: tenantId
        }
    })

    return records;
}


interface CreateData {
    tenantId: string,
    userId: string
    role: string,
    value: Prisma.InputJsonValue,
    key: string
    type: Record_type,
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
    role }: CreateData) => {

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

    }, {
        maxWait: 5000, // 5s max wait to start transaction
        timeout: 10000, // 10s max transaction time
    })

    return { result }
}


//UPDATE

interface UpdateData {
    tenantId: string,
    userId: string,
    role: string,
    value: Prisma.InputJsonValue,
    recordId: string,
}

export const update = async ({ tenantId, userId, role, recordId, value }: UpdateData) => {
    const result = await prisma.$transaction(async (tx) => {
        const existingRecord = await tx.records.findUnique({
            where: { id: recordId as string }
        })

        if (!existingRecord) {
            throw new Error("NO RECORD")
        }

        if (existingRecord.tenantId != tenantId) {
            throw new Error("CROSS TENANT-ACCESS DENIED")
        }

        if (!allowedRolesByType[existingRecord.type]?.includes(role)) {
            throw new Error("NOT ALLOWED TO UPDATE THIS TYPE");
        }

        const oldValue = existingRecord.value;
        const currVersion = existingRecord.version

        const updateRecord = await tx.records.updateMany({
            where: { id: recordId as string, version: currVersion },
            data: {
                value: value,
                version: { increment: 1 }
            }
        })

        if (updateRecord.count === 0) {
            throw new Error(
                "Record was modified by another user. Please refresh and retry."
            );
        }

        const updatedRecord = await tx.records.findUnique({
            where: { id: recordId }
        });

        const change_track = await tx.change_track.create({
            data: {
                tenantId: tenantId,
                recordId: recordId,
                changeBy: userId,
                action: "UPDATE",
                oldval: oldValue ?? Prisma.JsonNull,
                newval: updatedRecord?.value ?? Prisma.JsonNull
            }
        })

        const aiFeatures = buildAIFeatures({
            oldval: oldValue,
            newval: updatedRecord?.value,
            recordType: updatedRecord?.type as string,
            role,
            createdAt: change_track.time
        });

        const aiResponse = await axios.post(
            "http://localhost:8000/predict",
            aiFeatures
        );

        console.log("AI RESPONSE:", aiResponse.data);

        const { isAnomaly, score } = aiResponse.data;

        if (isAnomaly) {
            await tx.anomaly.create({
                data: {
                    recordId: recordId,
                    tenantId,
                    trackId: change_track.id,
                    score,
                    severity: "HIGH",
                    reason: "Unusual inventory drop detected"
                }
            });
        }

        return { change_track, updatedRecord, isAnomaly }

    }, {
        maxWait: 5000, // 5s max wait to start transaction
        timeout: 10000, // 10s max transaction time
    })

    return { result }

}

interface DeleteData {
    tenantId: string,
    userId: string,
    role: string,
    recordId: string,
}

export const deleterec = async ({ tenantId, userId, role, recordId }: DeleteData) => {

    if (role !== "ADMIN") {
        throw new Error("NOT ALLOWED TO DELETE");
    }


    const result = await prisma.$transaction(async (tx) => {
        const existingRecord = await tx.records.findUnique({
            where: { id: recordId as string }
        })


        if (!existingRecord) {
            throw new Error("NO RECORD FOUND")
        }

        if (existingRecord.tenantId != tenantId) {
            throw new Error("CROSS TENANT-ACCESS DENIED")
        }


        const oldvalue = existingRecord.value;

        const change_track = await tx.change_track.create({
            data: {
                tenantId: tenantId,
                recordId: existingRecord.id,
                changeBy: userId,
                action: "DELETE",
                oldval: oldvalue ?? Prisma.JsonNull,
                newval: Prisma.JsonNull
            }
        })

        await tx.records.update({
            where: { id: recordId as string },
            data: { deleteAt: new Date() }
        })


        return { change_track, existingRecord }

    }, {
        maxWait: 5000,
        timeout: 10000,
    })

    return { result }
}

//rollback

interface rollbackData {
    tenantId: string,
    userId: string,
    role: string,
    trackId: string,
}

export const rollback = async ({ tenantId, userId, role, trackId }: rollbackData) => {
    if (role !== "ADMIN") {
        throw new Error("Only admin can access")
    }


    const result = await prisma.$transaction(async (tx) => {

        // Fetch audit log
        const log = await tx.change_track.findUnique({
            where: { id: trackId }
        });

        if (!log) {
            throw new Error("NO AUDIT LOG");
        }

        // Tenant isolation
        if (log.tenantId !== tenantId) {
            throw new Error("CROSS TENANT-ACCESS DENIED");
        }

        // Fetch record
        const record = await tx.records.findUnique({
            where: { id: log.recordId }
        });

        if (!record) {
            throw new Error("NO RECORD FOUND");
        }

        // Save current value
        const currentValue = record.value;

        // Restore old value
        const restoredRecord = await tx.records.update({
            where: { id: record.id },
            data: {
                value: log.oldval ?? Prisma.JsonNull,
                version: { increment: 1 }
            }
        });

        //Create NEW audit log for rollback
        const rollbackLog = await tx.change_track.create({
            data: {
                recordId: record.id,
                tenantId: tenantId,
                oldval: currentValue ?? Prisma.JsonNull,
                newval: log.oldval ?? Prisma.JsonNull,
                action: "ROLLBACK",
                changeBy: userId
            }
        });

        return {
            restoredRecord,
            rollbackLog
        };
    }, {
        maxWait: 5000,
        timeout: 10000,
    });

    return { result }

}