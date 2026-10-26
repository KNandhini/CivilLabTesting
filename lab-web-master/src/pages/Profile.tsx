import React, { useState, useEffect } from 'react';
import { authApi } from '../services/api';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // const userId = localStorage.getItem('userId'); // Assuming you store userId in localStorage
        // if (!userId) return;
        
        const response = await authApi.getById();
        console.log("profile details", response.data);
        setProfile(response.data);
        setFormData(response.data);
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4D55CC]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">Profile</h2>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <p className="text-base text-gray-900">{profile?.firstName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <p className="text-base text-gray-900">{profile?.lastName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-base text-gray-900">{profile?.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <p className="text-base text-gray-900 capitalize">{profile?.role}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Security</h3>
                  <button
                    onClick={() => window.location.href = '/change-password'}
                    className="px-4 py-2 text-sm font-medium rounded-md text-[#4D55CC] hover:bg-[#4D55CC]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D55CC]"
                  >
                    Change Password
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-end">
                  <button
                    onClick={() => window.location.href = '/'}
                    className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D55CC]"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};