import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { ICONS } from '../constants';
import { EntryStatus } from '../types';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; linkTo?: string; bgColorClass?: string; textColorClass?: string; }> = 
({ title, value, icon, linkTo, bgColorClass = 'bg-primary-dark', textColorClass = 'text-white' }) => {
  const content = (
    <div className={`${bgColorClass} ${textColorClass} p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between h-full`}>
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <span className="text-2xl">{icon}</span>
        </div>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      {linkTo && <div className="mt-4 text-sm font-medium">Ver Detalhes &rarr;</div>}
    </div>
  );
  return linkTo ? <Link to={linkTo} className="block h-full">{content}</Link> : <div className="h-full">{content}</div>;
};


const DashboardPage: React.FC = () => {
  const { projects, expenseEntries, revenueEntries } = useData();

  const totalProjects = projects.length;
  const totalExpenses = expenseEntries.reduce((sum, entry) => sum + entry.totalAmount, 0);
  const unpaidExpenses = expenseEntries
    .filter(e => e.status === EntryStatus.UNPAID || e.status === EntryStatus.PARTIALLY_PAID)
    .reduce((sum, entry) => sum + (entry.totalAmount - entry.settledAmount), 0);
  
  const totalRevenue = revenueEntries.reduce((sum, entry) => sum + entry.totalAmount, 0);
  const unreceivedRevenue = revenueEntries
    .filter(e => e.status === EntryStatus.UNRECEIVED || e.status === EntryStatus.PARTIALLY_RECEIVED)
    .reduce((sum, entry) => sum + (entry.totalAmount - entry.settledAmount), 0);


  return (
    <div className="p-6 bg-neutral-bg min-h-full">
      <h1 className="text-3xl font-semibold text-primary-dark mb-8">Painel Principal</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Obras Ativas" value={totalProjects} icon={ICONS.PROJECTS} linkTo="/admin/projects" />
        <StatCard title="Despesas Totais" value={`R$${totalExpenses.toFixed(2)}`} icon={ICONS.EXPENSES} linkTo="/expenses" bgColorClass="bg-red-500" />
        <StatCard title="Despesas em Aberto" value={`R$${unpaidExpenses.toFixed(2)}`} icon={ICONS.EXPENSES} linkTo="/expenses" bgColorClass="bg-red-700" />
        <StatCard title="Receitas Totais" value={`R$${totalRevenue.toFixed(2)}`} icon={ICONS.REVENUE} linkTo="/revenue" bgColorClass="bg-green-500" />
        <StatCard title="Receitas a Receber" value={`R$${unreceivedRevenue.toFixed(2)}`} icon={ICONS.REVENUE} linkTo="/revenue" bgColorClass="bg-green-700" />
        <StatCard title="Extrato Conta Caixa" value="Consultar" icon={ICONS.CASH_ACCOUNTS} linkTo="/reports/cash-account-transactions" bgColorClass="bg-blue-500" />

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-neutral-card p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-primary-dark mb-4">Ações Rápidas</h2>
          <div className="space-y-3">
            <Link to="/expenses/new" className="block w-full text-center px-4 py-3 bg-secondary-accent text-white rounded-md hover:bg-opacity-90 transition-colors">
              Novo Lançamento de Despesa
            </Link>
            <Link to="/revenue/new" className="block w-full text-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              Novo Lançamento de Receita
            </Link>
             <Link to="/admin/cost-centers" className="block w-full text-center px-4 py-3 bg-primary-dark text-white rounded-md hover:bg-opacity-90 transition-colors">
              Gerenciar Centros de Custo
            </Link>
          </div>
        </div>
        
        <div className="bg-neutral-card p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-primary-dark mb-4">Atividade Recente (Exemplo)</h2>
          <ul className="space-y-2 text-sm text-text-muted">
            <li>- Despesa #DESP001 da Obra Sky Tower marcada como PAGA.</li>
            <li>- Nova Obra "Villas Vista Mar" adicionada.</li>
            <li>- Receita #REC003 recebida para Escritório Central.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;