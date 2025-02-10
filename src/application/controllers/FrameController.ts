import { Request, Response } from "express";
import { FrameUseCase } from "@usecases/FramesUseCase";
import path from "path";
import fs from "fs";
import archiver from "archiver";

export class FrameController {
    constructor(private frameUseCase: FrameUseCase) {}

    async getFramesByVideoId(req: Request, res: Response): Promise<void> {
        try {
            const { videoId } = req.params;
            const frames = await this.frameUseCase.getFramesByVideoId(Number(videoId));

            res.status(200).json(frames);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao buscar frames", error: error.message });
        }
    }

    async extractFramesFromVideos(req: Request, res: Response): Promise<void> {
        try {
            const { videoIds } = req.body; // Espera um array de IDs de vídeos
    
            if (!Array.isArray(videoIds) || videoIds.length === 0) {
                res.status(400).json({ message: "Nenhum ID de vídeo fornecido" });
                return;
            }
    
            const extractionResults = await Promise.all(
                videoIds.map(async (videoId) => {
                    try {
                        const frames = await this.frameUseCase.extractFramesFromVideo(Number(videoId));
                        return {
                            videoId,
                            success: true,
                            frames,
                        };
                    } catch (error) {
                        console.error(`Erro ao extrair frames do vídeo ${videoId}:`, error.message);
                        return {
                            videoId,
                            success: false,
                            error: error.message,
                        };
                    }
                })
            );
    
            res.status(201).json({
                message: "Processamento de extração de frames concluído.",
                results: extractionResults,
            });
    
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao processar extração de frames", error: error.message });
        }
    }
    
    async downloadFrames(req: Request, res: Response): Promise<void> {
        try {
            const { videoIds } = req.query; // Agora recebe IDs pela query string: ?videoIds=1,2,3
    
            if (!videoIds) {
                res.status(400).json({ message: "IDs de vídeos são necessários." });
                return;
            }
    
            const videoIdsString = videoIds.toString()
            const videoIdArray = (Array.isArray(videoIds) ? videoIds : videoIdsString.split(",")).map(Number);
            
            if (videoIdArray.some(isNaN)) {
                res.status(400).json({ message: "IDs de vídeos devem ser números válidos." });
                return;
            }
    
            const zipFiles: { videoId: number; zipPath: string }[] = [];
    
            for (const videoId of videoIdArray) {
                try {
                    const zipFilePath = await this.frameUseCase.downloadFramesAsZip(videoId);
                    zipFiles.push({ videoId, zipPath: zipFilePath });
                } catch (err) {
                    console.error(`Erro ao processar frames do vídeo ${videoId}:`, err);
                }
            }
    
            if (zipFiles.length === 0) {
                res.status(404).json({ message: "Nenhum frame encontrado para os vídeos fornecidos." });
                return;
            }
    
            // Se houver apenas um vídeo, envia o arquivo diretamente
            if (zipFiles.length === 1) {
                const { videoId, zipPath } = zipFiles[0];
    
                res.download(zipPath, `video_${videoId}_frames.zip`, (err) => {
                    if (err) {
                        console.error("Erro ao enviar arquivo ZIP:", err);
                        res.status(500).json({ message: "Erro ao baixar o ZIP" });
                    }
                });
                return;
            }
    
            // Se houver múltiplos vídeos, cria um ZIP contendo todos os arquivos ZIP individuais
            const finalZipPath = path.join("/app/temp", `frames_videos_${Date.now()}.zip`);
            const output = fs.createWriteStream(finalZipPath);
            const archive = archiver("zip", { zlib: { level: 9 } });
    
            output.on("close", () => {
                res.download(finalZipPath, `frames_videos_${Date.now()}.zip`, (err) => {
                    if (err) {
                        console.error("Erro ao enviar arquivo ZIP final:", err);
                        res.status(500).json({ message: "Erro ao baixar o ZIP final" });
                    }
                });
            });
    
            archive.on("error", (err) => {
                console.error("Erro ao criar o ZIP final:", err);
                res.status(500).json({ message: "Erro ao gerar o ZIP final" });
            });
    
            archive.pipe(output);
    
            for (const { videoId, zipPath } of zipFiles) {
                archive.file(zipPath, { name: `video_${videoId}_frames.zip` });
            }
    
            archive.finalize();
        } catch (error) {
            console.error("Erro ao processar o download dos frames:", error);
            res.status(500).json({ message: "Erro ao processar o download dos frames", error: error.message });
        }
    }
}
