import React, { useEffect, useState } from 'react';
import { mobileQuotationApi, mobileRequestApi } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { Dialog } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import * as base64 from 'base64-js';

export interface AppUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  password: string;
  createdDateTime: string;
}

export interface Test {
  id: string;
  name: string;
  price: string;
  createdDateTime: string;
  product: Product;
}

export interface Product {
  id: string;
  name: string;
}

export interface RequestTest {
  id: string;
  requestId: string;
  testId: string;
  price: string;
  test: Test;
}

export interface AppRequest {
  id: string;
  name: string;
  designation: string;
  organization: string;
  address: string;
  gstNumber: string;
  mobileNumber: string;
  email: string;
  projectName: string;
  siteLocation: string;
  testPoints: string;
  immediate: boolean;
  specificDate: string;
  confirmed: boolean;
  reason: string;
  appUserId: string;
  appUser: AppUser;
  status: string;
  createdDateTime: string;
  requestTests: RequestTest[];
}

export const AppRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<AppRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AppRequest | null>(null);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const navigate = useNavigate();
  const [isTestsModalOpen, setIsTestsModalOpen] = useState(false);
  const [selectedRequestTests, setSelectedRequestTests] = useState<RequestTest[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [searchMobileNo, setSearchMobileNo] = useState('');
  const [searchEmailId, setSearchEmailId] = useState('');

  useEffect(() => {
    fetchRequests(currentPage, pageSize, searchName, searchMobileNo, searchEmailId);
    // eslint-disable-next-line
  }, [currentPage, pageSize]);

  const fetchRequests = async (
    page: number,
    limit: number,
    searchName: string,
    searchMobileNo: string,
    searchEmailId: string
  ) => {
    try {
      setLoading(true);
      const response = await mobileRequestApi.getAll(page, limit, searchName, searchMobileNo, searchEmailId);
      // Expecting response.data to be { data: AppRequest[], total: number, page: number, pageSize: number, totalPages: number }
      setRequests(response.data.data || []);
      setTotalPages(Math.ceil((response.data.total || 0) / limit) || 1);
      setTotalResults(response.data.total || 0);
    } catch (error) {
      toast.error('Failed to fetch app requests');
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = async (request: AppRequest) => {
    setSelectedRequest(request);
    setIsStatusModalOpen(true);
    setStatuses(['Pending', 'Accept', 'Discard']);
  };

  const handleStatusUpdate = async () => {
    if (!selectedRequest) return;
    try {
      await mobileRequestApi.updateStatus(selectedRequest.id, { status: selectedStatus });
      toast.success('Status updated successfully');
      setIsStatusModalOpen(false);
      fetchRequests(currentPage, pageSize, searchName, searchMobileNo, searchEmailId);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const openTestsModal = (request: AppRequest) => {
    setSelectedRequestTests(request.requestTests);
    setIsTestsModalOpen(true);
  };

  const fetchPdf = async (id: string) => {
    setLoading(true);
    try {
      const response = await mobileQuotationApi.getInvoice(id);
      base64.fromByteArray(new Uint8Array(response.data)); // Not used, but kept for compatibility
      const blob = new Blob([response.data], { type: 'application/pdf' });
      setShowModal(true);
      const pdfUrl = URL.createObjectURL(blob);
      setPdfUrl(pdfUrl);
    } catch (error) {
      console.error('Error fetching PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="p-6">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">App Requests</h1>
            <p className="mt-2 text-sm text-gray-600">Manage and track all app requests</p>
          </div>
        </div>

        <form
          className="mb-8 w-full bg-white rounded-lg shadow-sm border border-gray-100 px-6 py-4"
          onSubmit={e => {
            e.preventDefault();
            setCurrentPage(1);
            fetchRequests(1, pageSize, searchName, searchMobileNo, searchEmailId);
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="searchName" className="block text-xs font-semibold text-gray-700 mb-1">
                Name
              </label>
              <input
                id="searchName"
                type="text"
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#4D55CC] focus:ring-[#4D55CC] text-sm"
                placeholder="Name"
              />
            </div>
            <div>
              <label htmlFor="searchMobileNo" className="block text-xs font-semibold text-gray-700 mb-1">
                Mobile No
              </label>
              <input
                id="searchMobileNo"
                type="text"
                value={searchMobileNo}
                onChange={e => setSearchMobileNo(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#4D55CC] focus:ring-[#4D55CC] text-sm"
                placeholder="Mobile No"
              />
            </div>
            <div>
              <label htmlFor="searchEmailId" className="block text-xs font-semibold text-gray-700 mb-1">
                Email ID
              </label>
              <input
                id="searchEmailId"
                type="text"
                value={searchEmailId}
                onChange={e => setSearchEmailId(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#4D55CC] focus:ring-[#4D55CC] text-sm"
                placeholder="Email ID"
              />
            </div>
            <div className="flex justify-start mt-4">
              <button
                type="submit"
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-[#4D55CC] hover:bg-[#211C84] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D55CC] transition"
              >
                Search
              </button>
            </div>
          </div>
        </form>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="whitespace-nowrap px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Sl. No.</th>
                  <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Designation</th>
                  <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Organization</th>
                  <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Address</th>
                  <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mobile No</th>
                  <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Project Name</th>
                  <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Site Location</th>
                  <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Test Points</th>
                  <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Confirmed</th>
                  <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created By</th>
                  <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created User Email</th>
                  <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created User Mobile No</th>
                  <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">createdDateTime</th>
                  <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tests</th>
                  <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={18} className="text-center py-4">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requests.map((request, idx) => (
                    <tr key={request.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{request.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{request.designation}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{request.organization}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{request.address}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{request.email}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{request.mobileNumber}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{request.projectName}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{request.siteLocation}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{request.testPoints}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{request.confirmed ? 'Yes' : 'No'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{request.appUser.firstName}{' '}{request.appUser.lastName}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{request.appUser.email}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{request.appUser.mobileNumber}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{request.createdDateTime ? new Date(request.createdDateTime).toLocaleDateString() : ''}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <a
                          href="#"
                          className="text-blue-600 underline cursor-pointer"
                          onClick={e => {
                            e.preventDefault();
                            openTestsModal(request);
                          }}
                        >
                          View Tests
                        </a>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {request.status === 'Pending' ? (
                          <a
                            href="#"
                            className="text-blue-600 underline cursor-pointer"
                            onClick={e => {
                              e.preventDefault();
                              openStatusModal(request);
                            }}
                          >
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              ⏳ Pending
                            </span>
                          </a>
                        ) : request.status === 'Accept' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Accept
                          </span>
                        ) : request.status === 'Payment Initiated' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            💰 Payment Initiated
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                            {request.status}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {(request.status === 'Pending' || request.status === 'Payment Initiated') && (
                          <button
                            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                            onClick={() => navigate(`/quotation/${request.id}`)}
                          >
                            Create Quotation
                          </button>
                        )}
                        {request.status === 'Payment Completed' && (
                          <button
                            className="px-3 py-1 bg-green-400 text-white rounded hover:bg-green-700 transition"
                            onClick={() => navigate(`/contract-create/null/${request.id}`)}
                          >
                            Create Contract
                          </button>
                        )}
                        {(request.status !== 'Pending' && request.status !== 'Accept' && request.status !== 'Discard') && (
                          <button
                            className="px-3 py-1 ml-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                            onClick={() => navigate(`/invoice/${request.id}`)}
                          >
                            Invoice
                          </button>
                        )}
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
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {totalResults === 0
                    ? 0
                    : (currentPage - 1) * pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, totalResults)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{totalResults}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                      currentPage === idx + 1
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
        <Toaster position="top-right" />
      </div>

      {/* Status Update Modal */}
      <Dialog open={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
            <Dialog.Title className="text-lg font-semibold mb-4">Update Status</Dialog.Title>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  setSelectedStatus(newStatus);
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 border rounded-md text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Update
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
      {/* Tests Modal */}
      <Dialog open={isTestsModalOpen} onClose={() => setIsTestsModalOpen(false)} className="relative z-50 w-lg">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-lg rounded-xl bg-white p-8 shadow-2xl">
            <Dialog.Title className="text-lg font-semibold mb-4">Tests</Dialog.Title>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {selectedRequestTests.map(test => (
                    <tr key={test.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 border-b border-gray-300">{test.test.product.name} - {test.test.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setIsTestsModalOpen(false)}
                className="px-4 py-2 border rounded-md text-gray-700"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Invoice PDF</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-auto flex-1">
              {loading ? (
                <div className="text-center py-8">Loading PDF...</div>
              ) : (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full min-h-[500px]"
                  title="Invoice PDF Viewer"
                />
              )}
            </div>

            <div className="p-4 border-t flex justify-end">
              <a
                href={pdfUrl}
                download="invoice.pdf"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Download PDF
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};