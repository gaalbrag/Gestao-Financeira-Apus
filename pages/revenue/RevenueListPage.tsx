import React, { useState, useMemo, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { RevenueEntry, EntryStatus } from '../../types';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import SettlementModal from '../expenses/SettlementModal'; // Reusing the same modal
import { ICONS } from '../../constants';
import { exportToCsv, ExportColumn } from '../../utils/exportCsv';

interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
  headerClassName?: string;
}

const RevenueListPage: React.FC = () => {
  const navigate = useNavigate();
  const { revenueEntries, projects, customers } = useData(); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<RevenueEntry | null>(null);

  const handleSettleClick = (entry: RevenueEntry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: EntryStatus) => {
    switch (status) {
      case EntryStatus.RECEIVED: return 'bg-green-100 text-green-700';
      case EntryStatus.PARTIALLY_RECEIVED: return 'bg-yellow-100 text-yellow-700';
      case EntryStatus.UNRECEIVED: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const columns: TableColumn<RevenueEntry>[] = useMemo(() => [
    { header: 'ID', accessor: (item: RevenueEntry) => <span className="font-mono text-xs">{item.id.substring(0,8)}</span> },
    { header: 'Data Emissão', accessor: (item: RevenueEntry) => new Date(item.issueDate).toLocaleDateString('pt-BR') },
    { header: 'Obra', accessor: (item: RevenueEntry) => projects.find(p => p.id === item.projectId)?.name || 'N/A' },
    { header: 'Cliente', accessor: (item: RevenueEntry) => customers.find(c => c.id === item.customerId)?.name || 'N/A' },
    { header: 'Descrição', accessor: (item: RevenueEntry) => item.description, className: 'truncate max-w-xs' },
    { header: 'Valor Total (R$)', accessor: (item: RevenueEntry) => item.totalAmount.toFixed(2) },
    { header: 'Recebido (R$)', accessor: (item: RevenueEntry) => item.settledAmount.toFixed(2) },
    { 
      header: 'Situação', 
      accessor: (item: RevenueEntry) => (
        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
          {item.status}
        </span>
      ) 
    },
    {
      header: 'Ações',
      accessor: (item: RevenueEntry) => (
        <div className="space-x-2">
          <Button 
            variant="accent" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); handleSettleClick(item); }}
            disabled={item.status === EntryStatus.RECEIVED}
            leftIcon={ICONS.PAY} // Using PAY icon, can be changed to a specific "receive" icon if available
          >
            Baixar
          </Button>
          {/* Adicionar botões Editar/Ver aqui se necessário */}
        </div>
      ),
    },
  ], [projects, customers]);

  const handleExport = () => {
    const exportableColumns: ExportColumn<RevenueEntry>[] = columns
      .filter(col => col.header !== 'Ações')
      .map(col => ({
        header: col.header,
        accessor: col.accessor as ExportColumn<RevenueEntry>['accessor'],
      }));
    exportToCsv('lista_receitas', revenueEntries, exportableColumns);
  };

  return (
    <div className="p-6 bg-neutral-bg min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primary-dark">Contas a Receber</h1>
        <div className="flex space-x-2">
            <Button onClick={handleExport} variant="secondary" leftIcon={ICONS.DOWNLOAD}>
                Exportar CSV
            </Button>
            <Button onClick={() => navigate('/revenue/new')} variant="primary" leftIcon={ICONS.ADD}>
            Nova Receita
            </Button>
        </div>
      </div>

      <Table<RevenueEntry>
        columns={columns}
        data={revenueEntries}
        emptyStateMessage="Nenhum lançamento de receita encontrado. Clique em 'Nova Receita' para adicionar."
      />

      {selectedEntry && (
        <SettlementModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedEntry(null); }}
          entry={selectedEntry}
          entryCategory="revenue" // Important: set category to 'revenue'
        />
      )}
    </div>
  );
};

export default RevenueListPage;