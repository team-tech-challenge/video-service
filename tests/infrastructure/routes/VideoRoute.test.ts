import request from 'supertest';
import express from 'express';
import { videoRoute } from '@routes/VideoRoute'; // Caminho para o arquivo de roteamento

// Mock de dependências
jest.mock('@controllers/VideoController');
jest.mock('@usecases/VideoUseCase');
jest.mock('@adapters/VideoAdapter');
jest.mock('@external/s3/S3Service');

describe('Video Routes', () => {
	let app: express.Express;

	beforeAll(() => {
		app = express();
		app.use('/videos', videoRoute); // Usando o roteador para testes
	});

	describe('POST /videos/upload', () => {
		it('should successfully upload videos and return 201', async () => {
			const response = await request(app)
				.post('/videos/upload')
				.attach('files', 'path/to/video.mp4'); // Mock de envio de arquivo

			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty('message', 'Vídeos enviados com sucesso');
		});

		it('should return 400 if no files are uploaded', async () => {
			const response = await request(app).post('/videos/upload');

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty('message', 'Nenhum arquivo enviado');
		});

		it('should return 500 on server error', async () => {
			// Mock de erro no controller ou use case
			const mockError = jest.fn().mockImplementationOnce(() => {
				throw new Error('Internal Server Error');
			});
			const response = await request(app)
				.post('/videos/upload')
				.attach('files', 'path/to/video.mp4');

			expect(response.status).toBe(500);
			expect(response.body).toHaveProperty('message', 'Erro no servidor');
		});
	});

	describe('GET /videos', () => {
		it('should return list of videos with status 200', async () => {
			const response = await request(app).get('/videos');

			expect(response.status).toBe(200);
			expect(response.body).toEqual(expect.arrayContaining([])); // Esperando uma lista de vídeos
		});

		it('should return 500 if there is an error while fetching videos', async () => {
			// Mock de erro na consulta de vídeos
			const mockError = jest.fn().mockImplementationOnce(() => {
				throw new Error('Error fetching videos');
			});
			const response = await request(app).get('/videos');

			expect(response.status).toBe(500);
			expect(response.body).toHaveProperty('message', 'Erro ao buscar vídeos');
		});
	});

	describe('GET /videos/:id', () => {
		it('should return video by ID with status 200', async () => {
			const videoId = 1; // ID de teste
			const response = await request(app).get(`/videos/${videoId}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('id', videoId);
		});

		it('should return 404 if video not found', async () => {
			const videoId = 9999; // ID que não existe
			const response = await request(app).get(`/videos/${videoId}`);

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('message', 'Vídeo não encontrado');
		});

		it('should return 500 on server error', async () => {
			// Mock de erro no controller ou use case
			const mockError = jest.fn().mockImplementationOnce(() => {
				throw new Error('Internal Server Error');
			});
			const response = await request(app).get('/videos/1');

			expect(response.status).toBe(500);
			expect(response.body).toHaveProperty('message', 'Erro ao buscar vídeo');
		});
	});
});
