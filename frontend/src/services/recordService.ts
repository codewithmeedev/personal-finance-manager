// src/services/recordService.ts
import api from "./api";
import { Record, RecordCreate, RecordUpdate } from "../types/record";

interface GetRecordsParams {
  skip: number;
  limit: number;
  category?: string;
  sortField?: string;
  sortOrder?: number;
}

async function getRecords(params: GetRecordsParams): Promise<{ records: Record[]; total: number }> {
  const response = await api.get<{ records: Record[]; total: number }>("/records", { params });
  return response.data;
}

async function getAll(): Promise<Record[]> {
  // Pass the all flag to bypass pagination for chart data
  const response = await api.get<{ records: Record[]; total: number }>("/records", { params: { all: true } });
  return response.data.records;
}

async function createRecord(data: RecordCreate): Promise<Record> {
  const response = await api.post<Record>("/records/", data);
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

export default {
  getRecords,
  getAll,
  createRecord,
  update,
  deleteRecord,
};
