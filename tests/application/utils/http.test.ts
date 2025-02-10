import { defaultReturnStatement, formatObjectResponse, handleError } from '@utils/http'; // Ajuste o caminho conforme necessário

describe('Testes de utilitários', () => {

	// Testes para defaultReturnStatement
	describe('defaultReturnStatement', () => {
		it('deve chamar o método json do response com a chave e valor corretos', () => {
			const response = {
				json: jest.fn(), // Mock da função json
			};
			const responseName = 'user';
			const value = { id: 1, name: 'John Doe' };

			defaultReturnStatement(response, responseName, value);

			expect(response.json).toHaveBeenCalledWith({ user: value });
		});
	});

	// Testes para formatObjectResponse
	describe('formatObjectResponse', () => {
		it('deve retornar um array com os dados do objeto especificado', () => {
			const includedObject = [
				{ user: { dataValues: { id: 1, name: 'John Doe' } } },
				{ user: { dataValues: { id: 2, name: 'Jane Doe' } } }
			];
			const objectName = 'user';

			const result = formatObjectResponse(includedObject, objectName);

			expect(result).toEqual([
				{ id: 1, name: 'John Doe' },
				{ id: 2, name: 'Jane Doe' }
			]);
		});

		it('deve retornar um array vazio se o objeto incluído estiver vazio', () => {
			const includedObject = [];
			const objectName = 'user';

			const result = formatObjectResponse(includedObject, objectName);

			expect(result).toEqual([]);
		});
	});

	// Testes para handleError
	describe('handleError', () => {
		it('deve chamar o método json do response com o erro correto', () => {
			const res = {
				status: jest.fn().mockReturnThis(),
				json: jest.fn(),
			};
			const error = new Error('Something went wrong');

			handleError(res, error);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: error.message });
		});

		it('deve chamar o status 500 mesmo para erro genérico', () => {
			const res = {
				status: jest.fn().mockReturnThis(),
				json: jest.fn(),
			};
			const error = new Error('Generic error');

			handleError(res, error);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: 'Generic error' });
		});
	});

});
