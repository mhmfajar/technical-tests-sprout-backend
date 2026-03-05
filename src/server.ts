import "dotenv/config";
import express from "express";

import { errorHandlerMiddleware } from "~/presentation/middleware/errorHandlerMiddleware";
import apiRouter from "~/presentation/routes";

const app = express();
app.use(express.json());

app.use(apiRouter);
app.use(errorHandlerMiddleware);

app.get("/", (_, res) => {
	res.json({ message: "Welcome!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

process.on("unhandledRejection", (reason, promise) => {
	console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
	console.error("Uncaught Exception:", error);
});
