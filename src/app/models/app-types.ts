export type View = 'dashboard' | 'accounts' | 'transactions' | 'customers' | 'reports';
export type Operation = 'deposit' | 'withdrawal' | 'transfer';
export type Modal = Operation | 'customer' | 'account' | null;
export type TransactionType = Operation | 'transfer-in' | 'transfer-out';
export type TransactionStatus = 'success' | 'failed' | 'pending';
export type SortOrder = 'newest' | 'oldest' | 'largest';
export type ReportPeriod = 'daily' | 'weekly' | 'monthly';
