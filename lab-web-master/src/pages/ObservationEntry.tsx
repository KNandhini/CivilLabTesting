import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { sampleCollectionApi, observationApi, reportNumberApi } from '../services/api';

interface SchemaField {
  type: 'number' | 'string' | 'formula';
  field: string;
  value: string;
  displayName: string;
}

interface TestSchema {
  id: string;
  name: string;
  schema: SchemaField[];
}

interface SchemaMapping {
  id: string;
  testId: string;
  schemaId: string;
  schema: TestSchema;
}

interface Test {
  id: string;
  name: string;
  price: string;
  testingMethod: string | null;
  productId: string;
  schemaMappings: SchemaMapping[];
}

interface Product {
  id: string;
  name: string;
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


interface GroupedMappings {
  [productName: string]: {
    [testName: string]: Mapping[];
  };
}

// Add new interface for additional info
const STEEL_GRADES = ['Fe 415', 'Fe 415D', 'Fe 500', 'Fe 500D', 'Fe 550', 'Fe 550D', 'Fe 600'];

interface AdditionalInfo {
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
  staffId: string;
  codeNo: string;
  temperature: string;
  humidity: string;
  materialStatus: string;
  sampleStorageCondition: string;
  gradeOfSteel: string;
  includeBendRebendTest: boolean;
}

interface ReportNumber {
  reportSchemaId: string;
  name?: string;
  reportNo: string;
  ulrno: string;
}

export const ObservationEntry: React.FC = () => {
  const { requestId } = useParams();
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportNumbers, setReportNumbers] = useState<ReportNumber[]>([]);
  const [isNablContract, setIsNablContract] = useState(false);
  const [numberErrors, setNumberErrors] = useState<Record<string, string>>({});
  const [savingNumbers, setSavingNumbers] = useState(false);
  const [numbersLoaded, setNumbersLoaded] = useState(false);
  const [openProduct, setOpenProduct] = useState<string | null>(null);
  const [openTests, setOpenTests] = useState<{ [key: string]: boolean }>({});
 // Add new state for expanded rows
 const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
 const [schemaValues, setSchemaValues] = useState<{ [key: string]: { [field: string]: string } }>({});
 const [additionalInfo, setAdditionalInfo] = useState<{ [testId: string]: AdditionalInfo }>({});
 const [saveAllLoading, setSaveAllLoading] = useState<{ [testName: string]: boolean }>({});
 const [saveValuesLoading, setSaveValuesLoading] = useState<{ [mappingId: string]: boolean }>({});
 
  

