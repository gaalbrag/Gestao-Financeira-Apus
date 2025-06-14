import React, { useState, useMemo, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { ExpenseEntry, EntryStatus } from '../../types';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import SettlementModal from './SettlementModal';
import { ICONS } from '../../constants';
import { exportToCsv, ExportColumn } from '../../utils/exportCsv';


interface TableColumn<T> { // Keep original Table's Column type if it's different
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
  headerClassName?: string;
}

const ExpenseListPage: React.FC = () => {
  const navigate = useNavigate();
  const { expenseEntries, projects, suppliers } = useData(); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ExpenseEntry | null>(null);

  const handleSettleClick = (entry: ExpenseEntry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: EntryStatus) => {
    switch (status) {
      case EntryStatus.PAID: return 'bg-green-100 text-green-700';
      case EntryStatus.PARTIALLY_PAID: return 'bg-yellow-100 text-yellow-700';
      case EntryStatus.UNPAID: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const columns: TableColumn<ExpenseEntry>[] = useMemo(() => [
    { header: 'ID', accessor: (item: ExpenseEntry) => <span className="font-mono text-xs">{item.id.substring(0,8)}</span> },
    { header: 'Data Emissão', accessor: (item: ExpenseEntry) => new Date(item.issueDate).toLocaleDateString('pt-BR') },
    { header: 'Obra', accessor: (item: ExpenseEntry) => projects.find(p => p.id === item.projectId)?.name || 'N/A' },
    { header: 'Fornecedor', accessor: (item: ExpenseEntry) => suppliers.find(s => s.id === item.supplierId)?.name || 'N/A' },
    { header: 'Descrição', accessor: (item: ExpenseEntry) => item.description, className: 'truncate max-w-xs' },
    { header: 'Valor Total (R$)', accessor: (item: ExpenseEntry) => item.totalAmount.toFixed(2) },
    { header: 'Liquidado (R$)', accessor: (item: ExpenseEntry) => item.settledAmount.toFixed(2) },
    { 
      header: 'Situação', 
      accessor: (item: ExpenseEntry) => (
        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
          {item.status}
        </span>
      ) 
    },
    {
      header: 'Ações',
      accessor: (item: ExpenseEntry) => (
        <div className="space-x-2">
          <Button 
            variant="accent" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); handleSettleClick(item); }}
            disabled={item.status === EntryStatus.PAID}
            leftIcon={ICONS.PAY}
          >
            Baixar
          </Button>
          {/* Adicionar botões Editar/Ver aqui se necessário */}
        </div>
      ),
    },
  ], [projects, suppliers]);

  const handleExport = () => {
    const exportableColumns: ExportColumn<ExpenseEntry>[] = columns
      .filter(col => col.header !== 'Ações') // Exclude non-data columns
      .map(col => ({
        header: col.header,
        // If accessor is a string key, it's fine. If it's a function, exportToCsv will handle it.
        accessor: col.accessor as ExportColumn<ExpenseEntry>['accessor'], // Type assertion
      }));
    exportToCsv('lista_despesas', expenseEntries, exportableColumns);
  };

  return (
    <div className="p-6 bg-neutral-bg min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primary-dark">Contas a Pagar</h1>
        <div className="flex space-x-2">
            <Button onClick={handleExport} variant="secondary" leftIcon={ICONS.DOWNLOAD}>
                Exportar CSV
            </Button>
            <Button onClick={() => navigate('/expenses/new')} variant="primary" leftIcon={ICONS.ADD}>
            Nova Despesa
            </Button>
        </div>
      </div>

      <Table<ExpenseEntry>
        columns={columns}
        data={expenseEntries}
        emptyStateMessage="Nenhum lançamento de despesa encontrado. Clique em 'Nova Despesa' para adicionar."
      />

      {selectedEntry && (
        <SettlementModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedEntry(null); }}
          entry={selectedEntry}
          entryCategory="expense"
        />
      )}
    </div>
  );
};

export default ExpenseListPage;