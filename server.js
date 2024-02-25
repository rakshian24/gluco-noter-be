import { createSchema, createYoga } from "graphql-yoga";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config({ path: "./.env" });
import { typeDefs } from "./backend/graphql/typeDefs.js";
import resolvers from "./backend/graphql/resolvers/index.js";
import { connectDB } from "./backend/db/index.js";

const app = express();

connectDB();
const { SERVER_PORT, NODE_ENV } = process.env;
// Since we are using E6 modules for NodeJS, __dirname will not be present for modules, we need to do some work around as below for making __dirname to work
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
});

app.use("/graphql", yoga);

if (NODE_ENV === "production") {
  app.use(express.static(path.resolve(__dirname, "frontend", "build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
} else if (NODE_ENV === "development") {
  app.get("/", (req, res) => {
    res.status(200).json({ message: "Hello there! Server is running!" });
  });
}

app.listen(SERVER_PORT, () => {
  console.log(`Server is running on port: ${SERVER_PORT}`);
});
