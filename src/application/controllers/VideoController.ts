import { Request, Response } from "express";
import { VideoUseCase } from "@usecases/VideoUseCase";
import { Video } from "@entities/Video";
import { searchUser } from "@external/api/User";

export class VideoController {
    constructor(private videoUseCase: VideoUseCase) {}

    async uploadVideos(req: Request, res: Response): Promise<void> {
        const files = req.files as Express.Multer.File[];
        const {userId} = req.body;

        if (!userId) {
            res.status(400).json({ message: "Nenhum usuário encontrato" });
            return;
        }

        const user = await searchUser(userId)
        
        if (!user) {
            res.status(400).json({ message: "Nenhum usuário encontrato" });
            return;
        }
    
        if (!files || files.length === 0) {
            res.status(400).json({ message: "Nenhum arquivo fornecido" });
            return;
        }
    
        try {
            const uploadedVideos = [];
    
            for (const file of files) {
                try {
                    // Criar instância do vídeo com os dados do arquivo
                    const video = new Video(null, file.originalname, file.path, file.mimetype);
                    
                    // Salvar e processar o vídeo
                    const savedVideo = await this.videoUseCase.uploadAndSaveVideo(file.path, video, user.id);
                    
                    uploadedVideos.push(savedVideo);
                } catch (error) {
                    console.error(`Erro ao processar o vídeo ${file.originalname}:`, error);
                }
            }
    
            res.status(201).json({ message: "Vídeos processados com sucesso", videos: uploadedVideos });
        } catch (error) {
            console.error("Erro ao processar vídeos:", error);
            res.status(500).json({ message: "Erro ao processar os vídeos", error: error.message });
        }
    }

    async getAllVideos(req: Request, res: Response): Promise<void> {
        try {
            const videos = await this.videoUseCase.getAllVideos();
            res.status(200).json(videos);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro buscar videos", error: error.message });
        }
    }

    async getVideoById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const video = await this.videoUseCase.getVideoById(Number(id));

            if (!video) {
                res.status(404).json({ message: "Vídeo não encontrato" });
                return;
            }

            res.status(200).json(video);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro buscar vídeo", error: error.message });
        }
    }
}
