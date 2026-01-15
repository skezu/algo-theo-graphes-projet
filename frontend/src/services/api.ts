import axios from 'axios';
import { GraphData, TraceStep } from '@/types';

// Assuming port 8000 for FastAPI
const API_URL = 'http://localhost:8000';

export const api = {
    getGraph: async (): Promise<GraphData> => {
        const res = await axios.get(`${API_URL}/graph`);
        return res.data;
    },
    runAlgorithm: async (algorithm: string, startNode: string, endNode?: string): Promise<TraceStep[]> => {
        const res = await axios.post(`${API_URL}/algorithms/run`, {
            algorithm,
            startNode,
            endNode
        });
        return res.data;
    },
    resetGraph: async () => {
        await axios.post(`${API_URL}/graph/reset`);
    }
};
