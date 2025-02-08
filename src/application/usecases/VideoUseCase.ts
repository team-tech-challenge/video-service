import { S3Service } from "@external/s3/S3Service";
import { searchUser } from "@external/api/User"
import { IVideoGateway } from "@gateways/IVideoGateway";;
import { Video } from "@entities/Video";
import * as fs from "fs";

export class VideoUseCase {
    constructor(
        private videoGateway: IVideoGateway,
        private s3Service: S3Service
    ) {}

    async uploadAndSaveVideo(filePath: string, video: Video, userId: number): Promise<Video> {
        try {
            
            // Lê o arquivo de vídeo como stream
            const fileStream = fs.createReadStream(filePath);

            // Gera a chave do S3
            const s3Key = `videos/${userId}/${video.getFileName()}`;

            // Envia o arquivo para o S3
            const videoUrl = await this.s3Service.uploadFile(s3Key, fileStream, "video/mp4");

            // Define as informações no objeto Video
			video.setIdUser(userId)
            video.setS3Key(s3Key);
            video.setUrl(videoUrl);

            // Salva as informações do vídeo no banco de dados
            const savedVideo = await this.videoGateway.saveVideo(video);

            return savedVideo;
        } catch (error) {
            console.error("Erro ao enviar e salvar o vídeo:", error);
            throw new Error("Erro ao processar upload do vídeo");
        }
    }
	/**
     * Busca todos os vídeos cadastrados
     * @returns {Promise<Video[]>} Lista de vídeos
     */
    async getAllVideos(): Promise<Video[]> {
        try {
            const videos = await this.videoGateway.allVideos();

            // Caso não encontre vídeos, você pode decidir retornar uma lista vazia
            if (!videos || videos.length === 0) {
                return [];
            }

            return videos;
        } catch (error) {
            console.error("Erro ao buscar todos os vídeos:", error.message);
            throw new Error("Não foi possivel buscar os vídeos");
        }
    }
	/**
     * Busca um vídeo pelo ID
     * @param {number} id - ID do vídeo
     * @returns {Promise<Video | null>} O vídeo encontrado ou null se não existir
     */
    async getVideoById(id: number): Promise<Video | null> {
        try {
            // Busca o vídeo pelo ID utilizando o gateway
            const video = await this.videoGateway.getVideoById(id);

            // Retorna null se o vídeo não for encontrado
            if (!video) {
                return null;
            }

            return video;
        } catch (error) {
            console.error(`Erro ao buscar vídeo com id ${id}:`, error.message);
            throw new Error("Não foi possivel buscar vídeo por ID");
        }
    }
}
