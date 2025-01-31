import { Request, Response } from "express";
import { VideoUseCase } from "@usecases/VideoUseCase";
import { Video } from "@entities/Video";

export class VideoController {
    constructor(private videoUseCase: VideoUseCase) {}

    async uploadVideos(req: Request, res: Response): Promise<void> {
        const { file } = req;

        if (!file) {
            res.status(400).json({ message: "No file provided" });
            return;
        }

        try {
            const video = new Video(1, file.originalname, file.path, file.mimetype);
            const savedVideo = await this.videoUseCase.uploadAndSaveVideo(file.path, video);
            res.status(201).json(savedVideo);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    }

    async getAllVideos(req: Request, res: Response): Promise<void> {
        try {
            const videos = await this.videoUseCase.getAllVideos();
            res.status(200).json(videos);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error fetching videos", error: error.message });
        }
    }

    async getVideoById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const video = await this.videoUseCase.getVideoById(Number(id));

            if (!video) {
                res.status(404).json({ message: "Video not found" });
                return;
            }

            res.status(200).json(video);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error fetching video", error: error.message });
        }
    }
}
