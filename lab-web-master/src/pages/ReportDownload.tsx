import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { reportApi } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

export const ReportDownload: React.FC = () => {
  const { requestId } = useParams();
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadReport = async (id: string) => {
    setDownloading(true);
    try {
      const response = await reportApi.getReportByMobileRequest(id);
      
      // Create blob from response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with request ID and current date
      const currentDate = new Date().toISOString().split('T')[0];
      link.download = `Test_Report_${id}_${currentDate}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading report:', error);
      setError('Failed to download report. Please try again.');
      toast.error('Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (requestId) {
      // Small delay to show the page before auto-download
      const timer = setTimeout(() => {
        setLoading(false); // Set loading to false when we start the download
        downloadReport(requestId);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setError('Invalid request ID');
      setLoading(false);
    }
  }, [requestId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Preparing Report Download</h2>
          <p className="text-gray-600">Please wait while we prepare your test report...</p>
        </div>
        <Toaster position="top-right" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
        <Toaster position="top-right" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        {downloading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Downloading Report</h2>
            <p className="text-gray-600">Your test report is being downloaded...</p>
          </>
        ) : (
          <>
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> Report downloaded.</span>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Report Downloaded</h2>
              <p className="text-gray-600">
                Your test report has been downloaded to your device. 
                Check your downloads folder.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => downloadReport(requestId!)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                >
                  Download Again
                </button>
               
              </div>
            </div>
          </>
        )}
      </div>
      <Toaster position="top-right" />
    </div>
  );
};
