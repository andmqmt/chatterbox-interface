import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ConversaService = {
  criarConversa: async (teoria = null) => {
    const resposta = await axios.post(`${API_BASE_URL}/conversas`, { teoria });
    return resposta.data;
  },

  obterConversa: async (id) => {
    const resposta = await axios.get(`${API_BASE_URL}/conversas/${id}`);
    return resposta.data;
  },

  listarConversas: async () => {
    const resposta = await axios.get(`${API_BASE_URL}/conversas`);
    return resposta.data;
  }
};

export default ConversaService;
