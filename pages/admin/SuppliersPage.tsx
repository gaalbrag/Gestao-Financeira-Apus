import React, { useState, ReactNode } from 'react';
import { useData } from '../../contexts/DataContext';
import { Supplier } from '../../types';
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

const SuppliersPage: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Partial<Supplier> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const openModalForNew = () => {
    setCurrentSupplier({ name: '', contactPerson: '', email: '', phone: '' });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openModalForEdit = (supplier: Supplier) => {
    setCurrentSupplier(supplier);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentSupplier(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentSupplier) {
      setCurrentSupplier({ ...currentSupplier, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentSupplier && currentSupplier.name) {
      if (isEditing && currentSupplier.id) {
        updateSupplier(currentSupplier as Supplier);
      } else {
        addSupplier(currentSupplier as Omit<Supplier, 'id'>);
      }
      closeModal();
    } else {
      alert("Por favor, preencha pelo menos o nome do fornecedor.");
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
      deleteSupplier(id);
    }
  };

  const columns: Column<Supplier>[] = [
    { header: 'Nome', accessor: (item: Supplier) => item.name },
    { header: 'Contato', accessor: (item: Supplier) => item.contactPerson || '-' },
    { header: 'Email', accessor: (item: Supplier) => item.email || '-' },
    { header: 'Telefone', accessor: (item: Supplier) => item.phone || '-' },
    {
      header: 'Ações',
      accessor: (item: Supplier) => (
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
        <h1 className="text-2xl font-semibold text-primary-dark">Gerenciar Fornecedores</h1>
        <Button onClick={openModalForNew} variant="primary" leftIcon={ICONS.ADD}>
          Adicionar Fornecedor
        </Button>
      </div>

      <Table<Supplier> columns={columns} data={suppliers} emptyStateMessage="Nenhum fornecedor encontrado."/>

      {isModalOpen && currentSupplier && (
        <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditing ? 'Editar Fornecedor' : 'Adicionar Novo Fornecedor'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Nome do Fornecedor"
              name="name"
              value={currentSupplier.name || ''}
              onChange={handleChange}
              required
            />
            <InputField
              label="Pessoa de Contato"
              name="contactPerson"
              value={currentSupplier.contactPerson || ''}
              onChange={handleChange}
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              value={currentSupplier.email || ''}
              onChange={handleChange}
            />
            <InputField
              label="Telefone"
              name="phone"
              value={currentSupplier.phone || ''}
              onChange={handleChange}
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
              <Button type="submit" variant="accent">{isEditing ? 'Salvar Alterações' : 'Adicionar Fornecedor'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SuppliersPage;