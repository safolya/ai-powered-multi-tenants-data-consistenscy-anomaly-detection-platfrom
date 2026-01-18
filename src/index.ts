import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import {prisma} from "../lib/prisma";
// import { dbConnect,dbDisconnect,prisma } from './config/dbconnection';

// dbConnect();

const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.post("/login", async (req,res)=>{
    const{email,password}=req.body;
    const user = await prisma.users.create({
        data:{
            name:"John Doe",
            email:"safolya@gmail.com"
        }
    })
    res.json(user);
})