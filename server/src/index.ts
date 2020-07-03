import 'dotenv/config'
import "reflect-metadata"
import { ApolloServer } from "apollo-server-express";
// import {createConnection} from "typeorm";
// import {User} from "./entity/User";

import express from 'express'
import { buildSchema } from "type-graphql";
import { UserResolver } from "./UserResolver";
import { createConnection } from "typeorm";
// 15:30

(async () => {
    await createConnection();
    
    const app = express()
    app.get('/', (_, res) => {
        res.json({
            hello: 'this just worked'
        })
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
