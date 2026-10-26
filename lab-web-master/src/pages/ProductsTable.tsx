import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronRightIcon, MagnifyingGlassIcon, PlusIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { productApi, testApi } from '../services/api';

interface Test {
  id: string;
  name: string;
  price: number;
  testingMethod: string;
  unit:string;
  minimumQuantityRequired: number;
  isSiteTest: boolean;
}

interface Product {
  id: string;
  name: string;
  productShortForm: string;
}

// Add these interfaces and states at the top with other interfaces
interface TestForm {
  name: string;
  price: number;
  testingMethod: string;
  unit:string;
}

export const ProductsTable = () => {
    const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState<Record<string, Test[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Add these new states after other state declarations
  const [activeTestForm, setActiveTestForm] = useState<string | null>(null);
  const [testForm, setTestForm] = useState<{ name: string; price: number, testingMethod: string,unit:string, isSiteTest: boolean, minimumQuantityRequired:number }>({ name: '', price: 0, testingMethod: '', unit:'', isSiteTest: false, minimumQuantityRequired: 1   });
  const [testFormLoading, setTestFormLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
            const [newProductName, setNewProductName] = useState('');
            const [isSubmitting, setIsSubmitting] = useState(false);
            const [newProductShortForm, setNewProductShortForm] = useState('');
            const [isEditing, setIsEditing] = useState(false);
            const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
            const [selectedTest, setSelectedTest] = useState<Test | null>(null);
            
            // Add this new function before the return statement
            const handleCreateProduct = async () => {
              try {
                if(!isEditing){
                setIsSubmitting(true);
                await productApi.create({ name: newProductName, productShortForm: newProductShortForm });
                await loadProducts(); // Reload the products list
                setNewProductName('');
                setIsModalOpen(false);
                }
                else{
                  setIsSubmitting(true);
                  await productApi.update(selectedProduct?.id ?? '', { name: newProductName, productShortForm: newProductShortForm });
                  await loadProducts(); // Reload the products list
                  setNewProductName('');
                  setIsModalOpen(false);
                  setIsEditing(false);
                }
              } catch (err) {
                console.error('Failed to create product:', err);
              } finally {
                setIsSubmitting(false);
              }
            
            };

           
  // Add this new function before the return statement
  const handleTestSubmit = async (productId: string) => {
    try {
      setTestFormLoading(true);
      await testApi.create({
        ...testForm,
        productId
      });
      
      const response = await testApi.getTestbyProductId(productId);
      setExpandedRows(prev => ({
        ...prev,
        [productId]: response.data
      }));
      
      setTestForm({ name: '', price: 0, testingMethod: '',unit:'', isSiteTest:false, minimumQuantityRequired: 1   });
      setActiveTestForm(null);
    } catch (err) {
      console.error('Failed to create test:', err);
    } finally {
      setTestFormLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productApi.getAll();
      setProducts(response.data);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = async (productId: string) => {
    if (expandedRows[productId]) {
      const newExpandedRows = { ...expandedRows };
      delete newExpandedRows[productId];
      setExpandedRows(newExpandedRows);
    } else {
      try {
        const response = await testApi.getTestbyProductId(productId);
        setExpandedRows(prev => ({
          ...prev,
          [productId]: response.data
        }));
      } catch (err) {
        console.error('Failed to load tests:', err);
      }
    }
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedAndFilteredProducts = filteredProducts.sort((a, b) => {
    return sortOrder === 'asc' 
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name);
  });

  const totalPages = Math.ceil(sortedAndFilteredProducts.length / itemsPerPage);
  const paginatedProducts = sortedAndFilteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleDeleteTest = async (testId: string) => {
    try {
      await testApi.delete(testId);
      loadProducts();
    } catch (err) {
      console.error('Failed to delete test:', err);
    }
  }

  
// Function to handle product editing
function handleEditProduct(product: Product) {
  setNewProductName(product.name || '');
  setNewProductShortForm(product.productShortForm || '');
  setIsEditing(true);
  setIsModalOpen(true);
  setSelectedProduct(product);  
}

function handleEditTest(test: Test) {
  setSelectedTest(test);
}

const handleDeleteProduct = async (productId: string) => {
  if (window.confirm('Are you sure you want to delete this material and all its associated tests?')) {
    try {
      await productApi.delete(productId);
      setProducts(products.filter(p => p.id !== productId));
      const newExpandedRows = { ...expandedRows };
      delete newExpandedRows[productId];
      setExpandedRows(newExpandedRows);
    } catch (err) {
      console.error('Failed to delete material:', err);
    }
  }
};

async function handleUpdateTest(){
  if(selectedTest){
    const response = await testApi.update(selectedTest?.id?? '', {
      name: selectedTest?.name?? '',
      price: selectedTest?.price?? 0,
      testingMethod: selectedTest?.testingMethod?? '',
      unit: selectedTest?.unit?? '',
      isSiteTest: selectedTest?.isSiteTest?? false,
      minimumQuantityRequired: selectedTest?.minimumQuantityRequired?? 1,
    });
    if(response){
      loadProducts();
      setSelectedTest(null);
      alert('Test updated successfully');
      // Update the test in the products state
      const updatedProducts = products.map(p => {
        if (expandedRows[p.id]) {
          const updatedTests = expandedRows[p.id].map(t => 
            t.id === selectedTest.id ? selectedTest : t
          );
          setExpandedRows(prev => ({
            ...prev,
            [p.id]: updatedTests
          }));
        }
        return p;
      });
      setProducts(updatedProducts);
    }
  }
  
}

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center justify-between mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900">Materials</h1>
          <p className="mt-2 text-sm text-gray-600">
            A list of all materials and their associated tests
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 flex items-center space-x-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search materials..."
              className="block w-64 rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm placeholder-gray-500 shadow-sm focus:border-[#4D55CC] focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
            />
          </div>
          <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-[#4D55CC] hover:bg-[#211C84] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D55CC] shadow-sm transition-colors duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Material
            </button>
            
            {/* Add Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Add New Material</h3>
                  </div>
                  <div className="px-6 py-4">
                    <div className="mb-4">
                      <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
                        Material Name
                      </label>
                      <input
                        type="text"
                        id="productName"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                        placeholder="Enter material name"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="productShortForm" className="block text-sm font-medium text-gray-700 mb-1">
                        Material Short Form (2 characters)
                      </label>
                      <input
                        type="text"
                        id="productShortForm"
                        value={newProductShortForm}
                        onChange={(e) => setNewProductShortForm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                        placeholder="Enter short form"
                        maxLength={2}
                      />
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        setNewProductName('');
                        setNewProductShortForm('');
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D55CC]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateProduct}
                      disabled={!newProductName.trim() || !newProductShortForm.trim() || isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-[#4D55CC] border border-transparent rounded-md hover:bg-[#211C84] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D55CC] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    
                      {isSubmitting ? isEditing ? 'Updating...':'Adding...' : isEditing ? 'Update Product' : 'Add Product'}
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
      
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="w-12 px-6 py-3"></th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={toggleSort}
                    >
                      Name {sortOrder === 'asc' ? <ChevronUpIcon className="h-4 w-4 inline" /> : <ChevronDownIcon className="h-4 w-4 inline" />}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Short Form
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedProducts.map((product) => (
                    <>
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button onClick={() => toggleRow(product.id)}>
                            {expandedRows[product.id] ? <ChevronDownIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.productShortForm}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleEditProduct(product)} className="text-[#4D55CC] hover:text-[#211C84] mr-4">Edit</button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                      {expandedRows[product.id] && (
                        <tr>
                          <td colSpan={4} className="p-0">
                            <div className="p-4 bg-gray-50">
                              <h4 className="text-md font-semibold mb-2">Tests for {product.name}</h4>
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                  <tr className="border-b border-gray-200">
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                      Test Name
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                      Testing Method
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                     Measuring Unit
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                     Minimum Quantity Required
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                                      Price
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                                      Is Site Test
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {expandedRows[product.id].map((test) => (
                                    
                                      selectedTest && selectedTest.id === test.id ? (
                                        <tr key={test.id} className="hover:bg-gray-100/50 transition-colors duration-200">
                                      <td className="px-4 py-3 text-sm text-gray-900">
                                        <input
                                          type="text"
                                          value={selectedTest.name}
                                          onChange={(e) => setSelectedTest({ ...selectedTest, name: e.target.value })}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4D55CC] focus:border-transparent"
                                          required
                                        />  
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-900">
                                        <input
                                          type="text"
                                          value={selectedTest.testingMethod}
                                          onChange={(e) => setSelectedTest({...selectedTest, testingMethod: e.target.value })}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4D55CC] focus:border-transparent"
                                          required
                                        />
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-900">
                                        <input
                                          type="text"
                                          value={selectedTest.unit}
                                          onChange={(e) => setSelectedTest({...selectedTest, unit: e.target.value })}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4D55CC] focus:border-transparent"
                                          required
                                        />
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-900">
                                        <input
                                          type="number"
                                          value={selectedTest.minimumQuantityRequired}
                                          onChange={(e) => setSelectedTest({...selectedTest, minimumQuantityRequired: parseFloat(e.target.value) })}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4D55CC] focus:border-transparent"
                                          min="0"
                                          step="1"
                                          required
                                        />
                                      </td>
                                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                                        <input
                                          type="number"
                                          value={selectedTest.price}
                                          onChange={(e) => setSelectedTest({...selectedTest, price: parseFloat(e.target.value) })}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4D55CC] focus:border-transparent"
                                          min="0"
                                          step="1"
                                          required
                                        />
                                      </td>
                                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                                        <input
                                          type="checkbox"
                                          checked={selectedTest.isSiteTest}
                                          onChange={(e) => setSelectedTest({...selectedTest, isSiteTest: e.target.checked })}
                                          className="w-4 h-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4D55CC] focus:border-transparent"
                                        />
                                      </td>
                                      
                                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                                      <button
                                      onClick={() => handleUpdateTest()}
                                          className="text-blue-500 hover:text-blue-700 transition-colors duration-200 inline-flex items-center"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          Update
                                        </button>
                                        <button
                                          onClick={async (e) => {
                                            e.stopPropagation(); // Prevent row expansion when clicking delete
                                            setSelectedTest(null);
                                          }}
                                          className="text-red-500 hover:text-red-700 transition-colors duration-200 inline-flex items-center ml-2"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                          Cancel
                                        </button>
                                      </td>
                                    </tr>
                                      ): (
                                        
                                     
                                    <tr key={test.id} className="hover:bg-gray-100/50 transition-colors duration-200">
                                      <td className="px-4 py-3 text-sm text-gray-900">
                                        {test.name}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-900">
                                        {test.testingMethod}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-900">
                                        {test.unit}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-900">
                                        {test.minimumQuantityRequired}
                                      </td>
                                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                                        ₹{test.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                      </td>
                                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                                        {test.isSiteTest? 'Yes' : 'No'}
                                      </td>
                                      
                                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                                      <button
                                      onClick={() => handleEditTest(test)}
                                          className="text-blue-500 hover:text-blue-700 transition-colors duration-200 inline-flex items-center"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                          </svg>
                                          Edit
                                        </button>
                                        <button
                                          onClick={async (e) => {
                                            e.stopPropagation(); // Prevent row expansion when clicking delete
                                            if (window.confirm('Are you sure you want to delete this test?')) {
                                              handleDeleteTest(test.id);
                                              const response = await testApi.getTestbyProductId(product.id);
                                              setExpandedRows(prev => ({
                                                ...prev,
                                                [product.id]: response.data
                                              }));
                                            }
                                          }}
                                          className="text-red-500 hover:text-red-700 transition-colors duration-200 inline-flex items-center ml-2"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                          </svg>
                                          Delete
                                        </button>
                                      </td>
                                    </tr>
                                      )
                                    ))}

                                  {activeTestForm === product.id && (
                                    <>
                                      <tr className="bg-white">
                                        <td className="px-4 py-3">
                                          <input
                                            type="text"
                                            value={testForm.name}
                                            onChange={(e) => setTestForm(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Test name"
                                            required
                                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4D55CC] focus:border-[#4D55CC]"
                                          />
                                        </td>
                                        <td className="px-4 py-3">
                                          <input
                                            type="text"
                                            value={testForm.testingMethod}
                                            onChange={(e) => setTestForm(prev => ({ ...prev, testingMethod: e.target.value }))}
                                            placeholder="Testing method"
                                            required
                                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4D55CC] focus:border-[#4D55CC]"
                                          />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                              type="text"
                                              value={testForm.unit}
                                              onChange={(e) => setTestForm(prev => ({ ...prev, unit: e.target.value }))}
                                              placeholder="Unit"
                                              required
                                              min="0"
                                              step="0.01"
                                              className="w-32 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4D55CC] focus:border-[#4D55CC] text-right"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                              type="nummber"
                                              value={testForm.minimumQuantityRequired}
                                              onChange={(e) => setTestForm(prev => ({ ...prev, minimumQuantityRequired: Number(e.target.value) }))}
                                              placeholder="Unit"
                                              required
                                              min="0"
                                              step="0.01"
                                              className="w-32 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4D55CC] focus:border-[#4D55CC] text-right"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                          <div className="flex justify-end">
                                            <input
                                              type="number"
                                              value={testForm.price}
                                              onChange={(e) => setTestForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                                              placeholder="Price"
                                              required
                                              min="0"
                                              step="0.01"
                                              className="w-32 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4D55CC] focus:border-[#4D55CC] text-right"
                                            />
                                          </div>
                                        </td>
                                        <td className="px-4 py-3">
                                        <div className="flex justify-end">
                                            <input
                                              type="checkbox"
                                              checked={testForm.isSiteTest}
                                              onChange={(e) => setTestForm(prev => ({ ...prev, isSiteTest: e.target.checked }))}
                                              className="mr-2"
                                            />
                                          </div>
                                        </td>
                                      </tr>
                                      <tr className="bg-white">
                                        <td colSpan={7} className="px-4 py-3">
                                          
                                          <div className="flex justify-end space-x-2 mt-2">
                                            <button
                                              onClick={() => handleTestSubmit(product.id)}
                                              disabled={testFormLoading || !testForm.name || !testForm.testingMethod || testForm.price <= 0}
                                              className="px-3 py-1.5 text-sm font-medium text-white bg-[#4D55CC] rounded-md hover:bg-[#211C84] disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                              {testFormLoading ? 'Adding...' : 'Add'}
                                            </button>
                                            <button
                                              onClick={() => {
                                                setActiveTestForm(null);
                                                setTestForm({ name: '', price: 0, testingMethod: '',unit:'', isSiteTest: false, minimumQuantityRequired: 1 });
                                              }}
                                              className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    </>
                                  )}
                                </tbody>
                                <tfoot>
                                  <tr>
                                    <td colSpan={7} className="px-4 py-3 border-t border-gray-200">
                                      <div className="flex justify-end">
                                        {activeTestForm !== product.id && (
                                          <button
                                            onClick={() => setActiveTestForm(product.id)}
                                            className="px-3 py-1.5 text-sm font-medium text-[#4D55CC] bg-white border border-[#4D55CC] rounded-md hover:bg-[#4D55CC] hover:text-white transition-colors duration-200"
                                          >
                                            Add Test
                                          </button>
                                        )}
                                        </div>
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                  ))
                }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-700">Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-md border border-gray-300 py-1 pl-2 pr-8 text-sm focus:border-[#4D55CC] focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
            >
              {[5, 10, 25, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
            <span className="ml-2 text-sm text-gray-700">entries</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
