export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  barcode?: string;
  currentStock: number;
  minStockLevel: number;
  purchasePrice: number;
  sellingPrice: number;
  expirationDate?: string;
  image?: Blob;
  imageType?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
  lastVerified?: string;
}

export interface Transaction {
  id: string;
  transactionNumber: string;
  productId: string;
  type: 'entry' | 'exit';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  date: string;
  notes?: string;
  createdBy: string;
  buyerName?: string;
  syncStatus: SyncStatus;
}

export interface TransactionItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  purchasePrice?: number;
  totalPrice: number;
}

export interface MultiTransaction {
  id: string;
  transactionNumber: string;
  type: 'entry' | 'exit';
  items: TransactionItem[];
  totalAmount: number;
  date: string;
  notes?: string;
  createdBy: string;
  buyerName?: string;
  supplierName?: string;
  syncStatus: SyncStatus;
}

export interface Category {
  id: string;
  name: string;
}

export interface Brand {
  id: string;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
}

export interface DashboardMetric {
  title: string;
  value: number | string;
  icon: string;
  trend?: number;
  color: string;
}

export enum SyncStatus {
  PendingSync = 'pending_sync',
  Synced = 'synced',
  SyncFailed = 'sync_failed'
}

export interface AppSettings {
  currency: 'USD' | 'Bs';
  dollarRate: number;
  lastInventoryVerification: string;
  lastDollarRateUpdate: string;
}

export interface User {
  username: string;
  role: 'admin' | 'employee';
  displayName: string;
}

export enum UserRole {
  Admin = 'admin',
  Employee = 'employee'
}