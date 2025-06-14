import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NavItem } from '../../types';
import { ICONS } from '../../constants';

const reportSubNavItems: NavItem[] = [
  { name: 'Análise Orçamentária', path: '/reports/project-budget', icon: ICONS.REPORTS },
  { name: 'Extrato Conta Caixa', path: '/reports/cash-account-transactions', icon: ICONS.CASH_ACCOUNTS },
  { name: 'Fluxo de Caixa', path: '/reports/cash-flow', icon: ICONS.REPORTS },
  { name: 'Hist. Compra Produtos', path: '/reports/product-purchase-history', icon: ICONS.PRODUCTS },
];

const mainNavItems: NavItem[] = [
  { name: 'Painel', path: '/', icon: ICONS.DASHBOARD },
  { name: 'Cadastros', path: '/admin', icon: ICONS.ADMIN }, // Changed from Admin to Cadastros
  { name: 'Despesas', path: '/expenses', icon: ICONS.EXPENSES },
  { name: 'Receitas', path: '/revenue', icon: ICONS.REVENUE },
  { 
    name: 'Relatórios', 
    path: '/reports', 
    icon: ICONS.REPORTS,
    children: reportSubNavItems
  },
];

export const registrationsNavItems: NavItem[] = [ // Renamed from adminNavItems
  { name: 'Obras', path: '/admin/projects', icon: ICONS.PROJECTS },
  { name: 'Fornecedores', path: '/admin/suppliers', icon: ICONS.SUPPLIERS },
  { name: 'Clientes', path: '/admin/customers', icon: ICONS.CUSTOMERS },
  { name: 'Contas Caixa', path: '/admin/cash-accounts', icon: ICONS.CASH_ACCOUNTS },
  { name: 'Cat. de Receita', path: '/admin/revenue-categories', icon: ICONS.REVENUE_CATEGORIES },
  { name: 'Centros de Custo', path: '/admin/cost-centers', icon: ICONS.COST_CENTERS },
  { name: 'Produtos', path: '/admin/products', icon: ICONS.PRODUCTS },
];


const SidebarNavLink: React.FC<{ item: NavItem; isSubItem?: boolean }> = ({ item, isSubItem = false }) => (
  <NavLink
    to={item.path}
    end={item.path === '/'} 
    className={({ isActive }) =>
      `flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out
      ${isSubItem ? 'pl-7' : ''} 
      ${isActive 
        ? 'bg-secondary-accent text-white' 
        : 'text-gray-200 hover:bg-primary-dark hover:bg-opacity-75 hover:text-white'
      }`
    }
  >
    {item.icon && <span className={`mr-3 flex-shrink-0 h-5 w-5 ${isSubItem ? 'w-4 h-4' : ''}`}>{item.icon}</span>}
    {item.name}
  </NavLink>
);

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const toggleSubmenu = (itemName: string) => {
    setOpenSubmenus(prev => ({ ...prev, [itemName]: !prev[itemName] }));
  };

  React.useEffect(() => {
    const isReportActive = mainNavItems.find(item => item.name === 'Relatórios')?.children?.some(child => location.pathname.startsWith(child.path));
    if (isReportActive && !openSubmenus['Relatórios']) {
      setOpenSubmenus(prev => ({ ...prev, 'Relatórios': true }));
    }
    
    // Check if a "Cadastros" (admin) route is active to potentially open it
    // This part might not be strictly necessary if /admin itself is a direct link and not expandable
    // However, if we make "Cadastros" expandable in the future, this would be useful.
    const isCadastrosActive = location.pathname.startsWith('/admin');
    if (isCadastrosActive && mainNavItems.find(item => item.name === 'Cadastros' && item.children) && !openSubmenus['Cadastros']) {
         // setOpenSubmenus(prev => ({ ...prev, ['Cadastros']: true })); // Only if Cadastros becomes expandable
    }

  }, [location.pathname, openSubmenus]);


  return (
    <aside className="w-64 bg-primary-dark text-gray-200 flex flex-col min-h-screen">
      <nav className="flex-grow p-4 space-y-1">
        {mainNavItems.map((item) => {
          // If the item is "Cadastros", we treat it as a direct link, not an expandable menu here.
          // The AdminLayout will render its own sidebar (AdminSidebar/RegistrationsSidebar).
          if (item.name === "Cadastros") {
            return <SidebarNavLink key={item.name} item={item} />;
          }

          if (item.children) {
            const isParentActive = location.pathname.startsWith(item.path);
            const isOpen = !!openSubmenus[item.name];
            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleSubmenu(item.name)}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out cursor-pointer
                    ${isParentActive && !isOpen ? 'bg-primary-dark bg-opacity-75 text-white' : ''}
                    ${isOpen ? 'bg-primary-dark bg-opacity-60 text-white' : 'text-gray-200 hover:bg-primary-dark hover:bg-opacity-75 hover:text-white'}
                  `}
                  aria-expanded={isOpen}
                  aria-controls={`submenu-${item.name}`}
                >
                  <div className="flex items-center">
                    {item.icon && <span className="mr-3 flex-shrink-0 h-5 w-5">{item.icon}</span>}
                    {item.name}
                  </div>
                  {isOpen ? ICONS.CHEVRON_DOWN : ICONS.CHEVRON_RIGHT}
                </button>
                {isOpen && (
                  <div id={`submenu-${item.name}`} className="pt-1 space-y-1">
                    {item.children.map(childItem => (
                      <SidebarNavLink key={childItem.name} item={childItem} isSubItem={true} />
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return <SidebarNavLink key={item.name} item={item} />;
        })}
      </nav>
    </aside>
  );
};

// This sidebar is used within the AdminLayout for /admin/* routes
export const AdminSidebar: React.FC = () => { // Or could be RegistrationsSidebar
 return (
    <aside className="w-64 bg-gray-50 border-r border-neutral-light-gray p-4">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Menu Cadastros</h3>
      <nav className="space-y-1">
        {registrationsNavItems.map((item) => ( // Using registrationsNavItems
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium group transition-colors
              ${isActive
                ? 'bg-primary-dark text-white'
                : 'text-text-dark hover:bg-gray-200 hover:text-primary-dark'
              }`
            }
          >
             {item.icon && <span className="mr-3 h-5 w-5 text-gray-400 group-hover:text-primary-dark transition-colors">{item.icon}</span>}
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};


export default Sidebar;
