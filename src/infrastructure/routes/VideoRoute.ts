
import express from "express";
import multer from "multer";
import { VideoController } from "@controllers/VideoController";
import { VideoUseCase } from "@usecases/VideoUseCase";
import { VideoAdapter } from "@adapters/VideoAdapter";
import { S3Service } from "@external/s3/S3Service";
import { EmailService } from "@external/email/EmailService";


export const videoRoute = express.Router();
// Configuração do multer para upload de arquivos
const upload = multer({ dest: "uploads/" });


// Instâncias necessárias
const videoAdapter = new VideoAdapter();
const s3Service = new S3Service(process.env.S3_BUCKET_NAME);
const emailService = new EmailService();

// Instância do UseCase
const videoUseCase = new VideoUseCase(videoAdapter, s3Service, emailService);

// Instância do Controller
const videoController = new VideoController(videoUseCase);

/**
 * @swagger
 * tags:
 *   name: Videos
 *   description: API de gerenciamento de vídeos
 */

/**
 * @swagger
 * /videos/upload:
 *   post:
 *     summary: Faz o upload de um ou mais vídeos
 *     tags: [Videos]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 123
 *                 description: ID do usuário enviando o vídeo
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Arquivos de vídeo a serem enviados
 *     parameters:
 *       - in: formData
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 123
 *         description: ID do usuário que está enviando os vídeos
 *       - in: formData
 *         name: files
 *         required: true
 *         description: Arquivos de vídeo a serem enviados
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             format: binary 
 *     responses:
 *       201:
 *         description: Vídeos enviados com sucesso
 *       400:
 *         description: Nenhum arquivo enviado ou userId ausente
 *       500:
 *         description: Erro no servidor
 */
videoRoute.post("/upload", upload.array("files", 10), (req, res) =>
    videoController.uploadVideos(req, res)
);

/**
 * @swagger
 * /videos:
 *   get:
 *     summary: Retorna todos os vídeos
 *     tags: [Videos]
 *     responses:
 *       200:
 *         description: Lista de vídeos retornada com sucesso
 *       500:
 *         description: Erro ao buscar vídeos
 */
videoRoute.get("/", (req, res) => videoController.getAllVideos(req, res));

/**
 * @swagger
 * /videos/{id}:
 *   get:
 *     summary: Retorna um vídeo pelo ID
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do vídeo
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vídeo encontrado com sucesso
 *       404:
 *         description: Vídeo não encontrado
 *       500:
 *         description: Erro ao buscar vídeo
 */
videoRoute.get("/:id", (req, res) => videoController.getVideoById(req, res));
