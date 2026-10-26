export interface ReportSchemaColumn {
  id: string;
  name: string;
  type: 'text' | 'schema';
  required: boolean;
  textValue?: string;
  testId?: string;
  schemaId?: string;
  order: number;
  averageCalculationRequired?: boolean;
}

export interface ReportSchemaRow {
  id: string;
  values: {
    [columnId: string]: string | string[] | boolean;
  };
  order: number;
}

export interface ReportSchemaDto {
  name: string;
  description: string;
  productId: string;
  includeObservationEntry: boolean;
  IncludeObservationEntryAverageRow: boolean;
  SerialNumberRequired: boolean;
  TestingMethodRequired: boolean;
  TestReportSchema:{
    columns: ReportSchemaColumn[];
  rows: ReportSchemaRow[];
  },
  ObservationEntrySchema:{
    columns: ReportSchemaColumn[];
    rows: ReportSchemaRow[];
  }
  
}
