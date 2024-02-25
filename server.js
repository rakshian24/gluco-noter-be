import { createSchema, createYoga } from "graphql-yoga";
import dotenv from "dotenv";
import express from "express";
dotenv.config({ path: "./.env" });
import { typeDefs } from "./graphql/typeDefs.js";
import resolvers from "./graphql/resolvers/index.js";
import { connectDB } from "./db/index.js";

const app = express();

connectDB();
const { SERVER_PORT } = process.env;

const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
});

app.use("/graphql", yoga);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello there! Server is running!" });
});

app.listen(SERVER_PORT, () => {
  console.log(`Server is running on port: ${SERVER_PORT}`);
});
