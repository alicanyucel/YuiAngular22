import type { TransactionStatus, TransactionType } from './app-types';

export interface Transaction {
  id: string;
  reference: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  createdAt: string;
  status: TransactionStatus;
  description: string;
}
