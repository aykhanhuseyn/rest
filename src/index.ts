import https from "https";
import path from "path";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { database } from "./database";
import { router } from "./router";

const app = express();

// Serve static files from the "public" directory.
// app.use(express.static(path.join(__dirname, "public")));
// Log HTTP requests.
app.use(morgan("dev"));
// enable CORS with various options.
app.use(cors());
// secure your app by setting various HTTP headers.
app.use(helmet());
// parse incoming requests with JSON payloads.
app.use(express.json({ type: "application/json" }));
// parse incoming requests with urlencoded payloads.
app.use(express.urlencoded({ extended: true }));

// Add the router to the app.
const prefix = process.env.API_PREFIX;
const version = process.env.VERSION;
const basePath = `/${[prefix, version].filter(Boolean).join("/")}`;
app.use(basePath, router);

// Create an HTTPS server with the app.
const key = await Bun.file(
	path.join(__dirname, "..", "cert", "key.pem"),
).text();
const cert = await Bun.file(
	path.join(__dirname, "..", "cert", "cert.pem"),
).text();
const server = https.createServer({ key, cert }, app);

// Start the server.
server.listen(3000, async () => {
	await database.initialize();
	console.log("Server is running on port 3000");
});
