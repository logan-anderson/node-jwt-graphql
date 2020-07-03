import { User } from "./entity/User"
import { sign } from "jsonwebtoken"

export const createAccessToken = (user: User) : string =>{
    return sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15min'})
}

export const createRefreshToken = (user: User) : string =>{
    return sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '7days'})
}