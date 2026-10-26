import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestApi } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { ProductTestSampleMapping } from '../types/request';

interface ContractReview {
  id: string;
  customerName: string;
  mobileNo: string;
  emailId: string;
  nameOfWork: string;
  location: string;
}

interface Request {
  id: string;
  formId: string;
  status: string;
  contractReview: ContractReview;
  productTestSampleMappings: ProductTestSampleMapping[];
}

interface Meta {
  limit: number;
  page: number;
  pageCount: number;
  total: number;
}

export const LabTestTable: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchFormId, setSearchFormId] = useState('');
  const [searchCustomerName, setSearchCustomerName] = useState('');
  const [searchMobileNo, setSearchMobileNo] = useState('');
  const [searchEmailId, setSearchEmailId] = useState('');

  useEffect(() => {
    fetchRequests(currentPage, pageSize, searchFormId, searchCustomerName, searchMobileNo, searchEmailId);
    // eslint-disable-next-line
  }, [currentPage, pageSize]);

  const fetchRequests = async (page: number, limit: number, searchFormId: string, searchCustomerName: string, searchMobileNo: string, searchEmailId: string) => {
    try {
      setLoading(true);
      // Pass page and limit to the API
      const response = await requestApi.getRequestsByLabUser(page, limit, searchFormId, searchCustomerName, searchMobileNo, searchEmailId);
      const meta: Meta = response.data.meta;
      setRequests(response.data.data || []);
      setTotalCount(meta.total || 0);
      setTotalPages(meta.pageCount || 1);
      // New API: response.data = { data: Request[], meta: { limit, page, pageCount, total } }
      
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = (requestId: string) => {
    navigate(`/observation-entry/${requestId}`);
  };

  // Next/Previous page implementation
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      {/* Header Section */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Requests</h1>
          <p className="mt-2 text-sm text-gray-600">Manage and track all test requests</p>
        </div>
      </div>

      <form
        className="mb-8 w-full bg-white rounded-lg shadow-sm border border-gray-100 px-6 py-4"
        onSubmit={(e) => {
          e.preventDefault();
          setCurrentPage(1);
          fetchRequests(1, pageSize, searchFormId, searchCustomerName, searchMobileNo, searchEmailId);
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="formId" className="block text-xs font-semibold text-gray-700 mb-1">
              Form ID
            </label>
            <input
              id="formId"
              type="text"
              value={searchFormId}
              onChange={(e) => setSearchFormId(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#4D55CC] focus:ring-[#4D55CC] text-sm"
              placeholder="Form ID"
            />
          </div>
          <div>
            <label htmlFor="customerName" className="block text-xs font-semibold text-gray-700 mb-1">
              Customer Name
            </label>
            <input
              id="customerName"
              type="text"
              value={searchCustomerName}
              onChange={(e) => setSearchCustomerName(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#4D55CC] focus:ring-[#4D55CC] text-sm"
              placeholder="Customer Name"
            />
          </div>
          <div>
            <label htmlFor="mobileNo" className="block text-xs font-semibold text-gray-700 mb-1">
              Mobile No
            </label>
            <input
              id="mobileNo"
              type="text"
              value={searchMobileNo}
              onChange={(e) => setSearchMobileNo(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#4D55CC] focus:ring-[#4D55CC] text-sm"
              placeholder="Mobile No"
            />
          </div>
          <div>
            <label htmlFor="emailId" className="block text-xs font-semibold text-gray-700 mb-1">
              Email ID
            </label>
            <input
              id="emailId"
              type="text"
              value={searchEmailId}
              onChange={(e) => setSearchEmailId(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#4D55CC] focus:ring-[#4D55CC] text-sm"
              placeholder="Email ID"
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-[#4D55CC] hover:bg-[#211C84] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D55CC] transition"
          >
            Search
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Form ID</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Customer Name</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Mobile No</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Test(s)</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name of Work</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Location</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    </div>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">No records found</td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id}>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{request.formId}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{request.contractReview.customerName}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{request.contractReview.mobileNo}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{request.contractReview.emailId}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {
                        // Get unique test names
                        (() => {
                          const testNames = [...new Set(request.productTestSampleMappings.map(mapping => mapping.test?.name).filter(Boolean))];
                          if (testNames.length <= 1) {
                            return testNames.join(', ');
                          } else {
                            return testNames.map(name => <div key={name}>{name}</div>);
                          }
                        })()
                      }
                      </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{request.contractReview.nameOfWork}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{request.contractReview.location}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{request.status}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleTest(request.id)}
                          className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                          title="Test"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
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
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-2 sm:mb-0">
            <span className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">
                {requests.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              </span>
              {' '}to{' '}
              <span className="font-medium">
                {requests.length === 0 ? 0 : (currentPage - 1) * pageSize + requests.length}
              </span>
              {' '}of{' '}
              <span className="font-medium">{totalCount}</span> results
            </span>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="text-sm text-gray-700">Rows per page:</label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={handlePageSizeChange}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              {[5, 10, 20, 50, 100].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className="relative inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};