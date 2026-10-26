import { useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Test {
  id: string;
  name: string;
  price: number;
}

interface ProductForm {
  name: string;
  tests: Test[];
}

export const ProductsPage = () => {
  const [productForm, setProductForm] = useState<ProductForm>({
    name: '',
    tests: []
  });

  const addTest = () => {
    setProductForm(prev => ({
      ...prev,
      tests: [...prev.tests, { id: crypto.randomUUID(), name: '', price: 0 }]
    }));
  };

  const removeTest = (id: string) => {
    setProductForm(prev => ({
      ...prev,
      tests: prev.tests.filter(test => test.id !== id)
    }));
  };

  const updateTest = (id: string, field: keyof Test, value: string | number) => {
    setProductForm(prev => ({
      ...prev,
      tests: prev.tests.map(test => 
        test.id === id ? { ...test, [field]: value } : test
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Replace with your API endpoint
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productForm),
      });
      
      if (response.ok) {
        setProductForm({ name: '', tests: [] });
        // Add success notification here
      }
    } catch (error) {
      console.error('Failed to create material:', error);
      // Add error notification here
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Create Material</h1>
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-6">
          <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
            Material Name
          </label>
          <input
            type="text"
            id="productName"
            value={productForm.name}
            onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4D55CC] focus:border-transparent"
            required
          />
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Tests</h2>
            <button
              type="button"
              onClick={addTest}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#4D55CC] hover:bg-[#211C84] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D55CC]"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Test
            </button>
          </div>

          <div className="space-y-4">
            {productForm.tests.map((test) => (
              <div key={test.id} className="flex items-start space-x-4 bg-gray-50 p-4 rounded-lg">
                <div className="flex-grow grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Test Name
                    </label>
                    <input
                      type="text"
                      value={test.name}
                      onChange={(e) => updateTest(test.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4D55CC] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      value={test.price}
                      onChange={(e) => updateTest(test.id, 'price', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4D55CC] focus:border-transparent"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeTest(test.id)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#4D55CC] hover:bg-[#211C84] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D55CC]"
          >
            Create Material
          </button>
        </div>
      </form>
    </div>
  );
};