import React, { useState, ReactNode } from 'react';
import { useData } from '../../contexts/DataContext';
import { Customer } from '../../types';
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

const CustomersPage: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Partial<Customer> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const openModalForNew = () => {
    setCurrentCustomer({ name: '', contactPerson: '', email: '', phone: '' });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openModalForEdit = (customer: Customer) => {
    setCurrentCustomer(customer);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCustomer(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentCustomer) {
      setCurrentCustomer({ ...currentCustomer, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCustomer && currentCustomer.name) {
      if (isEditing && currentCustomer.id) {
        updateCustomer(currentCustomer as Customer);
      } else {
        addCustomer(currentCustomer as Omit<Customer, 'id'>);
      }
      closeModal();
    } else {
      alert("Por favor, preencha pelo menos o nome do cliente.");
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      deleteCustomer(id);
    }
  };

  const columns: Column<Customer>[] = [
    { header: 'Nome', accessor: (item: Customer) => item.name },
    { header: 'Contato', accessor: (item: Customer) => item.contactPerson || '-' },
    { header: 'Email', accessor: (item: Customer) => item.email || '-' },
    { header: 'Telefone', accessor: (item: Customer) => item.phone || '-' },
    {
      header: 'Ações',
      accessor: (item: Customer) => (
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
        <h1 className="text-2xl font-semibold text-primary-dark">Gerenciar Clientes</h1>
        <Button onClick={openModalForNew} variant="primary" leftIcon={ICONS.ADD}>
          Adicionar Cliente
        </Button>
      </div>

      <Table<Customer> columns={columns} data={customers} emptyStateMessage="Nenhum cliente encontrado."/>

      {isModalOpen && currentCustomer && (
        <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditing ? 'Editar Cliente' : 'Adicionar Novo Cliente'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Nome do Cliente"
              name="name"
              value={currentCustomer.name || ''}
              onChange={handleChange}
              required
            />
            <InputField
              label="Pessoa de Contato"
              name="contactPerson"
              value={currentCustomer.contactPerson || ''}
              onChange={handleChange}
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              value={currentCustomer.email || ''}
              onChange={handleChange}
            />
            <InputField
              label="Telefone"
              name="phone"
              value={currentCustomer.phone || ''}
              onChange={handleChange}
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
              <Button type="submit" variant="accent">{isEditing ? 'Salvar Alterações' : 'Adicionar Cliente'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CustomersPage;