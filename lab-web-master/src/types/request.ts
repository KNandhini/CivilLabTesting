interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface ContractReview {
  id: string;
  requestId: string;
  customerName: string;
  address: string;
  contactPerson: string;
  mobileNo: string;
  emailId: string;
  nameOfWork: string;
  location: string;
  dateOfCasting: string;
  gradeOfConcrete: string;
  isStatementOfConformityRequired: string;
  decisionRule: string;
  deviationFromTestMethods: string;
  isMethodInappropriate: string;
  witnessRequest: string;
  witnessDetails: string;
  witnessName: string;
  witnessDesignation: string;
  modeOfDelivery: string;
  isSimplifiedReport: string;
  isOtherOrgAddress: string;
  otherOrgDetails: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

interface SchemaField {
  type: string;
  field: string;
  value: string;
  displayName: string;
}

interface Schema {
  id: string;
  name: string;
  schema: SchemaField[];
}

interface SchemaMapping {
  id: string;
  testId: string;
  schemaId: string;
  schema: Schema;
}

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
}

// Add Observation interface
interface Observation {
  id: string;
  schemaId: string;
  productTestSampleMappingId: string;
  requestId: string;
  result: Result[];
  productTestSampleMapping: ProductTestSampleMapping;
}

interface Product {
  id: string;
  name: string;
}

interface Sample {
  id: string;
  sampleId: string;
  requestId: string;
  sampleType: string;
  sampleAvailability: string;
}

interface Mapping {
  id: string;
  requestId: string;
  productId: string;
  testId: string;
  sampleId: string;
  request: Request;
  product: Product;
  test: Test;
  sample: Sample;
}

interface Request {
  id: string;
  formId: string;
  revisionNo: number;
  revisionDate: string;
  issueNo: number;
  issueDate: string;
  createdUserId: string;
  createdDate: string;
  modifiedDate: string;
  modifiedUserId: string;
  status: string;
  contractReview: ContractReview;
  appRequestId:string;
}

export type { 
  Request, 
  ContractReview, 
  Product, 
  Test, 
  Sample, 
  Result,
  ProductTestSampleMapping,
  Observation
};
