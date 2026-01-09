import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://localhost:7200/api', // Porta API
})