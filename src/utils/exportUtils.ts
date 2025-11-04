import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Product, MultiTransaction, Category, Brand, Supplier } from '../types';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const exportDataToPDF = async (
  products: Product[],
  transactions: MultiTransaction[],
  categories: Category[],
  brands: Brand[],
  suppliers: Supplier[],
  getCategoryById: (id: string) => Category | undefined,
  getBrandById: (id: string) => Brand | undefined,
  getProductById: (id: string) => Product | undefined,
  formatCurrency: (amount: number) => string
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 20;

  // Título principal
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('El Paradero del Cristiano', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.setFontSize(16);
  doc.text('Reporte Completo de Inventario', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 20;

  // 1. Resumen General
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen General', 14, yPosition);
  yPosition += 10;

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.currentStock * p.sellingPrice), 0);
  const lowStockProducts = products.filter(p => p.currentStock < p.minStockLevel).length;
  const totalTransactions = transactions.length;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total de Productos: ${totalProducts}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Valor Total del Inventario: ${formatCurrency(totalValue)}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Productos con Stock Bajo: ${lowStockProducts}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Total de Transacciones: ${totalTransactions}`, 14, yPosition);
  yPosition += 15;

  // 2. Tabla de Productos
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Inventario de Productos', 14, yPosition);
  yPosition += 10;

  const productData = products.map(product => [
    product.name,
    getCategoryById(product.category)?.name || 'N/A',
    getBrandById(product.brand)?.name || 'N/A',
    product.currentStock.toString(),
    product.minStockLevel.toString(),
    formatCurrency(product.purchasePrice),
    formatCurrency(product.sellingPrice),
    product.expirationDate || 'N/A'
  ]);

  doc.autoTable({
    startY: yPosition,
    head: [['Producto', 'Categoría', 'Marca', 'Stock', 'Min Stock', 'P. Compra', 'P. Venta', 'Vencimiento']],
    body: productData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    margin: { left: 14, right: 14 }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 20;

  // Nueva página si es necesario
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // 3. Productos con Stock Bajo
  const lowStockData = products
    .filter(p => p.currentStock < p.minStockLevel)
    .map(product => [
      product.name,
      product.currentStock.toString(),
      product.minStockLevel.toString(),
      getCategoryById(product.category)?.name || 'N/A'
    ]);

  if (lowStockData.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Productos con Stock Bajo', 14, yPosition);
    yPosition += 10;

    doc.autoTable({
      startY: yPosition,
      head: [['Producto', 'Stock Actual', 'Stock Mínimo', 'Categoría']],
      body: lowStockData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [239, 68, 68] },
      alternateRowStyles: { fillColor: [254, 242, 242] },
      margin: { left: 14, right: 14 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;
  }

  // Nueva página para transacciones
  doc.addPage();
  yPosition = 20;

  // 4. Transacciones Recientes (últimas 20)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Transacciones Recientes', 14, yPosition);
  yPosition += 10;

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);

  const transactionData = recentTransactions.map(transaction => [
    transaction.transactionNumber,
    transaction.date,
    transaction.type === 'entry' ? 'Entrada' : 'Salida',
    transaction.items.map(item => {
      const product = getProductById(item.productId);
      return `${product?.name || 'N/A'} (${item.quantity})`;
    }).join(', '),
    transaction.buyerName || transaction.supplierName || 'N/A',
    formatCurrency(transaction.totalAmount)
  ]);

  doc.autoTable({
    startY: yPosition,
    head: [['# Transacción', 'Fecha', 'Tipo', 'Productos', 'Cliente/Proveedor', 'Total']],
    body: transactionData,
    styles: { fontSize: 7 },
    headStyles: { fillColor: [59, 130, 246] },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    margin: { left: 14, right: 14 },
    columnStyles: {
      3: { cellWidth: 60 } // Productos column wider
    }
  });

  // Nueva página para categorías y marcas
  doc.addPage();
  yPosition = 20;

  // 5. Categorías
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Categorías', 14, yPosition);
  yPosition += 10;

  const categoryData = categories.map(category => {
    const productCount = products.filter(p => p.category === category.id).length;
    return [category.name, productCount.toString()];
  });

  doc.autoTable({
    startY: yPosition,
    head: [['Categoría', 'Cantidad de Productos']],
    body: categoryData,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [34, 197, 94] },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    margin: { left: 14, right: 14 }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 20;

  // 6. Marcas
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Marcas', 14, yPosition);
  yPosition += 10;

  const brandData = brands.map(brand => {
    const productCount = products.filter(p => p.brand === brand.id).length;
    return [brand.name, productCount.toString()];
  });

  doc.autoTable({
    startY: yPosition,
    head: [['Marca', 'Cantidad de Productos']],
    body: brandData,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [168, 85, 247] },
    alternateRowStyles: { fillColor: [250, 245, 255] },
    margin: { left: 14, right: 14 }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 20;

  // 7. Proveedores
  if (suppliers.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Proveedores', 14, yPosition);
    yPosition += 10;

    const supplierData = suppliers.map(supplier => [
      supplier.name,
      supplier.contact || 'N/A',
      supplier.phone || 'N/A',
      supplier.email || 'N/A'
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Proveedor', 'Contacto', 'Teléfono', 'Email']],
      body: supplierData,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [245, 158, 11] },
      alternateRowStyles: { fillColor: [255, 251, 235] },
      margin: { left: 14, right: 14 }
    });
  }

  // Pie de página en todas las páginas
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Página ${i} de ${pageCount} - El Paradero del Cristiano`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Guardar el PDF
  const fileName = `inventario_completo_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export const exportDataToJSON = (
  products: Product[],
  transactions: MultiTransaction[],
  categories: Category[],
  brands: Brand[],
  suppliers: Supplier[]
) => {
  const data = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    data: {
      products,
      transactions,
      categories,
      brands,
      suppliers
    }
  };

  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `inventario_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

export const importDataFromJSON = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Validar estructura básica
        if (!data.data || !data.data.products || !data.data.categories || !data.data.brands) {
          throw new Error('Formato de archivo inválido');
        }
        
        resolve(data.data);
      } catch (error) {
        reject(new Error('Error al leer el archivo: ' + (error as Error).message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };
    
    reader.readAsText(file);
  });
};