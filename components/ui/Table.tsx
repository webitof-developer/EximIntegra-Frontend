import React from "react";

export interface TableContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function TableContainer({ children, footer, className = "", ...props }: TableContainerProps) {
  return (
    <div
      className={`border border-line rounded-2xl bg-panel overflow-hidden shadow-2xs ${className}`}
      {...props}
    >
      <div className="overflow-x-auto w-full">{children}</div>
      {footer && (
        <div className="px-4 py-3 bg-bg/50 border-t border-line flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
          {footer}
        </div>
      )}
    </div>
  );
}

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = "", ...props }: TableProps) {
  return (
    <table
      className={`w-full text-left border-collapse text-xs ${className}`}
      {...props}
    >
      {children}
    </table>
  );
}

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
  className?: string;
}

export function TableHeader({ children, className = "", ...props }: TableHeaderProps) {
  return (
    <thead
      className={`bg-bg/80 border-b border-line text-[11px] font-semibold text-muted uppercase tracking-wider select-none ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
}

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
  className?: string;
}

export function TableBody({ children, className = "", ...props }: TableBodyProps) {
  return (
    <tbody className={`divide-y divide-line/70 text-xs font-sans ${className}`} {...props}>
      {children}
    </tbody>
  );
}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  className?: string;
  isClickable?: boolean;
  isSelected?: boolean;
}

export function TableRow({
  children,
  className = "",
  isClickable = false,
  isSelected = false,
  ...props
}: TableRowProps) {
  return (
    <tr
      className={`transition-colors duration-150 ${
        isSelected
          ? "bg-blue-dim/40"
          : isClickable
          ? "hover:bg-bg/70 cursor-pointer"
          : "hover:bg-bg/40"
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

export function TableHead({
  children,
  className = "",
  align = "left",
  ...props
}: TableHeadProps) {
  const alignClass =
    align === "right"
      ? "text-right"
      : align === "center"
      ? "text-center"
      : "text-left";

  return (
    <th
      className={`py-3.5 px-4 font-semibold text-muted ${alignClass} ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

export function TableCell({
  children,
  className = "",
  align = "left",
  ...props
}: TableCellProps) {
  const alignClass =
    align === "right"
      ? "text-right"
      : align === "center"
      ? "text-center"
      : "text-left";

  return (
    <td className={`py-3.5 px-4 text-ink align-middle ${alignClass} ${className}`} {...props}>
      {children}
    </td>
  );
}
