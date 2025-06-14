import React, { useState, ReactNode } from 'react';
import { useData } from '../../contexts/DataContext';
import { CashAccount } from '../../types';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import InputField from '../../components/ui/InputField';
import Table from '../../components/ui/Table';
import { ICONS } from '../../constants';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
  headerClassName?: string;
}

const CashAccountsPage: React.FC = () => {
  const { cashAccounts, addCashAccount, updateCashAccount, deleteCashAccount } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCashAccount, setCurrentCashAccount] = useState<Partial<CashAccount> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const openModalForNew = () => {
    setCurrentCashAccount({ name: '', bank: '', agency: '', accountNumber: '' }); // Balance is not directly editable here
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openModalForEdit = (account: CashAccount) => {
    setCurrentCashAccount(account);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCashAccount(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentCashAccount) {
      setCurrentCashAccount({ ...currentCashAccount, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCashAccount && currentCashAccount.name) {
      // Basic validation for bank details if bank name is provided
      if (currentCashAccount.bank && (!currentCashAccount.agency || !currentCashAccount.accountNumber)) {
        alert("Se o nome do banco for fornecido, agência e número da conta também são obrigatórios.");
        return;
      }
      if (isEditing && currentCashAccount.id) {
        updateCashAccount(currentCashAccount as CashAccount);
      } else {
        addCashAccount(currentCashAccount as Omit<CashAccount, 'id'>);
      }
      closeModal();
    } else {
      alert("Por favor, preencha pelo menos o nome da conta caixa.");
    }
  };

  const handleDelete = (id: string) => {
    // Consider adding a check if the account is in use before deleting
    if (window.confirm('Tem certeza que deseja excluir esta conta caixa?')) {
      deleteCashAccount(id);
    }
  };

  const columns: Column<CashAccount>[] = [
    { header: 'Nome da Conta', accessor: (item: CashAccount) => item.name },
    { header: 'Banco', accessor: (item: CashAccount) => item.bank || '-' },
    { header: 'Agência', accessor: (item: CashAccount) => item.agency || '-' },
    { header: 'Conta', accessor: (item: CashAccount) => item.accountNumber || '-' },
    { header: 'Saldo (Exemplo)', 
      accessor: (item: CashAccount) => `R$${(item.balance || 0).toFixed(2)}`,
      className: 'text-right' 
    },
    {
      header: 'Ações',
      accessor: (item: CashAccount) => (
        <div className="space-x-2">
          <Button variant="ghost" size="sm" onClick={() => openModalForEdit(item)} leftIcon={ICONS.EDIT}>Editar</Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)} leftIcon={ICONS.DELETE}>Excluir</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-neutral-bg min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primary-dark">Gerenciar Contas Caixa</h1>
        <Button onClick={openModalForNew} variant="primary" leftIcon={ICONS.ADD}>
          Adicionar Conta Caixa
        </Button>
      </div>

      <Table<CashAccount> columns={columns} data={cashAccounts} emptyStateMessage="Nenhuma conta caixa encontrada."/>

      {isModalOpen && currentCashAccount && (
        <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditing ? 'Editar Conta Caixa' : 'Adicionar Nova Conta Caixa'} size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Nome da Conta Caixa"
              name="name"
              value={currentCashAccount.name || ''}
              onChange={handleChange}
              placeholder="Ex: Caixa Principal da Obra X, Banco Y Corrente"
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField
                  label="Banco (Opcional)"
                  name="bank"
                  value={currentCashAccount.bank || ''}
                  onChange={handleChange}
                  placeholder="Ex: Banco do Brasil"
                  containerClassName="md:col-span-1"
                />
                <InputField
                  label="Agência"
                  name="agency"
                  value={currentCashAccount.agency || ''}
                  onChange={handleChange}
                  placeholder="Ex: 1234-5"
                  containerClassName="md:col-span-1"
                  disabled={!currentCashAccount.bank}
                />
                <InputField
                  label="Número da Conta"
                  name="accountNumber"
                  value={currentCashAccount.accountNumber || ''}
                  onChange={handleChange}
                  placeholder="Ex: 0012345-6"
                  containerClassName="md:col-span-1"
                  disabled={!currentCashAccount.bank}
                />
            </div>
            {/* Balance is typically derived from transactions, not set manually here */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
              <Button type="submit" variant="accent">{isEditing ? 'Salvar Alterações' : 'Adicionar Conta'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CashAccountsPage;