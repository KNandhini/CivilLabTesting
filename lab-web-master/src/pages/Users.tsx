import React, { useEffect, useState } from 'react';
import { authApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { KeyIcon, MagnifyingGlassIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password?: string;
  confirmPassword?: string;
}

export const Users: React.FC = () => {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    password: '',
    confirmPassword: '',
  });

  // Reset password modal state
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string>('');
  const [resetPasswordData, setResetPasswordData] = useState({
    password: '',
    confirmPassword: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await authApi.getAll({
        search: searchText,
        page: currentPage,
        pageSize,
      });

      setData(response.data.data);
      setTotalPages(Math.ceil(response.data.meta.total / pageSize));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [currentPage, searchText, pageSize]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
    setCurrentPage(1);
  };

  // Implement handleEdit
  const handleEdit = (userId: string) => {
    const user = data.find(u => u.id === userId);
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        password: '',
        confirmPassword: '',
      });
      setIsEditing(true);
      setSelectedUserId(userId);
      setIsModalOpen(true);
    }
  };

  // Implement openResetPasswordModal
  const openResetPasswordModal = (userId: string) => {
    setResetPasswordUserId(userId);
    setResetPasswordData({ password: '', confirmPassword: '' });
    setIsResetPasswordOpen(true);
  };

  // Implement handleResetPasswordSubmit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPasswordData.password !== resetPasswordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await authApi.resetPassword(resetPasswordUserId, {
        password: resetPasswordData.password,
      });
      toast.success('Password reset successfully');
      setIsResetPasswordOpen(false);
      setResetPasswordUserId('');
      setResetPasswordData({ password: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Error resetting password');
    }
  };

  const handleAddUser = () => {
    resetForm();
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Update user logic
        await authApi.update(selectedUserId, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role,
        });
        toast.success('User updated successfully');
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }
        await authApi.register({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password || '',
          role: formData.role,
        });
        toast.success('User added successfully');
      }
      setIsModalOpen(false);
      fetchData();
      resetForm();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Error saving user');
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: 'user',
      password: '',
      confirmPassword: '',
    });
    setIsEditing(false);
    setSelectedUserId('');
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      {/* Header Section */}
      <div className="mt-4 sm:mt-0 sm:ml-1 flex items-center space-x-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="mt-2 text-sm text-gray-600">Manage and track all users</p>
        </div>
        <div className="ml-auto flex space-x-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchText}
              onChange={handleSearch}
              placeholder="Search users..."
              className="block w-64 rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm placeholder-gray-500 shadow-sm focus:border-[#4D55CC] focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
            />
          </div>
          <button
            onClick={handleAddUser}
            className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-[#4D55CC] hover:bg-[#211C84] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D55CC] shadow-sm transition-colors duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add User
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sl. No.</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">First Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#4D55CC]"></div>
                      <span>Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                    No requests found
                  </td>
                </tr>
              ) : (
                data.map((user, index) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{user.firstName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.lastName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.role}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleEdit(user.id)}
                        className="flex items-center text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors duration-150"
                        title="Edit"
                        type="button"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => openResetPasswordModal(user.id)}
                        className="flex items-center text-yellow-600 hover:text-yellow-800 px-3 py-1 rounded-md border border-yellow-200 bg-yellow-50 hover:bg-yellow-100 transition-colors duration-150"
                        title="Reset Password"
                        type="button"
                      >
                        <KeyIcon className="h-4 w-4 mr-1" />
                        Reset Password
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this user?')) {
                            setLoading(true);
                            try {
                              await authApi.delete(user.id);
                              toast.success('User deleted successfully');
                              fetchData();
                            } catch (error) {
                              console.error('Error deleting user:', error);
                              toast.error('Error deleting user');
                            } finally {
                              setLoading(false);
                            }
                          }
                        }}
                        className="text-red-600 hover:text-red-800 px-3 py-1 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 transition-colors duration-150"
                        type="button"
                        title="Delete"
                      >
                        Delete
                      </button>
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
                {data.length > 0 ? (
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
                disabled={currentPage === 1 || data.length === 0}
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
                      disabled={data.length === 0}
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
                disabled={currentPage === totalPages || data.length === 0}
                className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Edit User' : 'Add User'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#4D55CC] focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#4D55CC] focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#4D55CC] focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#4D55CC] focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="technician">Technician</option>
                  </select>
                </div>

                {!isEditing && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Password</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#4D55CC] focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
                        required={!isEditing}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#4D55CC] focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
                        required={!isEditing}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium rounded-md border border-transparent bg-[#4D55CC] text-white hover:bg-[#211C84]"
                >
                  {isEditing ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetPasswordOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Reset Password
              </h2>
              <button
                onClick={() => {
                  setIsResetPasswordOpen(false);
                  setResetPasswordUserId('');
                  setResetPasswordData({ password: '', confirmPassword: '' });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleResetPasswordSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    value={resetPasswordData.password}
                    onChange={e => setResetPasswordData({ ...resetPasswordData, password: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#4D55CC] focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    type="password"
                    value={resetPasswordData.confirmPassword}
                    onChange={e => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#4D55CC] focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetPasswordOpen(false);
                    setResetPasswordUserId('');
                    setResetPasswordData({ password: '', confirmPassword: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium rounded-md border border-transparent bg-[#4D55CC] text-white hover:bg-[#211C84]"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toaster position="top-right" gutter={24} />
    </div>
  );
};