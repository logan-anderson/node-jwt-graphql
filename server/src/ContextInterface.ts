import { Request, Response } from 'express'

export interface ResReqContext {
    res: Response,
    req: Request
    payload?: { id : string}
}