import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  }).format(amount);
};

export const generateTaskId = (): string => {
  return `MT-${Math.floor(1000 + Math.random() * 9000)}`;
};

export const generatePurchaseOrderNumber = (): string => {
  return `PO-${Math.floor(100 + Math.random() * 900)}`;
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-red-100 text-red-800';
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'complete':
      return 'bg-green-100 text-green-800';
    case 'verified':
      return 'bg-blue-100 text-blue-800';
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'low':
      return 'bg-blue-100 text-blue-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getTaskTypeColor = (type: string) => {
  return type === 'corrective'
    ? 'bg-red-100 text-red-800'
    : 'bg-green-100 text-green-800';
};

export const truncateText = (text: string, maxLength: number) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};
