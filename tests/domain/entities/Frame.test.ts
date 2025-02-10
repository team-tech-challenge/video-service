import { Frame } from "@entities/Frame";

describe("Frame class", () => {
	let frame: Frame;

	beforeEach(() => {
		frame = new Frame("testFrame", 1, "s3/testKey", "mp4", "http://example.com", 100);
	});

	describe("Constructor", () => {
		it("should create an instance correctly", () => {
			expect(frame.getId()).toBe(100);
			expect(frame.getFileName()).toBe("testFrame");
			expect(frame.getVideoId()).toBe(1);
			expect(frame.getS3Key()).toBe("s3/testKey");
			expect(frame.getExtension()).toBe("mp4");
			expect(frame.getUrl()).toBe("http://example.com");
		});
	});

	describe("Setters and Getters", () => {
		it("should set and get id correctly", () => {
			frame.setId(200);
			expect(frame.getId()).toBe(200);
		});

		it("should set and get file name correctly", () => {
			frame.setFileName("newFrame");
			expect(frame.getFileName()).toBe("newFrame");
		});

		it("should set and get videoId correctly", () => {
			frame.setVideoId(2);
			expect(frame.getVideoId()).toBe(2);
		});

		it("should set and get s3Key correctly", () => {
			frame.setS3Key("s3/newKey");
			expect(frame.getS3Key()).toBe("s3/newKey");
		});

		it("should set and get extension correctly", () => {
			frame.setExtension("avi");
			expect(frame.getExtension()).toBe("avi");
		});

		it("should set and get url correctly", () => {
			frame.setUrl("http://newexample.com");
			expect(frame.getUrl()).toBe("http://newexample.com");
		});
	});

	describe("Optional Parameters", () => {
		it("should handle optional parameters correctly", () => {
			const frameWithoutOptional = new Frame("noIdFrame", 3, "s3/noKey", "mkv");
			expect(frameWithoutOptional.getId()).toBeUndefined();
			expect(frameWithoutOptional.getUrl()).toBeUndefined();
		});
	});
});
