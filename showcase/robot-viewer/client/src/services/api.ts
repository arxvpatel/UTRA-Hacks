import axios from 'axios';
import type { ProcessedVoiceResponse, RobotPart, ApiStatus } from '../types/robot';

const client = axios.create({ baseURL: '/api' });

export async function processVoiceCommand(audioBlob: Blob): Promise<ProcessedVoiceResponse> {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  const { data } = await client.post('/voice/process', formData);
  return data;
}

export async function processTextQuery(query: string): Promise<ProcessedVoiceResponse> {
  const { data } = await client.post('/voice/query', { query });
  return data;
}

export async function getAllParts(): Promise<RobotPart[]> {
  const { data } = await client.get('/parts', { params: { ai: true } });
  return data.parts;
}

export async function getPartDetails(
  partId: string
): Promise<{ part: RobotPart; relatedParts: RobotPart[] }> {
  const { data } = await client.get(`/parts/${partId}`, { params: { ai: true } });
  return data;
}

export async function searchParts(query: string): Promise<RobotPart[]> {
  const { data } = await client.get('/parts/search', { params: { q: query, ai: true } });
  return data.parts;
}

export async function getApiStatus(): Promise<ApiStatus> {
  const { data } = await client.get('/voice/status');
  return data;
}
