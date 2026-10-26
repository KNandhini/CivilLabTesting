import React, { useState, useEffect, useRef } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { productApi, testApi } from '../services/api';
import { testSchemaApi } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
                        


// Remove these interfaces
// Update the SchemaField interface
export interface SchemaField {
  field: string;
  displayName: string;  // Add this line
  type: 'string' | 'number' | 'formula';
  value: any;
}

// Update the schema field mapping section




export interface Product {
  id: string;
  name: string;
  tests: Test[];
}

export interface Test {
  id: string;
  name: string;
  productId: string;
}


// Add this interface after other interfaces
export interface TestSchema {
  id: string;
  name: string;
  schema: SchemaField[];
  testIds: string[];
}


export interface Test {
    id: string;
    name: string;
    price: string;
    testingMethod: string | null;
    productId: string;
    product: Product;
  }
  
  export interface TestMapping {
    id: string;
    testId: string;
    schemaId: string;
    test: Test;
  }
  
  export interface TestSchemaMapping {
    id: string;
    name: string;
    schema: SchemaField[];
    testMappings: TestMapping[];
  }

export interface TestSchema {
    id: string;
    name: string;
    schema: SchemaField[];
    testIds: string[];
  }

export const TestSchemaMapping = () => {
  // Add these states with other states
  const [schemas, setSchemas] = useState<TestSchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
      
  function onEditSchemaFieldClick(index:number,field: SchemaField) {
    setEditingFieldIndex(index);
    setSelectedSchemaField(field);
  }
  
  async function onUpdateSchemaFieldClick(index: number) {
    if (selectedSchemaField && expandedSchema) {
      const updatedSchema = [...expandedSchema.schema];
      updatedSchema[index] = selectedSchemaField;
      setExpandedSchema({
        ...expandedSchema,
        schema: updatedSchema
      });

      const response = await testSchemaApi.update(expandedSchema.id, 
        
        updatedSchema
      );
      if(response){
        toast.success('Schema updated successfully');
      }
      setSelectedSchemaField(undefined);
      setEditingFieldIndex(null);
    }

   
  }

  // Add this useEffect after other useEffects
  useEffect(() => {
    loadSchemas();
  }, []);

  const loadSchemas = async () => {
    try {
      const response = await testSchemaApi.getAll();
      setSchemas(response.data);
    } catch (error) {
      console.error('Error loading schemas:', error);
    } finally {
      setIsLoading(false);
    }
  };

   

      const [schema, setSchema] = useState<SchemaField[]>([]);
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [products, setProducts] = useState<Product[]>([]);
      const [selectedTests, setSelectedTests] = useState<string[]>([]);
      const [isDropdownOpen, setIsDropdownOpen] = useState(false);
      const [schemaName, setSchemaName] = useState('');
       // Add search state
       const [searchQuery, setSearchQuery] = useState('');
       const [expandedSchemaId, setExpandedSchemaId] = useState<string | null>(null);
                  const [expandedSchema, setExpandedSchema] = useState<TestSchemaMapping | null>(null);
                  const [selectedSchemaField, setSelectedSchemaField] = useState<SchemaField>();
              
            // Add new state for form visibility
            const [isFormVisible, setIsFormVisible] = useState(false);

            // Update the table section with Add Schema button
              
              
      // Add this hook after other state declarations
      const dropdownRef = useRef<HTMLDivElement>(null);
      
      // Add this effect after other useEffect hooks
      useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
          }
        };
      
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, []);
      
        useEffect(() => {
          loadProductsWithTests();
        }, []);
      
      //   // Update the Add Field button onClick handler
      // const onClick={() => {
      //     const newSchema = [...schema];
      //     newSchema.push({ 
      //       field: '', 
      //       displayName: '',  // Add this line
      //       type: 'string', 
      //       value: '' 
      //     });
      //     setSchema(newSchema);
      //   }}
      
        const loadProductsWithTests = async () => {
          try {
            const productsResponse = await productApi.getAll();
            const productsWithTests = await Promise.all(
              productsResponse.data.map(async (product: Product) => {
                const testsResponse = await testApi.getTestbyProductId(product.id);
                return {
                  ...product,
                  tests: testsResponse.data
                };
              })
            );
            // Filter out products with no tests
            setProducts(productsWithTests.filter(product => product.tests.length > 0));
          } catch (error) {
            console.error('Error loading products and tests:', error);
          }
        };

        const handleSchemaExpand = async (schemaId: string) => {
            if (expandedSchemaId === schemaId) {
              setExpandedSchemaId(null);
              setExpandedSchema(null);
              return;
            }
          
            try {
              const response = await testSchemaApi.getById(schemaId);
              setExpandedSchema(response.data);
              setExpandedSchemaId(schemaId);
            } catch (error) {
              console.error('Error loading schema details:', error);
            }
          };

          const handleDelete = async (id: string) => {
            try {
              await testSchemaApi.delete(id);
              toast.success('Schema deleted successfully');
              await loadSchemas(); // Refresh the list
            } catch (error) {
              console.error('Error deleting schema:', error);
              toast.error('Failed to delete schema');
            }
          };

          
