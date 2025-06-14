import React, { useState, useMemo, useEffect, ReactNode } from 'react';
import { useData } from '../../contexts/DataContext';
import { CashAccount, Settlement, ExpenseEntry, RevenueEntry } from '../../types';
import SelectField from '../../components/ui/SelectField';
import InputField from '../../components/ui/InputField';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import { ICONS } from '../../constants';
import { exportToCsv, ExportColumn } from '../../utils/exportCsv';


interface ReportFilters {
  cashAccountCodeId: string;
  startDate: string;
  endDate: string;
}

interface ReportTransaction {
  id: string;
  date: string;
  relatedEntryId: string;
  description: string;
  type: 'Entrada' | 'Saída';
  amount: number;
}

interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
  headerClassName?: string;
}

const CashAccountTransactionsReportPage: React.FC = () => {
  const { cashAccounts, settlements, expenseEntries, revenueEntries } = useData();
  const [filters, setFilters] = useState<ReportFilters>({
    cashAccountCodeId: cashAccounts.length > 0 ? cashAccounts[0].id : '',
    startDate: '',
    endDate: '',
  });
  const [reportData, setReportData] = useState<ReportTransaction[] | null>(null);
  const [summary, setSummary] = useState<{ totalInflows: number; totalOutflows: number; netChange: number } | null>(null);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const generateReport = () => {
    const { cashAccountCodeId, startDate, endDate } = filters;
    if (!cashAccountCodeId) {
      alert("Por favor, selecione uma conta caixa.");
      setReportData(null);
      setSummary(null);
      return;
    }

    const filteredSettlements = settlements.filter(settlement => {
      let matches = settlement.cashAccountCodeId === cashAccountCodeId;
      if (startDate) matches = matches && new Date(settlement.settlementDate) >= new Date(startDate);
      if (endDate) {
         // Add 1 day to endDate to make it inclusive of the selected day
        const inclusiveEndDate = new Date(endDate);
        inclusiveEndDate.setDate(inclusiveEndDate.getDate() + 1);
        matches = matches && new Date(settlement.settlementDate) < inclusiveEndDate;
      }
      return matches;
    });

    let totalInflows = 0;
    let totalOutflows = 0;

    const transactions: ReportTransaction[] = filteredSettlements.map(settlement => {
      let description = settlement.notes || '';
      let type: 'Entrada' | 'Saída';

      if (settlement.entryCategory === 'revenue') {
        type = 'Entrada';
        totalInflows += settlement.amount;
        const relatedRevenue = revenueEntries.find(r => r.id === settlement.entryId);
        description = relatedRevenue?.description || settlement.notes || 'Recebimento';
      } else {
        type = 'Saída';
        totalOutflows += settlement.amount;
        const relatedExpense = expenseEntries.find(e => e.id === settlement.entryId);
        description = relatedExpense?.description || settlement.notes || 'Pagamento';
      }

      return {
        id: settlement.id,
        date: new Date(settlement.settlementDate).toLocaleDateString('pt-BR'),
        relatedEntryId: settlement.entryId.substring(0,8),
        description,
        type,
        amount: settlement.amount,
      };
    }).sort((a,b) => new Date(b.date.split('/').reverse().join('-')).getTime() - new Date(a.date.split('/').reverse().join('-')).getTime()); // Sort by date descending

    setReportData(transactions);
    setSummary({
      totalInflows,
      totalOutflows,
      netChange: totalInflows - totalOutflows,
    });
  };
  
  useEffect(() => {
    if (filters.cashAccountCodeId) {
      generateReport();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.cashAccountCodeId, filters.startDate, filters.endDate, settlements, expenseEntries, revenueEntries]);

  const columns: TableColumn<ReportTransaction>[] = [
    { header: 'Data', accessor: 'date', className: 'w-28' },
    { header: 'ID Lanç. Origem', accessor: 'relatedEntryId', className: 'w-32 font-mono text-xs' },
    { header: 'Descrição', accessor: 'description', className: 'truncate max-w-sm' },
    { 
      header: 'Tipo', 
      accessor: (item: ReportTransaction) => (
        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
          item.type === 'Entrada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {item.type}
        </span>
      ),
      className: 'w-24 text-center'
    },
    { 
      header: 'Valor (R$)', 
      accessor: (item: ReportTransaction) => item.amount.toFixed(2),
      className: 'w-32 text-right font-medium' // Color is handled by accessor in export version
    },
  ];
  
  const handleExport = () => {
    if (!reportData) {
      alert("Não há dados para exportar. Gere o relatório primeiro.");
      return;
    }
    const exportableColumns: ExportColumn<ReportTransaction>[] = columns.map(col => ({
      header: col.header,
      accessor: col.accessor as ExportColumn<ReportTransaction>['accessor'],
    }));
    // Specific accessor for 'Valor (R$)' to ensure correct sign for export
    const valueColumnIndex = exportableColumns.findIndex(col => col.header === 'Valor (R$)');
    if (valueColumnIndex !== -1) {
        exportableColumns[valueColumnIndex].accessor = (item: ReportTransaction) => 
            `${item.type === 'Entrada' ? '' : '-'}${item.amount.toFixed(2)}`;
    }

    const selectedAccountName = cashAccounts.find(ca => ca.id === filters.cashAccountCodeId)?.name || 'conta_caixa';
    const filename = `transacoes_${selectedAccountName.replace(/\s+/g, '_')}`;
    exportToCsv(filename, reportData, exportableColumns);
  };

  const selectedAccount = cashAccounts.find(ca => ca.id === filters.cashAccountCodeId);

  return (
    <div className="p-6 bg-neutral-bg min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primary-dark">Relatório de Transações da Conta Caixa</h1>
         <Button onClick={handleExport} variant="secondary" leftIcon={ICONS.DOWNLOAD} disabled={!reportData}>
            Exportar CSV
        </Button>
      </div>
      
      <div className="bg-neutral-card p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <SelectField
            label="Conta Caixa"
            name="cashAccountCodeId"
            value={filters.cashAccountCodeId}
            onChange={handleFilterChange}
            options={cashAccounts.map(ca => ({ value: ca.id, label: ca.name }))}
            required
          />
          <InputField
            label="Data Início"
            name="startDate"
            type="date"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
          <InputField
            label="Data Fim"
            name="endDate"
            type="date"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
          <Button onClick={generateReport} variant="primary" className="h-10">Gerar Relatório</Button>
        </div>
      </div>

      {reportData ? (
        <>
          <Table<ReportTransaction>
            columns={columns.map(c => {
                if(c.header === 'Valor (R$)') { // Custom rendering for display table
                    return {
                        ...c,
                        accessor: (item: ReportTransaction) => (
                            <span className={`${item.type === 'Entrada' ? 'text-green-600' : 'text-red-600'}`}>
                              {item.amount.toFixed(2)}
                            </span>
                          ),
                    }
                }
                return c;
            })}
            data={reportData}
            emptyStateMessage="Nenhuma transação encontrada para os filtros selecionados."
          />
          {summary && reportData.length > 0 && (
            <div className="mt-6 bg-neutral-card p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-primary-dark mb-3">Resumo do Período</h3>
              {selectedAccount && <p className="text-sm text-text-muted">Conta Caixa: <span className="font-medium text-text-dark">{selectedAccount.name}</span></p>}
              <p className="text-sm text-text-muted">Período: <span className="font-medium text-text-dark">{filters.startDate ? new Date(filters.startDate).toLocaleDateString('pt-BR') : 'Início'} - {filters.endDate ? new Date(filters.endDate).toLocaleDateString('pt-BR') : 'Fim'}</span></p>
              <div className="mt-2 space-y-1">
                <p className="text-sm">Total Entradas: <span className="font-semibold text-green-600">R$ {summary.totalInflows.toFixed(2)}</span></p>
                <p className="text-sm">Total Saídas: <span className="font-semibold text-red-600">R$ {summary.totalOutflows.toFixed(2)}</span></p>
                <p className="text-sm">Movimentação Líquida: 
                  <span className={`font-semibold ${summary.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                     R$ {summary.netChange.toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-text-muted bg-neutral-card rounded-lg shadow">
          Selecione uma conta caixa e clique em "Gerar Relatório" para visualizar as transações.
        </div>
      )}
    </div>
  );
};

export default CashAccountTransactionsReportPage;