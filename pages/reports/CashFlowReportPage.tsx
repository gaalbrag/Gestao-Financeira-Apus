import React, { useState, useMemo, useEffect, ReactNode } from 'react';
import { useData } from '../../contexts/DataContext';
import { CashAccount, Settlement, ExpenseEntry, RevenueEntry, CashFlowReportTransaction } from '../../types';
import SelectField from '../../components/ui/SelectField';
import InputField from '../../components/ui/InputField';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table'; // Assuming Table can handle CashFlowReportTransaction type
import { ICONS } from '../../constants';
import { exportToCsv, ExportColumn } from '../../utils/exportCsv';


interface ReportFilters {
  cashAccountCodeId: string;
  startDate: string;
  endDate: string;
}

interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
  headerClassName?: string;
}

const CashFlowReportPage: React.FC = () => {
  const { cashAccounts, settlements, expenseEntries, revenueEntries } = useData();
  const [filters, setFilters] = useState<ReportFilters>({
    cashAccountCodeId: cashAccounts.length > 0 ? cashAccounts[0].id : '',
    startDate: '',
    endDate: '',
  });
  
  const [reportData, setReportData] = useState<CashFlowReportTransaction[] | null>(null);
  const [summary, setSummary] = useState<{
    openingBalance: number;
    totalInflows: number;
    totalOutflows: number;
    closingBalance: number;
    netChange: number;
  } | null>(null);

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

    // Calculate Opening Balance
    let openingBalance = 0;
    const prePeriodSettlements = settlements.filter(s => {
      let matches = s.cashAccountCodeId === cashAccountCodeId;
      if (startDate) {
        matches = matches && new Date(s.settlementDate) < new Date(startDate);
      } else { // If no start date, consider all settlements before today for opening balance (might need adjustment based on exact requirement)
         matches = matches && new Date(s.settlementDate) < new Date(new Date().setHours(0,0,0,0)); // beginning of today
      }
      return matches;
    });

    prePeriodSettlements.forEach(s => {
      if (s.entryCategory === 'revenue') {
        openingBalance += s.amount;
      } else {
        openingBalance -= s.amount;
      }
    });

    // Filter settlements for the selected period
    const periodSettlements = settlements.filter(s => {
      let matches = s.cashAccountCodeId === cashAccountCodeId;
      if (startDate) matches = matches && new Date(s.settlementDate) >= new Date(startDate);
      if (endDate) {
        const inclusiveEndDate = new Date(endDate);
        inclusiveEndDate.setDate(inclusiveEndDate.getDate() + 1); // Make endDate inclusive
        matches = matches && new Date(s.settlementDate) < inclusiveEndDate;
      }
      return matches;
    }).sort((a, b) => new Date(a.settlementDate).getTime() - new Date(b.settlementDate).getTime()); // Sort by date ascending

    let currentRunningBalance = openingBalance;
    let totalInflows = 0;
    let totalOutflows = 0;

    const transactions: CashFlowReportTransaction[] = periodSettlements.map(settlement => {
      let description = settlement.notes || '';
      let inflow = 0;
      let outflow = 0;

      if (settlement.entryCategory === 'revenue') {
        inflow = settlement.amount;
        totalInflows += settlement.amount;
        const relatedRevenue = revenueEntries.find(r => r.id === settlement.entryId);
        description = `Receita: ${relatedRevenue?.description || settlement.notes || 'Recebimento Diversos'}`;
      } else { // expense
        outflow = settlement.amount;
        totalOutflows += settlement.amount;
        const relatedExpense = expenseEntries.find(e => e.id === settlement.entryId);
        description = `Despesa: ${relatedExpense?.description || settlement.notes || 'Pagamento Diversos'}`;
      }
      currentRunningBalance += inflow - outflow;

      return {
        id: settlement.id,
        date: new Date(settlement.settlementDate).toLocaleDateString('pt-BR'),
        relatedEntryId: settlement.entryId.substring(0,8),
        description,
        inflow,
        outflow,
        runningBalance: currentRunningBalance,
      };
    });
    
    setReportData(transactions);
    setSummary({
      openingBalance,
      totalInflows,
      totalOutflows,
      closingBalance: currentRunningBalance,
      netChange: totalInflows - totalOutflows,
    });
  };
  
  useEffect(() => {
    if (filters.cashAccountCodeId) {
      generateReport();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.cashAccountCodeId, filters.startDate, filters.endDate, settlements, expenseEntries, revenueEntries, cashAccounts]);


  const columns: TableColumn<CashFlowReportTransaction>[] = [
    { header: 'Data', accessor: 'date', className: 'w-28' },
    { header: 'Descrição', accessor: 'description', className: 'truncate max-w-md' },
    { 
      header: 'Entrada (R$)', 
      accessor: (item) => item.inflow > 0 ? item.inflow.toFixed(2) : '-',
      className: 'w-32 text-right text-green-600 font-medium'
    },
    { 
      header: 'Saída (R$)', 
      accessor: (item) => item.outflow > 0 ? item.outflow.toFixed(2) : '-',
      className: 'w-32 text-right text-red-600 font-medium'
    },
    { 
      header: 'Saldo (R$)', 
      accessor: (item) => item.runningBalance.toFixed(2),
      className: 'w-32 text-right font-semibold'
    },
  ];

  const handleExport = () => {
    if (!reportData || !summary) {
        alert("Não há dados para exportar. Gere o relatório primeiro.");
        return;
    }

    const exportableReportData: ExportColumn<CashFlowReportTransaction>[] = columns.map(col => ({
        header: col.header,
        accessor: col.accessor as ExportColumn<CashFlowReportTransaction>['accessor'],
    }));

    // Prepare summary data for CSV
    const summaryRows = [
        { field: "Saldo Anterior", value: summary.openingBalance.toFixed(2) },
        { field: "Total Entradas", value: summary.totalInflows.toFixed(2) },
        { field: "Total Saídas", value: summary.totalOutflows.toFixed(2) },
        { field: "Saldo Atual", value: summary.closingBalance.toFixed(2) },
        { field: "Movimentação Líquida", value: summary.netChange.toFixed(2) },
    ];
    
    // Create CSV content manually
    let csvContent = "\uFEFF"; // BOM for UTF-8
    // Summary Headers
    csvContent += "Campo,Valor\n";
    summaryRows.forEach(row => {
        csvContent += `"${row.field}","${row.value}"\n`;
    });
    csvContent += "\n"; // Spacer

    // Table Headers
    csvContent += exportableReportData.map(col => `"${col.header.replace(/"/g, '""')}"`).join(',') + '\n';
    
    // Table Data
    reportData.forEach(transaction => {
        const row = exportableReportData.map(col => {
            let cellValue: any;
             if (typeof col.accessor === 'function') {
                cellValue = (col.accessor as (item: CashFlowReportTransaction) => ReactNode)(transaction);
                // Basic text extraction for ReactNode, might need more robust solution
                if(typeof cellValue === 'object' && cellValue !== null && 'props' in cellValue) cellValue = cellValue.props.children;

             } else {
                cellValue = transaction[col.accessor as keyof CashFlowReportTransaction];
             }
             const stringValue = String(cellValue === null || typeof cellValue === 'undefined' ? '' : cellValue);
             if (stringValue.includes(',')) return `"${stringValue.replace(/"/g, '""')}"`;
             return stringValue;
        }).join(',');
        csvContent += row + '\n';
    });
    
    const selectedAccountName = cashAccounts.find(ca => ca.id === filters.cashAccountCodeId)?.name || 'fluxo_caixa';
    const filename = `fluxo_caixa_${selectedAccountName.replace(/\s+/g, '_')}.csv`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } else {
        alert("Seu navegador não suporta downloads diretos.");
    }
  };


  const selectedAccount = cashAccounts.find(ca => ca.id === filters.cashAccountCodeId);

  return (
    <div className="p-6 bg-neutral-bg min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primary-dark">Relatório de Fluxo de Caixa</h1>
        <Button onClick={handleExport} variant="secondary" leftIcon={ICONS.DOWNLOAD} disabled={!reportData || !summary}>
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
          <Button onClick={generateReport} variant="primary" className="h-10 self-end" leftIcon={ICONS.REPORTS}>Gerar Relatório</Button>
        </div>
      </div>

      {reportData && summary ? (
        <>
          <div className="mb-6 bg-neutral-card p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-primary-dark mb-3">Resumo do Fluxo de Caixa</h3>
              {selectedAccount && <p className="text-sm text-text-muted">Conta Caixa: <span className="font-medium text-text-dark">{selectedAccount.name}</span></p>}
              <p className="text-sm text-text-muted">Período: <span className="font-medium text-text-dark">{filters.startDate ? new Date(filters.startDate).toLocaleDateString('pt-BR') : 'Desde o Início'} - {filters.endDate ? new Date(filters.endDate).toLocaleDateString('pt-BR') : 'Até Hoje'}</span></p>
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                    <p className="text-xs text-text-muted">Saldo Anterior</p>
                    <p className="text-lg font-semibold text-primary-dark">R$ {summary.openingBalance.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-xs text-text-muted">Total Entradas</p>
                    <p className="text-lg font-semibold text-green-600">R$ {summary.totalInflows.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-xs text-text-muted">Total Saídas</p>
                    <p className="text-lg font-semibold text-red-600">R$ {summary.totalOutflows.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-xs text-text-muted">Saldo Atual</p>
                    <p className="text-lg font-semibold text-primary-dark">R$ {summary.closingBalance.toFixed(2)}</p>
                </div>
              </div>
          </div>

          <Table<CashFlowReportTransaction>
            columns={columns}
            data={reportData}
            emptyStateMessage="Nenhuma transação encontrada para os filtros selecionados."
          />
        </>
      ) : (
        <div className="text-center py-8 text-text-muted bg-neutral-card rounded-lg shadow">
          Selecione uma conta caixa e um período, depois clique em "Gerar Relatório" para visualizar o fluxo de caixa.
        </div>
      )}
    </div>
  );
};

export default CashFlowReportPage;