export interface NavItem {
  name: string;
  path: string;
  icon?: React.ReactNode;
  children?: NavItem[]; // Added for sub-navigation
}

export interface Project { // Obra
  id: string;
  name: string; // Nome da Obra/ID
  address: string; // Endereço
  startDate: string; // Data de Início (ISO date string)
}

export interface Supplier { // Fornecedor
  id: string;
  name: string;
  contactPerson?: string; // Pessoa de Contato
  email?: string;
  phone?: string; // Telefone
}

export interface Customer { // Cliente
  id: string;
  name: string;
  contactPerson?: string; // Pessoa de Contato
  email?: string;
  phone?: string; // Telefone
}

export interface CashAccount { // Conta Caixa (Código de Caixa)
  id: string;
  name: string; // Nome da Conta (Ex: Banco Principal, Caixa Pequeno)
  bank?: string; // Nome do Banco
  agency?: string; // Agência Bancária
  accountNumber?: string; // Número da Conta Bancária
  balance?: number; // Saldo (Opcional, pode ser calculado dinamicamente)
}

export interface RevenueCategory { // Categoria de Receita
  id: string;
  name: string;
}

export interface CostCenterNode { // Centro de Custo
  id: string;
  name: string;
  parentId: string | null; // Para facilitar a travessia e reconstrução da árvore
  children: CostCenterNode[];
  isLaunchable: boolean; // Indica se pode receber lançamentos diretos
}

export interface ProductNode { // Produto - Now hierarchical
  id: string;
  name: string; // Nome do Produto ou Categoria de Produto
  unit: string; // Unidade de Medida (e.g., kg, m³, un, pct). Vazio se for uma categoria.
  parentId: string | null;
  children: ProductNode[];
}

export enum EntryType { // Tipo de Lançamento
  ACCOUNTING = "Contábil",
  FINANCIAL = "Financeiro",
}

export enum TransactionType { // Tipo de Transação
  PRODUCT = "Produto",
  SERVICE = "Serviço",
}

export enum EntryStatus { // Situação do Lançamento
  UNPAID = "Em Aberto", // Despesa não paga
  PARTIALLY_PAID = "Parcialmente Pago", // Despesa parcialmente paga
  PAID = "Pago", // Despesa paga
  UNRECEIVED = "Não Recebido", // Receita não recebida
  PARTIALLY_RECEIVED = "Parcialmente Recebido", // Receita parcialmente recebida
  RECEIVED = "Recebido", // Receita recebida
}

export interface LineItem { // Item do Lançamento
  id: string;
  description: string; // Descrição (pode ser auto-preenchida pelo produto ou customizada)
  costCenterId: string; // Link para CostCenterNode (despesas) ou RevenueCategory (receitas - ID da categoria armazenado aqui)
  amount: number; // Valor Total do Item (para despesas: quantity * unitPrice)

  // Campos específicos para itens de despesa com produtos
  productId?: string; // Link para ProductNode (um produto selecionável com unidade)
  quantity?: number;
  unitPrice?: number;
}

export interface BaseEntry { // Lançamento Base
  id:string;
  entryType: EntryType; // Tipo de Lançamento
  invoiceNumber?: string; // Número da Nota Fiscal
  projectId: string; // ID da Obra
  issueDate: string; // Data de Emissão (ISO date string)
  description: string; // Descrição geral do lançamento
  totalAmount: number; // Valor Total (soma dos lineItems.amount)
  settledAmount: number; // Valor Liquidado/Baixado
  status: EntryStatus; // Situação
  lineItems: LineItem[]; // Itens do Lançamento
}

export interface ExpenseEntry extends BaseEntry { // Lançamento de Despesa
  supplierId: string; // ID do Fornecedor
  disbursementDate: string; // Data de Desembolso (ISO date string)
  transactionType: TransactionType; // Tipo de Transação
  cashAccountCodeId: string; // ID da Conta Caixa (de onde será pago)
}

export interface RevenueEntry extends BaseEntry { // Lançamento de Receita
  customerId: string; // ID do Cliente
  receiptDate: string; // Data de Recebimento (ISO date string)
  cashAccountCodeId: string; // ID da Conta Caixa (para onde será recebido)
}

export interface Settlement { // Baixa / Liquidação
  id: string;
  entryId: string; // ID do Lançamento de Despesa ou Receita
  entryCategory: 'expense' | 'revenue'; // Categoria do Lançamento
  settlementDate: string; // Data da Baixa (ISO date string)
  amount: number; // Valor da Baixa
  cashAccountCodeId: string; // ID da Conta Caixa usada para a baixa
  notes?: string; // Observações
}

// Para relatórios
export interface CostCenterSummary extends CostCenterNode { // Resumo do Centro de Custo
  totalExpenses: number; // Total de Despesas
  children: CostCenterSummary[]; // Sobrescreve para garantir que filhos também sejam CostCenterSummary
}

export interface CashFlowReportTransaction {
  id: string;
  date: string;
  description: string;
  inflow: number;
  outflow: number;
  runningBalance: number;
  relatedEntryId?: string; // Optional: to link back to original expense/revenue if needed
}

export interface ProductPurchaseHistoryItem {
    id: string; // Unique ID for the table row (can be expenseId + lineItemId)
    expenseId: string;
    expenseDate: string;
    supplierName: string;
    productName: string; // Could be full path of product
    quantity: number;
    unit: string;
    unitPrice: number;
    totalAmount: number;
}