import React, { useState, ReactNode } from 'react';
import { useData } from '../../contexts/DataContext';
import { Project } from '../../types';
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

const ProjectsPage: React.FC = () => {
  const { projects, addProject, updateProject, deleteProject } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const openModalForNew = () => {
    setCurrentProject({ name: '', address: '', startDate: new Date().toISOString().split('T')[0] });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openModalForEdit = (project: Project) => {
    setCurrentProject(project);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProject(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentProject) {
      setCurrentProject({ ...currentProject, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentProject && currentProject.name && currentProject.address && currentProject.startDate) {
      if (isEditing && currentProject.id) {
        updateProject(currentProject as Project);
      } else {
        addProject(currentProject as Omit<Project, 'id'>);
      }
      closeModal();
    } else {
      alert("Por favor, preencha todos os campos.");
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta obra?')) {
      deleteProject(id);
    }
  };

  const columns: Column<Project>[] = [
    { header: 'Nome', accessor: (item: Project) => item.name },
    { header: 'Endereço', accessor: (item: Project) => item.address },
    { header: 'Data de Início', accessor: (item: Project) => new Date(item.startDate).toLocaleDateString('pt-BR') },
    {
      header: 'Ações',
      accessor: (item: Project) => (
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
        <h1 className="text-2xl font-semibold text-primary-dark">Gerenciar Obras</h1>
        <Button onClick={openModalForNew} variant="primary" leftIcon={ICONS.ADD}>
          Adicionar Obra
        </Button>
      </div>

      <Table<Project> columns={columns} data={projects} emptyStateMessage="Nenhuma obra encontrada."/>

      {isModalOpen && currentProject && (
        <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditing ? 'Editar Obra' : 'Adicionar Nova Obra'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Nome da Obra"
              name="name"
              value={currentProject.name || ''}
              onChange={handleChange}
              required
            />
            <InputField
              label="Endereço"
              name="address"
              value={currentProject.address || ''}
              onChange={handleChange}
              required
            />
            <InputField
              label="Data de Início"
              name="startDate"
              type="date"
              value={currentProject.startDate ? currentProject.startDate.split('T')[0] : ''}
              onChange={handleChange}
              required
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
              <Button type="submit" variant="accent">{isEditing ? 'Salvar Alterações' : 'Adicionar Obra'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ProjectsPage;