import React, { useEffect, useState } from 'react';
import { requestApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { sampleCollectionApi } from '../services/api';
import { authApi } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

 // Add this interface with your other interfaces
 interface User {
   id: string;
   firstName: string;
   lastName: string;
   email: string;
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

interface RequestData {
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
  productTestSampleMappings:ProductTestSampleMappings[]
}


interface Mapping {
  id: string;
  test: {
    name: string;
  };
  sample: {
    sampleId: string;
  };
}

interface ProductTestSampleMappings{
  productId:string;
  testId:string;
  sampleId:string;
  product:{
    id:string;
    name:string;
  };
  test:{
    id:string;
    name:string;
    isSiteTest: boolean;
  }
}

export const ContractTable = () => {
  // Replace the existing RequestData state with:
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  // Add this state at the top with other state declarations
  const [pageSize, setPageSize] = useState(10);
   // Add new state for status options
   const [statusOptions, setStatusOptions] = useState<string[]>([]);
    // Add these states in your component
 const [users, setUsers] = useState<User[]>([]);
 const [selectedUser, setSelectedUser] = useState('');
   
// Add these states in your component
const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
const [selectedRequestId, setSelectedRequestId] = useState<string>('');

 // Add this interface near your other interfaces
 interface MappingWithUser extends Mapping {
   userId?: string;
 }

 // Update the mappings state
 const [mappings, setMappings] = useState<MappingWithUser[]>([]);

 // Update the handleAssignClick function
 const handleAssignClick = async (requestId: string) => {
   setSelectedRequestId(requestId);
   try {
     const response = await sampleCollectionApi.getMappingsByRequestId(requestId);
     // Initialize each mapping with a selectedUser field
     const mappingsWithUsers = response.data.map((mapping: Mapping) => ({
       ...mapping,
       selectedUser: ''
     }));
     setMappings(mappingsWithUsers);
   } catch (error) {
     console.error('Error fetching mappings:', error);
     setMappings([]);
   }
   setIsAssignModalOpen(true);
 };

// Add this useEffect after your other useEffects
useEffect(() => {
  const fetchUsers = async () => {
    try {
      const response = await authApi.getAll({ page: 1, pageSize: 1000 });
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

fetchUsers();
}, []);

// Update the Dialog table body section
            
   // Add useEffect to fetch status options when component mounts
   useEffect(() => {
     const fetchStatuses = async () => {
       try {
         const response = await requestApi.getRequestStatuses();
         setStatusOptions(response.data);
       } catch (error) {
         console.error('Error fetching statuses:', error);
       }
     };
     fetchStatuses();
   }, []);
   
   // Update the status select element
  
  // Update fetchRequests function
  const fetchRequests = async (page: number) => {
    setIsLoading(true);
    try {
      const params = {
        page,
        pageSize,
        formId: searchFormNo,
        customerName: searchCustomerName,
        mobileNo: searchMobileNo,
        status: searchStatus
      };
  
      const response = await requestApi.getAll(params);
      setRequests(response.data.data);
      const total = response.data.meta?.total || 0;
      setTotalPages(Math.ceil(total / pageSize) || 1);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };
  
 
  const [searchFormNo, setSearchFormNo] = useState('');
  const [searchCustomerName, setSearchCustomerName] = useState('');
  const [searchMobileNo, setSearchMobileNo] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  
  // Add this before the return statement
  // Update useEffect to only handle page and pageSize changes
  useEffect(() => {
    fetchRequests(currentPage);
  }, [currentPage, pageSize]); // Remove search parameters from dependencies
  
  // Update handleSearch function
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page
    fetchRequests(1); // Fetch with search parameters
  };
  
  // Add useNavigate import at the top

// Add navigate inside the component
const navigate = useNavigate();

// Update the handleEdit function
const handleEdit = (id: string) => {
  navigate(`/contract-edit/${id}`);
};

const handleDeleteRequest = async (requestId: string) => {
  if (window.confirm('Are you sure you want to delete this contract request?')) {
    try {
      await requestApi.delete(requestId);
      setRequests(prev => prev.filter(r => r.id !== requestId));
      toast.success('Request deleted successfully');
    } catch (error) {
      toast.error('Failed to delete request');
      console.error('Delete error:', error);
    }
  }
};

// Add this handler function with your other handlers
const handleTestResult = (requestId: string) => {
  navigate(`/observation-entry/${requestId}`);
};
 const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, requestId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    const formData = new FormData();
    formData.append('requestId', requestId);
    formData.append('file', file);

    try {
      await requestApi.uploadPdf(formData);
      toast.success('Report uploaded successfully.');
      // Optionally refresh data or update UI here
      fetchRequests(currentPage); // Refresh table after upload
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to upload PDF');
      console.error(error);
    }
  };
const handleReport = (requestId: string) => {
  navigate(`/report/${requestId}`); 
}

// Update the actions column in the table
 
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      {/* Header Section */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contract Requests</h1>
          <p className="mt-2 text-sm text-gray-600">Manage and track all contract review requests</p>
        </div>
        <button
          onClick={() => navigate('/contract-create')}
          className="px-6 py-2.5 bg-[#4D55CC] text-white text-sm font-medium rounded-lg hover:bg-[#211C84] focus:outline-none focus:ring-2 focus:ring-[#4D55CC] focus:ring-offset-2 transition-colors duration-200 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Contract
        </button>
      </div>
  
      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="formNo" className="block text-sm font-medium text-gray-700 mb-1.5">Form No.</label>
            <input
              type="text"
              id="formNo"
              value={searchFormNo}
              onChange={(e) => setSearchFormNo(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 shadow-sm focus:border-[#4D55CC] focus:ring-[#4D55CC] text-sm transition-colors duration-200 h-11"
              placeholder="Enter form number"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1.5">Customer Name</label>
            <input
              type="text"
              id="customerName"
              value={searchCustomerName}
              onChange={(e) => setSearchCustomerName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 shadow-sm focus:border-[#4D55CC] focus:ring-[#4D55CC] text-sm transition-colors duration-200 h-10"
              placeholder="Enter customer name"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="mobileNo" className="block text-sm font-medium text-gray-700 mb-1.5">Mobile No.</label>
            <input
              type="text"
              id="mobileNo"
              value={searchMobileNo}
              onChange={(e) => setSearchMobileNo(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 shadow-sm focus:border-[#4D55CC] focus:ring-[#4D55CC] text-sm transition-colors duration-200 h-10"
              placeholder="Enter mobile number"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
           
            <select
              id="status"
              value={searchStatus}
              onChange={(e) => setSearchStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 shadow-sm focus:border-[#4D55CC] focus:ring-[#4D55CC] text-sm transition-colors duration-200 h-11"
            >
              <option value="">All Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="ml-auto">
            <button
              onClick={handleSearch}
              className="h-11 px-8 bg-[#4D55CC] text-white text-sm font-medium rounded-lg hover:bg-[#211C84] focus:outline-none focus:ring-2 focus:ring-[#4D55CC] focus:ring-offset-2 transition-colors duration-200 whitespace-nowrap flex items-center gap-2"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor" 
                className="w-4 h-4"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" 
                />
              </svg>
              Search Requests
            </button>
          </div>
        </div>
      </div>
  
      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">S.No</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact Person</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Material</th>
              
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date of Casting</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#4D55CC]"></div>
                      <span>Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                    No requests found
                  </td>
                </tr>
              ) : (
                requests.map((request, index) => (
                  // Update the table row to include action buttons
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    
                    <td className="px-6 py-4 text-sm text-gray-900">{request.contractReview?.customerName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{request.contractReview?.contactPerson}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{request.contractReview?.mobileNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {
                        Array.from(
                          new Set(
                            (request.productTestSampleMappings || [])
                              .map(mapping => mapping.product?.name)
                              .filter(Boolean)
                          )
                        ).join(', ')
                      }
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{request.contractReview?.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {request.contractReview?.dateOfCasting ? new Date(request.contractReview.dateOfCasting).toLocaleDateString() : ''}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        request.status === 'Contract Review Created' ? 'bg-blue-100 text-blue-800' :
                        request.status === 'Sample Collection' ? 'bg-purple-100 text-purple-800' :
                        request.status === 'Payment Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEdit(request.id)}
                          className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleAssignClick(request.id)}
                          className={`text-green-600  ${
                            request.status !== 'Sample Collected' 
                              ? 'opacity-100' 
                              : 'hover:text-green-800'
                          }`}
                          title={request.status !== 'Sample Collected' ? 'Sample collection required' : 'Assign Tests'}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75"></path>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(request.id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                       {request.productTestSampleMappings.some(mapping => mapping?.test?.isSiteTest) && (
                            <label className="cursor-pointer text-indigo-600 hover:text-indigo-800 transition-colors duration-200" title="Upload PDF">
                              <input
                                type="file"
                                accept="application/pdf"
                                style={{ display: 'none' }}
                                onChange={e => handleFileUpload(e, request.id)}
                              />
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 8l-4-4m4 4l4-4m-4 4V4m8 16H4" />
                              </svg>
                            </label>
                         )} 
                        <button
      onClick={() => handleReport(request.id)}
      className="text-orange-600 hover:text-orange-800 transition-colors duration-200"
      title="Generate Report"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
  
        {/* Enhanced Pagination */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-700">
                {requests.length > 0 ? (
                  <>
                    Showing page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </>
                ) : (
                  'No results'
                )}
              </p>
              <div className="flex items-center space-x-2">
                <label htmlFor="pageSize" className="text-sm text-gray-600">
                  Rows per page:
                </label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-md border-gray-300 text-sm focus:border-[#4D55CC] focus:ring-[#4D55CC]"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || requests.length === 0}
                className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex space-x-1">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  const isCurrentPage = pageNumber === currentPage;
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      disabled={requests.length === 0}
                      className={`px-4 py-2 text-sm font-medium rounded-md border ${
                        isCurrentPage 
                          ? 'bg-[#4D55CC] text-white border-[#4D55CC]' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || requests.length === 0}
                className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add this modal at the end of your return statement, before the closing div */}
<Dialog
  open={isAssignModalOpen}
  onClose={() => {}} // Remove the close action
  className="relative z-50"
>
  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
  <div className="fixed inset-0 flex items-center justify-center p-4">
    <Dialog.Panel className="mx-auto w-full max-w-4xl rounded-xl bg-white p-0 shadow-2xl flex flex-col" style={{ maxHeight: '70vh' }}>
      <div className="flex items-center justify-between mb-6 px-8 pt-8">
        <Dialog.Title className="text-xl font-semibold text-gray-900">
          Assign Tests to Users
        </Dialog.Title>
        <button
          onClick={() => setIsAssignModalOpen(false)}
          className="text-gray-400 hover:text-gray-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-8 pb-4" style={{ minHeight: 0 }}>
        <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Test Name
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Sample ID
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Assigned User
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mappings.map((mapping, index) => (
                  <tr key={mapping.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{mapping.test.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{mapping.sample.sampleId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={mapping.userId}
                        onChange={(e) => {
                          const newMappings = [...mappings];
                          newMappings[index].userId = e.target.value;
                          setMappings(newMappings);
                        }}
                        className="block w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg cursor-pointer hover:border-[#4D55CC] focus:outline-none focus:ring-2 focus:ring-[#4D55CC] focus:ring-opacity-50 focus:border-[#4D55CC] transition-all duration-200"
                      >
                        <option value="" className="text-gray-500">Select User</option>
                        {users.map((user) => (
                          <option 
                            key={user.id} 
                            value={user.id}
                            className="py-2 text-gray-900"
                          >
                            {user.firstName} {user.lastName}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="px-8 py-4 border-t border-gray-200 bg-white flex justify-end sticky bottom-0 z-10">
        <button
          onClick={() => setIsAssignModalOpen(false)}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D55CC] transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          onClick={async () => {
            try {
              // Filter mappings that have selected users
              const assignmentPromises = mappings
                .filter(mapping => mapping.userId)
                .map(mapping => 
                  sampleCollectionApi.assignUserToMapping(mapping.id, mapping.userId!)
                );
              // Execute all assignments in parallel
              await Promise.all(assignmentPromises);
              // Close modal and show success message
              setIsAssignModalOpen(false);
              toast.success('Users assigned successfully');
              fetchRequests(currentPage);
              // Refresh the requests data
              fetchRequests(currentPage);
            } catch (error) {
              console.error('Error assigning users:', error);
              toast.error('Failed to assign users');
            }
          }}
          className="ml-3 px-6 py-2.5 bg-[#4D55CC] text-white font-medium rounded-lg hover:bg-[#211C84] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D55CC] transition-colors duration-200"
        >
          Save Changes
        </button>
      </div>
    </Dialog.Panel>
  </div>
</Dialog>
<Toaster position="top-right" />
    </div>
  );
};



// Update the actions column in the table




