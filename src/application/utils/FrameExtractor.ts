import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { MetadataExtractor } from "./MetadataExtractor";
import { S3Adapter } from "@adapters/S3Adapter";

export class FrameExtractor {
    private s3Adapter: S3Adapter;

    constructor(s3Adapter: S3Adapter) {
        this.s3Adapter = s3Adapter;
    }

    // Extrai frames e metadados
    async extractFrames(videoPath: string, outputDir: string): Promise<any[]> {
        const videoMetadata = await MetadataExtractor.extractVideoMetadata(videoPath);

        const framesMetadata: any[] = [];
        return new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .on("filenames", (filenames) => {
                    console.log(`Generated frames: ${filenames}`);
                })
                .on("end", async () => {
                    console.log("Frames extracted successfully");

                    const frameFiles = fs.readdirSync(outputDir);
                    for (const frameFile of frameFiles) {
                        const frameTime = this.calculateFrameTime(frameFile);
                        const frameMetadata = MetadataExtractor.extractFrameMetadata(videoMetadata, frameTime);

                        // Upload frame and metadata to S3
                        const framePath = path.join(outputDir, frameFile);
                        const s3FramePath = `frames/${frameFile}`;
                        await this.s3Adapter.uploadFile(framePath, s3FramePath);

                        framesMetadata.push({
                            fileName: frameFile,
                            s3Path: s3FramePath,
                            metadata: frameMetadata,
                        });
                    }

                    resolve(framesMetadata);
                })
                .on("error", (err) => {
                    reject(new Error(`Error extracting frames: ${err.message}`));
                })
                .save(`${outputDir}/frame-%04d.jpg`);
        });
    }

    // Calcula o tempo do frame com base no nome
    private calculateFrameTime(frameFile: string): number {
        const match = frameFile.match(/frame-(\d+).jpg/);
        if (match) {
            const frameNumber = parseInt(match[1], 10);
            return frameNumber / 30; // Assume taxa de 30 fps
        }
        return 0;
    }
}
