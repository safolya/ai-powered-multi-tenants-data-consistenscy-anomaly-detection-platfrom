import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import cookieParser from 'cookie-parser';
import { authMiddle } from './middleware/authMiddle';

const app = express();
app.use(cookieParser());
app.use(express.json())

const PORT = process.env.PORT || 3000;

const secret = process.env.JWT_SECRET;


app.post("/signup", async (req, res) => {

    try {
        const { email, password } = req.body;

        const existingUser = await prisma.users.findUnique({
            where: { email }
        })

        if (existingUser) {
            return res.json({
                message: "User Already exist, Please login",
            })
        }

        const domain = email.split("@")[1];

        console.log(domain);

        const existingTenants = await prisma.tenants.findUnique({
            where: { domain: domain }
        })

        if (!existingTenants) {
            const tenant = await prisma.tenants.create({
                data: {
                    name: domain.split(".")[0],
                    domain: domain
                }
            })

            const hashedPass = await bcrypt.hash(password, 10);

            const user = await prisma.users.create({
                data: {
                    email: email,
                    password: hashedPass as unknown as string
                }
            })

            const role=await prisma.role.create({
                data:{
                    role:"ADMIN"
                }
            })

            const membership = await prisma.user_Tenants.create({
                data: {
                    userId: user.id,
                    roleId:role.id,
                    tenantId:tenant.id
            }
            })


            res.json({
                message:"Success, please login",
                membership
            })


        } else {
            return res.json({
                message: "similar domain org is already present.. wait for invitation"
            })
        }


        // const token = jwt.sign({
        //     userId: user.id
        // }, secret as string)

        // res.cookie("token", token, {
        //     httpOnly: true,
        //     secure: false,
        //     sameSite: "lax",
        //     maxAge: 24 * 60 * 60 * 1000
        // });
    } catch (error: any) {
        res.json({
            message: error.message || "Internal Server Error"
        })
    }
})

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const existinguser = await prisma.users.findUnique({
        where: { email }
    })

    if (!existinguser) {
        return res.json({
            message: "Email is not registered, Please signup"
        })
    }

    const pass = await bcrypt.compare(password, existinguser.password as string);

    if (!pass) {
        return res.json({
            message: "Incorrect Credentials"
        })
    }


    const membership=await prisma.user_Tenants.findMany({
       where:{userId:existinguser.id},
       include:{
           role:true,
           tenant:true
       }
    })

    if(membership.length===0){
        return res.json({
            message:"You don't have any membership"
        })
    };


    const acitveMembership=membership[0];

    const token=jwt.sign({
        userId:existinguser.id,
        tenatId:acitveMembership?.tenantId,
        role:acitveMembership?.role.role
    },secret as string)


    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000
    });


    res.json({
        message: "Success",
        existinguser,
        token
    })

})


// app.post("/org", authMiddle, async (req, res) => {
//     const { name } = req.body;
//     const existingTenant = await prisma.tenants.findFirst({
//         where: {
//             name,
//             status: "ACCEPT"
//         }
//     })
//     if (existingTenant) {
//         return res.json({
//             message: "Tenant is already exists"
//         })
//     }

//     const tenat = await prisma.tenants.create({
//         data: {
//             name: name,
//             domain: "companyA.com"
//         }
//     })
//     res.json({
//         message: "successfull",
//         tenat
//     })
// })



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