  useEffect(() => {
    const fetchMappings = async () => {
      try {
        const response = await sampleCollectionApi.getUserMappingsByRequestId(requestId!);
        setMappings(response.data);
        try {
          const numbers = await reportNumberApi.get(requestId!);
          setReportNumbers(numbers.data.reports);
          setIsNablContract(numbers.data.isNabl);
          setNumbersLoaded(true);
        } catch {
          setNumbersLoaded(false);
          toast.error('Unable to load report numbers. Please reload before saving.');
        }
  
        // Fetch observation data for each mapping
        for (const mapping of response.data) {
          try {
            const observationResponse = await observationApi.getByUserAndRequestId(mapping.requestId);
            const observationData = observationResponse.data.find(
              (obs: any) => obs.productTestSampleMappingId === mapping.id
            );
  
            if (observationData) {
              // Update schema values if result exists
              if (observationData.result) {
                setSchemaValues(prev => ({
                  ...prev,
                  [mapping.id]: observationData.result.reduce((acc: any, field: any) => {
                    acc[field.field] = field.value;
                    return acc;
                  }, {})
                }));
              }
  
              // Update additional info if exists
              if (observationData) {
                setAdditionalInfo(prev => ({
                  ...prev,
                  [mapping.testId]: {
                    receivedBy: observationData.receivedBy || '',
                    condition: observationData.condition || '',
                    remarks: observationData.remarks || '',
                    resources: observationData.resources || false,
                    efficiency: observationData.efficiency || false,
                    verification: observationData.verification || false,
                    conditionsCheck: observationData.conditionsCheck || false,
                    pertinentDiscussion: observationData.pertinentDiscussion || false,
                    testStartDate: observationData.testStartDate || undefined,
                    testCompletionDate: observationData.testCompletionDate || undefined,
                    statusOnTest: observationData.statusOnTest || '',
                    staffId: observationData.staffId || '',
                    codeNo: observationData.codeNo || '',
                    temperature: observationData.temperature || '',
                    humidity: observationData.humidity || '',
                    materialStatus: observationData.materialStatus || '',
                    sampleStorageCondition: observationData.sampleStorageCondition || '',
                    gradeOfSteel: observationData.gradeOfSteel || '',
                    includeBendRebendTest: observationData.includeBendRebendTest ?? false,
                  }
                }));
              }
            }
          } catch (error) {
            console.error('Error fetching observation data:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching mappings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchMappings();
    }
  }, [requestId]);

  const groupedMappings = mappings.reduce((acc: GroupedMappings, mapping) => {
    const productName = mapping.product.name;
    const testName = mapping.test.name;

    if (!acc[productName]) {
      acc[productName] = {};
    }
    if (!acc[productName][testName]) {
      acc[productName][testName] = [];
    }
    acc[productName][testName].push(mapping);
    return acc;
  }, {});

  const toggleProduct = (productName: string) => {
    setOpenProduct(openProduct === productName ? null : productName);
  };

  const toggleTest = (productName: string, testName: string) => {
    setOpenTests(prev => ({
      ...prev,
      [`${productName}-${testName}`]: !prev[`${productName}-${testName}`]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  
  
  // Add new state for additional info
  // Remove these lines
  // const [additionalInfo, setAdditionalInfo] = useState<{ [testId: string]: AdditionalInfo }>({});
  
  // Keep only the handler
  const handleAdditionalInfoChange = (testId: string, field: keyof AdditionalInfo, value: any) => {
    setAdditionalInfo(prev => ({
      ...prev,
      [testId]: {
        ...(prev[testId] || {}),
        [field]: value
      }
    }));
  };
  
  const saveReportNumbers = async (showSuccess = false) => {
    if (!requestId || !numbersLoaded) {
      toast.error('Report numbers are not loaded. Please reload and try again.');
      return false;
    }
    const errors: Record<string, string> = {};
    for (const item of reportNumbers) {
      if (!item.reportNo.trim()) errors[`${item.reportSchemaId}.reportNo`] = 'This field is required';
      if (isNablContract && !item.ulrno.trim()) errors[`${item.reportSchemaId}.ulrno`] = 'This field is required';
    }
    setNumberErrors(errors);
    if (Object.keys(errors).length) return false;
    setSavingNumbers(true);
    try {
      const response = await reportNumberApi.save(requestId, reportNumbers);
      setReportNumbers(response.data.reports);
      setIsNablContract(response.data.isNabl);
      if (showSuccess) toast.success('Report numbers saved successfully');
      return true;
    } catch (error: any) {
      if (error.response?.data?.errors) setNumberErrors(error.response.data.errors);
      else toast.error(error.response?.data?.message || 'Unable to save report numbers');
      return false;
    } finally { setSavingNumbers(false); }
  };
  // Modify the save handler
  const handleSaveAllData = async (testName: string, testMappings: Mapping[]) => {
    setSaveAllLoading(prev => ({ ...prev, [testName]: true }));
    let hasError = false;
    try {
      if (!await saveReportNumbers()) return;
      const testId = testMappings[0].testId;
      const additionalData = {
        testId,
        requestId: testMappings[0].requestId,
        ...additionalInfo[testId]
      };
      // Save schema values
      for (const mapping of testMappings) {
        for (const schemaMapping of mapping.test.schemaMappings) {
          const observationData: ObservationData = {
            schemaId: schemaMapping.schemaId,
            productTestSampleMappingId: mapping.id,
            requestId: mapping.requestId,
            ...additionalInfo[testId]
          };
          try {
            await observationApi.updateAdditionalInfo(observationData);
          } catch (error) {
            hasError = true;
          }
        }
      }
      if (hasError) {
        toast.error('Some data failed to save');
      } else {
        toast.success('All data saved successfully');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Error saving data');
    } finally {
      setSaveAllLoading(prev => ({ ...prev, [testName]: false }));
    }
  };
  
  // Add the save button after Additional Information section
  // Add this interface for the observation data
  interface ObservationData {
    schemaId: string;
    productTestSampleMappingId: string;
    requestId: string;
    result?: {
      field: string;
      displayName: string;
      type: string;
      value: string;
    }[];
  }
  
  // Add this handler function
  const handleSaveValues = async (mapping: Mapping, schemaMapping: SchemaMapping) => {
    setSaveValuesLoading(prev => ({ ...prev, [mapping.id]: true }));
    console.log('Saving values for mapping:', mapping);
    console.log('Schema mapping:', schemaMapping);
    
    // Check if all required fields have values
    const hasEmptyFields = schemaMapping.schema.schema
      .filter(field => field.type !== 'formula')
      .some(field => schemaValues[mapping.id]?.[field.field] === undefined || String(schemaValues[mapping.id]?.[field.field]).trim() === '');
  
    if (hasEmptyFields) {
  
      setSaveValuesLoading(prev => ({ ...prev, [mapping.id]: false }));
      toast.error('Please fill in all fields before saving');
      return;
    }
  
    try {
      if (!await saveReportNumbers()) return;
      console.log('schemaValues:', schemaValues);
      const observationData: ObservationData = {
        schemaId: schemaMapping.schemaId,
        productTestSampleMappingId: mapping.id,
        requestId: mapping.requestId,
        result: schemaMapping.schema.schema.map(field => ({
          field: field.field,
          displayName: field.displayName,
          type: field.type,
          value: schemaValues[mapping.id]?.[field.field] ?? ''
        }))
      };

      console.log('Sending observation data:', observationData);
      
      const response = await observationApi.create(observationData);
      if (response.data) {
        toast.success('Values saved successfully');
      }
    } catch (error) {
      console.error('Error saving observation:', error);
      toast.error('Error saving values');
    } finally {
      setSaveValuesLoading(prev => ({ ...prev, [mapping.id]: false }));
    }
  };
  
  // Update the save button in the return statement

 
  // Add toggle handler for rows
  const toggleRow = (mappingId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(mappingId)) {
      newExpandedRows.delete(mappingId);
    } else {
      newExpandedRows.add(mappingId);
    }
    setExpandedRows(newExpandedRows);
  };
  
  // Add handler for schema field changes
  const handleSchemaFieldChange = (mappingId: string, field: string, value: string) => {
    setSchemaValues(prev => ({
      ...prev,
      [mappingId]: {
        ...(prev[mappingId] || {}),
        [field]: value
      }
    }));
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Observation Entry</h1>
        <section className="mb-6 rounded-lg bg-white p-6 shadow" aria-label="Report numbers">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Report Numbers</h2>
          {!numbersLoaded && <p role="alert" className="text-sm text-red-600">Unable to load report numbers. Please reload the page.</p>}
          {numbersLoaded && reportNumbers.length === 0 && (
            <p role="status" className="text-sm text-amber-700">
              No matching Report Schema was found for this contract. Add or select a Report Schema for its mapped product/tests to enter Test Report No. and ULR No.
            </p>
          )}
          {reportNumbers.map(item => (
            <div key={item.reportSchemaId} className="mb-5">
              <h3 className="mb-2 text-sm font-medium text-gray-700">{item.name || 'Test Report'}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {(['reportNo', ...(isNablContract ? ['ulrno'] : [])] as ('reportNo' | 'ulrno')[]).map(field => {
                  const key = `${item.reportSchemaId}.${field}`;
                  return <div key={field}>
                    <label htmlFor={key} className="mb-1 block text-sm font-medium text-gray-700">
                      {field === 'reportNo' ? 'Test Report No.' : 'ULR No.'} <span className="text-red-500">*</span>
                    </label>
                    <input id={key} type="text" value={item[field]} disabled={savingNumbers}
                      aria-invalid={!!numberErrors[key]} aria-describedby={`${key}-error`}
                      className={`w-full rounded-md border px-3 py-2 ${numberErrors[key] ? 'border-red-500' : 'border-gray-300'}`}
                      onChange={event => {
                        const value = event.target.value;
                        setReportNumbers(previous => previous.map(row => row.reportSchemaId === item.reportSchemaId ? { ...row, [field]: value } : row));
                        setNumberErrors(previous => ({ ...previous, [key]: '' }));
                      }} />
                    {numberErrors[key] && <p id={`${key}-error`} role="alert" className="mt-1 text-sm text-red-600">{numberErrors[key]}</p>}
                  </div>;
                })}
              </div>
            </div>
          ))}
          {reportNumbers.length > 0 && <button type="button" disabled={savingNumbers || !numbersLoaded}
            onClick={() => saveReportNumbers(true)} className="rounded-md bg-[#4D55CC] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            {savingNumbers ? 'Saving…' : 'Save Report Numbers'}
          </button>}
        </section>
        
        <div className="space-y-4">
          {Object.entries(groupedMappings).map(([productName, tests]) => (
            <div key={productName} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Product Header */}
              <button
                onClick={() => toggleProduct(productName)}
                className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-600">Material:</span>
                    <h2 className="text-lg font-semibold text-gray-900">{productName}</h2>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-medium text-gray-600">Test:</span>
                    <p className="text-sm text-gray-900">{Object.keys(tests).join(', ')}</p>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 transform transition-transform ${openProduct === productName ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
  
              {/* Product Content */}
              {openProduct === productName && (
                <div className="border-t border-gray-200">
                  {Object.entries(tests).map(([testName, testMappings]) => (
                    <>
                    <div key={testName} className="px-6 py-4">
                      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">{testName}</h3>
                        
                        {/* Sample Mappings Section */}
                        <div className="space-y-4 mb-6">
                          {testMappings.map((mapping) => (
                            <div key={mapping.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center gap-4">
                                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                                  Sample ID: {mapping.sample.sampleId}
                                </span>
                                <span className="text-sm text-gray-600">
                                  Type: {mapping.sample.sampleType}
                                </span>
                              </div>
  
                              <div className="mt-6 space-y-6">
                                {mapping.test.schemaMappings.map((schemaMapping) => (
                                  <>
                                  <div key={schemaMapping.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                    <div className="grid grid-cols-3 gap-6">
                                      {schemaMapping.schema.schema
                                        .filter(field => field.type !== 'formula')
                                        .map((field) => (
                                          <div key={field.field} className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                              {field.displayName}
                                            </label>
                                            <input
                                              type={field.type === 'number' ? 'number' : 'text'}
                                              step={field.type === 'number' ? 'any' : undefined}
                                              value={schemaValues[mapping.id]?.[field.field] ?? ''}
                                              onChange={(e) => handleSchemaFieldChange(mapping.id, field.field, e.target.value)}
                                              className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm text-sm"
                                              placeholder={`Enter ${field.displayName.toLowerCase()}`}
                                            />
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-end pt-4">
                                    <button
                                      onClick={() => handleSaveValues(mapping, schemaMapping)}
                                      disabled={!!saveValuesLoading[mapping.id] || savingNumbers || !numbersLoaded}
                                      className={`px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out ${saveValuesLoading[mapping.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                      {saveValuesLoading[mapping.id] ? (
                                        <span className="flex items-center"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>Saving...</span>
                                      ) : (
                                        'Save Values'
                                      )}
                                    </button>
                                  </div>
                                  </>
                                ))}
                                </div>
                              </div>
                          ))}
                        </div>
                        </div>
                        </div>
  
                        
<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
  <h4 className="text-lg font-medium text-gray-900 mb-6">Additional Information</h4>
  
  <div className="space-y-6">
    {/* New fields row */}
    
    {/* Dates and Additional Fields */}
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Test Start Date</label>
        <input
          type="date"
          value={additionalInfo[testMappings[0].testId]?.testStartDate || ''}
          onChange={(e) => handleAdditionalInfoChange(testMappings[0].testId, 'testStartDate', e.target.value)}
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Test Completion Date</label>
        <input
          type="date"
          value={additionalInfo[testMappings[0].testId]?.testCompletionDate || ''}
          onChange={(e) => handleAdditionalInfoChange(testMappings[0].testId, 'testCompletionDate', e.target.value)}
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Status on Test</label>
        <select
          value={additionalInfo[testMappings[0].testId]?.statusOnTest || ''}
          onChange={(e) => handleAdditionalInfoChange(testMappings[0].testId, 'statusOnTest', e.target.value)}
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Select Status</option>
          <option value="Pending">Pending</option>
          <option value="In-Progress">In-Progress</option>
          <option value="Partially Completed">Partially Completed</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Staff ID</label>
        <input
          type="text"
          value={additionalInfo[testMappings[0].testId]?.staffId || ''}
          onChange={(e) => handleAdditionalInfoChange(testMappings[0].testId, 'staffId', e.target.value)}
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Code No</label>
        <input
          type="text"
          value={additionalInfo[testMappings[0].testId]?.codeNo || ''}
          onChange={(e) => handleAdditionalInfoChange(testMappings[0].testId, 'codeNo', e.target.value)}
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Temperature</label>
        <input
          type="text"
          value={additionalInfo[testMappings[0].testId]?.temperature || ''}
          onChange={(e) => handleAdditionalInfoChange(testMappings[0].testId, 'temperature', e.target.value)}
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          placeholder="Enter temperature"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Humidity</label>
        <input
          type="text"
          value={additionalInfo[testMappings[0].testId]?.humidity || ''}
          onChange={(e) => handleAdditionalInfoChange(testMappings[0].testId, 'humidity', e.target.value)}
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          placeholder="Enter humidity"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Material Status</label>
        <select
          value={additionalInfo[testMappings[0].testId]?.materialStatus || ''}
          onChange={(e) => handleAdditionalInfoChange(testMappings[0].testId, 'materialStatus', e.target.value)}
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Select Material Status</option>
          <option value="Returnable">Returnable</option>
          <option value="Non-returnable">Non-returnable</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Sample Storage Condition</label>
        <input
          type="text"
          value={additionalInfo[testMappings[0].testId]?.sampleStorageCondition || ''}
          onChange={(e) => handleAdditionalInfoChange(testMappings[0].testId, 'sampleStorageCondition', e.target.value)}
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          placeholder="Enter sample storage condition"
        />
      </div>
      {productName.toLowerCase().includes('steel') && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Grade of Steel</label>
          <select
            value={additionalInfo[testMappings[0].testId]?.gradeOfSteel || ''}
            onChange={(e) => handleAdditionalInfoChange(testMappings[0].testId, 'gradeOfSteel', e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Select Grade of Steel</option>
            {STEEL_GRADES.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
        </div>
      )}
      {productName.toLowerCase().includes('steel') && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Include Bend and Rebend Test</label>
          <div className="flex space-x-6">
            {['Yes', 'No'].map((option) => (
              <label key={option} className="inline-flex items-center">
                <input
                  type="radio"
                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  value={option}
                  checked={
                    option === 'Yes'
                      ? (additionalInfo[testMappings[0].testId]?.includeBendRebendTest === true)
                      : (additionalInfo[testMappings[0].testId]?.includeBendRebendTest !== true)
                  }
                  onChange={() =>
                    handleAdditionalInfoChange(
                      testMappings[0].testId,
                      'includeBendRebendTest',
                      option === 'Yes'
                    )
                  }
                />
                <span className="ml-2 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
</div>
{/* Save All Button */}
<div className="flex justify-end mt-8 pt-6 border-t border-gray-200 mr-4 mb-4">
  <button 
    onClick={() => handleSaveAllData(testName, testMappings)}
    disabled={!!saveAllLoading[testName] || savingNumbers || !numbersLoaded}
    className={`px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out ${saveAllLoading[testName] ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {saveAllLoading[testName] ? (
      <span className="flex items-center"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>Saving...</span>
    ) : (
      'Save All Data'
    )}
  </button>
</div>
</>
                  ))}
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>
      <Toaster position="top-right" />
        </div>
        
  );
};
