import request from "supertest";
import express from "express";
import { FrameRoutes } from "@routes/FrameRoute";

const app = express();
app.use(express.json());
app.use(FrameRoutes);

describe("FrameRoutes", () => {
	describe("GET /frames/video/:videoId", () => {
		it("should return a list of frames for a valid video ID", async () => {
			const response = await request(app).get("/frames/video/1");
			expect(response.status).toBe(200);
			expect(response.body).toBeInstanceOf(Array);
		});

		it("should return 404 when video is not found", async () => {
			const response = await request(app).get("/frames/video/999");
			expect(response.status).toBe(404);
		});
	});

	describe("POST /frames/extract", () => {
		it("should return 201 when frames are extracted successfully", async () => {
			const response = await request(app)
				.post("/frames/extract")
				.send({ videoId: 1 });
			expect(response.status).toBe(201);
		});

		it("should return 400 for invalid input", async () => {
			const response = await request(app)
				.post("/frames/extract")
				.send({});
			expect(response.status).toBe(400);
		});
	});

	describe("GET /frames/videos/download-frames", () => {
		it("should return URLs of ZIP files when video IDs are provided", async () => {
			const response = await request(app)
				.get("/frames/videos/download-frames?videoIds=1,2");
			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("files");
		});

		it("should return 400 when no video IDs are provided", async () => {
			const response = await request(app).get("/frames/videos/download-frames");
			expect(response.status).toBe(400);
		});
	});
});
