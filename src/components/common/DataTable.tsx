import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, Edit, Plus, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Column {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  options?: string[];
  width?: string;
  required?: boolean;
  editable?: boolean;
}

interface DataTableProps {
  title: string;
  data: any[];
  columns: Column[];
  onAdd?: (item: any) => Promise<void>;
  onEdit?: (id: string, item: any) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  loading?: boolean;
  className?: string;
}

export function DataTable({ 
  title, 
  data, 
  columns, 
  onAdd, 
  onEdit, 
  onDelete, 
  loading = false,
  className 
}: DataTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const { toast } = useToast();

  const resetForm = () => {
    const initialData: any = {};
    columns.forEach(col => {
      if (col.type === 'number') {
        initialData[col.key] = '';
      } else if (col.type === 'date') {
        initialData[col.key] = new Date().toISOString().split('T')[0];
      } else if (col.type === 'select' && col.options?.length) {
        initialData[col.key] = col.options[0];
      } else {
        initialData[col.key] = '';
      }
    });
    setFormData(initialData);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({ ...item });
  };

  const handleSave = async () => {
    try {
      if (editingId && onEdit) {
        await onEdit(editingId, formData);
        toast({
          title: "Success",
          description: "Record updated successfully"
        });
      } else if (isAddingNew && onAdd) {
        await onAdd(formData);
        toast({
          title: "Success", 
          description: "Record added successfully"
        });
      }
      setEditingId(null);
      setIsAddingNew(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save record",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAddingNew(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
      if (onDelete) {
        await onDelete(id);
        toast({
          title: "Success",
          description: "Record deleted successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete record",
        variant: "destructive"
      });
    }
  };

  const renderCell = (item: any, column: Column, isEditing: boolean) => {
    const value = isEditing ? formData[column.key] : item[column.key];
    
    if (isEditing && column.editable !== false) {
      switch (column.type) {
        case 'textarea':
          return (
            <Textarea
              value={value || ''}
              onChange={(e) => setFormData({...formData, [column.key]: e.target.value})}
              className="min-h-[60px]"
            />
          );
        case 'select':
          return (
            <Select 
              value={value || ''} 
              onValueChange={(val) => setFormData({...formData, [column.key]: val})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {column.options?.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        case 'number':
          return (
            <Input
              type="number"
              step={column.key.includes('amount') || column.key.includes('salary') ? '0.01' : '1'}
              value={value || ''}
              onChange={(e) => setFormData({...formData, [column.key]: e.target.value})}
            />
          );
        case 'date':
          return (
            <Input
              type="date"
              value={value || ''}
              onChange={(e) => setFormData({...formData, [column.key]: e.target.value})}
            />
          );
        default:
          return (
            <Input
              value={value || ''}
              onChange={(e) => setFormData({...formData, [column.key]: e.target.value})}
            />
          );
      }
    }

    // Display mode
    if (column.type === 'number' && value) {
      if (column.key.includes('amount') || column.key.includes('salary')) {
        return `$${Number(value).toLocaleString()}`;
      }
      return Number(value).toLocaleString();
    }
    
    if (column.type === 'date' && value) {
      return new Date(value).toLocaleDateString();
    }
    
    return value || '-';
  };

  useEffect(() => {
    resetForm();
  }, [columns]);

  const showingForm = editingId || isAddingNew;

  return (
    <div className={cn("bg-card border border-border rounded-lg", className)}>
      <div className="p-4 border-b border-border bg-muted/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <div className="flex gap-2">
            {showingForm ? (
              <>
                <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => { resetForm(); setIsAddingNew(true); }} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add New
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full">
          <thead className="bg-muted/30 sticky top-0">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-4 py-3 text-left text-sm font-medium text-foreground border-r border-border last:border-r-0",
                    column.width
                  )}
                >
                  {column.label} {column.required && <span className="text-destructive">*</span>}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground w-24">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isAddingNew && (
              <tr className="border-b border-border bg-blue-50 dark:bg-blue-950/20">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-sm border-r border-border last:border-r-0">
                    {renderCell({}, column, true)}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleSave}
                      className="h-7 w-7 p-0 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancel}
                      className="h-7 w-7 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            )}
            {data.length === 0 && !isAddingNew ? (
              <tr>
                <td 
                  colSpan={columns.length + 1}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {loading ? 'Loading...' : 'No data available'}
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const isEditing = editingId === item.id;
                return (
                  <tr 
                    key={item.id || index}
                    className={cn(
                      "border-b border-border hover:bg-muted/20 transition-colors",
                      isEditing && "bg-yellow-50 dark:bg-yellow-950/20"
                    )}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="px-4 py-3 text-sm text-foreground border-r border-border last:border-r-0"
                      >
                        {renderCell(item, column, isEditing)}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleSave}
                              className="h-7 w-7 p-0 bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancel}
                              className="h-7 w-7 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            {onEdit && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(item)}
                                className="h-7 w-7 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            )}
                            {onDelete && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(item.id)}
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}