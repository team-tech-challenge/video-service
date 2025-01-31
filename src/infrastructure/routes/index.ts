import express from "express";
import initDatabase from "@database";
import { videoRoute } from "@routes/VideoRoute";
import { FrameRoutes } from "@routes/FrameRoute";

export const apiRoutes = express.Router();

initDatabase();

apiRoutes.use("/video", videoRoute);
apiRoutes.use("/frame", FrameRoutes);

