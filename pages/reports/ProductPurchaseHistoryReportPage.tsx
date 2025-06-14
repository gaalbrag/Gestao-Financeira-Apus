import React, { useState, useMemo, useEffect, ReactNode } from 'react';
import { useData } from '../../contexts/DataContext';
import { ProductNode, ExpenseEntry, ProductPurchaseHistoryItem, Supplier } from '../../types';
import SelectField from '../../components/ui/SelectField';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import { ICONS } from '../../constants';
import { exportToCsv, ExportColumn } from '../../utils/exportCsv';

interface ReportFilters {
  productId: string;
}

interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
  headerClassName?: string;
}

const ProductPurchaseHistoryReportPage: React.FC = () => {
  const { productNodes, expenseEntries, suppliers, getSelectableProducts, getProductPath } = useData();
  const [selectableProductOptions, setSelectableProductOptions] = useState<{ value: string; label: string; unit: string }[]>([]);

  const [filters, setFilters] = useState<ReportFilters>({
    productId: '',
  });
  const [reportData, setReportData] = useState<ProductPurchaseHistoryItem[] | null>(null);

  useEffect(() => {
    const options = getSelectableProducts();
    setSelectableProductOptions(options);
    if (options.length > 0 && !filters.productId) {
      setFilters(prev => ({ ...prev, productId: options[0].value }));
    }
  }, [getSelectableProducts, filters.productId]);


  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const findProductNodeById = (nodes: ProductNode[], id: string): ProductNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children.length > 0) {
        const found = findProductNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const generateReport = () => {
    const { productId } = filters;
    if (!productId) {
      alert("Por favor, selecione um produto.");
      setReportData(null);
      return;
    }

    const selectedProductNode = findProductNodeById(productNodes, productId);
    if (!selectedProductNode || !selectedProductNode.unit) { // Ensure it's a selectable product with a unit
        setReportData([]);
        return;
    }

    const historyItems: ProductPurchaseHistoryItem[] = [];
    expenseEntries.forEach(entry => {
      entry.lineItems.forEach((item, index) => {
        if (item.productId === productId && item.quantity && item.unitPrice) {
          const supplier = suppliers.find(s => s.id === entry.supplierId);
          historyItems.push({
            id: `${entry.id}-${item.id || index}`, 
            expenseId: entry.id,
            expenseDate: new Date(entry.issueDate).toLocaleDateString('pt-BR'),
            supplierName: supplier?.name || 'N/A',
            productName: getProductPath(selectedProductNode.id), // Use full path
            quantity: item.quantity as number,
            unit: selectedProductNode.unit,
            unitPrice: item.unitPrice as number,
            totalAmount: (item.quantity as number) * (item.unitPrice as number),
          });
        }
      });
    });
    
    historyItems.sort((a,b) => new Date(b.expenseDate.split('/').reverse().join('-')).getTime() - new Date(a.expenseDate.split('/').reverse().join('-')).getTime());

    setReportData(historyItems);
  };
  
  useEffect(() => {
    if (filters.productId) {
      generateReport();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.productId, expenseEntries, suppliers, productNodes, getProductPath]);


  const columns: TableColumn<ProductPurchaseHistoryItem>[] = [
    { header: 'Data NF', accessor: 'expenseDate', className: 'w-28' },
    { header: 'Fornecedor', accessor: 'supplierName' },
    { header: 'Produto', accessor: 'productName', className: 'truncate max-w-xs' },
    { 
      header: 'Qtd.', 
      accessor: 'quantity', 
      className: 'w-20 text-right' 
    },
    { header: 'Un.', accessor: 'unit', className: 'w-16 text-center' },
    { 
      header: 'Preço Unit. (R$)', 
      accessor: (item) => item.unitPrice.toFixed(2), 
      className: 'w-32 text-right' 
    },
    { 
      header: 'Total Item (R$)', 
      accessor: (item) => item.totalAmount.toFixed(2), 
      className: 'w-32 text-right font-medium' 
    },
  ];

  const handleExport = () => {
    if (!reportData) {
      alert("Não há dados para exportar. Gere o relatório primeiro.");
      return;
    }
    const exportableColumns: ExportColumn<ProductPurchaseHistoryItem>[] = columns.map(col => ({
      header: col.header,
      accessor: col.accessor as ExportColumn<ProductPurchaseHistoryItem>['accessor'],
    }));

    const selectedProductRef = findProductNodeById(productNodes, filters.productId);
    const selectedProductName = selectedProductRef ? selectedProductRef.name : 'produto';
    const filename = `historico_compras_${selectedProductName.replace(/\s+/g, '_')}`;
    exportToCsv(filename, reportData, exportableColumns);
  };


  return (
    <div className="p-6 bg-neutral-bg min-h-full">
       <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primary-dark">Histórico de Compra de Produtos</h1>
        <Button onClick={handleExport} variant="secondary" leftIcon={ICONS.DOWNLOAD} disabled={!reportData}>
            Exportar CSV
        </Button>
      </div>
      
      <div className="bg-neutral-card p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <SelectField
            label="Produto"
            name="productId"
            value={filters.productId}
            onChange={handleFilterChange}
            options={selectableProductOptions.map(opt => ({value: opt.value, label: opt.label}))} // Use options with full path
            containerClassName="md:col-span-2"
            required
          />
          <Button onClick={generateReport} variant="primary" className="h-10 self-end" leftIcon={ICONS.REPORTS}>Gerar Relatório</Button>
        </div>
      </div>

      {reportData ? (
        <Table<ProductPurchaseHistoryItem>
          columns={columns}
          data={reportData}
          emptyStateMessage="Nenhum histórico de compra encontrado para este produto ou filtros selecionados."
        />
      ) : (
        <div className="text-center py-8 text-text-muted bg-neutral-card rounded-lg shadow">
          Selecione um produto e clique em "Gerar Relatório" para visualizar o histórico de compras.
        </div>
      )}
    </div>
  );
};

export default ProductPurchaseHistoryReportPage;