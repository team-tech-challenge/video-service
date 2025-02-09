import { FrameUseCase } from "@usecases/FramesUseCase";
import { IFrameGateway } from "@gateways/IFrameGateway";
import { IVideoGateway } from "@gateways/IVideoGateway";
import { S3Service } from "@external/s3/S3Service";
import { MediaConvertService } from "@external/aws/MediaConvertService";
import { EmailService } from "@external/email/EmailService";
import { Frame } from "@entities/Frame";
import { mock } from "jest-mock-extended";
import * as fs from "fs";
import path from "path";
import { Video } from "@entities/Video";

jest.mock("fs");
jest.mock("path");

describe("FrameUseCase", () => {
	let videoMock = mock<Video>();
	let frameGatewayMock = mock<IFrameGateway>();
	let videoGatewayMock = mock<IVideoGateway>();
	let s3ServiceMock = mock<S3Service>();
	let mediaConvertServiceMock = mock<MediaConvertService>();
	let emailServiceMock = mock<EmailService>();

	let frameUseCase = new FrameUseCase(
		frameGatewayMock,
		videoGatewayMock,
		s3ServiceMock,
		mediaConvertServiceMock,
		emailServiceMock
	);

	describe("extractFramesFromVideo", () => {
		it("should successfully extract frames and send email notifications", async () => {
			// Mocking the video and user data
			const videoId = 1;
			const userMock = { username: "user@example.com" };
			const frameUrlsMock = [{ key: "frame1.jpg", url: "http://example.com/frame1.jpg" }];

			videoGatewayMock.getVideoById.mockResolvedValue(videoMock);
			mediaConvertServiceMock.createFrameExtractionJob.mockResolvedValue("job-id");
			mediaConvertServiceMock.checkJobStatus.mockResolvedValue("COMPLETE");
			mediaConvertServiceMock.listExtractedFrames.mockResolvedValue(frameUrlsMock);
			emailServiceMock.sendEmail.mockResolvedValue(undefined);

			frameGatewayMock.saveFrame.mockResolvedValue(undefined);

			const extractedFrames = await frameUseCase.extractFramesFromVideo(videoId);

			expect(extractedFrames).toHaveLength(1);
			expect(extractedFrames[0]).toBeInstanceOf(Frame);
			expect(extractedFrames[0].getFileName()).toBe("frame-0.jpg");
			expect(emailServiceMock.sendEmail).toHaveBeenCalledWith(
				userMock.username,
				"Processo de extração de frame",
				`O processo de extração de frame "video.mp4" foi iniciado.`
			);
			expect(emailServiceMock.sendEmail).toHaveBeenCalledWith(
				userMock.username,
				"Processo de extração de frame",
				`O processo de extração de frame "video.mp4" foi finalizado.`
			);
		});

		it("should throw error if video not found", async () => {
			const videoId = 1;
			videoGatewayMock.getVideoById.mockResolvedValue(null);

			await expect(frameUseCase.extractFramesFromVideo(videoId)).rejects.toThrow("Vídeo não encontrado.");
		});

		it("should throw error if frame extraction fails", async () => {
			const videoId = 1;
			videoGatewayMock.getVideoById.mockResolvedValue(videoMock);
			mediaConvertServiceMock.createFrameExtractionJob.mockResolvedValue("job-id");
			mediaConvertServiceMock.checkJobStatus.mockResolvedValue("FAILED");

			await expect(frameUseCase.extractFramesFromVideo(videoId)).rejects.toThrow(
				"Falha na extração de frames. Status final: FAILED"
			);
		});
	});

	describe("getFramesByVideoId", () => {
		it("should return frames by videoId", async () => {
			const videoId = 1;
			const frameUrlsMock = [{ key: "frame1.jpg", url: "http://example.com/frame1.jpg" }];
			videoGatewayMock.getVideoById.mockResolvedValue(videoMock);
			mediaConvertServiceMock.listExtractedFrames.mockResolvedValue(frameUrlsMock);

			const frames = await frameUseCase.getFramesByVideoId(videoId);

			expect(frames).toHaveLength(1);
			expect(frames[0]).toBeInstanceOf(Frame);
			expect(frames[0].getFileName()).toBe("frame-0.jpg");
		});

		it("should throw error if video not found", async () => {
			const videoId = 1;
			videoGatewayMock.getVideoById.mockResolvedValue(null);

			await expect(frameUseCase.getFramesByVideoId(videoId)).rejects.toThrow("Vídeo não encontrado.");
		});
	});

	describe("downloadFramesAsZip", () => {
		it("should create a zip file with frames and send email notifications", async () => {
			const videoId = 1;
			const userMock = { username: "user@example.com" };
			const framesMock = [
				new Frame("frame-0.jpg", videoId, "frame-0-s3-key", "jpg", "http://example.com/frame0"),
			];

			videoGatewayMock.getVideoById.mockResolvedValue(videoMock);
			frameGatewayMock.getFramesByVideoId.mockResolvedValue(framesMock);
			emailServiceMock.sendEmail.mockResolvedValue(undefined);
			s3ServiceMock.downloadFile.mockResolvedValue(undefined);

			const zipFilePath = await frameUseCase.downloadFramesAsZip(videoId);

			expect(zipFilePath).toContain("video_1_frames.zip");
			expect(emailServiceMock.sendEmail).toHaveBeenCalledWith(
				userMock.username,
				"Processo de zip de frames",
				`O processo de criação de zip de frames "video.mp4" foi iniciado.`
			);
			expect(emailServiceMock.sendEmail).toHaveBeenCalledWith(
				userMock.username,
				"Processo de zip de frames",
				`O processo de criação de zip de frames "video.mp4" foi finalizado.`
			);
		});

		it("should throw error if video not found", async () => {
			const videoId = 1;
			videoGatewayMock.getVideoById.mockResolvedValue(null);

			await expect(frameUseCase.downloadFramesAsZip(videoId)).rejects.toThrow("Vídeo não encontrado.");
		});

		it("should throw error if no frames are found", async () => {
			const videoId = 1;
			videoGatewayMock.getVideoById.mockResolvedValue(videoMock);
			frameGatewayMock.getFramesByVideoId.mockResolvedValue([]);

			await expect(frameUseCase.downloadFramesAsZip(videoId)).rejects.toThrow(
				"Nenhum frame encontrado para o video"
			);
		});
	});
});
