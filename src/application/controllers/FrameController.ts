import { Request, Response } from "express";
import { FrameUseCase } from "@usecases/FramesUseCase";

export class FrameController {
    constructor(private frameUseCase: FrameUseCase) {}

    async getFramesByVideoId(req: Request, res: Response): Promise<void> {
        try {
            const { videoId } = req.params;
            const frames = await this.frameUseCase.getFramesByVideoId(Number(videoId));

            res.status(200).json(frames);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error fetching frames", error: error.message });
        }
    }

    async extractFramesFromVideo(req: Request, res: Response): Promise<void> {
        try {
            const { videoId } = req.body; // ID do vídeo para extração dos frames
            const frames = await this.frameUseCase.extractFramesFromVideo(Number(videoId));

            res.status(201).json({
                message: "Frames extracted successfully.",
                data: frames,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error extracting frames", error: error.message });
        }
    }
}
