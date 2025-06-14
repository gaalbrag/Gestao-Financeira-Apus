import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { EntryType, TransactionType, LineItem, CostCenterNode, ProductNode } from '../../types';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import SelectField from '../../components/ui/SelectField';
import TextAreaField from '../../components/ui/TextAreaField';
import { ICONS } from '../../constants';

interface FormLineItem {
  description: string;
  costCenterId: string;
  amount: number; // This will be calculated: quantity * unitPrice
  productId?: string;
  quantity?: number;
  unitPrice?: number;
  productUnit?: string; // For display purposes
}

interface FormData {
  entryType: EntryType;
  invoiceNumber: string;
  projectId: string;
  supplierId: string;
  disbursementDate: string;
  issueDate: string;
  transactionType: TransactionType;
  description: string; // Overall description for the expense entry
  cashAccountCodeId: string;
  lineItems: FormLineItem[];
}

const NewExpensePage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    projects, 
    suppliers, 
    cashAccounts, 
    costCenters, 
    getSelectableProducts, // Use new function for hierarchical products
    productNodes, // Keep for finding selected product details
    addExpenseEntry 
  } = useData();

  const [formData, setFormData] = useState<FormData>({
    entryType: EntryType.FINANCIAL,
    invoiceNumber: '',
    projectId: '',
    supplierId: '',
    disbursementDate: new Date().toISOString().split('T')[0],
    issueDate: new Date().toISOString().split('T')[0],
    transactionType: TransactionType.PRODUCT,
    description: '',
    cashAccountCodeId: '',
    lineItems: [{ description: '', costCenterId: '', amount: 0, quantity: 1, unitPrice: 0 }],
  });
  const [costCenterOptions, setCostCenterOptions] = useState<{ value: string; label: string }[]>([]);
  const [productOptions, setProductOptions] = useState<{ value: string; label: string; unit: string }[]>([]);

  useEffect(() => {
    const flattenCostCenters = (nodes: CostCenterNode[], prefix = ''): { value: string; label: string }[] => {
      let options: { value: string; label: string }[] = [];
      for (const node of nodes) {
        const currentLabel = prefix ? `${prefix} > ${node.name}` : node.name;
        if (node.isLaunchable) {
          options.push({ value: node.id, label: currentLabel });
        }
        if (node.children && node.children.length > 0) {
          options = options.concat(flattenCostCenters(node.children, currentLabel));
        }
      }
      return options;
    };
    setCostCenterOptions(flattenCostCenters(costCenters));
    setProductOptions(getSelectableProducts());
  }, [costCenters, getSelectableProducts]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLineItemChange = (index: number, field: keyof FormLineItem, value: string | number) => {
    const newLineItems = [...formData.lineItems];
    const currentItem = { ...newLineItems[index] };

    (currentItem as any)[field] = value;

    if (field === 'productId') {
      const selectedProductOption = productOptions.find(p => p.value === value);
      currentItem.description = selectedProductOption ? selectedProductOption.label.split(' / ').pop() || '' : ''; // Use last part of path as description suggestion
      currentItem.productUnit = selectedProductOption ? selectedProductOption.unit : '';
    }
    
    if (field === 'quantity' || field === 'unitPrice' || field === 'productId') {
        const qty = parseFloat(String(currentItem.quantity)) || 0;
        const price = parseFloat(String(currentItem.unitPrice)) || 0;
        currentItem.amount = qty * price;
    }

    newLineItems[index] = currentItem;
    setFormData(prev => ({ ...prev, lineItems: newLineItems }));
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: '', costCenterId: '', amount: 0, quantity: 1, unitPrice: 0 }],
    }));
  };

  const removeLineItem = (index: number) => {
    if (formData.lineItems.length <= 1) return; 
    const newLineItems = formData.lineItems.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, lineItems: newLineItems }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId || !formData.supplierId || !formData.cashAccountCodeId || formData.lineItems.some(li => !li.costCenterId || (li.productId && ( (li.quantity || 0) <= 0 || (li.unitPrice || 0) <= 0 ) ) || (!li.productId && li.amount <= 0)  )) {
        alert("Por favor, preencha todos os campos obrigatórios. Para itens de produto, preencha produto, quantidade e preço unitário. Para itens avulsos, preencha o valor. Certifique-se que um centro de custo lançável foi selecionado para cada item.");
        return;
    }

    const finalLineItems: Omit<LineItem, 'id'>[] = formData.lineItems.map(fli => ({
        description: fli.description,
        costCenterId: fli.costCenterId,
        amount: fli.amount, 
        productId: fli.productId,
        quantity: fli.quantity,
        unitPrice: fli.unitPrice,
    }));

    addExpenseEntry({
      entryType: formData.entryType,
      invoiceNumber: formData.invoiceNumber,
      projectId: formData.projectId,
      supplierId: formData.supplierId,
      disbursementDate: formData.disbursementDate,
      issueDate: formData.issueDate,
      transactionType: formData.transactionType,
      description: formData.description,
      cashAccountCodeId: formData.cashAccountCodeId,
      lineItems: finalLineItems,
    });
    alert('Lançamento de despesa criado com sucesso!');
    navigate('/expenses');
  };

  return (
    <div className="p-6 bg-neutral-bg min-h-full">
      <h1 className="text-2xl font-semibold text-primary-dark mb-6">Novo Lançamento de Despesa</h1>
      <form onSubmit={handleSubmit} className="bg-neutral-card p-6 rounded-lg shadow space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField
            label="Tipo de Lançamento"
            name="entryType"
            value={formData.entryType}
            onChange={handleChange}
            options={Object.values(EntryType).map(et => ({ value: et, label: et }))}
            required
          />
          <InputField
            label="Número da Nota Fiscal"
            name="invoiceNumber"
            value={formData.invoiceNumber}
            onChange={handleChange}
          />
          <SelectField
            label="Obra"
            name="projectId"
            value={formData.projectId}
            onChange={handleChange}
            options={projects.map(p => ({ value: p.id, label: p.name }))}
            required
          />
          <SelectField
            label="Fornecedor"
            name="supplierId"
            value={formData.supplierId}
            onChange={handleChange}
            options={suppliers.map(s => ({ value: s.id, label: s.name }))}
            required
          />
          <InputField
            label="Data de Desembolso"
            name="disbursementDate"
            type="date"
            value={formData.disbursementDate}
            onChange={handleChange}
            required
          />
          <InputField
            label="Data de Emissão da NF"
            name="issueDate"
            type="date"
            value={formData.issueDate}
            onChange={handleChange}
            required
          />
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Tipo de Transação</label>
            <div className="flex space-x-4">
              {Object.values(TransactionType).map(tt => (
                <label key={tt} className="flex items-center">
                  <input
                    type="radio"
                    name="transactionType"
                    value={tt}
                    checked={formData.transactionType === tt}
                    onChange={handleChange}
                    className="h-4 w-4 text-secondary-accent border-gray-300 focus:ring-secondary-accent"
                  />
                  <span className="ml-2 text-sm text-text-dark">{tt}</span>
                </label>
              ))}
            </div>
          </div>
          <SelectField
            label="Conta Caixa (Pagamento de)"
            name="cashAccountCodeId"
            value={formData.cashAccountCodeId}
            onChange={handleChange}
            options={cashAccounts.map(ca => ({ value: ca.id, label: ca.name }))}
            required
          />
        </div>
        <TextAreaField
          label="Descrição Geral da Despesa"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />

        <h3 className="text-lg font-medium text-primary-dark pt-4 border-t border-neutral-light-gray">Itens do Lançamento</h3>
        {formData.lineItems.map((item, index) => (
          <div key={index} className="p-3 border border-neutral-light-gray rounded-md space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SelectField
                    label={`Produto Item ${index + 1}`}
                    value={item.productId || ''}
                    onChange={(e) => handleLineItemChange(index, 'productId', e.target.value)}
                    options={productOptions.map(po => ({ value: po.value, label: po.label }))} // Pass only value and label
                    containerClassName="md:col-span-1"
                />
                <InputField
                    label="Descrição do Item"
                    value={item.description}
                    onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                    containerClassName="md:col-span-2"
                    placeholder={item.productId ? "Detalhes adicionais do produto" : "Descrição do serviço ou item avulso"}
                    required
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                 <SelectField
                    label="Centro de Custo (Lançável)"
                    value={item.costCenterId}
                    onChange={(e) => handleLineItemChange(index, 'costCenterId', e.target.value)}
                    options={costCenterOptions}
                    containerClassName="md:col-span-4"
                    required
                />
                <InputField
                    label="Quantidade"
                    type="number"
                    value={item.quantity || ''}
                    onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                    min="0"
                    step="any"
                    containerClassName="md:col-span-2"
                    disabled={!item.productId}
                    required={!!item.productId}
                />
                 {item.productId && item.productUnit && <span className="md:col-span-1 mt-8 text-sm text-text-muted">({item.productUnit})</span>}

                <InputField
                    label="Preço Unitário (R$)"
                    type="number"
                    value={item.unitPrice || ''}
                    onChange={(e) => handleLineItemChange(index, 'unitPrice', e.target.value)}
                    min="0"
                    step="0.01"
                    containerClassName="md:col-span-2"
                    disabled={!item.productId}
                    required={!!item.productId}
                />
                <InputField
                    label="Valor Total Item (R$)"
                    type="number"
                    value={item.amount.toFixed(2)}
                    readOnly={!!item.productId} 
                    onChange={(e) => !item.productId && handleLineItemChange(index, 'amount', parseFloat(e.target.value))}
                    min="0.01"
                    step="0.01"
                    containerClassName="md:col-span-2"
                    required
                />
                <div className={`md:col-span-1 flex items-center h-full ${item.productId && item.productUnit ? 'pb-0' : 'pb-4'}`}>
                {formData.lineItems.length > 1 && (
                    <Button type="button" variant="danger" size="sm" onClick={() => removeLineItem(index)} className="mt-1" title="Remover Item">
                    {ICONS.DELETE}
                    </Button>
                )}
                </div>
            </div>
          </div>
        ))}
        <Button type="button" onClick={addLineItem} variant="secondary" leftIcon={ICONS.ADD} className="mt-2">
          Adicionar Item
        </Button>

        <div className="pt-6 border-t border-neutral-light-gray flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/expenses')}>
            Cancelar
          </Button>
          <Button type="submit" variant="accent" leftIcon={ICONS.SAVE}>
            Salvar Lançamento
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewExpensePage;