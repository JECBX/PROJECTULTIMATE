import Dexie, { Table } from 'dexie';
import { v4 as uuidv4 } from 'uuid';
import { 
  Product, 
  Transaction, 
  MultiTransaction,
  TransactionItem,
  Category, 
  Brand,
  SyncStatus 
} from '../types';
import { 
  products as initialProducts, 
  transactions as initialTransactions,
  categories as initialCategories,
  brands as initialBrands,
  suppliers as initialSuppliers
} from '../data/mockData';

class InventoryDatabase extends Dexie {
  products!: Table<Product, string>;
  transactions!: Table<Transaction, string>;
  multiTransactions!: Table<MultiTransaction, string>;
  categories!: Table<Category, string>;
  brands!: Table<Brand, string>;
  suppliers!: Table<Supplier, string>;
  
  constructor() {
    super('InventoryDatabase');
    
    this.version(3).stores({
      products: 'id, name, category, brand, barcode, currentStock, expirationDate, syncStatus, updatedAt',
      transactions: 'id, transactionNumber, productId, type, date, createdBy, syncStatus',
      multiTransactions: 'id, transactionNumber, type, date, createdBy, syncStatus',
      categories: 'id, name',
      brands: 'id, name',
      suppliers: 'id, name, contact, phone, email'
    }).upgrade(tx => {
      // Migration for existing transactions
      return tx.table('transactions').toCollection().modify(transaction => {
        if (!transaction.transactionNumber) {
          transaction.transactionNumber = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
        if (!transaction.unitPrice) {
          transaction.unitPrice = 0;
        }
        if (!transaction.totalPrice) {
          transaction.totalPrice = 0;
        }
      });
    });
    
    this.on('populate', () => this.populate());
  }
  
  async populate() {
    // Add default categories
    await this.categories.bulkAdd(initialCategories);
    
    // Add default brands
    await this.brands.bulkAdd(initialBrands);
    
    // Add default suppliers
    await this.suppliers.bulkAdd(initialSuppliers);
    
    // Add sample products
    await this.products.bulkAdd(
      initialProducts.map(product => ({
        ...product,
        syncStatus: SyncStatus.Synced
      }))
    );
    
    // Add sample transactions
    await this.transactions.bulkAdd(
      initialTransactions.map(transaction => ({
        ...transaction,
        transactionNumber: `T-${String(Math.floor(Math.random() * 100) + 1).padStart(3, '0')}`,
        unitPrice: 0,
        totalPrice: 0,
        syncStatus: SyncStatus.Synced
      }))
    );
  }
  
  async generateTransactionNumber(): Promise<string> {
    const count = await this.multiTransactions.count();
    const timestamp = Date.now();
    return `TXN-${timestamp}-${String(count + 1).padStart(4, '0')}`;
  }

  async addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) {
    const now = new Date().toISOString().split('T')[0];
    const newProduct: Product = {
      ...product,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      syncStatus: SyncStatus.PendingSync
    };
    
    await this.products.add(newProduct);
    return newProduct;
  }
  
