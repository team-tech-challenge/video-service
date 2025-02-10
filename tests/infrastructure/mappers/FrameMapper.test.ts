import { Frame } from "@entities/Frame";
import { FrameMapper } from "@mappers/FrameMapper";

describe("FrameMapper", () => {
	describe("toEntity", () => {
		it("should map a frame model to a Frame entity", () => {
			const frameModel = {
				id: 1,
				name: "frame1",
				videoId: 10,
				s3Key: "s3/frame1.png",
				extension: "png",
				url: "http://example.com/frame1.png"
			};

			const frameEntity = FrameMapper.toEntity(frameModel);

			expect(frameEntity.getId()).toBe(1);
			expect(frameEntity.getFileName()).toBe("frame1");
			expect(frameEntity.getVideoId()).toBe(10);
			expect(frameEntity.getS3Key()).toBe("s3/frame1.png");
			expect(frameEntity.getExtension()).toBe("png");
			expect(frameEntity.getUrl()).toBe("http://example.com/frame1.png");
		});
	});

	describe("toModel", () => {
		it("should map a Frame entity to a frame model", () => {
			const frameEntity = new Frame("frame2", 20, "s3/frame2.jpg", "jpg", "http://example.com/frame2.jpg", 2);

			const frameModel = FrameMapper.toModel(frameEntity);

			expect(frameModel.id).toBe(2);
			expect(frameModel.name).toBe("frame2");
			expect(frameModel.videoId).toBe(20);
			expect(frameModel.s3Key).toBe("s3/frame2.jpg");
			expect(frameModel.extension).toBe("jpg");
			expect(frameModel.url).toBe("http://example.com/frame2.jpg");
		});
	});
});
