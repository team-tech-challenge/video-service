import { IFrameGateway } from "@gateways/IFrameGateway";
import { IVideoGateway } from "@gateways/IVideoGateway";
import { S3Service } from "@external/s3/S3Service";
import { FrameMapper } from "@mappers/FrameMapper";
import { Frame } from "@entities/Frame";
import * as fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";



export class FrameUseCase {
    constructor(
        private frameGateway: IFrameGateway,
        private videoGateway: IVideoGateway,
        private s3Service: S3Service
    ) {
        if (ffmpegStatic) {
            ffmpeg.setFfmpegPath(ffmpegStatic); // Define o caminho do FFmpeg estático
        } else {
            console.error("FFmpeg não encontrado!");
            throw new Error("FFmpeg não encontrado. Verifique a instalação do ffmpeg-static.");
        }
    }

    async extractFramesFromVideo(videoId: number): Promise<Frame[]> {
        const video = await this.videoGateway.getVideoById(videoId);
    
        if (!video) {
            throw new Error("Video not found");
        }
    
        if (!video.getS3Key()) {
            throw new Error("Video does not have a valid S3 key");
        }
    
        const extractedFrames: Frame[] = [];
        const outputFolder = `temp/frames/video_${videoId}`; // Pasta temporária local para frames
    
        // Criar a pasta temporária se não existir
        if (!fs.existsSync(outputFolder)) {
            fs.mkdirSync(outputFolder, { recursive: true });
        }
    
        // Fazer o download do vídeo do S3
        const videoFilePath = `${outputFolder}/video.mp4`; // Nome temporário para o vídeo
        await this.s3Service.downloadFile(video.getS3Key(), videoFilePath);
    
        // Usando ffmpeg para extrair frames
        return new Promise((resolve, reject) => {
            ffmpeg(videoFilePath) // Agora utilizando o arquivo baixado do S3            
                .on("end", async () => {
                    try {
                        // Define o caminho do binário do FFmpeg para o fluent-ffmpeg
                        
                        const frameFiles = fs.readdirSync(outputFolder); // Lista os arquivos extraídos
    
                        for (const fileName of frameFiles) {
                            const filePath = `${outputFolder}/${fileName}`;
                            const s3Key = `frames/video_${videoId}/${fileName}`;
    
                            // Upload do frame ao S3
                            const s3Url = await this.s3Service.uploadFile(s3Key, fs.createReadStream(filePath), "image/jpeg");
    
                            // Criar instância do Frame
                            const frame = new Frame(fileName, videoId, s3Key, "jpg");
                            frame.setUrl(s3Url);
    
                            // Salvar o frame no banco de dados
                            await this.frameGateway.saveFrame(frame);
                            extractedFrames.push(frame);
                        }
    
                        // Limpar a pasta temporária
                        fs.rmdirSync(outputFolder, { recursive: true });
                        resolve(extractedFrames);
                    } catch (err) {
                        console.error("Error processing frames:", err);
                        reject(err);
                    }
                })
                .on("error", (err) => {
                    console.error("Error during frame extraction:", err);
                    reject(err);
                })
                .save(`${outputFolder}/frame-%03d.jpg`);
        });
    }

    async getFramesByVideoId(videoId: number): Promise<Frame[]> {
        if (!videoId) {
            throw new Error("Video ID is required");
        }

        // Busca todos os frames associados ao vídeo pelo videoId
        const frames = await this.frameGateway.getFramesByVideoId(videoId);

        if (!frames || frames.length === 0) {
            throw new Error("No frames found for the provided video ID");
        }

        return frames;
    }
}
