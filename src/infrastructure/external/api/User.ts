import { config } from 'dotenv';
import axios from 'axios';

config();

const API_BASE = process.env.USER_SERVICE_URL || 'http://user-service:3001';

// Função para buscar informações de pagamento no Mercado Pago
const searchUser = async (id: number) => {

    console.log(process.env.USER_SERVICE_URL)
    console.log(id)

    const headers = {        
        'Content-Type': 'application/json',        
    };


    try {
        const response = await axios.get(
            `${API_BASE}/user/id/${id}`,
            {
                headers                
            }
        );

        return response.data.user;
    } catch (error) {
        console.error('Erro ao buscar usuário em video:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export { searchUser };