import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { ExpenseEntry, RevenueEntry, Settlement } from '../../types';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import SelectField from '../../components/ui/SelectField';
import { ICONS } from '../../constants';

interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: ExpenseEntry | RevenueEntry;
  entryCategory: 'expense' | 'revenue';
}

const SettlementModal: React.FC<SettlementModalProps> = ({ isOpen, onClose, entry, entryCategory }) => {
  const { cashAccounts, addSettlement } = useData();
  const [amount, setAmount] = useState<number>(0);
  const [settlementDate, setSettlementDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [cashAccountCodeId, setCashAccountCodeId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const remainingAmount = entry.totalAmount - entry.settledAmount;

  useEffect(() => {
    if (isOpen) {
      setAmount(Math.max(0, remainingAmount)); 
      setSettlementDate(new Date().toISOString().split('T')[0]);
      setCashAccountCodeId(cashAccounts.length > 0 ? cashAccounts[0].id : '');
      setNotes('');
    }
  }, [isOpen, remainingAmount, cashAccounts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount > remainingAmount) {
      alert(`O valor deve ser maior que 0 e não mais que o restante de R$${remainingAmount.toFixed(2)}.`);
      return;
    }
    if (!cashAccountCodeId) {
      alert('Por favor, selecione uma conta caixa.');
      return;
    }

    const settlementData: Omit<Settlement, 'id'> = {
      entryId: entry.id,
      entryCategory,
      settlementDate,
      amount,
      cashAccountCodeId,
      notes,
    };
    addSettlement(settlementData);
    alert('Baixa registrada com sucesso!');
    onClose();
  };
  
  const modalTitle = entryCategory === 'expense' ? 'Baixar Pagamento de Despesa' : 'Registrar Recebimento de Receita';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-text-muted">ID Lançamento: <span className="font-medium text-text-dark">{entry.id.substring(0,8)}</span></p>
          <p className="text-sm text-text-muted">Valor Total: <span className="font-medium text-text-dark">R${entry.totalAmount.toFixed(2)}</span></p>
          <p className="text-sm text-text-muted">Já Liquidado: <span className="font-medium text-text-dark">R${entry.settledAmount.toFixed(2)}</span></p>
          <p className="text-lg font-semibold text-primary-dark">Restante: R${remainingAmount.toFixed(2)}</p>
        </div>
        <InputField
          label="Valor da Baixa"
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
          min="0.01"
          max={remainingAmount.toFixed(2)}
          step="0.01"
          required
        />
        <InputField
          label={entryCategory === 'expense' ? "Data do Pagamento" : "Data do Recebimento"}
          type="date"
          value={settlementDate}
          onChange={(e) => setSettlementDate(e.target.value)}
          required
        />
        <SelectField
          label={entryCategory === 'expense' ? "Pago de (Conta Caixa)" : "Recebido em (Conta Caixa)"}
          value={cashAccountCodeId}
          onChange={(e) => setCashAccountCodeId(e.target.value)}
          options={cashAccounts.map(ca => ({ value: ca.id, label: ca.name }))}
          required
        />
        <InputField
          label="Observações (Opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} leftIcon={ICONS.CANCEL}>
            Cancelar
          </Button>
          <Button type="submit" variant="accent" leftIcon={ICONS.SAVE}>
            {entryCategory === 'expense' ? 'Registrar Pagamento' : 'Registrar Recebimento'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SettlementModal;