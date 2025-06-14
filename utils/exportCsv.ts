import { ReactNode } from 'react';

// Define a Column type that matches what Table.tsx might use, or a simplified version for export.
// Ensure this is compatible with the Column type used in your table components.
export interface ExportColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode); // ReactNode implies we need to extract text
}

// Helper to extract text from ReactNode, very basic
const extractTextFromReactNode = (node: ReactNode): string => {
    if (typeof node === 'string' || typeof node === 'number') {
        return String(node);
    }
    if (node === null || typeof node === 'undefined' || typeof node === 'boolean') {
        return '';
    }
    if (Array.isArray(node)) {
        return node.map(extractTextFromReactNode).join('');
    }
    // Check for common JSX structure: an element with props.children
    if (
        typeof node === 'object' && // Is it an object?
        node !== null && // Is it not null?
        'props' in node // Does it have a 'props' key?
    ) {
        // If so, node is some object with a 'props' property. Let's get that property.
        // We cast `node` to access `props` because `node` is `ReactNode`.
        const propsProperty = (node as { props: unknown }).props;

        // Now, let's check if this 'propsProperty' is itself an object and has 'children'.
        // This aligns with the original logic: `node.props && typeof node.props.children !== 'undefined'`
        if (
            propsProperty && // Is propsProperty truthy? (original `node.props` check)
            typeof propsProperty === 'object' && // Is it an object? (implicit in original, explicit now for TS)
            'children' in propsProperty // Does it have a 'children' key?
            // The check `typeof (propsProperty as { children: unknown }).children !== 'undefined'` was part of the original logic
            // and is covered by `extractTextFromReactNode` handling `undefined` for the recursive call.
        ) {
            // Safely access children, asserting its type for the recursive call.
            return extractTextFromReactNode((propsProperty as { children: ReactNode }).children);
        }
    }
    // Fallback for other object types, could be improved with more specific checks
    if (typeof node === 'object' && node !== null) {
        return Object.values(node).map(extractTextFromReactNode).join(' ');
    }
    return ''; // Default fallback
};


export function exportToCsv<T>(filename: string, rows: T[], columns: ExportColumn<T>[]) {
  if (!rows || rows.length === 0) {
    alert("Não há dados para exportar.");
    return;
  }

  const processRow = (row: T): string[] => {
    return columns.map(col => {
      let cellValue: any;
      if (typeof col.accessor === 'function') {
        // The accessor might return a complex ReactNode. Try to extract meaningful text.
        cellValue = extractTextFromReactNode(col.accessor(row));
      } else {
        // Direct property access
        cellValue = row[col.accessor] as any;
      }
      
      const stringValue = String(cellValue === null || typeof cellValue === 'undefined' ? '' : cellValue);
      // Basic CSV escaping: if the string contains a comma, newline, or double quote, wrap it in double quotes
      // and escape any existing double quotes within the string by doubling them (e.g., " becomes "").
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
  };

  const headerRow = columns.map(col => `"${col.header.replace(/"/g, '""')}"`).join(',');
  const csvContent = [
    headerRow,
    ...rows.map(row => processRow(row).join(','))
  ].join('\n');

  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); // Adding BOM for Excel UTF-8 compatibility
  const link = document.createElement("a");

  if (link.download !== undefined) { // Check for browser support
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    // Fallback for browsers that don't support the download attribute
    alert("Seu navegador não suporta downloads diretos. Tente copiar os dados manualmente ou usar um navegador diferente.");
  }
}