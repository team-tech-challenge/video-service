import { Video } from "@entities/Video";
import { VideoMapper } from "@mappers/VideoMapper";

describe("VideoMapper", () => {
	describe("toEntity", () => {
		it("should map a video model to a Video entity", () => {
			const videoModel = {
				id: 1,
				idUser: 100,
				name: "video1",
				s3Key: "s3/video1.mp4",
				extension: "mp4",
				url: "http://example.com/video1.mp4"
			};

			const videoEntity = VideoMapper.toEntity(videoModel);

			expect(videoEntity.getId()).toBe(1);
			expect(videoEntity.getIdUser()).toBe(100);
			expect(videoEntity.getFileName()).toBe("video1");
			expect(videoEntity.getS3Key()).toBe("s3/video1.mp4");
			expect(videoEntity.getExtension()).toBe("mp4");
			expect(videoEntity.getUrl()).toBe("http://example.com/video1.mp4");
		});
	});

	describe("toModel", () => {
		it("should map a Video entity to a video model", () => {
			const videoEntity = new Video(200, "video2", "s3/video2.avi", "avi", "http://example.com/video2.avi", 2);

			const videoModel = VideoMapper.toModel(videoEntity);

			expect(videoModel.id).toBe(2);
			expect(videoModel.idUser).toBe(200);
			expect(videoModel.name).toBe("video2");
			expect(videoModel.s3Key).toBe("s3/video2.avi");
			expect(videoModel.extension).toBe("avi");
			expect(videoModel.url).toBe("http://example.com/video2.avi");
		});
	});
});
