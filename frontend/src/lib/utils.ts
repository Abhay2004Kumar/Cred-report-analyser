import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatPhoneNumber(phone: string): string {
  if (!phone) return 'N/A';
  
  // Format Indian phone number
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  return phone;
}

export function getCreditScoreColor(score?: number): string {
  if (!score) return 'text-gray-500';
  
  if (score >= 750) return 'text-green-600';
  if (score >= 650) return 'text-yellow-600';
  return 'text-red-600';
}

export function getCreditScoreLabel(score?: number): string {
  if (!score) return 'No Score';
  
  if (score >= 750) return 'Excellent';
  if (score >= 700) return 'Good';
  if (score >= 650) return 'Fair';
  return 'Poor';
}

export function getAccountStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return 'text-green-600 bg-green-100';
    case 'closed':
      return 'text-gray-600 bg-gray-100';
    case 'written off':
      return 'text-red-600 bg-red-100';
    case 'settled':
      return 'text-yellow-600 bg-yellow-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function calculateAccountUtilization(currentBalance: number, creditLimit?: number): number {
  if (!creditLimit || creditLimit === 0) return 0;
  return Math.min((currentBalance / creditLimit) * 100, 100);
}

export function getUtilizationColor(utilization: number): string {
  if (utilization <= 30) return 'text-green-600';
  if (utilization <= 60) return 'text-yellow-600';
  return 'text-red-600';
}
