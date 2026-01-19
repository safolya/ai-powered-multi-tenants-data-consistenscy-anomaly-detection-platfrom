import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const app = express();

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

        const hashedPass =await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
            data: {
                email: email,
                password: hashedPass as unknown as string
            }
        })

        const token = jwt.sign({
            userId: user.id
        }, secret as string)

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });


        res.json({
            message: "Success",
            user,
            token
        })
    } catch (error:any) {
        res.json({
            message: error.message||"Internal Server Error"
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

    const pass =await bcrypt.compare(password, existinguser.password as string);

    if (!pass) {
        return res.json({
            message: "Incorrect Credentials"
        })
    }

    const token = jwt.sign({
        userId: existinguser.id
    }, secret as string)

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



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
