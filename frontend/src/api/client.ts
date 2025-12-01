// src/api/client.ts
import axios from 'axios';

const API_BASE = 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000
});
