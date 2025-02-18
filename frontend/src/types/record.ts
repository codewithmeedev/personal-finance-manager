export interface Record {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
  type: 'income' | 'expense';
}

export interface RecordUpdate {
  amount: number;
  category: string;
  description?: string;
  type: 'income' | 'expense';
}

export interface RecordCreate {
  amount: number;
  category: string;
  description?: string;
  type: 'income' | 'expense';
}