const handleFieldChange = (fieldIndex: number, fieldName: keyof SchemaField, value: string) => {

  if(selectedSchemaField){
    setSelectedSchemaField(prev => prev ? {...prev, [fieldName]: value} : prev);
  
  }
};
      
        // Add this component inside the main return, before the schema fields
        return (
            <React.Fragment>
          <div className="px-4 sm:px-6 lg:px-8 py-8">

<div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Add this table before the form */}
     
            <div className="sm:flex sm:items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Test Schema Mapping</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Create a schema template for test fields
                </p>
              </div>
            </div>

            <div className="mb-8 shadow border-gray-300 rounded-md">
              <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8 ">
                  <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8 ">
                    <div className="overflow-hidden shadow border-gray-300 md:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                              Schema Name
                            </th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        
                        
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {schemas.length === 0 ? (
                            <tr>
                              <td colSpan={2} className="px-6 py-8 text-center text-sm text-gray-500">
                                No test schemas to display
                              </td>
                            </tr>
                          ) : (
                            schemas.map((schema) => (
                              <React.Fragment key={schema.id}>
                                
                                <tr className="cursor-pointer hover:bg-gray-50" onClick={() => handleSchemaExpand(schema.id)}>
                                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 flex items-center">
                                    {expandedSchemaId === schema.id ? (
                                      <ChevronDownIcon className="h-5 w-5 mr-2 text-gray-500" />
                                    ) : (
                                      <ChevronRightIcon className="h-5 w-5 mr-2 text-gray-500" />
                                    )}
                                    {schema.name}
                                  </td>
                                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    
                                    
                                      <button 
                                      onClick={(e) => {
                                        e.stopPropagation(); // Prevent row expansion when clicking delete
                                        if (window.confirm('Are you sure you want to delete this schema?')) {
                                          handleDelete(schema.id);
                                        }
                                      }}
                                      className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-600 hover:text-red-900 focus:outline-none"
                                    >
                                      <TrashIcon className="h-4 w-4 mr-1" />
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                                {expandedSchemaId === schema.id && expandedSchema && (
                                   
<tr>
  <td colSpan={2} className="px-4 py-4 bg-gray-50">
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Material - Test Mapping</h3>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 pl-6 pr-3 text-left text-sm font-semibold text-gray-900 border-b">Material</th>
            <th className="py-3 pl-6 pr-3 text-left text-sm font-semibold text-gray-900 border-b">Test Name</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {expandedSchema.testMappings.map((mapping, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="whitespace-nowrap py-3 pl-6 pr-3 text-sm text-gray-900">{mapping.test.product.name}</td>
              <td className="whitespace-nowrap py-3 pl-6 pr-3 text-sm text-gray-900">{mapping.test.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      </div>
      <div className="mb-6">

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Schema Fields</h3>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
     
      
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 pl-6 pr-3 text-left text-sm font-semibold text-gray-900 border-b">Field</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 border-b">Display Name</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 border-b">Type</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 border-b">Value</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 border-b">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expandedSchema.schema.map((field, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="whitespace-nowrap py-3 pl-6 pr-3 text-sm text-gray-900">
                  {editingFieldIndex === index ? (
                    <input type="text" value={selectedSchemaField?.field} onChange={(e) => handleFieldChange(index, 'field', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4D55CC] focus:border-transparent'
                     />
                  ) : (
                    field.field
                  )}
                </td>
                <td className="whitespace-nowrap py-3 px-4 text-sm text-gray-900">
                  {editingFieldIndex === index ? (
                    <input type="text" value={selectedSchemaField?.displayName} onChange={(e) => handleFieldChange(index, 'displayName', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4D55CC] focus:border-transparent'
                    />
                    
                  ) : (
                    field.displayName
                  )}
                </td>
                <td className="whitespace-nowrap py-3 px-4 text-sm text-gray-900">
                  {editingFieldIndex === index ? (
                    <select value={selectedSchemaField?.type} onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4D55CC] focus:border-transparent'
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="formula">Formula</option>
                    </select>
                  ) : (
                    field.type
                  )}
                </td>
                <td className="whitespace-nowrap py-3 px-4 text-sm text-gray-900">
                  {editingFieldIndex === index ? (
                    <input type="text" value={selectedSchemaField?.value} onChange={(e) => handleFieldChange(index, 'value', e.target.value)} 
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4D55CC] focus:border-transparent'
                    />
                  ) : (
                    field.value || '-'
                  )}
                </td>
                <td className="whitespace-nowrap py-3 px-4 text-sm text-gray-900">
                  <div className="flex space-x-2">
                    {editingFieldIndex === index ? (
                      <>
                        <button 
                          onClick={() => onUpdateSchemaFieldClick(index)}
                          className='inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Update
                        </button>
                        <button 
                          onClick={() => setEditingFieldIndex(null)}
                          className='inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D55CC]'
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => onEditSchemaFieldClick(index, field)}
                        className='inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-[#4D55CC] hover:bg-[#211C84] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D55CC]'
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
  </td>
</tr>
                        )}
                      </React.Fragment>
                    )))}
                  </tbody>
                </table>
                
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end">
                  <button
                    onClick={() => setIsFormVisible(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#4D55CC] hover:bg-[#211C84] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D55CC]"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Schema
                  </button>
                </div>
      </div>
      
            {isFormVisible && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="p-6 ">
                <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Schema Name
                      </label>
                      <input
                        type="text"
                        value={schemaName}
                        onChange={(e) => setSchemaName(e.target.value)}
                        placeholder="Enter schema name"
                        className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:ring-[#4D55CC] focus:border-[#4D55CC]"
                      />
                    </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Tests to Map
                    </label>
                   
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-left focus:outline-none focus:ring-1 focus:ring-[#4D55CC] focus:border-[#4D55CC]"
                      >
                        {selectedTests.length > 0 
                          ? `${selectedTests.length} test(s) selected`
                          : 'Select tests'}
                      </button>
                      
                      {isDropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 overflow-auto border border-gray-300">
                          <div className="sticky top-0 bg-white p-2 border-b">
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Search tests..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#4D55CC] focus:border-[#4D55CC]"
                            />
                          </div>
                          {products
                            .filter(product => 
                              product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              product.tests.some(test => 
                                test.name.toLowerCase().includes(searchQuery.toLowerCase())
                              )
                            )
                            .map(product => (
                              <div key={product.id} className="px-3 py-2">
                                <div className="font-medium text-gray-900">{product.name}</div>
                                {product.tests
                                  .filter(test => 
                                    test.name.toLowerCase().includes(searchQuery.toLowerCase())
                                  )
                                  .map(test => (
                                    <div key={test.id} className="ml-4 py-1">
                                      <label className="flex items-center">
                                        <input
                                          type="checkbox"
                                          checked={selectedTests.includes(test.id)}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setSelectedTests([...selectedTests, test.id]);
                                            } else {
                                              setSelectedTests(selectedTests.filter(id => id !== test.id));
                                            }
                                          }}
                                          className="h-4 w-4 text-[#4D55CC] focus:ring-[#4D55CC] border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">{test.name}</span>
                                      </label>
                                    </div>
                                ))}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
        {schema.map((field, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={field.field}
                onChange={(e) => {
                  const newSchema = [...schema];
                  newSchema[index] = { ...newSchema[index], field: e.target.value };
                  setSchema(newSchema);
                }}
                placeholder="Field name"
                className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:ring-[#4D55CC] focus:border-[#4D55CC]"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={field.displayName}
                onChange={(e) => {
                  const newSchema = [...schema];
                  newSchema[index] = { ...newSchema[index], displayName: e.target.value };
                  setSchema(newSchema);
                }}
                placeholder="Display name"
                className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:ring-[#4D55CC] focus:border-[#4D55CC]"
              />
            </div>
            <div className="flex-1">
              <select
                value={field.type}
                onChange={(e) => {
                  const newSchema = [...schema];
                  newSchema[index] = { ...newSchema[index], type: e.target.value as 'string' | 'number' | 'formula' };
                  setSchema(newSchema);
                }}
                className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:ring-[#4D55CC] focus:border-[#4D55CC]"
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="formula">Formula</option>
              </select>
            </div>
            {field.type === 'formula' && (
              <div className="flex-1">
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => {
                    const newSchema = [...schema];
                    newSchema[index] = { ...newSchema[index], value: e.target.value };
                    setSchema(newSchema);
                  }}
                  placeholder="Enter formula (e.g., {field1} + {field2})"
                  className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:ring-[#4D55CC] focus:border-[#4D55CC]"
                />
              </div>
            )}
            <button
              onClick={() => {
                const newSchema = [...schema];
                newSchema.splice(index, 1);
                setSchema(newSchema);
              }}
              className="p-2 text-red-600 hover:text-red-800"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
        
</div>
                </div>
               
<div className="flex items-center space-x-4 mx-6 ">
            <button
              onClick={() => {
                const newSchema = [...schema];
                newSchema.push({ field: '', displayName:'', type: 'string', value: '' });
                setSchema(newSchema);
              }}
              className="inline-flex items-center px-4 py-2 border border-[#4D55CC] text-sm font-medium rounded-md text-[#4D55CC] bg-white hover:bg-[#4D55CC] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D55CC]"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Field
            </button>
            
            
            <button
            // Add to imports at the top
            
            // Update the save button onClick handler
            onClick={async () => {
              setIsSubmitting(true);
              try {
                await testSchemaApi.create({
                  name: schemaName,
                  schema,
                  testIds: selectedTests
                });
                await loadSchemas(); // Refresh the schemas list
                toast.success('Schema saved successfully');
                // Reset form
                setSchemaName('');
                setSchema([]);
                setSelectedTests([]);
              } catch (error) {
                console.error('Error submitting schema:', error);
                toast.error('Failed to save schema');
              } finally {
                setIsSubmitting(false);
              }
            }}
            
           
              disabled={isSubmitting || schema.length === 0 || !schemaName.trim()}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#4D55CC] hover:bg-[#211C84] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D55CC] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Schema'}
              </button>

              <button
                onClick={async () => {
                  setIsFormVisible(false);
                }}
                className="inline-flex items-center px-4 py-2 border border-[#4D55CC] text-sm font-medium rounded-md text-[#4D55CC] bg-white hover:bg-[#4D55CC] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D55CC] ml-auto"
              >
                Cancel
              </button>
            </div>
          </div>
         
            )}
        </div>
        
      </div>
      <Toaster position="top-right" />
    </React.Fragment>
   
  );
};

