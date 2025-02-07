import express from "express";
import { FrameController } from "@controllers/FrameController";
import { FrameUseCase } from "@usecases/FramesUseCase";
import { FrameAdapter } from "@adapters/FrameAdapter";
import { VideoAdapter } from "@adapters/VideoAdapter";
import { S3Service } from "@external/s3/S3Service";
import { MediaConvertService } from "@external/aws/MediaConvertService";

const router = express.Router();

// Instâncias necessárias
const frameAdapter = new FrameAdapter();
const videoAdapter = new VideoAdapter();
const s3Service = new S3Service('fiap-video-frame');
const mediaConvertService = new MediaConvertService();

const frameUseCase = new FrameUseCase(frameAdapter, videoAdapter, s3Service, mediaConvertService);


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
 *         description: ID do vídeo
 *     responses:
 *       200:
 *         description: Lista de frames do vídeo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Frame'
 *       404:
 *         description: Vídeo não encontrado ou nenhum frame associado
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
 *     summary: Extraia frames de um vídeo
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
 *                 description: ID do vídeo do qual extrair frames
 *     responses:
 *       201:
 *         description: Frames extraídos com sucesso
 *       400:
 *         description: Input inválido
 *       404:
 *         description: Video não encontrato
 *       500:
 *         description: Internal server error
 */
router.post("/frames/extract", (req, res) =>
    frameController.extractFramesFromVideos(req, res)
);

/**
 * @swagger
 * /frames/videos/download-frames:
 *   get:
 *     summary: Obtenha arquivos Zip de frames para múltiplos vídeos
 *     tags: [Frames]
 *     parameters:
 *       - in: query
 *         name: videoIds
 *         schema:
 *           type: array
 *           items:
 *             type: integer
 *         required: true
 *         description: IDs dos vídeos separados por vírgula (ex: videoIds=1,2,3)
 *     responses:
 *       200:
 *         description: URLs de download dos arquivos ZIP contendo os frames dos vídeos solicitados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Arquivos ZIP gerados com sucesso."
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       videoId:
 *                         type: integer
 *                         example: 1
 *                       downloadUrl:
 *                         type: string
 *                         example: "http://localhost:3000/frames/video/1/download-frames"
 *       400:
 *         description: Nenhum vídeo foi especificado na requisição
 *       404:
 *         description: Nenhum frame encontrado para os vídeos especificados
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/frames/videos/download-frames", (req, res) =>
    frameController.downloadFrames(req, res)
);

export { router as FrameRoutes };
