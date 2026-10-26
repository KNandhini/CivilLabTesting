import React, { useEffect, useState } from 'react';
import { receiptApi, sampleCollectionApi, requestApi } from '../../services/api';
import logo from '../../assets/react.svg';

// Add these imports at the top
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

interface ReceiptProps {
  requestId?: string | undefined;
}

// Add customer details interface
interface CustomerDetails {
  customerName: string;
  address: string;
  contactPerson: string;
  mobileNo: string;
  emailId: string;
}

interface Mapping {
  id: string;
  test: {
    name: string;
    price: string;
  };
  sample: {
    sampleId: string;
  };
}

interface ReceiptData {
  totalAmount: number;
  gst: number;
}

export const Receipt: React.FC<ReceiptProps> = ({ requestId }) => {
  const [lineItems, setLineItems] = useState<Mapping[]>([]);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch line items and receipt data
        const [mappingsResponse, receiptResponse, requestResponse] = await Promise.all([
          sampleCollectionApi.getMappingsByRequestId(requestId ??''),
          receiptApi.getByRequestId(requestId??''),
          requestApi.getById(requestId??'')
        ]);

        setLineItems(mappingsResponse.data);
        console.log(receiptResponse.data)
        setReceiptData(receiptResponse.data[0]);
        setCustomerDetails(requestResponse.data.contractReview);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchData();
    }
  }, [requestId]);

  if (loading) {
    return <div className="flex justify-center items-center p-8">Loading...</div>;
  }

   // Add these functions inside the component before the return statement
   
   

   const handleEmail = () => {
     const subject = `Invoice #INV-${requestId}`;
     const body = `Please find the attached invoice for your recent lab testing services.`;
     window.location.href = `mailto:${customerDetails?.emailId}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
   };

   const handleShare = async () => {
     if (navigator.share) {
       try {
         await navigator.share({
           title: `Invoice #INV-${requestId}`,
           text: 'Lab Testing Services Invoice',
           url: window.location.href,
         });
       } catch (error) {
         console.error('Error sharing:', error);
       }
     }
   };
   
   
  
  // // Add handlePrint function after other handlers
  //  // Update the handlePrint implementation
  //  const handlePrint = ()=>  useReactToPrint({
  //   documentTitle: `Invoice-${requestId}`,
  //   content: () => contentRef.current,  // Changed from contentRef to content
  //   removeAfterPrint: true,
  //   pageStyle: `
  //     @media print {
  //       @page { margin: 20mm; }
  //       body { -webkit-print-color-adjust: exact; }
  //     }
  //   `
  // });
  // Update the print button
  
  return (
    <React.Fragment>
    <div ref={contentRef} className="bg-white p-8 rounded-lg shadow max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-8 border-b pb-6">
        <div className="flex items-center">
          <img src={logo} alt="Company Logo" className="h-16 w-auto mr-4" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">LAB TESTING SERVICES</h1>
            <p className="text-gray-600">123 Lab Street, Testing City</p>
            <p className="text-gray-600">Phone: (123) 456-7890</p>
            <p className="text-gray-600">Email: info@labtesting.com</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-gray-900">INVOICE</h2>
          <p className="text-gray-600">Date: {new Date().toLocaleDateString()}</p>
          <p className="text-gray-600">Invoice #: INV-{requestId}</p>
        </div>
      </div>
  
      {/* Customer Details Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Bill To:</h3>
        <div className="border rounded-lg p-4 bg-gray-50">
          <p className="font-medium">{customerDetails?.customerName}</p>
          <p className="text-gray-600">{customerDetails?.address}</p>
          <p className="text-gray-600">Contact: {customerDetails?.contactPerson}</p>
          <p className="text-gray-600">Phone: {customerDetails?.mobileNo}</p>
          <p className="text-gray-600">Email: {customerDetails?.emailId}</p>
        </div>
      </div>
  
      {/* Line Items Table with updated styling */}
      <div className="mb-8">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Sample ID</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Qty</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Price</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {lineItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{item.test.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.sample.sampleId}</td>
                <td className="px-6 py-4 text-sm text-gray-900 text-center">1</td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">₹ {item.test.price}</td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">₹ {item.test.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      {/* Summary Section with updated styling */}
      {receiptData && (
        <div className="border-t pt-4">
          <div className="flex justify-end">
            <div className="w-80">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹ {receiptData.totalAmount}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">GST (18%):</span>
                <span className="font-medium">₹ {receiptData.gst}</span>
              </div>
              <div className="flex justify-between py-3 border-t border-gray-900 text-lg font-bold">
                <span>Total Amount:</span>
                <span>₹ {receiptData.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      )}
  
      {/* Footer Section */}
      <div className="mt-8 pt-8 border-t">
        <div className="text-gray-600 text-sm">
          <p className="font-medium mb-2">Terms & Conditions:</p>
          <ul className="list-disc list-inside">
            <li>Payment is due within 30 days</li>
            <li>Please include invoice number on your payment</li>
            <li>Make all checks payable to LAB TESTING SERVICES</li>
          </ul>
        </div>
      </div>
     
      
        <div>
          {/* Action Buttons - These won't be printed */}
          <div className="flex justify-end gap-4 mb-6">
            <button
              // onClick={() => handlePrint()}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button
              onClick={handleEmail}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Share
            </button>
          </div>
          </div>
      </div>

          </React.Fragment>
        );
};