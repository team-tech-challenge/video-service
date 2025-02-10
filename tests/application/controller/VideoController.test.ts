import { VideoController } from "../../../src/application/controllers/VideoController";
import { VideoUseCase } from "../../../src/application/usecases/VideoUseCase";
import { Request, Response } from "express";
import { searchUser } from "../../../src/infrastructure/external/api/User";
import { Video } from "../../../src/domain/entities/Video";

jest.mock("../../../src/infrastructure/external/api/User");

describe("VideoController", () => {
    let videoController: VideoController;
    let videoUseCase: VideoUseCase;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let videoGateway: any;
    let s3Service: any;
    let emailService: any;

    beforeEach(() => {
        videoGateway = {
            saveVideo: jest.fn(),
            allVideos: jest.fn(),
            getVideoById: jest.fn()
        };
        s3Service = {
            uploadFile: jest.fn()
        };
        emailService = {
            sendEmail: jest.fn()
        };
        videoUseCase = new VideoUseCase(videoGateway, s3Service, emailService);
        videoController = new VideoController(videoUseCase);
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    describe("uploadVideos", () => {
        it("should return 400 if no userId is provided", async () => {
            req.body = {};
            await videoController.uploadVideos(req as Request, res as Response);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Nenhum usuário encontrato" });
        });

        it("should return 400 if user is not found", async () => {
            req.body = { userId: 1 };
            (searchUser as jest.Mock).mockResolvedValue(null);
            await videoController.uploadVideos(req as Request, res as Response);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Nenhum usuário encontrato" });
        });

        it("should return 400 if no files are provided", async () => {
            req.body = { userId: 1 };
            req.files = [];
            (searchUser as jest.Mock).mockResolvedValue({});
            await videoController.uploadVideos(req as Request, res as Response);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Nenhum arquivo fornecido" });
        });

        it("should return 201 and save videos if all data is provided", async () => {
            req.body = { userId: 1 };
            req.files = [{
                originalname: "test.mp4",
                path: "path/to/test.mp4",
                mimetype: "video/mp4",
                fieldname: "file",
                encoding: "7bit",
                size: 12345,
                stream: {} as any,
                destination: "path/to",
                filename: "test.mp4",
                buffer: Buffer.from(""),
            }];
            const user = { id: 1, username: "testuser" };
            (searchUser as jest.Mock).mockResolvedValue(user);
            s3Service.uploadFile.mockResolvedValue("https://example.com/videos/1/test.mp4");
            videoGateway.saveVideo.mockResolvedValue(new Video(1, "test.mp4", "videos/1/test.mp4", "mp4"));

            await videoController.uploadVideos(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: "Vídeos processados com sucesso",
                videos: [expect.any(Video)]
            });
        });

        it("should return 500 if there is an error during video processing", async () => {
            req.body = { userId: 1 };
            req.files = [{
                originalname: "test.mp4",
                path: "path/to/test.mp4",
                mimetype: "video/mp4",
                fieldname: "file",
                encoding: "7bit",
                size: 12345,
                stream: {} as any,
                destination: "path/to",
                filename: "test.mp4",
                buffer: Buffer.from(""),
            }];
            const user = { id: 1, username: "testuser" };
            (searchUser as jest.Mock).mockResolvedValue(user);
            s3Service.uploadFile.mockRejectedValue(new Error("Erro ao enviar arquivo para o S3"));

            await videoController.uploadVideos(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Erro ao processar os vídeos", error: "Erro ao enviar arquivo para o S3" });
        });

        // Add more tests as needed
    });

    describe("getAllVideos", () => {
        it("should return 200 with all videos", async () => {
            const videos = [new Video(1, "Test Video", "videos/1/test-video.mp4", "mp4")];
            videoGateway.allVideos.mockResolvedValue(videos);
            await videoController.getAllVideos(req as Request, res as Response);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(videos);
        });

        it("should return 500 if there is an error", async () => {
            videoGateway.allVideos.mockRejectedValue(new Error("Erro ao buscar vídeos"));
            await videoController.getAllVideos(req as Request, res as Response);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Erro buscar videos", error: "Erro ao buscar vídeos" });
        });

    });

    describe("getVideoById", () => {
        it("should return 404 if video is not found", async () => {
            req.params = { id: "1" };
            videoGateway.getVideoById.mockResolvedValue(null);
            await videoController.getVideoById(req as Request, res as Response);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Vídeo não encontrato" });
        });

        it("should return 200 with the video if found", async () => {
            req.params = { id: "1" };
            const video = new Video(1, "Test Video", "videos/1/test-video.mp4", "mp4");
            videoGateway.getVideoById.mockResolvedValue(video);
            await videoController.getVideoById(req as Request, res as Response);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(video);
        });

        it("should return 500 if there is an error", async () => {
            req.params = { id: "1" };
            videoGateway.getVideoById.mockRejectedValue(new Error("Erro ao buscar vídeo"));
            await videoController.getVideoById(req as Request, res as Response);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Erro buscar vídeo", error: "Erro ao buscar vídeo" });
        });

    });
});
