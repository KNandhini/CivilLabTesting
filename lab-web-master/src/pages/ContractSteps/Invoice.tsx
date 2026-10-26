import React, { useState, useEffect } from 'react';

export const Invoice: React.FC<{ requestId: string }> = ({ requestId }) => {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoicePdf = async () => {
      try {
        const response = await fetch(`/api/invoice/${requestId}/pdf`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (error) {
        console.error('Error fetching PDF:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoicePdf();

    return () => URL.revokeObjectURL(pdfUrl);
  }, [requestId]);

  if (loading) return <div>Loading PDF...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-4 flex justify-end">
        <a
          href={pdfUrl}
          download="invoice.pdf"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Download PDF
        </a>
      </div>
      
      <div className="border rounded-lg overflow-hidden h-[600px]">
        {pdfUrl && (
          <iframe
            src={pdfUrl}
            className="w-full h-full"
            title="Invoice PDF"
          />
        )}
      </div>
    </div>
  );
};