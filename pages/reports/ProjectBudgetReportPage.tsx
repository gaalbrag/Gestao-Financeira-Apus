import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { Project, CostCenterNode, ExpenseEntry, CostCenterSummary } from '../../types';
import SelectField from '../../components/ui/SelectField';
import InputField from '../../components/ui/InputField';
import Button from '../../components/ui/Button';
import { ICONS } from '../../constants';
import { exportToCsv, ExportColumn } from '../../utils/exportCsv';

interface ReportFilters {
  projectId: string;
  startDate: string;
  endDate: string;
}

const CostCenterSummaryRow: React.FC<{ node: CostCenterSummary; level: number }> = ({ node, level }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <>
      <tr className={`${level % 2 === 0 ? 'bg-gray-50' : 'bg-neutral-card'} hover:bg-gray-100`}>
        <td className="px-6 py-3 whitespace-nowrap text-sm text-text-dark" style={{ paddingLeft: `${1.5 + level * 1.5}rem` }}>
          <div className="flex items-center">
            {hasChildren && (
              <button onClick={() => setIsExpanded(!isExpanded)} className="mr-2 text-primary-dark p-0.5 rounded hover:bg-gray-200">
                {isExpanded ? ICONS.CHEVRON_DOWN : ICONS.CHEVRON_RIGHT}
              </button>
            )}
            {node.name}
             {node.isLaunchable && <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">L</span>}
          </div>
        </td>
        <td className="px-6 py-3 whitespace-nowrap text-sm text-text-dark text-right font-medium">
          R${node.totalExpenses.toFixed(2)}
        </td>
      </tr>
      {isExpanded && hasChildren && node.children.map(child => (
        <CostCenterSummaryRow key={child.id} node={child} level={level + 1} />
      ))}
    </>
  );
};

interface FlatCostCenterSummary {
  id: string;
  path: string;
  name: string;
  isLaunchable: boolean;
  totalExpenses: number;
  level: number;
}

const flattenReportDataForExport = (nodes: CostCenterSummary[], level = 0, parentPath = ''): FlatCostCenterSummary[] => {
  let flatList: FlatCostCenterSummary[] = [];
  for (const node of nodes) {
    const currentPath = parentPath ? `${parentPath} / ${node.name}` : node.name;
    flatList.push({
      id: node.id,
      path: currentPath,
      name: node.name,
      isLaunchable: node.isLaunchable,
      totalExpenses: node.totalExpenses,
      level,
    });
    if (node.children && node.children.length > 0) {
      flatList = flatList.concat(flattenReportDataForExport(node.children, level + 1, currentPath));
    }
  }
  return flatList;
};


const ProjectBudgetReportPage: React.FC = () => {
  const { projects, costCenters, expenseEntries } = useData();
  const [filters, setFilters] = useState<ReportFilters>({
    projectId: projects.length > 0 ? projects[0].id : '',
    startDate: '',
    endDate: '',
  });
  const [reportData, setReportData] = useState<CostCenterSummary[] | null>(null);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const generateReport = () => {
    const { projectId, startDate, endDate } = filters;
    if (!projectId) {
      alert("Por favor, selecione uma obra.");
      return;
    }

    const filteredExpenses = expenseEntries.filter(entry => {
      let matches = entry.projectId === projectId;
      if (startDate) matches = matches && new Date(entry.issueDate) >= new Date(startDate);
      if (endDate) {
        const inclusiveEndDate = new Date(endDate);
        inclusiveEndDate.setDate(inclusiveEndDate.getDate() + 1);
        matches = matches && new Date(entry.issueDate) < inclusiveEndDate;
      }
      return matches;
    });

    const aggregateExpenses = (nodes: CostCenterNode[]): CostCenterSummary[] => {
      return nodes.map(node => {
        const calculateNodeTotal = (currentNode: CostCenterNode): number => {
            let directSum = 0;
            if (currentNode.isLaunchable) { // Only sum for launchable nodes directly, children sums are separate
                filteredExpenses.forEach(entry => {
                    entry.lineItems.forEach(item => {
                        if (item.costCenterId === currentNode.id) {
                            directSum += item.amount;
                        }
                    });
                });
            }
            
            let childrenSum = 0;
            if (currentNode.children && currentNode.children.length > 0) {
                 childrenSum = currentNode.children.reduce((sum, child) => sum + calculateNodeTotal(child), 0);
            }
            return directSum + childrenSum;
        };
        
        const nodeTotal = calculateNodeTotal(node);

        return {
          ...node,
          totalExpenses: nodeTotal,
          children: node.children ? aggregateExpenses(node.children) : [],
        };
      });
    };
    
    setReportData(aggregateExpenses(costCenters));
  };
  
  useEffect(() => { 
    if (filters.projectId) {
        generateReport();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.projectId, filters.startDate, filters.endDate, expenseEntries, costCenters]);

  const handleExport = () => {
    if (!reportData) {
      alert("Não há dados para exportar. Gere o relatório primeiro.");
      return;
    }
    const flatData = flattenReportDataForExport(reportData);
    const exportColumns: ExportColumn<FlatCostCenterSummary>[] = [
      { header: 'Caminho Completo', accessor: (item) => item.path },
      { header: 'Nome Centro de Custo', accessor: (item) => item.name },
      { header: 'É Lançável?', accessor: (item) => item.isLaunchable ? 'Sim' : 'Não'},
      { header: 'Nível', accessor: (item) => item.level.toString() },
      { header: 'Despesas Totais (R$)', accessor: (item) => item.totalExpenses.toFixed(2) },
    ];
    const selectedProject = projects.find(p => p.id === filters.projectId);
    const filename = `analise_orcamentaria_${selectedProject ? selectedProject.name.replace(/\s+/g, '_') : 'obra'}`;
    exportToCsv(filename, flatData, exportColumns);
  };

  return (
    <div className="p-6 bg-neutral-bg min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primary-dark">Análise Orçamentária da Obra</h1>
        <Button onClick={handleExport} variant="secondary" leftIcon={ICONS.DOWNLOAD} disabled={!reportData}>
            Exportar CSV
        </Button>
      </div>
      
      <div className="bg-neutral-card p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <SelectField
            label="Obra"
            name="projectId"
            value={filters.projectId}
            onChange={handleFilterChange}
            options={projects.map(p => ({ value: p.id, label: p.name }))}
            required
          />
          <InputField
            label="Data Início (Emissão NF)"
            name="startDate"
            type="date"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
          <InputField
            label="Data Fim (Emissão NF)"
            name="endDate"
            type="date"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
          <Button onClick={generateReport} variant="primary" className="h-10">Gerar Relatório</Button>
        </div>
      </div>

      {reportData ? (
        <div className="bg-neutral-card shadow-md rounded-lg overflow-hidden border border-neutral-light-gray">
          <table className="min-w-full divide-y divide-neutral-light-gray">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Centro de Custo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Despesas Totais (R$)</th>
              </tr>
            </thead>
            <tbody className="bg-neutral-card divide-y divide-neutral-light-gray">
              {reportData.length > 0 ? reportData.map(node => (
                <CostCenterSummaryRow key={node.id} node={node} level={0} />
              )) : (
                <tr><td colSpan={2} className="text-center py-4 text-text-muted">Nenhum dado para os filtros selecionados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-text-muted py-8">Selecione os filtros e clique em "Gerar Relatório" para visualizar os dados.</p>
      )}
    </div>
  );
};

export default ProjectBudgetReportPage;