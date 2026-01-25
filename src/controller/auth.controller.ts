import { Request, Response } from "express";
import * as authService from "../services/auth.service"


export const signup = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const result = await authService.signup({
            email,
            password
        })


        res.status(200).json({
            message: "Successfully SignedUp please login",
            result
        })

    } catch (error: any) {
        if (error.message === "EMAIL ALREADY EXIST") {
            return res.status(409).json({
                success: false,
                message: "Email already exists,Please login"
            });
        }
        else if (error.message === "SIMILAR DOMAIN") {
            return res.status(409).json({
                success: false,
                message: "similar domain org is already present.. wait for invitation"
            });
        }

        console.error("Signup error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }

}




export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const result = await authService.login({
            email,
            password
        })

        res.cookie("token", result.token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Success",
            token:result.token,
            user:result.existinguser
        })


    } catch (error:any) {
      if (error.message === "EMAIL NOT REGISTERED") {
            return res.status(409).json({
                success: false,
                message: "Email is not registered, Please signup"
            });
        }
        else if (error.message === "INCORRECT CREDENTIALS") {
            return res.status(409).json({
                success: false,
                message: "Incorrect credentials"
            });
        }

        else if (error.message === "NO MEMBERSHIP") {
            return res.status(409).json({
                success: false,
                message: "You don't have any membership"
            });
        }

        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}