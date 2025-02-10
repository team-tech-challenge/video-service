import { VideoUseCase } from "@usecases/VideoUseCase";
import { S3Service } from "@external/s3/S3Service";
import { EmailService } from "@external/email/EmailService";
import { IVideoGateway } from "@gateways/IVideoGateway";
import { Video } from "@entities/Video";
import * as fs from "fs";

jest.mock("fs");

describe("VideoUseCase", () => {
	let videoUseCase: VideoUseCase;
	let mockVideoGateway: jest.Mocked<IVideoGateway>;
	let mockS3Service: jest.Mocked<S3Service>;
	let mockEmailService: jest.Mocked<EmailService>;

	beforeEach(() => {
		mockVideoGateway = {
			saveVideo: jest.fn(),
			allVideos: jest.fn(),
			getVideoById: jest.fn()
		} as unknown as jest.Mocked<IVideoGateway>;

		mockS3Service = {
			uploadFile: jest.fn()
		} as unknown as jest.Mocked<S3Service>;

		mockEmailService = {
			sendEmail: jest.fn()
		} as unknown as jest.Mocked<EmailService>;

		videoUseCase = new VideoUseCase(mockVideoGateway, mockS3Service, mockEmailService);
	});

	describe("uploadAndSaveVideo", () => {
		it("deve fazer o upload do vídeo e salvar no banco de dados", async () => {
			const filePath = "path/to/video.mp4";
			const video = new Video(1, "example.mp4", "", "mp4");
			const user = { id: 1, username: "testuser" };
			const mockFileStream = {} as fs.ReadStream;

			(fs.createReadStream as jest.Mock).mockReturnValue(mockFileStream);
			mockS3Service.uploadFile.mockResolvedValue("https://s3.amazonaws.com/videos/example.mp4");
			mockVideoGateway.saveVideo.mockResolvedValue(video);

			const result = await videoUseCase.uploadAndSaveVideo(filePath, video, user);

			expect(fs.createReadStream).toHaveBeenCalledWith(filePath);
			expect(mockS3Service.uploadFile).toHaveBeenCalledWith("videos/1/example.mp4", mockFileStream, "video/mp4");
			expect(mockVideoGateway.saveVideo).toHaveBeenCalledWith(video);
			expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
				"testuser",
				"Novo vídeo processado",
				"O vídeo \"example.mp4\" foi processado com sucesso."
			);
			expect(result).toBe(video);
		});

		it("deve lançar um erro caso ocorra uma falha no upload", async () => {
			const filePath = "path/to/video.mp4";
			const video = new Video(1, "example.mp4", "", "mp4");
			const user = { id: 1, username: "testuser" };
			const mockFileStream = {} as fs.ReadStream;

			(fs.createReadStream as jest.Mock).mockReturnValue(mockFileStream);
			mockS3Service.uploadFile.mockRejectedValue(new Error("Erro no S3"));

			await expect(videoUseCase.uploadAndSaveVideo(filePath, video, user))
				.rejects.toThrow("Erro ao processar upload do vídeo");
		});
	});

	describe("getAllVideos", () => {
		it("deve retornar uma lista de vídeos", async () => {
			const videos = [new Video(1, "video1.mp4", "", "mp4"), new Video(2, "video2.mp4", "", "mp4")];
			mockVideoGateway.allVideos.mockResolvedValue(videos);

			const result = await videoUseCase.getAllVideos();
			expect(result).toEqual(videos);
		});

		it("deve retornar uma lista vazia se não houver vídeos", async () => {
			mockVideoGateway.allVideos.mockResolvedValue([]);

			const result = await videoUseCase.getAllVideos();
			expect(result).toEqual([]);
		});

		it("deve lançar um erro caso ocorra uma falha ao buscar todos os videos", async () => {
			const mockFileStream = {} as fs.ReadStream;

			(fs.createReadStream as jest.Mock).mockReturnValue(mockFileStream);
			mockVideoGateway.allVideos.mockRejectedValue(new Error("Não foi possivel buscar os vídeos"));

			await expect(videoUseCase.getAllVideos())
				.rejects.toThrow("Não foi possivel buscar os vídeos");
		});
	});

	describe("getVideoById", () => {
		it("deve retornar um vídeo pelo ID", async () => {
			const video = new Video(1, "example.mp4", "", "mp4");
			mockVideoGateway.getVideoById.mockResolvedValue(video);

			const result = await videoUseCase.getVideoById(1);
			expect(result).toBe(video);
		});

		it("deve retornar null se o vídeo não for encontrado", async () => {
			mockVideoGateway.getVideoById.mockResolvedValue(null);

			const result = await videoUseCase.getVideoById(1);
			expect(result).toBeNull();
		});

		it("deve lançar um erro caso ocorra uma falha ao buscar todos os videos", async () => {
			const idVideo = 2;
			const mockFileStream = {} as fs.ReadStream;

			(fs.createReadStream as jest.Mock).mockReturnValue(mockFileStream);
			mockVideoGateway.getVideoById.mockRejectedValue(new Error("Não foi possivel buscar vídeo por ID"));

			await expect(videoUseCase.getVideoById(idVideo))
				.rejects.toThrow("Não foi possivel buscar vídeo por ID");
		});
	});
});
