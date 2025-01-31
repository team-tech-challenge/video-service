import express from "express";
import { apiRoutes } from "../routes/index";

export const routes = express.Router();

routes.use("", apiRoutes);

routes.get("/heathlz", (req, res) => {
	// #swagger.ignore = true
	res.status(200);
	res.end();
});
