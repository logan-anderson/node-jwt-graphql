import { Resolver, Query, Mutation, Arg, ObjectType, Field, Ctx, UseMiddleware, Int } from 'type-graphql'
import { hash, compare } from 'bcryptjs'
import { User } from './entity/User'
import { ResReqContext } from "./ContextInterface";
import { createRefreshToken, createAccessToken } from './auth';
import { isAuth } from './IsAuth';
import { sendRefeshToken } from './sendRefreshToken';
import { getConnection } from 'typeorm';
@ObjectType()
class LoginRes { 
    @Field()
    accessToken: string
}

@Resolver()
export class UserResolver {
    @Query(()=>String)
    hello() {
        return 'hi!'
    }
    
    @Query(()=>String)
    @UseMiddleware(isAuth)
    bye(
        @Ctx() {payload} : ResReqContext 
    ) {
        return `Your user is is ${payload?.id}`
    }

    @Query(()=>[User])
    async users() {
        const users = await User.find()
        console.log(users)
        return users
    }

    @Mutation(()=>Boolean)
    async register(
        @Arg('email', ()=>String) email: string,
        @Arg('password', ()=>String) password: string,
    )
    {
        try {
            let hashedPass = await hash(password, 12)
            await User.insert({
                email,
                password: hashedPass,
            })
        } catch (error) {
            console.error(error)
            return false   
        }

        return true;
    }

    @Mutation(()=>Boolean)
    async revokeRefreshTokensForUser(
        @Arg('id', ()=> Int) id: number
    ){
        await getConnection().getRepository(User).increment({id: id}, "tokenVersion", 1)
        return true;  
    }
    @Mutation(()=>LoginRes)
    async login(
        @Arg('email', ()=>String) email: string,
        @Arg('password', ()=>String) password: string,
        @Ctx() { res }: ResReqContext
    ): Promise<LoginRes>
    {
            const user = await User.findOneOrFail({
                where: { email },
            })
            const valid = await compare(password, user.password);
            if(!valid) {
                throw new Error('bad password')
            }


           sendRefeshToken(res, createRefreshToken(user))

            return {
                accessToken: createAccessToken(user)
            } 
    }
    
}