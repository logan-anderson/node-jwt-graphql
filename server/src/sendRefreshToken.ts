import { Response } from "express";

export const sendRefeshToken = (res: Response, token: string)=>{
    res.cookie('qid', token, {
        httpOnly: true,
    })
}