  async updateProduct(id: string, updatedFields: Partial<Product>) {
    const product = await this.products.get(id);
    
    if (!product) throw new Error(`Product with id ${id} not found`);
    
    const updatedProduct = {
      ...product,
      ...updatedFields,
      updatedAt: new Date().toISOString().split('T')[0],
      syncStatus: SyncStatus.PendingSync
    };
    
    await this.products.put(updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: string) {
    await this.products.delete(id);
  }
  
  async addTransaction(transaction: Omit<Transaction, 'id' | 'syncStatus'>) {
    const newTransaction: Transaction = {
      ...transaction,
      id: uuidv4(),
      syncStatus: SyncStatus.PendingSync
    };
    
    await this.transactions.add(newTransaction);
    
    // Update product stock
    const product = await this.products.get(transaction.productId);
    if (product) {
      const newStock = transaction.type === 'entry'
        ? product.currentStock + transaction.quantity
        : product.currentStock - transaction.quantity;
      
      await this.updateProduct(product.id, { currentStock: newStock });
    }
    
    return newTransaction;
  }
  
  async addMultiTransaction(transaction: Omit<MultiTransaction, 'id' | 'transactionNumber' | 'syncStatus'>) {
    const transactionNumber = await this.generateTransactionNumber();
    const newTransaction: MultiTransaction = {
      ...transaction,
      id: uuidv4(),
      transactionNumber,
      syncStatus: SyncStatus.PendingSync
    };
    
    await this.multiTransactions.add(newTransaction);
    
    // Update product stocks for each item
    for (const item of transaction.items) {
      const product = await this.products.get(item.productId);
      if (product) {
        const newStock = transaction.type === 'entry'
          ? product.currentStock + item.quantity
          : product.currentStock - item.quantity;
        
        const updateData: Partial<Product> = { currentStock: newStock };
        
        // Update prices if they changed (for both entry and exit transactions)
        if (transaction.type === 'entry' || transaction.type === 'exit') {
          const purchasePrice = item.unitPrice;
          let sellingPrice = item.unitPrice;
          
          // For entry transactions, calculate selling price with markup
          if (transaction.type === 'entry') {
            sellingPrice = purchasePrice * 1.3; // 30% markup by default
          }
          
          // For exit transactions, use the provided prices
          if (transaction.type === 'exit' && item.purchasePrice !== undefined) {
            updateData.purchasePrice = item.purchasePrice;
            updateData.sellingPrice = item.unitPrice; // unitPrice is the selling price for exits
          } else if (transaction.type === 'entry') {
            updateData.purchasePrice = purchasePrice;
            updateData.sellingPrice = sellingPrice;
          }
          
          // Only update if prices actually changed
          if (transaction.type === 'entry' && purchasePrice !== product.purchasePrice) {
            // Already set above
          } else if (transaction.type === 'exit' && item.purchasePrice !== undefined && 
                    (item.purchasePrice !== product.purchasePrice || item.unitPrice !== product.sellingPrice)) {
            // Already set above
          }
        }
        
        await this.updateProduct(product.id, updateData);
      }
    }
    
    return newTransaction;
  }

  async deleteMultiTransaction(id: string) {
    const transaction = await this.multiTransactions.get(id);
    if (!transaction) return;

    // Revert stock changes
    for (const item of transaction.items) {
      const product = await this.products.get(item.productId);
      if (product) {
        const revertedStock = transaction.type === 'entry'
          ? product.currentStock - item.quantity
          : product.currentStock + item.quantity;
        
        await this.updateProduct(product.id, { currentStock: revertedStock });
      }
    }

    await this.multiTransactions.delete(id);
  }

  async getProductsByCategory(categoryId: string) {
    return await this.products.where('category').equals(categoryId).toArray();
  }
  
  async getProductsByBrand(brandId: string) {
    return await this.products.where('brand').equals(brandId).toArray();
  }
  
  async getProductsExpiringWithinDays(days: number) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    return await this.products
      .filter(product => {
        if (!product.expirationDate) return false;
        const expirationDate = new Date(product.expirationDate);
        return expirationDate <= futureDate && expirationDate >= today;
      })
      .toArray();
  }
  
  async getProductsBelowStock() {
    return await this.products
      .filter(product => product.currentStock < product.minStockLevel)
      .toArray();
  }
  
  async searchProducts(query: string) {
    const lowerCaseQuery = query.toLowerCase();
    
    return await this.products
      .filter(product => 
        product.name.toLowerCase().includes(lowerCaseQuery) || 
        product.description.toLowerCase().includes(lowerCaseQuery) ||
        (product.barcode && product.barcode.includes(query))
      )
      .toArray();
  }
  
  async getPendingSyncItems() {
    const products = await this.products
      .where('syncStatus')
      .equals(SyncStatus.PendingSync)
      .toArray();
      
    const transactions = await this.transactions
      .where('syncStatus')
      .equals(SyncStatus.PendingSync)
      .toArray();
      
    const multiTransactions = await this.multiTransactions
      .where('syncStatus')
      .equals(SyncStatus.PendingSync)
      .toArray();
      
    return { products, transactions, multiTransactions };
  }
  
  async markAsSynced(type: 'products' | 'transactions' | 'multiTransactions', ids: string[]) {
    if (ids.length === 0) return;
    
    const table = this[type];
    await table.where('id').anyOf(ids).modify({ syncStatus: SyncStatus.Synced });
  }

  async addCategory(name: string) {
    const category: Category = {
      id: uuidv4(),
      name
    };
    await this.categories.add(category);
    return category;
  }

  async addBrand(name: string) {
    const brand: Brand = {
      id: uuidv4(),
      name
    };
    await this.brands.add(brand);
    return brand;
  }

  async addSupplier(name: string, contact?: string, phone?: string, email?: string) {
    const supplier: Supplier = {
      id: uuidv4(),
      name,
      contact,
      phone,
      email
    };
    await this.suppliers.add(supplier);
    return supplier;
  }
}

export const db = new InventoryDatabase();