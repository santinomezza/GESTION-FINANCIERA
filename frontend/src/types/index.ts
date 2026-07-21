export type UserRole = 'ADMIN' | 'USER';

export type WorkspaceType = 'PERSONAL' | 'BUSINESS';

export type WorkspaceMemberRole = 'OWNER' | 'ADMIN' | 'ACCOUNTANT' | 'PARTNER' | 'VIEWER';

export interface Workspace {
  id: string;
  name: string;
  type: WorkspaceType;
  userId: string;
  createdAt: string;
  enabledFeatures?: string[];
  memberRole?: WorkspaceMemberRole;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceMemberRole;
  displayName?: string;
  permissions?: Record<string, any>;
  invitedBy?: string;
  invitedAt: string;
  joinedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Invitation {
  id: string;
  workspaceId: string;
  code: string;
  email?: string;
  role: WorkspaceMemberRole;
  displayName?: string;
  maxUses: number;
  usesCount: number;
  expiresAt: string;
  createdBy: string;
  createdAt: string;
  usedAt?: string;
  workspace?: Workspace;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  telegramId?: string;
  telegramUsername?: string;
  isActive: boolean;
  createdAt: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  currency?: string;
  language?: string;
  dateFormat?: string;
  theme?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    telegram: boolean;
  };
}

export type CategoryType = 'EXPENSE' | 'INCOME' | 'MIXED';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  isActive: boolean;
  isFavorite: boolean;
  sortOrder: number;
}

export type TransactionType = 'EXPENSE' | 'INCOME';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'CHECK' | 'OTHER';
export type TransactionStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: string | number; // Decimal string from prisma
  categoryId?: string;
  category?: Partial<Category>;
  description?: string;
  date: string;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  source: string;
  createdAt: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Client {
  id: string;
  name: string;
  cuit?: string;
  email?: string;
  phone?: string;
  address?: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  status: string;
  workspaceId: string;
  clientId: string;
  client?: Client;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  targetAmount: string;
  currentAmount: string;
  category?: string;
  targetDate?: string;
  isCompleted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface RecurringTransaction {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  type: TransactionType;
  amount: number;
  currency: string;
  categoryId?: string;
  category?: Category;
  frequency: RecurrenceFrequency;
  dayOfMonth?: number;
  dayOfWeek?: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  lastGeneratedAt?: string;
  nextDueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryLimit {
  id: string;
  workspaceId: string;
  categoryId: string;
  category?: Category;
  limitAmount: number;
  period: 'monthly' | 'yearly';
  alertEnabled: boolean;
  alertThreshold: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 
  | 'DAILY_SUMMARY'
  | 'WEEKLY_SUMMARY'
  | 'EXPENSE_ALERT'
  | 'INCOME_ALERT'
  | 'AI_INSIGHT'
  | 'MONTHLY_SUMMARY'
  | 'CATEGORY_LIMIT_ALERT'
  | 'RECURRING_REMINDER';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  sentAt?: string;
  readAt?: string;
  createdAt: string;
}

export interface AIRecommendation {
  id: string;
  userId: string;
  workspaceId: string;
  type: 'saving' | 'spending' | 'investment' | 'alert';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  data?: Record<string, any>;
  isRead: boolean;
  isDismissed: boolean;
  expiresAt?: string;
  createdAt: string;
  readAt?: string;
}

export interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  date: string;
  source: string;
  createdAt: string;
  updatedAt: string;
}
