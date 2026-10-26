import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mobileQuotationApi, mobileRequestApi, mobileTestsApi } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

interface LineItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  price:number;
  amount: number;
  isCustom: boolean;
  product: Product;
}

interface Product {
  id: string;
  name: string;
}

export const QuotationPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [state, setState] = useState<string>('');

  useEffect(() => {
    if (requestId) {
      fetchLineItems(requestId);
      fetchrequest(requestId);
    }
    // eslint-disable-next-line
  }, [requestId]);

  const fetchrequest = async (reqId: string) => {
    try {
      setLoading(true);
      const response = await mobileRequestApi.getById(reqId);
      // Mark all API-loaded items as not custom
      setState(response.data.appState.name);
    } catch (error) {
      console.error('Error fetching state:', error);
    } finally {
    }
  };

  const fetchLineItems = async (reqId: string) => {
    try {
      setLoading(true);
      const response = await mobileTestsApi.getByRequestId(reqId);
      // Mark all API-loaded items as not custom
      const loadedItems = (response.data as LineItem[]).map(item => ({
        ...item,
        isCustom: false,
        quantity:1,
        rate: item.price,
        unit:item.unit,
        description: item.name
      }));
      setLineItems(loadedItems);
    } catch (error) {
      console.error('Error fetching line items:', error);
      toast.error('Error fetching line items');
    } finally {
      setLoading(false);
    }
  };
  // Handler to add a new line item
  const handleAddLineItem = () => {
    setLineItems(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9), // simple unique id
        name: '',
        description: '',
        quantity: 1,
        unit: '',
        rate: 0,
        amount: 0,
        isCustom: true, // Mark as custom
        product: { id: '', name: '' }, // Placeholder for product
        price:0,
      }
    ]);
  };

  // Handler to delete a line item
  const handleDeleteLineItem = (id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  // Always recalculate amount for each line item and total
  const computedLineItems = lineItems.map(item => ({
    ...item,
    amount: Number(item.quantity) * Number(item.rate)
  }));
  const totalAmount = Math.round(computedLineItems.reduce((sum, item) => sum + (item.amount || 0), 0))


   // Submit handler
   const handleSubmitQuotation = async () => {
    let amount = totalAmount;
    let CGST = 0;
    let SGST = 0;
    let IGST = 0;
    if(state === 'Tamil Nadu'){
      CGST = Math.round(Number((Number(totalAmount) * 0.09).toFixed(2)));
      SGST = Math.round(Number((Number(totalAmount) * 0.09).toFixed(2)));
      amount = totalAmount + CGST + SGST;
    }
    else{
      IGST = Math.round(Number((Number(totalAmount) * 0.18).toFixed(2)));
      amount = totalAmount + IGST;
    }

    console.log('Quotation submitted:', {
      requestId,
      lineItems: computedLineItems.map(({ id,...rest }) => rest),
      totalAmount:amount,
      CGST,
      SGST,
      IGST
    });
    try {
      await mobileQuotationApi.create({
        requestId,
        lineItems: computedLineItems.map(({ id, ...rest }) => rest),
        totalAmount: amount,
        CGST,
        SGST,
        IGST
      });
      navigate('/app-requests')
      toast.success('Quotation submitted!');
    } catch (error) {
      toast.error('Failed to submit quotation');
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Quotation</h1>
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <div className="text-lg font-semibold text-gray-700">Request ID:</div>
            <div className="text-gray-900">{requestId}</div>
          </div>
          <div className="mt-4 sm:mt-0">
            <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto ">
          <table className="min-w-full divide-y divide-gray-200 rounded-lg border-indigo-600 ">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-12">#</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-48">Description</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 w-24">Quantity</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-24">Measuring Unit</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 w-24">Rate</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 w-28">Amount</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  </td>
                </tr>
              ) : computedLineItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    No line items found for this request.
                  </td>
                </tr>
              ) : (
                computedLineItems.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm text-gray-700 w-12">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 w-48">
                      {item.isCustom ? (
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded px-2 py-1"
                          value={item.description}
                          onChange={e => {
                            const newDescription = e.target.value;
                            setLineItems(prev =>
                              prev.map(li =>
                                li.id === item.id
                                  ? { ...li, description: newDescription }
                                  : li
                              )
                            );
                          }}
                        />
                      ) : (
                       item.product.name +'-'+  item.name  
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700 w-24">
                      <input
                        type="number"
                        // disabled={!item.isCustom}
                        min={0}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-right"
                        value={item.quantity}
                        onChange={e => {
                          const newQuantity = Number(e.target.value);
                          setLineItems(prev =>
                            prev.map(li =>
                              li.id === item.id
                                ? { ...li, quantity: newQuantity }
                                : li
                            )
                          );
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-left text-gray-700 w-24">
                     {item.unit}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700 w-24">
                      <input
                        type="number"
                        min={0}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-right"
                        value={item.rate}
                        onChange={e => {
                          const newRate = Number(e.target.value);
                          setLineItems(prev =>
                            prev.map(li =>
                              li.id === item.id
                                ? { ...li, rate: newRate }
                                : li
                            )
                          );
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 font-semibold w-28">
                      ₹{isNaN(item.amount) ? '0.00' : item.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center w-20">
                      {item.isCustom && (
                        <button
                          className="text-red-600 hover:text-red-800 font-bold"
                          onClick={() => handleDeleteLineItem(item.id)}
                          title="Delete"
                        >
                          &#10005;
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Remove the tfoot section from the table */}
          </table>
        </div>
        {/* Add total amount display below the table */}
        
          {state === 'Tamil Nadu' ? (
            <>
            <div className="flex justify-end mb-4">
              <div className="text-lg font-bold text-gray-900 ">
                CGST (9%):&nbsp;
<span className="text-indigo-700">₹{Math.round((Number(totalAmount) * 0.09)).toFixed(2)}</span>
              </div>
              </div>
            <div className="flex justify-end mb-4">

              <div className="text-lg font-bold text-gray-900">
                SGST (9%):&nbsp;
<span className="text-indigo-700">₹{Math.round((Number(totalAmount) * 0.09)).toFixed(2)}</span>
              </div>
              </div>
            </>
          ) : (
            <div className="flex justify-end mb-4">
            <div className="text-lg font-bold text-gray-900">
              IGST (18%):&nbsp;
              <span className="text-indigo-700">₹{Math.round((Number(totalAmount) * 0.18)).toFixed(2)}</span>
            </div>
            </div>
          )}
        
        <div className="flex justify-end mt-4">
          <div className="text-lg font-bold text-gray-900">
            Total:&nbsp;
            <span className="text-indigo-700">
              ₹{Math.round((Number(totalAmount) + (Number(totalAmount) * 0.18))).toFixed(2)}
            </span>
          </div>
        </div>
       
        <div className="mt-6 flex justify-between">
          <button
            className="inline-block px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition"
            onClick={handleAddLineItem}
          >
            + Add Line Item
          </button>
          <button
            className="inline-block px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition"
            onClick={handleSubmitQuotation}
          >
            Submit Quotation
          </button>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};