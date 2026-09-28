'use client';

import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface TableSortHeaderProps {
  field: string;
  currentField: string;
  currentDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
  label: string;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

export default function TableSortHeader({
  field,
  currentField,
  currentDirection,
  onSort,
  label,
  align = 'left',
  className = '',
}: TableSortHeaderProps) {
  const isActive = currentField === field;

  const getAlignClass = () => {
    if (align === 'right') return 'justify-end text-right';
    if (align === 'center') return 'justify-center text-center';
    return 'justify-start text-left';
  };

  return (
    <th
      onClick={() => onSort(field)}
      className={`py-3 px-4 select-none cursor-pointer group transition hover:text-slate-900 dark:hover:text-white ${className}`}
      title={`Sort by ${label}`}
    >
      <div className={`inline-flex items-center gap-1.5 ${getAlignClass()}`}>
        <span>{label}</span>
        <span className="inline-flex items-center">
          {isActive ? (
            currentDirection === 'desc' ? (
              <ArrowDown className="w-3.5 h-3.5 text-[#9C2007] dark:text-rose-400 shrink-0" />
            ) : (
              <ArrowUp className="w-3.5 h-3.5 text-[#9C2007] dark:text-rose-400 shrink-0" />
            )
          ) : (
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 shrink-0 transition" />
          )}
        </span>
      </div>
    </th>
  );
}
