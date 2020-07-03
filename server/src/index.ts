import 'dotenv/config'
import "reflect-metadata"
import { ApolloServer } from "apollo-server-express";
import cookieParser from 'cookie-parser'
// import {createConnection} from "typeorm";
// import {User} from "./entity/User";



import express from 'express'
import { buildSchema } from "type-graphql";
import { UserResolver } from "./UserResolver";
import { createConnection } from "typeorm";
import { verify } from 'jsonwebtoken';
import { User } from './entity/User';
import { createRefreshToken } from './auth';
import { sendRefeshToken } from './sendRefreshToken';
// 1:03:28

(async () => {
    await createConnection();
    
    const app = express()
    app.use(cookieParser())
    app.get('/', (_, res) => {
        res.json({
            hello: 'this just worked'
        })
    })
    app.post('/refresh_token', async (req, res)=>{
        const token = req.cookies.qid
        if(!token){
            return res.send({ok: false, accessToken: ''})
        }
        let payload: any = null;
        let user : User = null as any;
        try {
            payload = verify(token, process.env.REFRESH_TOKEN_SECRET!)
            console.log(payload)
            user = await User.findOneOrFail({id: payload.id})
        } catch(e){
            console.log(e)
            return res.send({ok: false, accessToken: ''})
        }

        // token is valid

        if(!user){
            return res.send({ok: false, accessToken: ''})
        }
        
        if(user.tokenVersion !== payload.tokenVersion){
            return res.send({ok: false, accessToken: ''})
        }

        sendRefeshToken(res,createRefreshToken(user))
        

        return res.send({ok: true, accessToken: token})
    })


    const apollo = new ApolloServer({
        schema: await buildSchema({resolvers: [UserResolver]}),
        context: ({req, res})=>({res, req})
    })
    apollo.applyMiddleware({app})


    app.listen(3001, () => {
        console.log("⚡ server started")
    })
})()

// createConnection().then(async connection => {

//     console.log("Inserting a new user into the database...");
//     const user = new User();
//     user.firstName = "Timber";
//     user.lastName = "Saw";
//     user.age = 25;
//     await connection.manager.save(user);
//     console.log("Saved a new user with id: " + user.id);

//     console.log("Loading users from the database...");
//     const users = await connection.manager.find(User);
//     console.log("Loaded users: ", users);

//     console.log("Here you can setup and run express/koa/any other framework.");

// }).catch(error => console.log(error));
