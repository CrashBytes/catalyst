import { type ReactNode } from "react";

export interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className="glass overflow-hidden rounded-xl">
      <table
        className={`min-w-full divide-y divide-guard-700/30 ${className}`.trim()}
      >
        {children}
      </table>
    </div>
  );
}

export interface TableHeadProps {
  children: ReactNode;
  className?: string;
}

export function TableHead({ children, className = "" }: TableHeadProps) {
  return (
    <thead className={`bg-guard-800/60 ${className}`.trim()}>{children}</thead>
  );
}

export interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

export function TableBody({ children, className = "" }: TableBodyProps) {
  return (
    <tbody
      className={`divide-y divide-guard-700/30 ${className}`.trim()}
    >
      {children}
    </tbody>
  );
}

export interface TableRowProps {
  children: ReactNode;
  className?: string;
}

export function TableRow({ children, className = "" }: TableRowProps) {
  return (
    <tr
      className={`border-b border-guard-700/30 transition-colors hover:bg-guard-800/40 ${className}`.trim()}
    >
      {children}
    </tr>
  );
}

export interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function TableHeader({ children, className = "" }: TableHeaderProps) {
  return (
    <th
      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-guard-400 ${className}`.trim()}
    >
      {children}
    </th>
  );
}

export interface TableCellProps {
  children: ReactNode;
  className?: string;
}

export function TableCell({ children, className = "" }: TableCellProps) {
  return (
    <td
      className={`whitespace-nowrap px-6 py-3 text-sm text-guard-200 ${className}`.trim()}
    >
      {children}
    </td>
  );
}
