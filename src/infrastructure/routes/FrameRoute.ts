import express from "express";
import { FrameController } from "@controllers/FrameController";
import { FrameUseCase } from "@usecases/FramesUseCase";
import { FrameAdapter } from "@adapters/FrameAdapter";
import { VideoAdapter } from "@adapters/VideoAdapter";
import { S3Service } from "@external/s3/S3Service";

const router = express.Router();

// Instâncias necessárias
const frameAdapter = new FrameAdapter();
const videoAdapter = new VideoAdapter();
const s3Service = new S3Service('fiap-video-frame');

const frameUseCase = new FrameUseCase(frameAdapter, videoAdapter, s3Service);


const frameController = new FrameController(frameUseCase);

/**
 * @swagger
 * tags:
 *   name: Frames
 *   description: API for frame management
 */

/**
 * @swagger
 * /frames/video/{videoId}:
 *   get:
 *     summary: Get frames by video ID
 *     tags: [Frames]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the video
 *     responses:
 *       200:
 *         description: List of frames for the specified video
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Frame'
 *       404:
 *         description: Video not found or no frames associated
 *       500:
 *         description: Internal server error
 */
router.get("/frames/video/:videoId", (req, res) =>
    frameController.getFramesByVideoId(req, res)
);

/**
 * @swagger
 * /frames/extract:
 *   post:
 *     summary: Extract frames from a video
 *     tags: [Frames]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               videoId:
 *                 type: integer
 *                 description: ID of the video to extract frames from
 *     responses:
 *       201:
 *         description: Frames extracted successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Video not found
 *       500:
 *         description: Internal server error
 */
router.post("/frames/extract", (req, res) =>
    frameController.extractFramesFromVideo(req, res)
);

export { router as FrameRoutes };
