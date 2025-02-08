import { Video } from "@entities/Video";

describe("Video class", () => {
	let video: Video;

	beforeEach(() => {
		video = new Video(1, "testVideo", "s3/testVideo.mp4", "mp4", "http://example.com", 100);
	});

	describe("Constructor", () => {
		it("should create an instance correctly", () => {
			expect(video.getId()).toBe(100);
			expect(video.getIdUser()).toBe(1);
			expect(video.getFileName()).toBe("testVideo");
			expect(video.getS3Key()).toBe("s3/testVideo.mp4");
			expect(video.getExtension()).toBe("mp4");
			expect(video.getUrl()).toBe("http://example.com");
		});
	});

	describe("Setters and Getters", () => {
		it("should set and get id correctly", () => {
			video.setId(200);
			expect(video.getId()).toBe(200);
		});

		it("should set and get idUser correctly", () => {
			video.setIdUser(2);
			expect(video.getIdUser()).toBe(2);
		});

		it("should set and get file name correctly", () => {
			video.setFileName("newVideo");
			expect(video.getFileName()).toBe("newVideo");
		});

		it("should set and get s3Key correctly", () => {
			video.setS3Key("s3/newVideo.mp4");
			expect(video.getS3Key()).toBe("s3/newVideo.mp4");
		});

		it("should set and get extension correctly", () => {
			video.setExtension("avi");
			expect(video.getExtension()).toBe("avi");
		});

		it("should set and get url correctly", () => {
			video.setUrl("http://newexample.com");
			expect(video.getUrl()).toBe("http://newexample.com");
		});
	});

	describe("File Name Processing", () => {
		it("should return the file name without extension from full path", () => {
			expect(video.getFileNameWithoutExtension()).toBe("testVideo");
		});

		it("should return the file name without extension when there is no path", () => {
			const videoNoPath = new Video(2, "simpleVideo", "videoOnly.avi", "avi");
			expect(videoNoPath.getFileNameWithoutExtension()).toBe("videoOnly");
		});
	});

	describe("Optional Parameters", () => {
		it("should handle optional parameters correctly", () => {
			const videoWithoutOptional = new Video(3, "noIdVideo", "s3/noKey.mkv", "mkv");
			expect(videoWithoutOptional.getId()).toBeUndefined();
			expect(videoWithoutOptional.getUrl()).toBeUndefined();
		});
	});
});
