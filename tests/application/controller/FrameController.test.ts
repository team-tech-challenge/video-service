import { FrameController } from "@controllers/FrameController";
import { MediaConvertService } from "@external/aws/MediaConvertService";
import { EmailService } from "@external/email/EmailService";
import { S3Service } from "@external/s3/S3Service";
import { IFrameGateway } from "@gateways/IFrameGateway";
import { IVideoGateway } from "@gateways/IVideoGateway";
import { FrameUseCase } from "@usecases/FramesUseCase";
import { Request, Response } from "express";
import { mock } from "jest-mock-extended";

jest.mock("@usecases/FramesUseCase");

describe("FrameController", () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;

	// Criar mocks das dependências
	const frameGatewayMock = mock<IFrameGateway>();
	const videoGatewayMock = mock<IVideoGateway>();
	const s3ServiceMock = mock<S3Service>();
	const mediaConvertServiceMock = mock<MediaConvertService>();
	const emailServiceMock = mock<EmailService>();

	// Instanciar o FrameUseCase e o FrameController
	const frameUseCase = new FrameUseCase(
		frameGatewayMock,
		videoGatewayMock,
		s3ServiceMock,
		mediaConvertServiceMock,
		emailServiceMock
	);
	const frameController = new FrameController(frameUseCase);

	beforeEach(() => {
		mockRequest = {};
		mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
			download: jest.fn().mockReturnThis(),
		};
	});

	describe("getFramesByVideoId", () => {
		it("should return frames successfully", async () => {
			mockRequest.params = { videoId: "1" };

			frameUseCase.getFramesByVideoId = jest.fn().mockResolvedValue([{ frameId: 1 }]);

			await frameController.getFramesByVideoId(mockRequest as Request, mockResponse as Response);

			expect(frameUseCase.getFramesByVideoId).toHaveBeenCalledWith(1);
			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith([{ frameId: 1 }]);
		});

		it("should return an error if frames cannot be fetched", async () => {
			mockRequest.params = { videoId: "1" };

			frameUseCase.getFramesByVideoId = jest.fn().mockRejectedValue(new Error("Erro ao buscar frames"));

			await frameController.getFramesByVideoId(mockRequest as Request, mockResponse as Response);

			expect(mockResponse.status).toHaveBeenCalledWith(500);
			expect(mockResponse.json).toHaveBeenCalledWith({ message: "Erro ao buscar frames", error: "Erro ao buscar frames" });
		});
	});

	describe("extractFramesFromVideos", () => {
		it("should extract frames from videos successfully", async () => {
			mockRequest.body = { videoIds: [1, 2] };

			frameUseCase.extractFramesFromVideo = jest.fn().mockResolvedValue([{ frameId: 1 }, { frameId: 2 }]);

			await frameController.extractFramesFromVideos(mockRequest as Request, mockResponse as Response);

			expect(frameUseCase.extractFramesFromVideo).toHaveBeenCalledWith(1);
			expect(frameUseCase.extractFramesFromVideo).toHaveBeenCalledWith(2);
			expect(mockResponse.status).toHaveBeenCalledWith(201);
			expect(mockResponse.json).toHaveBeenCalledWith({
				message: "Processamento de extração de frames concluído.",
				results: [
					{ videoId: 1, success: true, frames: [{ frameId: 1 }] },
					{ videoId: 2, success: true, frames: [{ frameId: 2 }] },
				],
			});
		});

		it("should return error if videoIds is not an array", async () => {
			mockRequest.body = { videoIds: "invalid" };

			await frameController.extractFramesFromVideos(mockRequest as Request, mockResponse as Response);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({ message: "Nenhum ID de vídeo fornecido" });
		});

		it("should return an error if any frame extraction fails", async () => {
			mockRequest.body = { videoIds: [1, 2] };

			frameUseCase.extractFramesFromVideo = jest
				.fn()
				.mockResolvedValue([{ frameId: 1 }])
				.mockRejectedValueOnce(new Error("Erro ao extrair frames"));

			await frameController.extractFramesFromVideos(mockRequest as Request, mockResponse as Response);

			expect(mockResponse.status).toHaveBeenCalledWith(201);
			expect(mockResponse.json).toHaveBeenCalledWith({
				message: "Processamento de extração de frames concluído.",
				results: [
					{ videoId: 1, success: true, frames: [{ frameId: 1 }] },
					{ videoId: 2, success: false, error: "Erro ao extrair frames" },
				],
			});
		});

		it("deve lançar um erro", async () => {
			jest.fn().mockResolvedValue


			await expect(frameController.extractFramesFromVideos(mockRequest as Request, mockResponse as Response))
				.rejects.toThrow("Não foi possivel buscar vídeo por ID");
		});
	});

	describe("downloadFrames", () => {
		it("should download frames successfully", async () => {
			mockRequest.query = { videoIds: "1,2" };

			frameUseCase.downloadFramesAsZip = jest
				.fn()
				.mockResolvedValue("/path/to/video_1_frames.zip")
				.mockResolvedValueOnce("/path/to/video_2_frames.zip");

			await frameController.downloadFrames(mockRequest as Request, mockResponse as Response);

			expect(frameUseCase.downloadFramesAsZip).toHaveBeenCalledWith(1);
			expect(frameUseCase.downloadFramesAsZip).toHaveBeenCalledWith(2);
			expect(mockResponse.download).toHaveBeenCalledWith(
				expect.stringContaining("frames_videos"),
				expect.any(String)
			);
		});

		it("should return error if videoIds is missing", async () => {
			mockRequest.query = {};

			await frameController.downloadFrames(mockRequest as Request, mockResponse as Response);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({ message: "IDs de vídeos são necessários." });
		});

		it("should return error if videoIds are invalid", async () => {
			mockRequest.query = { videoIds: "invalid" };

			await frameController.downloadFrames(mockRequest as Request, mockResponse as Response);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({ message: "IDs de vídeos devem ser números válidos." });
		});

		it("should return error if no frames are found", async () => {
			mockRequest.query = { videoIds: "3,4" };

			frameUseCase.downloadFramesAsZip = jest.fn().mockRejectedValueOnce(new Error("Nenhum frame encontrado"));

			await frameController.downloadFrames(mockRequest as Request, mockResponse as Response);

			expect(mockResponse.status).toHaveBeenCalledWith(404);
			expect(mockResponse.json).toHaveBeenCalledWith({ message: "Nenhum frame encontrado para os vídeos fornecidos." });
		});
	});
});
