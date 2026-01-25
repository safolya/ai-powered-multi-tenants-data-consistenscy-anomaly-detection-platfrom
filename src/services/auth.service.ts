import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;

interface Data {
    password: string;
    email: string;
}

//SIGNUP

export const signup = async ({ email, password }: Data) => {


    const existingUser = await prisma.users.findUnique({
        where: { email }
    })

    if (existingUser) {
        throw new Error("EMAIL ALREADY EXIST")
    }

    const domain = email.split("@")[1];

    console.log(domain);

    const existingTenants = await prisma.tenants.findUnique({
        where: { domain: domain as string }
    })

    if (!existingTenants) {
        const tenant = await prisma.tenants.create({
            data: {
                name: domain?.split(".")[0] as string,
                domain: domain as string
            }
        })

        const hashedPass = await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
            data: {
                email: email,
                password: hashedPass as unknown as string
            }
        })

        const role = await prisma.role.create({
            data: {
                role: "ADMIN"
            }
        })

        const membership = await prisma.user_Tenants.create({
            data: {
                userId: user.id,
                roleId: role.id,
                tenantId: tenant.id
            }
        })

         return{
            user,
            membership
         }

    }else{
        throw new Error("SIMILAR DOMAIN")
    }
}

//--------------------------------------------

//LOGIN


export const login= async({email,password}:Data)=>{
   const existinguser = await prisma.users.findUnique({
           where: { email }
       })
   
       if (!existinguser) {
           throw new Error("EMAIL NOT REGISTERED")
       }
   
       const pass = await bcrypt.compare(password, existinguser.password as string);
   
       if (!pass) {
           throw new Error("INCORRECT CREDENTIALS")
       }
   
   
       const membership = await prisma.user_Tenants.findMany({
           where: { userId: existinguser.id },
           include: {
               role: true,
               tenant: true
           }
       })
   
       if (membership.length === 0) {
           throw new Error("NO MEMBERSHIP")
       };
   
   
       const acitveMembership = membership[0];
   
       const token = jwt.sign({
           userId: existinguser.id,
           tenatId: acitveMembership?.tenantId,
           role: acitveMembership?.role.role
       }, secret as string)

       return{
        existinguser,
        token
       }
}