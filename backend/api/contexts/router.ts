import { Router } from "express";
import { contextService } from "./contexts-service.js";
import { pool } from "../../database/index.js";

export const contextsRouter = Router();

contextsRouter.post("/presentations/:id/context", async (req, res) => {
	const presentationId = req.params.id;
	const { prompt, files = [] } = req.body;
	const createdContext = await contextService.create(
		pool,
		{
			prompt,
			presentationId,
		},
		files,
	);
	res.status(201).json(createdContext);
});

contextsRouter.put("/contexts/:id", async (req, res) => {
	const contextId = req.params.id;
	const { prompt, newFiles = [], deletedFilesIds = [] } = req.body;

	const updatedContext = await contextService.update(
		pool,
		{
			id: contextId,
			prompt,
		},
		newFiles,
		deletedFilesIds,
	);

	res.json(updatedContext);
});
