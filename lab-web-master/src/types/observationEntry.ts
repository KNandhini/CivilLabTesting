import { Product, Sample } from "./request";

// Update Test interface to remove schemaMappings as it's not present in this context
interface Test {
    id: string;
    name: string;
    price: string;
    testingMethod: string | null;
    productId: string;
  }
  
  // Add new Result interface
  interface Result {
    type: string;
    field: string;
    value: string | number;
    displayName: string;
  }
  
  // Add ProductTestSampleMapping interface
  interface ProductTestSampleMapping {
    id: string;
    requestId: string;
    productId: string;
    testId: string;
    sampleId: string;
    request: Request;
    product: Product;
    test: Test;
    sample: Sample;
    user:User;
  }
  
  // Add Observation interface
  interface Observation {
    id: string;
    schemaId: string;
    productTestSampleMappingId: string;
    requestId: string;
    result: Result[];
    productTestSampleMapping: ProductTestSampleMapping;
    receivedBy: string;
  condition: string;
  remarks: string;
  resources: boolean;
  efficiency: boolean;
  verification: boolean;
  conditionsCheck: boolean;
  pertinentDiscussion: boolean;
  testStartDate: string;
  testCompletionDate: string;
  statusOnTest: string;
  temperature: number;
  humidity: number;
  }
  
  export type { 
    Product, 
    Test, 
    Sample, 
    Result,
    ProductTestSampleMapping,
    Observation
  };

  export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }