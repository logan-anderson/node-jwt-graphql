import { MiddlewareFn } from "type-graphql";
import { ResReqContext }  from './ContextInterface'
import { verify } from "jsonwebtoken";


// we want bearer <Token>


export const isAuth : MiddlewareFn<ResReqContext> = ({context}, next )=>{
    const auth = context.req.headers.authorization;

    if(!auth){
        throw new Error('no token bro')
    }
    try {
        const token = auth.split(' ')[1]
        context.payload = verify(token, process.env.ACCESS_TOKEN_SECRET!) as any;

    } catch(err) {
        console.log(err)
        throw err
    }

    return next()
}