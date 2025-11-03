import { Product, Transaction, Category, Brand, Supplier } from '../types';

// Generate random dates within a range
const randomDate = (start: Date, end: Date): string => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
};

// Generate random future date for expiration
const randomFutureDate = (): string => {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + Math.floor(Math.random() * 365));
  return futureDate.toISOString().split('T')[0];
};

// Categories
export const categories: Category[] = [
  { id: '1', name: 'Bebidas' },
  { id: '2', name: 'Snacks' },
  { id: '3', name: 'Panadería' },
  { id: '4', name: 'Lácteos' },
  { id: '5', name: 'Confitería' },
  { id: '6', name: 'Enlatados' },
];

// Brands
export const brands: Brand[] = [
  { id: '1', name: 'Coca-Cola' },
  { id: '2', name: 'Pepsi' },
  { id: '3', name: 'Bimbo' },
  { id: '4', name: 'Nestlé' },
  { id: '5', name: 'Lala' },
  { id: '6', name: 'Gamesa' },
];

// Suppliers
export const suppliers: Supplier[] = [
  { id: '1', name: 'Distribuidora Central', contact: 'Juan Pérez', phone: '0414-1234567', email: 'ventas@distcentral.com' },
  { id: '2', name: 'Mayorista El Buen Precio', contact: 'María González', phone: '0424-9876543' },
  { id: '3', name: 'Comercial Los Andes', contact: 'Carlos Rodríguez', email: 'pedidos@losandes.com' },
  { id: '4', name: 'Proveedor Local', contact: 'Ana Martínez', phone: '0412-5555555' },
];

// Products
export const products: Product[] = [
  {
    id: '1',
    name: 'Coca-Cola 600ml',
    description: 'Refresco carbonatado',
    category: '1',
    brand: '1',
    barcode: '7501055300105',
    currentStock: 24,
    minStockLevel: 10,
    purchasePrice: 12.50 * 35, // Convertido a Bs.
    sellingPrice: 18.00 * 35, // Convertido a Bs.
    expirationDate: randomFutureDate(),
    imageUrl: 'https://images.pexels.com/photos/3819969/pexels-photo-3819969.jpeg?auto=compress&cs=tinysrgb&w=300',
    createdAt: '2023-01-15',
    updatedAt: '2023-06-20'
  },
  {
    id: '2',
    name: 'Galletas Marías',
    description: 'Paquete de galletas',
    category: '2',
    brand: '6',
    barcode: '7501000130421',
    currentStock: 8,
    minStockLevel: 15,
    purchasePrice: 10.00 * 35, // Convertido a Bs.
    sellingPrice: 15.50 * 35, // Convertido a Bs.
    expirationDate: randomFutureDate(),
    imageUrl: 'https://images.pexels.com/photos/7474372/pexels-photo-7474372.jpeg?auto=compress&cs=tinysrgb&w=300',
    createdAt: '2023-02-10',
    updatedAt: '2023-06-18'
  },
  {
    id: '3',
    name: 'Pan Blanco',
    description: 'Pan de caja blanco',
    category: '3',
    brand: '3',
    barcode: '7501030428808',
    currentStock: 12,
    minStockLevel: 5,
    purchasePrice: 30.00 * 35, // Convertido a Bs.
    sellingPrice: 40.00 * 35, // Convertido a Bs.
    expirationDate: randomFutureDate(),
    imageUrl: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=300',
    createdAt: '2023-01-20',
    updatedAt: '2023-06-15'
  },
  {
    id: '4',
    name: 'Leche Entera 1L',
    description: 'Leche entera pasteurizada',
    category: '4',
    brand: '5',
    barcode: '7501055384455',
    currentStock: 18,
    minStockLevel: 10,
    purchasePrice: 22.00 * 35, // Convertido a Bs.
    sellingPrice: 28.00 * 35, // Convertido a Bs.
    expirationDate: randomFutureDate(),
    imageUrl: 'https://images.pexels.com/photos/7773917/pexels-photo-7773917.jpeg?auto=compress&cs=tinysrgb&w=300',
    createdAt: '2023-03-05',
    updatedAt: '2023-06-20'
  },
  {
    id: '5',
    name: 'Chocolate Abuelita',
    description: 'Chocolate en tableta',
    category: '5',
    brand: '4',
    type: '5',
    barcode: '7501058618924',
    currentStock: 30,
    minStockLevel: 15,
    purchasePrice: 35.00 * 35, // Convertido a Bs.
    sellingPrice: 45.00 * 35, // Convertido a Bs.
    expirationDate: randomFutureDate(),
    imageUrl: 'https://images.pexels.com/photos/65882/chocolate-dark-coffee-confiserie-65882.jpeg?auto=compress&cs=tinysrgb&w=300',
    createdAt: '2023-02-15',
    updatedAt: '2023-06-10'
  },
  {
    id: '6',
    name: 'Atún en Agua',
    description: 'Atún en lata en agua',
    category: '6',
    brand: '4',
    barcode: '7501003344152',
    currentStock: 20,
    minStockLevel: 12,
    purchasePrice: 18.00 * 35, // Convertido a Bs.
    sellingPrice: 25.00 * 35, // Convertido a Bs.
    expirationDate: randomFutureDate(),
    imageUrl: 'https://images.pexels.com/photos/4553031/pexels-photo-4553031.jpeg?auto=compress&cs=tinysrgb&w=300',
    createdAt: '2023-01-30',
    updatedAt: '2023-06-12'
  },
];

// Transactions
export const transactions: Transaction[] = [
  {
    id: '1',
    productId: '1',
    type: 'entry',
    quantity: 30,
    date: randomDate(new Date(2023, 5, 1), new Date(2023, 5, 30)),
    notes: 'Compra regular',
    createdBy: 'Admin'
  },
  {
    id: '2',
    productId: '1',
    type: 'exit',
    quantity: 6,
    date: randomDate(new Date(2023, 5, 1), new Date(2023, 5, 30)),
    notes: 'Venta regular',
    createdBy: 'Admin'
  },
  {
    id: '3',
    productId: '2',
    type: 'entry',
    quantity: 20,
    date: randomDate(new Date(2023, 5, 1), new Date(2023, 5, 30)),
    notes: 'Compra regular',
    createdBy: 'Admin'
  },
  {
    id: '4',
    productId: '2',
    type: 'exit',
    quantity: 12,
    date: randomDate(new Date(2023, 5, 1), new Date(2023, 5, 30)),
    notes: 'Venta regular',
    createdBy: 'Admin'
  },
  {
    id: '5',
    productId: '3',
    type: 'entry',
    quantity: 15,
    date: randomDate(new Date(2023, 5, 1), new Date(2023, 5, 30)),
    notes: 'Compra regular',
    createdBy: 'Admin'
  },
  {
    id: '6',
    productId: '3',
    type: 'exit',
    quantity: 3,
    date: randomDate(new Date(2023, 5, 1), new Date(2023, 5, 30)),
    notes: 'Venta regular',
    createdBy: 'Admin'
  },
  {
    id: '7',
    productId: '4',
    type: 'entry',
    quantity: 25,
    date: randomDate(new Date(2023, 5, 1), new Date(2023, 5, 30)),
    notes: 'Compra regular',
    createdBy: 'Admin'
  },
  {
    id: '8',
    productId: '4',
    type: 'exit',
    quantity: 7,
    date: randomDate(new Date(2023, 5, 1), new Date(2023, 5, 30)),
    notes: 'Venta regular',
    createdBy: 'Admin'
  },
];