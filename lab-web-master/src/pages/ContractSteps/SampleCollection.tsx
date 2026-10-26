import React, { useState, useEffect } from 'react';
import { productApi, testApi } from '../../services/api';
import { sampleCollectionApi } from '../../services/api';
import toast, { Toaster } from 'react-hot-toast';

interface Sample {
  id: string;
  sampleId: string;
  requestId: string;
  sampleType: string;
  quantity: string;
  sampleAvailability: string;
  // ... other sample properties
}

interface Product {
  id: string;
  name: string;
  tests: Test[];
}

interface Test {
  id: string;
  name: string;
  standardReference: string;
}


// In the component, replace quantity and remarks states with selectedSample
interface SampleCollectionProps {
  requestId?: string | undefined;
  setIsSampleMapped: (isSampleMapped: boolean) => void;
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
  modifiedUserId: string | null;
  status: string;
  contractReview: ContractReview;
}

interface Product {
  id: string;
  name: string;
}

interface Test {
  id: string;
  name: string;
  price: string;
  testingMethod: string | null;
  productId: string;
}

interface SampleDetails {
  id: string;
  sampleId: string;
  requestId: string;
  sampleType: string;
  quantity: string;
  sampleAvailability: boolean;
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
  sample: SampleDetails;
}

export const SampleCollection: React.FC<SampleCollectionProps> = ({ requestId, setIsSampleMapped }) => {
    const [products, setProducts] = useState<Product[]>([]);
        const [selectedProduct, setSelectedProduct] = useState<string>('');
        const [selectedTest, setSelectedTest] = useState<string>('');
        const [tests, setTests] = useState<Test[]>([]);
        const [selectedSample, setSelectedSample] = useState<string>('');
        const [selectedSampleId, setSelectedSampleId] = useState<string>('');

        const [samples, setSamples] = useState<Sample[]>([]);
        
        const [loading, setLoading] = useState(false);
         // Add these states
  const [newSample, setNewSample] = useState<{
    sampleType: string;
    sampleAvailability: string;
    sampleId: string;
    quantity: string;
  }>({
    sampleType: '',
    sampleAvailability: '',
    sampleId: generateSampleID(samples.length + 1),
    quantity: ''
  });
      // Add new state for mappings
const [mappings, setMappings] = useState<Mapping[]>([]);
const [addSampleLoading, setAddSampleLoading] = useState(false);

// Add useEffect to fetch sample collection mappings
useEffect(() => {
  const fetchMappings = async () => {
    if (requestId) {
      try {
        const response = await sampleCollectionApi.getMappingsByRequestId(requestId);
        const mappingData = response.data;
        
        setMappings(mappingData);
        setIsSampleMapped(mappingData.length > 0);
      } catch (error) {
        console.error('Error fetching mappings:', error);
      }
    }
  };

  fetchMappings();
}, [requestId, products, tests, samples]); // Add dependencies
        // Fetch samples when component mounts
        useEffect(() => {
          const fetchSamples = async () => {
            if (requestId) {
              setLoading(true);
              try {
                const response = await sampleCollectionApi.getSamplesByRequestId(requestId);
                setSamples(response.data.samples);
              } catch (error) {
                console.error('Error fetching samples:', error);
              } finally {
                setLoading(false);
              }
            }
          };
      
          fetchSamples();
        }, [requestId]);

        // Monitor samples state changes
        useEffect(() => {
          console.log('Samples state changed:', samples);
        }, [samples]);
    
        // Load products on component mount
        useEffect(() => {
          const fetchProducts = async () => {
            try {
              const response = await productApi.getAll();
              setProducts(response.data);
            } catch (error) {
              console.error('Error fetching products:', error);
            }
          };
          
          fetchProducts();
        }, []);
    
        // Load tests when product is selected
        useEffect(() => {
          const fetchTests = async () => {
            if (selectedProduct) {
              try {
                const response = await testApi.getTestbyProductId(selectedProduct);
                setTests(response.data);
              } catch (error) {
                console.error('Error fetching tests:', error);
              }
            } else {
              setTests([]);
            }
            setSelectedTest(''); // Reset test selection when product changes
          };
    
          fetchTests();
        }, [selectedProduct]);

        // Handle sample creation
  // Update handleAddSample function
  const handleAddSample = async (sampleData: any) => {
    setAddSampleLoading(true);
    try {
      if (newSample.sampleId && newSample.quantity && newSample.sampleType && newSample.sampleAvailability) {
        const response = await sampleCollectionApi.createSample({
          ...newSample,
          sampleId: newSample.sampleId,
          requestId
        });
        setSamples(prev => [...prev, response.data]);
        setNewSample({
          sampleType: '',
          sampleAvailability: '',
          sampleId: generateSampleID(samples.length + 1),
          quantity: ''
        });
        toast.success('Sample added successfully');
      } else {
        toast.error('Please fill in all required fields');
      }
    } catch (error: any) {
      console.error('Error creating sample:', error);
      toast.error(error.response?.data?.message || 'Failed to add sample');
    } finally {
      setAddSampleLoading(false);
    }
  };
    
        const handleAddTest = async () => {
          if (selectedProduct && selectedTest && selectedSample && requestId) {
            try {
              // Call the createMapping API
              await sampleCollectionApi.createMapping({
                requestId,
                productId: selectedProduct,
                testId: selectedTest,
                sampleId: selectedSample
              });
  
              // Fetch updated mappings
              const response = await sampleCollectionApi.getMappingsByRequestId(requestId);
              setMappings(response.data);
              setIsSampleMapped(response.data.length > 0);
  
              // Reset selections
              setSelectedProduct('');
              setSelectedTest('');
              setSelectedSample('');
  
              // Show success toast
              toast.success('Test mapping added successfully');
  
            } catch (error:any) {
              console.error('Error creating mapping:', error);
              toast.error(error.response?.data?.message || 'Failed to add test mapping');
            }
          }
        };
    
        // Update handleRemoveTest function
        const handleRemoveTest = async (mappingId: string) => {
          if (window.confirm('Are you sure you want to remove this test mapping?')) {
            try {
              await sampleCollectionApi.deleteMapping(mappingId);
              
              // Update the local state after successful deletion
              setMappings(prevMappings => 
                prevMappings.filter(mapping => mapping.id !== mappingId)
              );

              setIsSampleMapped(mappings.length > 0);
              
              toast.success('Test mapping removed successfully');
            } catch (error) {
              console.error('Error removing test mapping:', error);
              toast.error('Failed to remove test mapping');
            }
          }
        };
        

   // Add this new handler function
   const handleDeleteSample = async (sampleId: string) => {
    if (window.confirm('Are you sure you want to delete this sample?')) {
      try {
        await sampleCollectionApi.deleteSample(sampleId);
        setSamples(prevSamples => prevSamples.filter(sample => sample.id !== sampleId));
        toast.success('Sample deleted successfully');
      } catch (error) {
        console.error('Error deleting sample:', error);
        toast.error('Failed to delete sample');
      }
    }
  };

  function generateSampleID(sequenceNumber:number) {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const formattedSequence = String(sequenceNumber).padStart(4, '0');
    return `CC/CCTC/${month}${year}/${formattedSequence}`;
  }

  
// Function to handle sample changes
function handleSampleChange(index:number, field:string, value:string) {
  console.log('handleSampleChange called:', { index, field, value });
  console.log('Current samples before update:', samples);
  
  const updatedSamples = samples.map((sample, i) => {
    if (i === index) {
      const updatedSample = { ...sample };
      if (field === 'sampleId') {
        updatedSample.sampleId = value;
        console.log('Updated sampleId to:', value);
      } else if (field === 'sampleType') {
        updatedSample.sampleType = value;
      } else if (field === 'quantity') {
        updatedSample.quantity = value;
      } else if (field === 'sampleAvailability') {
        updatedSample.sampleAvailability = value;
      }
      return updatedSample;
    }
    return sample;
  });

  console.log('Updated samples:', updatedSamples);
  setSamples(updatedSamples);
  setSelectedSampleId(updatedSamples[index].id)
  console.log('selectedSampleId set to:', updatedSamples[index].id)
}

// Function to handle sample update
async function handleUpdateSample(id:string) {
  
  console.log('handleUpdateSample called with id:', id);
  console.log('Current samples state:', samples);
  
  const sampleToUpdate = samples.find(sample => sample.id === id);
  console.log('Sample to update:', sampleToUpdate);
  if (sampleToUpdate?.sampleId && sampleToUpdate?.quantity && sampleToUpdate?.sampleType && sampleToUpdate?.sampleAvailability) {
  try {
    const updateData = {
      sampleId: sampleToUpdate?.sampleId,
      sampleType: sampleToUpdate?.sampleType,
      quantity: sampleToUpdate?.quantity || undefined,
      sampleAvailability: sampleToUpdate?.sampleAvailability,
      requestId
    };
    
    console.log('Sending update data:', updateData);
    
    const response = await sampleCollectionApi.updateSample(id, updateData);
    console.log('Update response:', response);

    if (response) {
      toast.success('Sample updated successfully');
      
      // Refresh samples data from server to reflect the actual changes
      if (requestId) {
        console.log('Refreshing samples from server...');
        const updatedResponse = await sampleCollectionApi.getSamplesByRequestId(requestId);
        console.log('Refreshed samples:', updatedResponse.data.samples);
        setSamples(updatedResponse.data.samples);
      }
    } else {
      toast.error('Failed to update sample');
    }
  } catch (error) {
    console.error('Error updating sample:', error);
    toast.error('Failed to update sample');
  }
  setSelectedSampleId('')
}
else{
  toast.error("Please enter required fields");
}
}
  
  // Update the table header and sample rows in the return JSX
  

  return (
    <div className=" mx-auto">
                
          <div className="rounded-lg mb-8">
        
        {/* Selected Tests Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            
              {/* Product-Test-Sample Mapping Section */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Sample Collection Details</h2>
                </div>
              
                <div className="p-6">
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
              
                 
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample Availability</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {samples.map((sample, index) => (
                      <React.Fragment key={sample.id}>
                      {
                        selectedSampleId === sample.id ? (

                        <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                          {index + 1}
                        </td> 
                      
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                          <input
                            type="text"
                            value={sample.sampleId}
                            onChange={(e) => handleSampleChange(index, 'sampleId', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                            placeholder={generateSampleID(index + 1)}
                          />
                          
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                          <input
                            type="text"
                            value={sample.sampleType}
                            onChange={(e) => handleSampleChange(index, 'sampleType', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                          <input
                            type="number"
                            value={sample.quantity}
                            onChange={(e) => handleSampleChange(index, 'quantity', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                          <select
                            value={sample.sampleAvailability}
                            onChange={(e) => handleSampleChange(index, 'sampleAvailability', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                          >
                            <option value="">Select availability</option>
                            <option value="Sufficient">Sufficient</option>
                            <option value="Not Sufficient">Not Sufficient</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdateSample(sample.id)}
                              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                            >
                              <svg 
                                className="w-4 h-4 mr-1" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Update
                            </button>
                            <button
                              onClick={() => setSelectedSampleId('')}
                              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                            >
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>)
                        
                      :
                      (<tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                        {sample.sampleId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200"> 
                        {sample.sampleType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                        {sample.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                        {sample.sampleAvailability}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedSampleId(sample.id)}
                              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                            >
                              <svg 
                                className="w-4 h-4 mr-1" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSample(sample.id)}
                              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                            >
                              <svg 
                                className="w-4 h-4 mr-1" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>)
                     
}
                      
                      </React.Fragment>
                    ))}
                  </tbody>

                {/* Input Row */}
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr className="bg-gray-50">
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                 {samples?.length ? samples?.length + 1 : 1 }
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                      value={newSample.sampleId}
                      onChange={(e) => setNewSample({ ...newSample, sampleId: e.target.value })}
                      placeholder="Enter sample id"
                    />
                  </td>
                 
                  <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                      value={newSample.sampleType}
                      onChange={(e) => setNewSample({ ...newSample, sampleType: e.target.value })}
                      placeholder="Enter type"
                    />
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                    <input
                      type="number"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                      value={newSample.quantity}
                      onChange={(e) => setNewSample({ ...newSample, quantity: e.target.value })}
                      placeholder="Enter quantity"
                    />
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                    <select
                      className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                      value={newSample.sampleAvailability}
                      onChange={(e) => setNewSample({ ...newSample, sampleAvailability: e.target.value })}
                    >
                      <option value="">Select availability</option>
                      <option value="Sufficient">Sufficient</option>
                      <option value="Not Sufficient">Not Sufficient</option>
                    </select>
                  </td>
                  <td colSpan={3} className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                  <button
          onClick={() => handleAddSample({ /* sample data */ })}
          disabled={addSampleLoading}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${addSampleLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {addSampleLoading ? (
            <span className="flex items-center"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>Adding...</span>
          ) : (
            'Add Sample'
          )}
        </button>
                  </td>
                </tr>
                </tfoot>
            </table>
            
                  
                 
                  </div>
                  </div>
                </div>
              </div>
      </div>
          {/* Update the Product-Test-Sample Mapping section layout */}
          <div className="rounded-lg mb-8">
        
        
            {/* Selected Tests Table */}
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                
                  {/* Product-Test-Sample Mapping Section */}
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-900">Material-Test-Sample Mapping</h2>
                    </div>
                  
                    <div className="p-6">
                      <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Material</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Test</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Sample</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                          </thead>
                          {mappings && mappings.length > 0 && (
  <tbody className="bg-white divide-y divide-gray-200">
                              {mappings.map((mapping: Mapping) => (
                                <tr key={mapping.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">{mapping.product.name}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">{mapping.test.name}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                                    {`${mapping.sample.sampleId} - ${mapping.sample.sampleType} (Qty: ${mapping.sample.quantity || 'N/A'})`}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button
                                      onClick={() => handleRemoveTest(mapping.id)}
                                      className="text-red-600 hover:text-red-800 inline-flex items-center"
                                    >
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                      Remove
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>

                              )}
                            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                  <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                  >
                                    <option value="">Select a material</option>
                                    {products.map(product => (
                                      <option key={product.id} value={product.id}>{product.name}</option>
                                    ))}
                                  </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                  <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                                    value={selectedTest}
                                    onChange={(e) => setSelectedTest(e.target.value)}
                                    disabled={!selectedProduct}
                                  >
                                    <option value="">Select a test</option>
                                    {tests.map(test => (
                                      <option key={test.id} value={test.id}>{test.name}</option>
                                    ))}
                                  </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                  <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                                    value={selectedSample}
                                    onChange={(e) => setSelectedSample(e.target.value)}
                                    disabled={!selectedTest}
                                  >
                                    <option value="">Select a sample</option>
                                    {samples?.map((sample) => (
                                      <option key={sample.sampleId} value={sample.id}>
                                        {`Sample ${sample.sampleId} - ${sample.sampleType}`}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={handleAddTest}
                                    disabled={!selectedProduct || !selectedTest || !selectedSample}
                                    className="w-full px-4 py-2 bg-[#4D55CC] text-white rounded-md hover:bg-[#3A3F99] disabled:bg-gray-300 disabled:cursor-not-allowed"
                                  >
                                    Add Test
                                  </button>
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                      
                     
                      </div>
                      </div>
                    </div>
                  </div>

           
          </div>
          <Toaster position="top-right" gutter={24}  />
          </div>
  );
};



