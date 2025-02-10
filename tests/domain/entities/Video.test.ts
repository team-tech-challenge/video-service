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

	describe('getFileNameWithoutExtension', () => {
		it('should return the file name without the extension', () => {
			const video = new Video(null, 'video.mp4', '/path/to/video.mp4', 'video/mp4');

			// Testa o nome do arquivo sem extensão
			const fileNameWithoutExtension = video.getFileNameWithoutExtension();
			expect(fileNameWithoutExtension).toBe('video');
		});

		it('should handle file name with multiple dots', () => {
			const video = new Video(null, 'movie.name.final.mp4', '/path/to/movie.name.final.mp4', 'video/mp4');

			// Testa um nome de arquivo com vários pontos
			const fileNameWithoutExtension = video.getFileNameWithoutExtension();
			expect(fileNameWithoutExtension).toBe('movie.name.final');
		});

		it('should return an empty string if there is no file name', () => {
			const video = new Video(null, '', '/path/to/', 'video/mp4');

			// Testa se não há nome de arquivo
			const fileNameWithoutExtension = video.getFileNameWithoutExtension();
			expect(fileNameWithoutExtension).toBe('');
		});

		it('should return the file name without extension even if the path contains directories', () => {
			const video = new Video(null, 'folder/video.mp4', '/path/to/folder/video.mp4', 'video/mp4');

			// Testa um caminho com diretórios
			const fileNameWithoutExtension = video.getFileNameWithoutExtension();
			expect(fileNameWithoutExtension).toBe('video');
		});

		it('should return the file name as it is when there is no extension', () => {
			const video = new Video(null, 'video', '/path/to/video', 'video/mp4');

			// Testa o caso sem extensão
			const fileNameWithoutExtension = video.getFileNameWithoutExtension();
			expect(fileNameWithoutExtension).toBe('video');
		});

		it('should return an empty string if s3Key is empty', () => {
			const video = new Video(null, '', '', 'video/mp4');

			// Testa o caso com chave S3 vazia
			const fileNameWithoutExtension = video.getFileNameWithoutExtension();
			expect(fileNameWithoutExtension).toBe('');
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
