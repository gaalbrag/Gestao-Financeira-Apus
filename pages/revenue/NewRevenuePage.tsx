import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { EntryType, LineItem, RevenueCategory as RevenueCategoryType, RevenueEntry } from '../../types'; // Renamed to avoid conflict
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import SelectField from '../../components/ui/SelectField';
import TextAreaField from '../../components/ui/TextAreaField';
import { ICONS } from '../../constants';

interface RevenueFormLineItem {
  description: string;
  amount: number;
  revenueCategoryId: string; 
}

interface FormData {
  entryType: EntryType;
  invoiceNumber: string;
  projectId: string;
  customerId: string;
  receiptDate: string;
  issueDate: string;
  description: string;
  cashAccountCodeId: string;
  lineItems: RevenueFormLineItem[];
}

const NewRevenuePage: React.FC = () => {
  const navigate = useNavigate();
  const { projects, customers, cashAccounts, revenueCategories, addRevenueEntry } = useData();
  
  const [formData, setFormData] = useState<FormData>({
    entryType: EntryType.FINANCIAL,
    invoiceNumber: '',
    projectId: '',
    customerId: '',
    receiptDate: new Date().toISOString().split('T')[0],
    issueDate: new Date().toISOString().split('T')[0],
    description: '',
    cashAccountCodeId: '',
    lineItems: [{ description: '', amount: 0, revenueCategoryId: '' }],
  });

  const revenueCategoryOptions = revenueCategories.map(rc => ({ value: rc.id, label: rc.name }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLineItemChange = (index: number, field: keyof RevenueFormLineItem, value: string | number) => {
    const newLineItems = [...formData.lineItems];
    const itemToUpdate = newLineItems[index];

    if (field === 'amount') {
      itemToUpdate[field] = parseFloat(value as string) || 0;
    } else { // 'description' or 'revenueCategoryId'
      (itemToUpdate as any)[field] = value;
    }
    setFormData(prev => ({ ...prev, lineItems: newLineItems }));
  };
  

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: '', amount: 0, revenueCategoryId: '' }],
    }));
  };

  const removeLineItem = (index: number) => {
    if (formData.lineItems.length <= 1) return; 
    const newLineItems = formData.lineItems.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, lineItems: newLineItems }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId || !formData.customerId || !formData.cashAccountCodeId || formData.lineItems.some(li => !li.revenueCategoryId || li.amount <= 0)) {
      alert("Por favor, preencha todos os campos obrigatórios e garanta que os itens de linha (incluindo categoria de receita e valor) estejam completos.");
      return;
    }
    
    const processedLineItemsForEntry: Array<Omit<LineItem, 'id'>> = formData.lineItems.map(li => ({
        description: li.description,
        costCenterId: li.revenueCategoryId, // Map revenueCategoryId to costCenterId for the BaseEntry structure
        amount: li.amount,
    }));

    addRevenueEntry({
      entryType: formData.entryType,
      invoiceNumber: formData.invoiceNumber,
      projectId: formData.projectId,
      customerId: formData.customerId,
      receiptDate: formData.receiptDate,
      issueDate: formData.issueDate,
      description: formData.description,
      cashAccountCodeId: formData.cashAccountCodeId,
      lineItems: processedLineItemsForEntry, 
    });
    alert('Lançamento de receita criado com sucesso!');
    navigate('/revenue');
  };

  return (
    <div className="p-6 bg-neutral-bg min-h-full">
      <h1 className="text-2xl font-semibold text-primary-dark mb-6">Novo Lançamento de Receita</h1>
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
            label="Cliente"
            name="customerId"
            value={formData.customerId}
            onChange={handleChange}
            options={customers.map(c => ({ value: c.id, label: c.name }))}
            required
          />
          <InputField
            label="Data de Recebimento Previsto"
            name="receiptDate"
            type="date"
            value={formData.receiptDate}
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
           <SelectField
            label="Conta Caixa (Recebimento em)"
            name="cashAccountCodeId"
            value={formData.cashAccountCodeId}
            onChange={handleChange}
            options={cashAccounts.map(ca => ({ value: ca.id, label: ca.name }))}
            required
          />
        </div>
        <TextAreaField
          label="Descrição Geral da Receita"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />

        <h3 className="text-lg font-medium text-primary-dark pt-4 border-t border-neutral-light-gray">Itens do Lançamento de Receita</h3>
        {formData.lineItems.map((item, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-3 border border-neutral-light-gray rounded-md">
            <InputField
              label={`Descrição Item ${index + 1}`}
              value={item.description}
              onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
              containerClassName="md:col-span-5"
              required
            />
            <SelectField
              label="Categoria de Receita"
              value={item.revenueCategoryId || ''}
              onChange={(e) => handleLineItemChange(index, 'revenueCategoryId', e.target.value)}
              options={revenueCategoryOptions}
              containerClassName="md:col-span-4"
              required
            />
            <InputField
              label="Valor"
              type="number"
              value={item.amount}
              onChange={(e) => handleLineItemChange(index, 'amount', e.target.value)}
              min="0.01"
              step="0.01"
              containerClassName="md:col-span-2"
              required
            />
            <div className="md:col-span-1 flex items-center h-full pb-4">
              {formData.lineItems.length > 1 && (
                <Button type="button" variant="danger" size="sm" onClick={() => removeLineItem(index)} className="mt-1" title="Remover Item">
                  {ICONS.DELETE}
                </Button>
              )}
            </div>
          </div>
        ))}
        <Button type="button" onClick={addLineItem} variant="secondary" leftIcon={ICONS.ADD} className="mt-2">
          Adicionar Item de Receita
        </Button>

        <div className="pt-6 border-t border-neutral-light-gray flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/revenue')}>
            Cancelar
          </Button>
          <Button type="submit" variant="accent" leftIcon={ICONS.SAVE}>
            Salvar Lançamento de Receita
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewRevenuePage;