export interface SummaryReport {
  startDate: string;
  endDate: string;
  totalTests: number;
  completedTests: number;
  pendingTests: number;
  revenue: number;
}

export interface DetailedReport {
  startDate: string;
  endDate: string;
  type: string;
  details: Array<{
    id: string;
    name: string;
    status: string;
    date: string;
    value: number;
  }>;
}

export interface CustomReport {
  config: {
    filters?: any[];
    groupBy?: string[];
    sortBy?: string[];
  };
  data: any[];
  metadata: {
    generatedAt: string;
    totalRecords: number;
    executionTime: number;
  };
} 