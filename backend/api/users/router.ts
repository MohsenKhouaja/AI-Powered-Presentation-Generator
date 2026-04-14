import { Router } from "express";
import { usersService } from "./users-service.js";
import { pool } from "../../database/index.js";

export const usersRouter = Router();

usersRouter.post("/users/signup", async (req, res) => {
	const { username, email, password } = req.body;
	const createdUser = await usersService.signup(pool, {
		username,
		email,
		password,
	});
	res.status(201).json(createdUser);
});
