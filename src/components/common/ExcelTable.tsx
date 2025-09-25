import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'select';
  options?: string[];
  width?: string;
}

interface ExcelTableProps {
  columns: Column[];
  data: any[];
  onAdd?: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  title?: string;
  showActions?: boolean;
  className?: string;
}

export function ExcelTable({ 
  columns, 
  data, 
  onAdd, 
  onEdit, 
  onDelete, 
  title,
  showActions = true,
  className 
}: ExcelTableProps) {
  return (
    <div className={cn("bg-card border border-border rounded-lg overflow-hidden", className)}>
      {title && (
        <div className="p-4 border-b border-border bg-muted/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {onAdd && (
              <Button onClick={onAdd} size="sm">
                Add New
              </Button>
            )}
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-4 py-3 text-left text-sm font-medium text-foreground border-r border-border last:border-r-0",
                    column.width
                  )}
                >
                  {column.label}
                </th>
              ))}
              {showActions && (
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground w-20">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr 
                  key={item.id || index}
                  className="border-b border-border hover:bg-muted/20 transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 text-sm text-foreground border-r border-border last:border-r-0"
                    >
                      {item[column.key] || '-'}
                    </td>
                  ))}
                  {showActions && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {onEdit && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEdit(item)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(item)}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}