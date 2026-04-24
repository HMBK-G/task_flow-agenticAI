import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const db = {
  dashboard: {
    get: async () => {
      const { data } = await client.get('/dashboard');
      return data;
    },
  },
  tasks: {
    filter: async () => {
      const { data } = await client.get('/tasks');
      return data;
    },
  },
  members: {
    filter: async () => {
      const { data } = await client.get('/members');
      return data;
    },
  },
  events: {
    filter: async () => {
      const { data } = await client.get('/events');
      return data;
    },
  },
};

export default client;
