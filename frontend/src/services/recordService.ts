// src/services/recordService.ts
import api from './api';
import { Record, RecordCreate, RecordUpdate } from '../types/record';

async function getAll(): Promise<Record[]> {
  const response = await api.get<Record[]>('/records/');
  return response.data;
}

async function createRecord(data: RecordCreate): Promise<Record> {
  const response = await api.post<Record>('/records/', data);
  return response.data;
}

async function update(recordId: string, data: RecordUpdate): Promise<Record> {
  const response = await api.patch<Record>(`/records/${recordId}`, data);
  return response.data;
}

async function deleteRecord(recordId: string): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(`/records/${recordId}`);
  return response.data;
}

async function getRecords(): Promise<Record[]> {
  // If your backend /records returns an array of records directly:
  const response = await axios.get<Record[]>(`/records`);
  // e.g. response.data => [ { id: "...", date: "...", ... }, ... ]
  return response.data;
}

export default {
  getAll,
  createRecord,
  update,
  deleteRecord,
  getRecords,
};
