import React from 'react';
import { HashRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import Header from './components/layout/Header';
import Sidebar, { AdminSidebar } from './components/layout/Sidebar'; // AdminSidebar is used for /admin/* routes
import DashboardPage from './pages/DashboardPage';

// Admin/Cadastros Pages
import CostCentersPage from './pages/admin/CostCentersPage';
import ProjectsPage from './pages/admin/ProjectsPage';
import SuppliersPage from './pages/admin/SuppliersPage';
import CustomersPage from './pages/admin/CustomersPage';
import CashAccountsPage from './pages/admin/CashAccountsPage';
import RevenueCategoriesPage from './pages/admin/RevenueCategoriesPage';
import ProductsPage from './pages/admin/ProductsPage'; // New Page

// Expense Pages
import NewExpensePage from './pages/expenses/NewExpensePage';
import ExpenseListPage from './pages/expenses/ExpenseListPage';

// Revenue Pages
import NewRevenuePage from './pages/revenue/NewRevenuePage';
import RevenueListPage from './pages/revenue/RevenueListPage';

// Report Pages
import ProjectBudgetReportPage from './pages/reports/ProjectBudgetReportPage';
import CashAccountTransactionsReportPage from './pages/reports/CashAccountTransactionsReportPage';
import CashFlowReportPage from './pages/reports/CashFlowReportPage'; // Updated
import ProductPurchaseHistoryReportPage from './pages/reports/ProductPurchaseHistoryReportPage'; // New Page


const MainLayout: React.FC = () => (
  <div className="flex min-h-screen bg-neutral-bg">
    <Sidebar />
    <div className="flex-1 flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  </div>
);

// This layout is for /admin/* routes, conceptually "Cadastros"
const AdminSectionLayout: React.FC = () => ( 
  <div className="flex flex-1">
    <AdminSidebar /> {/* This sidebar contains items like Projects, Suppliers, Products etc. */}
    <div className="flex-1 overflow-y-auto bg-neutral-bg">
      <Outlet />
    </div>
  </div>
);


const App: React.FC = () => {
  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            
            {/* "Cadastros" section, internally routed via /admin */}
            <Route path="admin" element={<AdminSectionLayout />}> 
              <Route index element={<Navigate to="projects" replace />} /> {/* Default to projects */}
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="suppliers" element={<SuppliersPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="cash-accounts" element={<CashAccountsPage />} />
              <Route path="revenue-categories" element={<RevenueCategoriesPage />} />
              <Route path="cost-centers" element={<CostCentersPage />} />
              <Route path="products" element={<ProductsPage />} /> {/* New products route */}
            </Route>

            <Route path="expenses">
              <Route index element={<ExpenseListPage />} />
              <Route path="new" element={<NewExpensePage />} />
            </Route>

            <Route path="revenue">
              <Route index element={<RevenueListPage />} />
              <Route path="new" element={<NewRevenuePage />} />
            </Route>

            <Route path="reports">
              <Route index element={<Navigate to="project-budget" replace />} />
              <Route path="project-budget" element={<ProjectBudgetReportPage />} />
              <Route path="cash-account-transactions" element={<CashAccountTransactionsReportPage />} />
              <Route path="cash-flow" element={<CashFlowReportPage />} />
              <Route path="product-purchase-history" element={<ProductPurchaseHistoryReportPage />} /> {/* New report route */}
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} /> {/* Fallback route */}
          </Route>
        </Routes>
      </HashRouter>
    </DataProvider>
  );
};

export default App;
