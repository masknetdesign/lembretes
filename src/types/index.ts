
export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  dueTime: string;
  isPaid: boolean;
  createdAt: string;
}

export type BillFormData = Omit<Bill, 'id' | 'isPaid' | 'createdAt'>;
