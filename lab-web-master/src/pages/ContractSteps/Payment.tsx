import React, { useState } from 'react';
import { RadioGroup } from '@headlessui/react';
import { CreditCardIcon, BanknotesIcon, QrCodeIcon } from '@heroicons/react/24/outline';

interface PaymentProps {
  formData: {
    paymentMethod: string;
    amount: number;
    transactionId?: string;
    upiId?: string;
    cardDetails?: {
      number: string;
      expiry: string;
      cvv: string;
      name: string;
    };
  };
  onFormDataChange: (data: any) => void;
}

const paymentMethods = [
  {
    id: 'cash',
    title: 'Cash Payment',
    description: 'Pay with cash at our facility',
    icon: BanknotesIcon,
  },
  {
    id: 'upi',
    title: 'UPI Payment',
    description: 'Pay using any UPI app',
    icon: QrCodeIcon,
  },
  {
    id: 'card',
    title: 'Card Payment',
    description: 'Credit/Debit Card',
    icon: CreditCardIcon,
  }
];

export const Payment: React.FC<PaymentProps> = ({ formData, onFormDataChange }) => {
  const [selectedMethod, setSelectedMethod] = useState(formData.paymentMethod || 'cash');

  const handleMethodChange = (method: string) => {
    setSelectedMethod(method);
    onFormDataChange({
      ...formData,
      paymentMethod: method
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Payment Details</h2>
          <p className="mt-2 text-sm text-gray-600">Please select your preferred payment method</p>
        </div>

        <div className="mb-8">
          <div className="text-lg font-medium text-gray-900 mb-4">Amount to Pay: ₹{formData.amount}</div>
          
          <RadioGroup value={selectedMethod} onChange={handleMethodChange}>
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <RadioGroup.Option
                  key={method.id}
                  value={method.id}
                  className={({ checked }) =>
                    `${checked ? 'border-[#4D55CC] bg-[#4D55CC]/5' : 'border-gray-200'}
                    relative flex cursor-pointer rounded-lg border p-4 focus:outline-none`
                  }
                >
                  {({ checked }) => (
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center">
                        <div className="text-sm">
                          <RadioGroup.Label as="p" className="font-medium text-gray-900">
                            {method.title}
                          </RadioGroup.Label>
                          <RadioGroup.Description as="span" className="text-gray-500">
                            <span>{method.description}</span>
                          </RadioGroup.Description>
                        </div>
                      </div>
                      <method.icon className={`h-6 w-6 ${checked ? 'text-[#4D55CC]' : 'text-gray-400'}`} />
                    </div>
                  )}
                </RadioGroup.Option>
              ))}
            </div>
          </RadioGroup>
        </div>

        {selectedMethod === 'upi' && (
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-4">UPI Payment</h3>
            <div className="flex items-center justify-center p-6">
              <div className="w-48 h-48 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                QR Code Placeholder
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">UPI Transaction ID</label>
              <input
                type="text"
                placeholder="Enter UPI Transaction ID"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4D55CC] focus:border-[#4D55CC] transition duration-150 ease-in-out placeholder-gray-400 text-gray-900"
                value={formData.upiId || ''}
                onChange={(e) => onFormDataChange({ ...formData, upiId: e.target.value })}
              />
            </div>
          </div>
        )}

        {selectedMethod === 'card' && (
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Card Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4D55CC] focus:border-[#4D55CC] transition duration-150 ease-in-out placeholder-gray-400 text-gray-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4D55CC] focus:border-[#4D55CC] transition duration-150 ease-in-out placeholder-gray-400 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    type="password"
                    maxLength={3}
                    placeholder="123"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4D55CC] focus:border-[#4D55CC] transition duration-150 ease-in-out placeholder-gray-400 text-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4D55CC] focus:border-[#4D55CC] transition duration-150 ease-in-out placeholder-gray-400 text-gray-900"
                />
              </div>
            </div>
          </div>
        )}

        {selectedMethod === 'cash' && (
          <div className="border rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cash Payment</h3>
            <p className="text-gray-600">
              Please pay the amount at our facility. A receipt will be provided upon payment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};