import { MediaConvertService } from "@external/aws/MediaConvertService";
import { S3Service } from "@external/s3/S3Service"
import { IFrameGateway } from "@gateways/IFrameGateway";
import { IVideoGateway } from "@gateways/IVideoGateway";
import { Frame } from "@entities/Frame";
import * as fs from "fs";
import path from "path";
import archiver from "archiver";
import { searchUser } from "@external/api/User";
import { EmailService } from "@external/email/EmailService";



export class FrameUseCase {
    constructor(
        private frameGateway: IFrameGateway,
        private videoGateway: IVideoGateway,
        private s3Service: S3Service,
        private mediaConvertService: MediaConvertService,
        private emailService: EmailService
    ) {}

    async extractFramesFromVideo(videoId: number): Promise<Frame[]> {
        const video = await this.videoGateway.getVideoById(videoId);
        if (!video) {
            throw new Error("Vídeo não encontrado.");
        }  
        
        const user = await searchUser(video.getIdUser())
        // Enviar e-mail de notificação para o usuário
        await this.emailService.sendEmail(
            user.username,
            "Processo de extração de frame",
            `O processo de extração de frame "${video.getFileName()}" foi iniciado.`
        );    
        const inputS3Key = `s3://${process.env.S3_BUCKET_NAME}/${video.getS3Key()}`;
        const outputS3KeyFrame = `s3://${process.env.S3_BUCKET_NAME}/frames/video_${videoId}/`;

        console.log("Iniciando extração de frames...");
        const jobId = await this.mediaConvertService.createFrameExtractionJob(inputS3Key, outputS3KeyFrame);

        console.log(`Monitorando Job ID: ${jobId}`);
        let status = await this.mediaConvertService.checkJobStatus(jobId);

        while (status === "SUBMITTED" || status === "PROGRESSING") {
            console.log(`Status do processamento: ${status}`);
            await new Promise((resolve) => setTimeout(resolve, 5000));
            status = await this.mediaConvertService.checkJobStatus(jobId);
        }

        if (status !== "COMPLETE") {
            throw new Error(`Falha na extração de frames. Status final: ${status}`);
        }

        console.log("Frames extraídos, listando arquivos...");

        const outputS3KeyExtract = `frames/video_${videoId}/`;
        const frameUrls = await this.mediaConvertService.listExtractedFrames(outputS3KeyExtract);

        const extractedFrames: Frame[] = frameUrls.map((frameUrl, index) => {
            return new Frame(
                `frame-${index}.jpg`,
                videoId,
                frameUrl.key,
                "jpg",
                frameUrl.url,
            );
        });

        // Salvar frames no banco
        for (const frame of extractedFrames) {
            await this.frameGateway.saveFrame(frame);
        }

        // Enviar e-mail de notificação para o usuário
        await this.emailService.sendEmail(
            user.username,
            "Processo de extração de frame",
            `O processo de extração de frame "${video.getFileName()}" foi finalizado.`
        );  

        return extractedFrames;
    }      

    async getFramesByVideoId(videoId: number): Promise<Frame[]> {     
        const video = await this.videoGateway.getVideoById(videoId);
        if (!video) {
            throw new Error("Vídeo não encontrado.");
        }        
        const outputS3KeyPrefix = `frames/video_${videoId}/`;

        const frameUrls = await this.mediaConvertService.listExtractedFrames(outputS3KeyPrefix);
        
        const extractedFrames: Frame[] = frameUrls.map((frameUrl, index) => {
            return new Frame(
                `frame-${index}.jpg`,
                videoId,
                frameUrl.key,
                "jpg",
                frameUrl.url,
            );
        });

        return extractedFrames;
    }

    async downloadFramesAsZip(videoId: number): Promise<string> {
        if (!videoId) {
            throw new Error("Video ID é obrigatorio");
        }
        const video = await this.videoGateway.getVideoById(videoId);
        if (!video) {
            throw new Error("Vídeo não encontrado.");
        }  

        const user = await searchUser(video.getIdUser())
        // Enviar e-mail de notificação para o usuário
        await this.emailService.sendEmail(
            user.username,
            "Processo de zip de frames",
            `O processo de criação de zip de frames "${video.getFileName()}" foi iniciado.`
        );

        // Busca todos os frames associados ao vídeo
        const frames = await this.frameGateway.getFramesByVideoId(videoId);

        if (!frames || frames.length === 0) {
            throw new Error("Nenhum frame encontrado para o video");
        }

        const tempDir = path.join("/app", "temp");
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
            fs.chmodSync(tempDir, 0o777); // Permissão total (somente dentro do container)
        }

        // Criando diretório temporário para armazenar os frames
        const framesFolder = path.join(tempDir, `frames_video_${videoId}`);
        if (!fs.existsSync(framesFolder)) {
            fs.mkdirSync(framesFolder, { recursive: true });
        }

        // Baixa cada frame do S3 para a pasta temporária
        for (const frame of frames) {
            const framePath = path.join(framesFolder, frame.getFileName());
            await this.s3Service.downloadFile(frame.getS3Key(), framePath);
        }

        // Criando um arquivo ZIP
        const zipFilePath = path.join(tempDir, `video_${videoId}_frames.zip`);
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver("zip", { zlib: { level: 9 } });

        return new Promise((resolve, reject) => {
            output.on("close", () => {
                console.log(`Arquivo ZIP criado: ${zipFilePath}`);
                resolve(zipFilePath);
            });

            archive.on("error", (err) => reject(err));

            archive.pipe(output);
            archive.directory(framesFolder, false);
            archive.finalize();

            // Enviar e-mail de notificação para o usuário
            this.emailService.sendEmail(
                user.username,
                "Processo de zip de frames",
                `O processo de criação de zip de frames "${video.getFileName()}" foi finalizado.`
            );
            
        });
    }
}
