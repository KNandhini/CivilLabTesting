import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';
import { productApi, reportSchemaApi, testApi, testSchemaApi } from '../services/api';
import { TestSchema } from './TestSchemaMapping';
import ReactDOM from 'react-dom';

interface Product {
  id: string;
  name: string;
}

interface Test {
  id: string;
  name: string;
}

interface Schema {
  id: string;
  name: string;
}

interface Column {
  id: string;
  name: string;
  type: 'text' | 'schema';
  required: boolean;
  testId?: string; // For schema type
  schemaId?: string; // For schema type
  textValue?: string; // For text type
  width?: string;
  order: number;
  averageCalculationRequired?: boolean; // New property for average calculation requirement
}

interface Row {
  id: string;
  values: { [columnId: string]: any };
  order: number;
}

interface TableSchema {
  id: string;
  name: string;
  description: string;
  productId: string;
  includeResultReport: boolean
  includeObservationEntry: boolean;
  IncludeObservationEntryAverageRow: boolean;
  SerialNumberRequired: boolean;
  TestingMethodRequired: boolean;
  TestReportSchema:{
    columns: Column[];
    rows: Row[];
  },
  ObservationEntrySchema:{
    columns: Column[];
    rows: Row[];
  },
  createdAt: string;
  updatedAt: string;
}

function TestReportTableSchemas() {
  const [schemas, setSchemas] = useState<TableSchema[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [schemasList, setSchemasList] = useState<TestSchema[]>([]);
  const [allSchemas, setAllSchemas] = useState<TestSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingSchema, setEditingSchema] = useState<TableSchema | null>(null);
  const [renderKey, setRenderKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'columns' | 'rows'>('columns');

  // Form state
  const [schemaName, setSchemaName] = useState('');
  const [schemaDescription, setSchemaDescription] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [includeObservationEntry, setIncludeObservationEntry] = useState(false);
  const [includeObservationEntryAverageRow, setIncludeObservationEntryAverageRow] = useState(false);
  const [serialNumberRequired, setSerialNumberRequired] = useState(false);
  const [testingMethodRequired, setTestingMethodRequired] = useState(false);
  const [columns, setColumns] = useState<Column[]>([
    {
      id: '1',
      name: 'Test',
      type: 'text',
      required: true,
      textValue: '',
      order: 1
    },
    {
      id: '2',
      name: 'TestSchema',
      type: 'schema',
      required: true,
      testId: '',
      schemaId: '',
      order: 2
    }
  ]);
  const [rows, setRows] = useState<Row[]>([]);

  // Add state for Observation Entry table columns and rows
  // 1. Update defaultObservationColumns to match main table logic
  const defaultObservationColumns: Column[] = [
    {
      id: '1',
      name: 'Test',
      type: 'text', // Will be rendered as dropdown, not text input
      required: true,
      textValue: '',
      order: 1,
      averageCalculationRequired: false
    },
    {
      id: '2',
      name: 'TestSchema',
      type: 'schema',
      required: true,
      testId: '',
      schemaId: '',
      order: 2,
      averageCalculationRequired: false
    }
  ];
  const [observationColumns, setObservationColumns] = useState<Column[]>([]);
  const [observationRows, setObservationRows] = useState<Row[]>([]);

  // Add state for Include Report Table
  const [includeReportTable, setIncludeReportTable] = useState(true);

  // Search functionality state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    product: '',
    hasAverageRow: false,
    hasTestingMethod: false,
    columnType: '',
    dateRange: {
      start: '',
      end: ''
    }
  });
  const [filteredSchemas, setFilteredSchemas] = useState<TableSchema[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    total: number;
    results: TableSchema[];
    highlights: { [key: string]: string[] };
  }>({ total: 0, results: [], highlights: {} });

  // When the checkbox is checked, set default columns if not already set
  useEffect(() => {
    if (includeObservationEntry && observationColumns.length === 0) {
      setObservationColumns(defaultObservationColumns);
    }
    if (!includeObservationEntry) {
      setObservationColumns([]);
      setObservationRows([]);
    }
    // eslint-disable-next-line
  }, [includeObservationEntry]);

  useEffect(() => {
    fetchSchemas();
    fetchProducts();
  }, []);

  // Trigger search when search criteria change
  useEffect(() => {
    performSearch(searchQuery, searchFilters);
  }, [searchQuery, searchFilters, schemas, tests, allSchemas]);

  // Search and filter functions
  const performSearch = (query: string, filters: any) => {
    setIsSearching(true);
    
    // Simulate search delay for better UX
    setTimeout(() => {
      let results = [...schemas];
      const highlights: { [key: string]: string[] } = {};

      // Text search across all fields
      if (query.trim()) {
        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
        
        results = results.filter(schema => {
          // Get product name
          const productName = products.find(p => p.id === schema.productId)?.name || '';
          
          // Extract test names and schema names from rows
          const testNames: string[] = [];
          const schemaNames: string[] = [];
          
          // Extract from TestReportSchema rows
          if (schema.TestReportSchema?.rows) {
            schema.TestReportSchema.rows.forEach((row: any) => {
              // Test names (column '1' typically contains test IDs, we need to map to test names)
              if (row.values['1']) {
                const test = tests.find(t => t.id === row.values['1']);
                if (test) {
                  testNames.push(test.name);
                }
              }
              // Schema names (column '2' typically contains schema IDs, we need to map to schema names)
              if (row.values['2']) {
                const schemaItem = allSchemas.find(s => s.id === row.values['2']);
                if (schemaItem) {
                  schemaNames.push(schemaItem.name);
                }
              }
            });
          }
          
          // Extract from ObservationEntrySchema rows
          if (schema.ObservationEntrySchema?.rows) {
            schema.ObservationEntrySchema.rows.forEach((row: any) => {
              // Test names
              if (row.values['1']) {
                const test = tests.find(t => t.id === row.values['1']);
                if (test) {
                  testNames.push(test.name);
                }
              }
              // Schema names
              if (row.values['2']) {
                const schemaItem = allSchemas.find(s => s.id === row.values['2']);
                if (schemaItem) {
                  schemaNames.push(schemaItem.name);
                }
              }
            });
          }
          
          const searchableText = [
            schema.name || '',
            schema.description || '',
            productName,
            ...(schema.TestReportSchema?.columns?.map((col: any) => col.name) || []),
            ...(schema.ObservationEntrySchema?.columns?.map((col: any) => col.name) || []),
            ...testNames,
            ...schemaNames
          ].join(' ').toLowerCase();

          const matches = searchTerms.every(term => searchableText.includes(term));
          
          if (matches) {
            // Store highlights for matched terms
            highlights[schema.id] = searchTerms.filter(term => 
              searchableText.includes(term)
            );
          }
          
          return matches;
        });
      }

      // Apply filters
      if (filters.product) {
        results = results.filter(schema => 
          schema.productId === filters.product
        );
      }

      if (filters.hasAverageRow) {
        results = results.filter(schema => 
          schema.IncludeObservationEntryAverageRow
        );
      }

      if (filters.hasTestingMethod) {
        results = results.filter(schema => 
          schema.TestingMethodRequired
        );
      }

      if (filters.columnType) {
        results = results.filter(schema => 
          schema.TestReportSchema?.columns?.some((col: any) => 
            col.type === filters.columnType
          ) || schema.ObservationEntrySchema?.columns?.some((col: any) => 
            col.type === filters.columnType
          )
        );
      }

      if (filters.dateRange.start || filters.dateRange.end) {
        results = results.filter(schema => {
          const createdAt = new Date(schema.createdAt);
          const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
          const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
          
          if (startDate && endDate) {
            return createdAt >= startDate && createdAt <= endDate;
          } else if (startDate) {
            return createdAt >= startDate;
          } else if (endDate) {
            return createdAt <= endDate;
          }
          return true;
        });
      }

      setSearchResults({
        total: results.length,
        results,
        highlights
      });
      setFilteredSchemas(results);
      setIsSearching(false);
    }, 300);
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery, searchFilters);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchFilters, schemas, tests, allSchemas]);

  // Highlight text function
  const highlightText = (text: string, highlights: string[]) => {
    if (!highlights || highlights.length === 0) return text;
    
    let highlightedText = text;
    highlights.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
    });
    
    return highlightedText;
  };

  const fetchSchemas = async () => {
    setLoading(true);
    try {
      const response = await reportSchemaApi.get();
      
      // Transform the nested data structure to match TableSchema interface
      const loadedSchemas = (response.data || [])
        .map((entity: any) => {
          // Extract the nested TestReportSchema data
          const testReportSchema = entity.TestReportSchema;
          if (!testReportSchema) return null;
          
          // Flatten the nested structure
          const flattenedSchema = {
            id: entity.id,
            name: testReportSchema.name || '',
            description: testReportSchema.description || '',
            productId: testReportSchema.productId || '',
            includeResultReport: testReportSchema.includeResultReport || false,
            includeObservationEntry: testReportSchema.includeObservationEntry || false,
            IncludeObservationEntryAverageRow: testReportSchema.IncludeObservationEntryAverageRow || false,
            SerialNumberRequired: testReportSchema.SerialNumberRequired || false,
            TestingMethodRequired: testReportSchema.TestingMethodRequired || false,
            TestReportSchema: {
              columns: testReportSchema.TestReportSchema?.columns || [],
              rows: testReportSchema.TestReportSchema?.rows || []
            },
            ObservationEntrySchema: {
              columns: testReportSchema.ObservationEntrySchema?.columns || [],
              rows: testReportSchema.ObservationEntrySchema?.rows || []
            },
            createdAt: entity.createdAt || '',
            updatedAt: entity.updatedAt || ''
          };
          
          return flattenedSchema;
        })
        .filter(Boolean);
      
      setSchemas(loadedSchemas);
    } catch (error) {
      console.error('Error fetching schemas:', error);
      toast.error('Failed to fetch schemas');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productApi.getAll();
      setProducts(response.data);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchTests = async () => {
    try {
      // Only fetch tests if a product is selected
      if (selectedProductId) {
        const response = await testApi.getTestbyProductId(selectedProductId);
        setTests(response.data);
      } else {
        setTests([]);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast.error('Failed to fetch tests');
      setTests([]);
    }
  };

  const fetchSchemasList = async () => {
    try {
      // Load all schemas once and hold in memory
      const response = await testSchemaApi.getAll();
      setAllSchemas(response.data);
      setSchemasList([]); // Initially empty until test is selected
    } catch (error) {
      console.error('Error fetching schemas list:', error);
      toast.error('Failed to fetch schemas list');
      setAllSchemas([]);
      setSchemasList([]);
    }
  };

  // Filter schemas when test is selected
  const filterSchemasByTest = (testId: string) => {
    if (testId && allSchemas.length > 0) {
      const filteredSchemas = allSchemas.filter((schema: any) => 
        schema.testMappings && schema.testMappings.find((test:any) => test.testId == testId)
      );
      setSchemasList(filteredSchemas);
    } else {
      setSchemasList([]);
    }
  };

  // Add effect to load all schemas when product is selected
  useEffect(() => {
    if (selectedProductId) {
      fetchSchemasList();
    } else {
      setAllSchemas([]);
      setSchemasList([]);
    }
  }, [selectedProductId]);

  // Add effect to refetch tests when product changes
  useEffect(() => {
    if (selectedProductId) {
      fetchTests();
    } else {
      setTests([]);
    }
  }, [selectedProductId]);

  // Add effect to handle clicking outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close all dropdowns when clicking outside
      const target = event.target as Element;
      
      // Check if click is inside any dropdown button or dropdown content
      const isInsideDropdown = target.closest('.schema-dropdown');
      
      if (!isInsideDropdown) {
        // Close all open dropdowns
        const updatedRows = rows.map(row => {
          const newValues = { ...row.values };
          Object.keys(newValues).forEach(key => {
            if (key.endsWith('_open')) {
              newValues[key] = false;
            }
          });
          return { ...row, values: newValues };
        });
        setRows(updatedRows);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [rows]);

  const handleAddColumn = () => {
    const newColumn: Column = {
      id: Date.now().toString(),
      name: '',
      type: 'text',
      required: false,
      textValue: '',
      order: columns.length + 1
    };
    setColumns([...columns, newColumn]);
  };

  const handleRemoveColumn = (columnId: string) => {
    console.log('Removing column:', columnId);
    setColumns(columns.filter(col => col.id !== columnId));
    // Also remove this column from all rows
    setRows(rows.map(row => {
      const newValues = { ...row.values };
      delete newValues[columnId];
      return { ...row, values: newValues };
    }));
  };

  const handleColumnChange = (columnId: string, field: keyof Column, value: any) => {
    console.log('Column change:', columnId, field, value);
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, [field]: value } : col
    ));
  };

  const handleAddRow = () => {
    const newRow: Row = {
      id: Date.now().toString(),
      values: {},
      order: rows.length + 1
    };
    setRows([...rows, newRow]);
  };

  const handleRemoveRow = (rowId: string) => {
    setRows(rows.filter(row => row.id !== rowId));
  };

  const handleRowValueChange = (rowId: string, columnId: string, value: any) => {
    console.log('Row value change:', rowId, columnId, value);
    console.log('Current rows before update:', rows);
    
    const updatedRows = rows.map(row => 
      row.id === rowId 
        ? { ...row, values: { ...row.values, [columnId]: value } }
        : row
    );
    
    console.log('Updated rows:', updatedRows);
    setRows(updatedRows);
  };

  const handleNextStep = () => {
    
    setCurrentStep('rows');
  };

  const handlePreviousStep = () => {
    setCurrentStep('columns');
  };

  const handleSubmit = async () => {
    if (!schemaName.trim()) {
      toast.error('Please enter a schema name');
      return;
    }

    if (!selectedProductId) {
      toast.error('Please select a product');
      return;
    }

    if (columns.length === 0) {
      toast.error('Please add at least one column');
      return;
    }

    const hasEmptyColumnNames = columns.some(col => !col.name.trim());
    if (hasEmptyColumnNames) {
      toast.error('Please fill in all column names');
      return;
    }

    // Validate schema columns have test and schema selected
    const hasInvalidSchemaColumns = rows.some(row => {
      // Check if any row has schema type columns without proper test and schema selections
      return columns.some(col => {
        if (col.type === 'schema') {
          const testValue = row.values['1']; // Test column value
          const schemaValue = row.values['2']; // TestSchema column value
          return !testValue || !schemaValue;
        }
        return false;
      });
    });
    
    if (hasInvalidSchemaColumns) {
      toast.error('Please select test and schema for all schema columns in all rows');
      return;
    }

    setIsSubmitting(true);
    try {
      // Clean up rows for both main and observation tables
      const cleanedRows = rows.map((row, index) => {
        const cleanValues = { ...row.values };
        delete cleanValues.filteredSchemas;
        delete cleanValues.selectedSchema;
        return {
          ...row,
          values: cleanValues,
          order: index + 1
        };
      });
      const cleanedObservationRows = observationRows.map((row, index) => {
        const cleanValues = { ...row.values };
        delete cleanValues.filteredSchemas;
        delete cleanValues.selectedSchema;
        // Remap obs-1/obs-2 to '1'/'2' if present
        if (cleanValues['obs-1'] !== undefined) {
          cleanValues['1'] = cleanValues['obs-1'];
          delete cleanValues['obs-1'];
        }
        if (cleanValues['obs-2'] !== undefined) {
          cleanValues['2'] = cleanValues['obs-2'];
          delete cleanValues['obs-2'];
        }
        return {
          ...row,
          values: cleanValues,
          order: index + 1
        };
      });

      // Build the TableSchema payload
      const payload: TableSchema = {
        id: editingSchema ? editingSchema.id : Date.now().toString(),
        name: schemaName,
        description: schemaDescription,
        productId: selectedProductId,
        includeResultReport: includeReportTable,
        includeObservationEntry,
        IncludeObservationEntryAverageRow: includeObservationEntryAverageRow,
        SerialNumberRequired: serialNumberRequired,
        TestingMethodRequired: testingMethodRequired,
        TestReportSchema: {
          columns: columns.map((col, index) => ({ ...col, order: index + 1 })),
          rows: cleanedRows
        },
        ObservationEntrySchema: {
          columns: observationColumns.map((col, index) => ({ ...col, order: index + 1 })),
          rows: cleanedObservationRows
        },
        createdAt: editingSchema ? editingSchema.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingSchema) {
        await reportSchemaApi.update(editingSchema.id, { TestReportSchema:payload});
        setSchemas(schemas.map(schema =>
          schema.id === editingSchema.id
            ? { ...payload }
            : schema
        ));
        toast.success('Schema updated successfully');
      } else {
        setSchemas([...schemas, payload]);
        await reportSchemaApi.create({TestReportSchema:payload});
        toast.success('Schema created successfully');
      }

      fetchSchemas();

      resetForm();
    } catch (error) {
      console.error('Error saving schema:', error);
      toast.error('Failed to save schema');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (schema: TableSchema) => {
    setEditingSchema(schema);
    setSchemaName(schema.name || '');
    setSchemaDescription(schema.description || '');
    setSelectedProductId(schema.productId || '');
    setIncludeObservationEntry(!!schema.includeObservationEntry);
    setIncludeObservationEntryAverageRow(!!schema.IncludeObservationEntryAverageRow);
    setSerialNumberRequired(!!schema.SerialNumberRequired);
    setTestingMethodRequired(!!schema.TestingMethodRequired);
    // Main table columns/rows
    setColumns(schema.TestReportSchema?.columns ? [...schema.TestReportSchema.columns] : []);
    // Load tests and schemas for the product
    try {
      if (schema.productId) {
        const testResponse = await testApi.getTestbyProductId(schema.productId);
        setTests(testResponse.data);
      }
      const schemaResponse = await testSchemaApi.getAll();
      setAllSchemas(schemaResponse.data);
      // Reconstruct row data with internal state for main table
      const reconstructedRows = (schema.TestReportSchema?.rows || []).map((row: any) => {
        const testId = row.values['1'];
        const schemaId = row.values['2'];
        let filteredSchemas = [];
        if (testId && schemaResponse.data.length > 0) {
          filteredSchemas = schemaResponse.data.filter((schema: any) =>
            schema.testMappings && schema.testMappings.find((test:any) => test.testId == testId)
          );
        }
        let selectedSchema = null;
        if (schemaId && filteredSchemas.length > 0) {
          selectedSchema = filteredSchemas.find((schema: any) => schema.id === schemaId);
        }
        return {
          ...row,
          values: {
            ...row.values,
            filteredSchemas,
            selectedSchema
          }
        };
      });
      setRows(reconstructedRows);
      console.log('schema', schema)
      // Observation table columns/rows
      if (schema.ObservationEntrySchema) {
        // Remap first two columns to id '1' and '2' if needed
        let obsCols = schema.ObservationEntrySchema.columns ? [...schema.ObservationEntrySchema.columns] : [];
        if (obsCols.length > 0) {
          if (obsCols[0].id !== '1') obsCols[0].id = '1';
          if (obsCols[1] && obsCols[1].id !== '2') obsCols[1].id = '2';
        }
        setObservationColumns(ensureObservationColumnProperties(obsCols));
        const reconstructedObsRows = (schema.ObservationEntrySchema.rows || []).map((row: any) => {
          // Remap obs-1/obs-2 to '1'/'2' if present
          const values = { ...row.values };
          if (values['obs-1'] !== undefined) {
            values['1'] = values['obs-1'];
            delete values['obs-1'];
          }
          if (values['obs-2'] !== undefined) {
            values['2'] = values['obs-2'];
            delete values['obs-2'];
          }
          const testId = values['1'];
          const schemaId = values['2'];
          let filteredSchemas = [];
          if (testId && schemaResponse.data.length > 0) {
            filteredSchemas = schemaResponse.data.filter((schema: any) =>
              schema.testMappings && schema.testMappings.find((test:any) => test.testId == testId)
            );
          }
          let selectedSchema = null;
          if (schemaId && filteredSchemas.length > 0) {
            selectedSchema = filteredSchemas.find((schema: any) => schema.id === schemaId);
          }
          return {
            ...row,
            values: {
              ...row.values,
              filteredSchemas,
              selectedSchema
            }
          };
        });
        setObservationRows(reconstructedObsRows);
      } else {
        setObservationColumns([]);
        setObservationRows([]);
      }
    } catch (error) {
      console.error('Error loading data for editing:', error);
      toast.error('Failed to load schema data for editing');
    }
    setCurrentStep('columns');
    setIsFormVisible(true);
  };

  const handleDelete = async (schemaId: string) => {
    if (window.confirm('Are you sure you want to delete this schema?')) {
      try {
        // TODO: Replace with actual API call
         await reportSchemaApi.delete(schemaId);
        setSchemas(schemas.filter(schema => schema.id !== schemaId));


        toast.success('Schema deleted successfully');
      } catch (error) {
        console.error('Error deleting schema:', error);
        toast.error('Failed to delete schema');
      }
    }
  };

  const resetForm = () => {
    setEditingSchema(null);
    setSchemaName('');
    setSchemaDescription('');
    setSelectedProductId('');
    setIncludeObservationEntry(false);
    setIncludeObservationEntryAverageRow(false);
    setSerialNumberRequired(false);
    setTestingMethodRequired(false);
    setColumns([
      {
        id: '1',
        name: 'Test',
        type: 'text',
        required: true,
        textValue: '',
        order: 1
      },
      {
        id: '2',
        name: 'TestSchema',
        type: 'schema',
        required: true,
        testId: '',
        schemaId: '',
        order: 2
      }
    ]);
    setRows([]);
    setCurrentStep('columns');
    setIsFormVisible(false);
  };

  // Helper function to ensure observation columns have the averageCalculationRequired property
  const ensureObservationColumnProperties = (cols: Column[]): Column[] => {
    return cols.map(col => ({
      ...col,
      averageCalculationRequired: col.averageCalculationRequired ?? false
    }));
  };

  // Handlers for Observation Entry table
  const handleAddObservationColumn = () => {
    const newColumn: Column = {
      id: 'obs-' + Date.now().toString(),
      name: '',
      type: 'text',
      required: false,
      textValue: '',
      order: observationColumns.length + 1,
      averageCalculationRequired: false
    };
    setObservationColumns([...observationColumns, newColumn]);
  };
  const handleRemoveObservationColumn = (columnId: string) => {
    setObservationColumns(observationColumns.filter(col => col.id !== columnId));
    setObservationRows(observationRows.map(row => {
      const newValues = { ...row.values };
      delete newValues[columnId];
      return { ...row, values: newValues };
    }));
  };
  const handleObservationColumnChange = (columnId: string, field: keyof Column, value: any) => {
    setObservationColumns(observationColumns.map(col =>
      col.id === columnId ? { ...col, [field]: value } : col
    ));
  };
  const handleAddObservationRow = () => {
    const newRow: Row = {
      id: Date.now().toString(),
      values: {},
      order: observationRows.length + 1
    };
    setObservationRows([...observationRows, newRow]);
  };
  const handleRemoveObservationRow = (rowId: string) => {
    setObservationRows(observationRows.filter(row => row.id !== rowId));
  };
  const handleObservationRowValueChange = (rowId: string, columnId: string, value: any) => {
    setObservationRows(observationRows.map(row => {
      if (row.id === rowId) {
        // If this is the TestSchema column in observation table, set both obs-2 and 2
        if (columnId === 'obs-2' || columnId === '2') {
          return {
            ...row,
            values: {
              ...row.values,
              [columnId]: value,
              // Always keep both keys in sync
              ['obs-2']: value,
              ['2']: value
            }
          };
        }
        return { ...row, values: { ...row.values, [columnId]: value } };
      }
      return row;
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4D55CC]"></div>
          <span className="text-gray-500">Loading schemas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Test Report Table Schemas</h1>
          <p className="mt-2 text-gray-600">Create and manage dynamic table schemas for test reports</p>
        </div>

        {/* Schema List */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Table Schemas</h2>
                <button
                  onClick={() => {
                    console.log('Add Schema clicked, setting form visible');
                    setIsFormVisible(true);
                    console.log('Form visible state:', true);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#4D55CC] hover:bg-[#211C84] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D55CC]"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Schema
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Search Interface - Always Visible */}
              <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-[#4D55CC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search & Filter Schemas (includes product names, test names, and schema names)
                </h3>
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search Input */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search Query</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search schemas, descriptions, columns, products, test names, schema names..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4D55CC] focus:border-[#4D55CC] bg-white"
                        style={{ minHeight: '40px' }}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col gap-2">
                    <label className="block text-sm font-medium text-gray-700">Filters</label>
                    <div className="flex flex-wrap gap-2">
                    <select
                      value={searchFilters.product}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, product: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4D55CC] focus:border-[#4D55CC]"
                    >
                      <option value="">All Products</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>{product.name}</option>
                      ))}
                    </select>

                    <select
                      value={searchFilters.columnType}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, columnType: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4D55CC] focus:border-[#4D55CC]"
                    >
                      <option value="">All Column Types</option>
                      <option value="text">Text</option>
                      <option value="schema">Schema</option>
                    </select>


                  </div>
                </div>
              </div>

                {/* Search Results Summary */}
                {searchQuery || searchFilters.product || searchFilters.columnType ? (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        {isSearching ? 'Searching...' : `${searchResults.total} results found`}
                      </span>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSearchFilters({
                            product: '',
                            hasAverageRow: false,
                            hasTestingMethod: false,
                            columnType: '',
                            dateRange: { start: '', end: '' }
                          });
                        }}
                        className="text-sm text-[#4D55CC] hover:text-[#211C84]"
                      >
                        Clear filters
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              {(searchQuery || searchFilters.product || searchFilters.columnType) && searchResults.total === 0 && !isSearching ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No schemas found matching your search criteria</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchFilters({
                        product: '',
                        hasAverageRow: false,
                        hasTestingMethod: false,
                        columnType: '',
                        dateRange: { start: '', end: '' }
                      });
                    }}
                    className="mt-4 text-sm text-[#4D55CC] hover:text-[#211C84]"
                  >
                    Clear search
                  </button>
                </div>
              ) : (searchQuery || searchFilters.product || searchFilters.columnType) ? (
                <div className="space-y-4">
                  {searchResults.results.map((schema: any) => (
                    <div key={schema.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 
                            className="text-lg font-medium text-gray-900"
                            dangerouslySetInnerHTML={{
                              __html: highlightText(schema.name || '', searchResults.highlights[schema.id] || [])
                            }}
                          />
                          <p 
                            className="text-sm text-gray-600 mt-1"
                            dangerouslySetInnerHTML={{
                              __html: highlightText(schema.description || '', searchResults.highlights[schema.id] || [])
                            }}
                          />
                          <div className="mt-2 text-sm text-gray-600">
                            <p>Product: {products.find(p => p.id === schema.productId)?.name || 'Unknown'}</p>
                            <div className="mt-1 flex flex-wrap gap-2">
                              
                              {schema.includeObservationEntry && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Observation Entry
                                </span>
                              )}
                              {schema.IncludeObservationEntryAverageRow && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Average Row
                                </span>
                              )}
                              {schema.SerialNumberRequired && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Serial Number
                                </span>
                              )}
                              {schema.TestingMethodRequired && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  Testing Method
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {schema.TestReportSchema?.columns?.map((column: any) => (
                              <span
                                key={column.id}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {column.name} ({column.type})
                                {column.required && <span className="text-red-500 ml-1">*</span>}
                              </span>
                            ))}
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            <p>Rows: {schema.TestReportSchema?.rows?.length || 0}</p>
                          </div>
                          {schema.ObservationEntrySchema?.columns?.length > 0 && (
                            <div className="mt-6">
                              <h4 className="text-md font-semibold text-gray-900 mb-2">Observation Table</h4>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {schema.ObservationEntrySchema.columns.map((column: any) => (
                                  <span
                                    key={column.id}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                  >
                                    {column.name} ({column.type})
                                    {column.required && <span className="text-red-500 ml-1">*</span>}
                                  </span>
                                ))}
                              </div>
                              <div className="text-sm text-gray-600">
                                <p>Rows: {schema.ObservationEntrySchema.rows?.length || 0}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(schema)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D55CC]"
                          >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(schema.id)}
                            className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : schemas.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No schemas found</p>
                  <button
                    onClick={() => setIsFormVisible(true)}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-[#4D55CC] bg-[#4D55CC] bg-opacity-10 hover:bg-opacity-20"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create your first schema
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {schemas.map((schema: any) => (
                    <div key={schema.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{schema.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{schema.description}</p>
                          <div className="mt-2 text-sm text-gray-600">
                            <p>Product: {products.find(p => p.id === schema.productId)?.name || 'Unknown'}</p>
                            <div className="mt-1 flex flex-wrap gap-2">
                              
                              {schema.includeObservationEntry && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Observation Entry
                                </span>
                              )}
                              {schema.IncludeObservationEntryAverageRow && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Average Row
                                </span>
                              )}
                              {schema.SerialNumberRequired && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Serial Number
                                </span>
                              )}
                              {schema.TestingMethodRequired && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  Testing Method
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {schema.TestReportSchema?.columns?.map((column: any) => (
                              <span
                                key={column.id}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {column.name} ({column.type})
                                {column.required && <span className="text-red-500 ml-1">*</span>}
                              </span>
                            ))}
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            <p>Rows: {schema.TestReportSchema?.rows?.length || 0}</p>
                          </div>
                          {schema.ObservationEntrySchema?.columns?.length > 0 && (
                            <div className="mt-6">
                              <h4 className="text-md font-semibold text-gray-900 mb-2">Observation Table</h4>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {schema.ObservationEntrySchema.columns.map((column: any) => (
                                  <span
                                    key={column.id}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                  >
                                    {column.name} ({column.type})
                                    {column.required && <span className="text-red-500 ml-1">*</span>}
                                  </span>
                                ))}
                              </div>
                              <div className="text-sm text-gray-600">
                                <p>Rows: {schema.ObservationEntrySchema.rows?.length || 0}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(schema)}
                            className="text-[#4D55CC] hover:text-[#211C84]"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(schema.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Schema Form - Now below the table schemas */}
        {isFormVisible && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingSchema ? 'Edit Schema' : 'Create Schema'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Step Indicator */}
              <div className="mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center ${currentStep === 'columns' ? 'text-[#4D55CC]' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'columns' ? 'bg-[#4D55CC] text-white' : 'bg-gray-200'}`}>
                      1
                    </div>
                    <span className="ml-2 text-sm font-medium">Basic</span>
                  </div>
                  <div className={`flex items-center ${currentStep === 'rows' ? 'text-[#4D55CC]' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'rows' ? 'bg-[#4D55CC] text-white' : 'bg-gray-200'}`}>
                      2
                    </div>
                    <span className="ml-2 text-sm font-medium">Configuration</span>
                  </div>
                </div>
              </div>

              {currentStep === 'columns' ? (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Side - Schema Details */}
                    <div className="lg:col-span-1 space-y-4">
                      {/* Schema Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Schema Name *
                        </label>
                        <input
                          type="text"
                          value={schemaName}
                          onChange={(e) => setSchemaName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
                          placeholder="Enter schema name"
                        />
                      </div>

                      {/* Schema Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={schemaDescription}
                          onChange={(e) => setSchemaDescription(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
                          placeholder="Enter schema description"
                        />
                      </div>

                      {/* Product Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product *
                        </label>
                        <select
                          value={selectedProductId}
                          onChange={(e) => setSelectedProductId(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
                        >
                          <option value="">Select a product</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Options */}
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={includeReportTable}
                            onChange={(e) => setIncludeReportTable(e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Include Report Table</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={includeObservationEntry}
                            onChange={(e) => setIncludeObservationEntry(e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Include Observation Entry</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={includeObservationEntryAverageRow}
                            onChange={(e) => setIncludeObservationEntryAverageRow(e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Include Observation Entry Average Row</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={serialNumberRequired}
                            onChange={(e) => setSerialNumberRequired(e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Serial Number Required</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={testingMethodRequired}
                            onChange={(e) => setTestingMethodRequired(e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Testing Method Required</span>
                        </label>
                      </div>
                    </div>

                    {/* Right Side - Empty for now, as columns config is moved to next step */}
                    <div className="lg:col-span-2"></div>
                  </div>
                  {/* Navigation Buttons for Columns Step */}
                  <div className="pt-4 flex space-x-2">
                    <button
                      onClick={handleNextStep}
                      className="flex-1 px-4 py-2 bg-[#4D55CC] text-white rounded-md hover:bg-[#211C84]"
                    >
                      Next: Configuration
                    </button>
                    <button
                      onClick={resetForm}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-10">
                  {/* Main Table Column and Row Configuration */}
                  {includeReportTable && (
                    <>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Result Table</h2>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <label className="block text-sm font-medium text-gray-700">
                              Columns ({columns.length})
                            </label>
                            <button
                              onClick={handleAddColumn}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-[#4D55CC] hover:text-[#211C84]"
                            >
                              <PlusIcon className="h-4 w-4 mr-1" />
                              Add Column
                            </button>
                          </div>
                          <div className="space-y-3">
                            {columns.map((column) => (
                              <div key={column.id} className="border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center space-x-3">
                                  <div className="flex-1">
                                    <input
                                      type="text"
                                      value={column.name}
                                      onChange={(e) => handleColumnChange(column.id, 'name', e.target.value)}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
                                      placeholder="Column name"
                                      disabled={column.id === '1' || column.id === '2'}
                                    />
                                  </div>
                                  <select
                                    value={column.type}
                                    onChange={(e) => handleColumnChange(column.id, 'type', e.target.value)}
                                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
                                    disabled={column.id === '1' || column.id === '2'}
                                  >
                                    <option value="text">Text</option>
                                    <option value="schema">Schema</option>
                                  </select>
                                  <label className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={column.required}
                                      onChange={(e) => handleColumnChange(column.id, 'required', e.target.checked)}
                                      className="mr-1"
                                      disabled={column.id === '1' || column.id === '2'}
                                    />
                                    <span className="text-xs text-gray-600">Required</span>
                                  </label>
                                  
                                  {column.id !== '1' && column.id !== '2' && (
                                    <button
                                      onClick={() => handleRemoveColumn(column.id)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Rows ({rows.length})
                          </label>
                          <button
                            onClick={handleAddRow}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-[#4D55CC] hover:text-[#211C84] border border-[#4D55CC] rounded-md hover:bg-[#4D55CC] hover:text-white"
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Add Row
                          </button>
                        </div>

                        <div className="overflow-x-auto" style={{ overflow: 'visible' }}>
                          <div className="inline-block min-w-full" style={{ overflow: 'visible' }}>
                            <div className="space-y-3" style={{ overflow: 'visible' }}>
                              {rows.map((row, rowIndex) => (
                                <div key={row.id} className="border border-gray-200 rounded-lg p-4 relative" style={{ zIndex: rowIndex + 1, overflow: 'visible' }}>
                                  <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-sm font-medium text-gray-700">Row {rowIndex + 1}</h4>
                                    <button
                                      onClick={() => handleRemoveRow(row.id)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3" style={{ overflow: 'visible' }}>
                                    {columns.map((column) => (
                                      <div key={column.id} className="min-w-0" style={{ overflow: 'visible' }}>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                          {column.name} {column.required && <span className="text-red-500">*</span>}
                                        </label>
                                        {column.name === 'Test' ? (
                                          <select
                                            key={`${row.id}-${column.id}-${row.values[column.id] || 'empty'}-${renderKey}`}
                                            value={row.values[column.id] || ''}
                                            onChange={(e) => {
                                              const selectedValue = e.target.value;
                                              console.log('Test selected:', selectedValue, 'for row:', row.id);
                                              
                                              // Force immediate state update for test selection
                                              const updatedRows = rows.map(r => 
                                                r.id === row.id 
                                                  ? { ...r, values: { ...r.values, [column.id]: selectedValue } }
                                                  : r
                                              );
                                              setRows(updatedRows);
                                              
                                              // Filter schemas for this specific test and store in row
                                              if (selectedValue && allSchemas.length > 0) {
                                                const filteredSchemas = allSchemas.filter((schema: any) => 
                                                  schema.testMappings && schema.testMappings.find((test:any) => test.testId == selectedValue)
                                                );
                                                console.log('Filtered schemas for test:', selectedValue, ':', filteredSchemas);
                                                
                                                // Store filtered schemas in this row's values
                                                const rowsWithSchemas = updatedRows.map(r => 
                                                  r.id === row.id 
                                                    ? { ...r, values: { ...r.values, filteredSchemas } }
                                                    : r
                                                );
                                                setRows(rowsWithSchemas);
                                                
                                                // Clear the TestSchema selection when test changes
                                                const rowsWithClearedSchema = rowsWithSchemas.map(r => 
                                                  r.id === row.id 
                                                    ? { ...r, values: { ...r.values, '2': '', selectedSchema: null } }
                                                    : r
                                                );
                                                setRows(rowsWithClearedSchema);
                                              } else {
                                                // Clear schemas if no test selected
                                                const rowsWithClearedSchemas = updatedRows.map(r => 
                                                  r.id === row.id 
                                                    ? { ...r, values: { ...r.values, filteredSchemas: [], '2': '', selectedSchema: null } }
                                                    : r
                                                );
                                                setRows(rowsWithClearedSchemas);
                                              }
                                              
                                              // Force re-render
                                              setRenderKey(prev => prev + 1);
                                              
                                              console.log('Current row values:', row.values);
                                              console.log('Column ID:', column.id);
                                            }}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
                                          >
                                            {(() => {
                                              console.log('Rendering Test dropdown for row:', row.id, 'with value:', row.values[column.id], 'column ID:', column.id);
                                              return null;
                                            })()}
                                            <option value="">Select a test</option>
                                            {tests.map(test => (
                                              <option key={test.id} value={test.id}>
                                                {test.name}
                                              </option>
                                            ))}
                                          </select>
                                        ) : column.name === 'TestSchema' ? (
                                          <select
                                            key={`${row.id}-${column.id}-${row.values[column.id] || 'empty'}-${renderKey}`}
                                            value={row.values[column.id] || ''}
                                            onChange={(e) => {
                                              const selectedValue = e.target.value;
                                              console.log('TestSchema onChange triggered:', selectedValue);
                                              
                                              // Get the filtered schemas for this specific row
                                              const rowFilteredSchemas = row.values.filteredSchemas || [];
                                              console.log('Row filtered schemas:', rowFilteredSchemas);
                                              
                                              // Force immediate state update
                                              const updatedRows = rows.map(r => 
                                                r.id === row.id 
                                                  ? { ...r, values: { ...r.values, [column.id]: selectedValue } }
                                                  : r
                                              );
                                              setRows(updatedRows);
                                              
                                              // Update selected schema to filter fields for schema type columns
                                              const selectedSchema = rowFilteredSchemas.filter((schema: any) => schema.id === selectedValue)[0];
                                              console.log('Selected schema:', selectedSchema);
                                              
                                              if (selectedSchema) {
                                                // Update the row's selected schema for filtering
                                                const rowsWithSchema = updatedRows.map(r => 
                                                  r.id === row.id 
                                                    ? { ...r, values: { ...r.values, selectedSchema } }
                                                    : r
                                                );
                                                setRows(rowsWithSchema);
                                                console.log('Updated row with selectedSchema');
                                                
                                                // Clear values for other custom columns (not Test and TestSchema)
                                                const clearedValues = { ...rowsWithSchema.find(r => r.id === row.id)?.values };
                                                
                                                // Keep Test and TestSchema values, clear everything else
                                                const testValue = clearedValues['1']; // Test column
                                                const testSchemaValue = selectedValue; // TestSchema column
                                                const selectedSchemaValue = selectedSchema; // selectedSchema
                                                const filteredSchemasValue = clearedValues.filteredSchemas; // filteredSchemas
                                                
                                                // Clear all values except the ones we want to keep
                                                Object.keys(clearedValues).forEach(key => {
                                                  if (key !== '1' && key !== '2' && key !== 'selectedSchema' && key !== 'filteredSchemas') {
                                                    delete clearedValues[key];
                                                  }
                                                });
                                                
                                                // Restore the values we want to keep
                                                clearedValues['1'] = testValue;
                                                clearedValues['2'] = testSchemaValue;
                                                clearedValues.selectedSchema = selectedSchemaValue;
                                                clearedValues.filteredSchemas = filteredSchemasValue;
                                                
                                                console.log('Cleared values for other columns, kept Test and TestSchema');
                                                console.log('Updated values:', clearedValues);
                                                
                                                // Update the row with cleared values
                                                const rowsWithClearedValues = rowsWithSchema.map(r => 
                                                  r.id === row.id 
                                                    ? { ...r, values: clearedValues }
                                                    : r
                                                );
                                                setRows(rowsWithClearedValues);
                                              }
                                              
                                              // Force re-render
                                              setRenderKey(prev => prev + 1);
                                              
                                              console.log('TestSchema selected:', selectedValue, 'for row:', row.id);
                                              console.log('Current row values:', row.values);
                                              console.log('Column ID:', column.id);
                                            }}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
                                          >
                                            {(() => {
                                              const rowFilteredSchemas = row.values.filteredSchemas || [];
                                              console.log('Rendering TestSchema dropdown for row:', row.id, 'with value:', row.values[column.id], 'column ID:', column.id);
                                              console.log('Available schemas for this row:', rowFilteredSchemas);
                                              return null;
                                            })()}
                                            <option value="">Select a test schema</option>
                                            {(() => {
                                              // Get the current row's test selection
                                              const currentTestId = row.values['1']; // Column ID for Test
                                              const currentSchemaId = row.values[column.id]; // Current schema selection
                                              
                                              // Get all used test-schema combinations from previous rows
                                              const usedCombinations = rows
                                                .filter(r => r.id !== row.id) // Exclude current row
                                                .map(r => ({
                                                  testId: r.values['1'], // Test column ID
                                                  schemaId: r.values['2'] // TestSchema column ID
                                                }))
                                                .filter(combo => combo.testId && combo.schemaId); // Only valid combinations
                                              
                                              console.log('Current test ID:', currentTestId);
                                              console.log('Current schema ID:', currentSchemaId);
                                              console.log('Used combinations:', usedCombinations);
                                              
                                              // Filter out schemas that are already used for the same test in other rows
                                              const availableSchemas = (row.values.filteredSchemas || []).filter((schema: any) => {
                                                // Always include the currently selected schema for this row
                                                if (schema.id === currentSchemaId) {
                                                  return true;
                                                }
                                                
                                                // Check if this schema is already used for the same test in another row
                                                const isUsed = usedCombinations.some(combo => 
                                                  combo.testId === currentTestId && combo.schemaId === schema.id
                                                );
                                                
                                                return !isUsed;
                                              });
                                              
                                              console.log('Available schemas after filtering:', availableSchemas);
                                              
                                              return availableSchemas.map((schema: any) => (
                                                <option key={schema.id} value={schema.id}>
                                                  {schema.name}
                                                </option>
                                              ));
                                            })()}
                                          </select>
                                        ) : column.type === 'schema' ? (
                                          <div className="w-full relative schema-dropdown" style={{ zIndex: 1000 }}>
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                // Toggle dropdown visibility
                                                const currentOpen = row.values[`${column.id}_open`] || false;
                                                console.log('Dropdown toggle clicked:', column.id, 'current state:', currentOpen, 'new state:', !currentOpen);
                                                handleRowValueChange(row.id, `${column.id}_open`, !currentOpen);
                                              }}
                                              className="w-full px-3 py-2 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4D55CC] bg-white hover:bg-gray-50 transition-colors"
                                            >
                                              <span className="block truncate text-sm">
                                                {(() => {
                                                  const selectedFields = row.values[column.id] || [];
                                                  if (selectedFields.length === 0) {
                                                    return "Select schema fields";
                                                  } else if (selectedFields.length === 1) {
                                                    return selectedFields[0];
                                                  } else {
                                                    return `${selectedFields.length} fields selected`;
                                                  }
                                                })()}
                                              </span>
                                              <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                <svg className={`h-4 w-4 text-gray-400 transition-transform ${(row.values[`${column.id}_open`] || false) ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                              </span>
                                            </button>
                                            
                                            {(row.values[`${column.id}_open`] || false) && (
                                              <div className="absolute z-[99999] w-full bottom-full mb-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-auto" style={{ minWidth: '300px' }}>
                                                {/* Header */}
                                                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                                                  <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-medium text-gray-900">Select Schema Fields</h3>
                                                    <button
                                                      onClick={() => handleRowValueChange(row.id, `${column.id}_open`, false)}
                                                      className="text-gray-400 hover:text-gray-600"
                                                    >
                                                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                      </svg>
                                                    </button>
                                                  </div>
                                                </div>
                                                
                                                {/* Content */}
                                                <div className="py-2">
                                                  {(() => {
                                                    // Get the selected schema for this row
                                                    const selectedSchema = row.values.selectedSchema;
                                                    const selectedFields = row.values[column.id] || [];
                                                    
                                                    if (selectedSchema && selectedSchema.schema) {
                                                      // Show fields only from the selected schema
                                                      return selectedSchema.schema.map((field: any) => (
                                                        <label key={field.field} className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors">
                                                          <input
                                                            type="checkbox"
                                                            checked={selectedFields.includes(field.field)}
                                                            onChange={(e) => {
                                                              e.stopPropagation();
                                                              const fieldValue = field.field;
                                                              const currentFields = row.values[column.id] || [];
                                                              
                                                              let updatedFields;
                                                              if (e.target.checked) {
                                                                // Add field to selection
                                                                updatedFields = [...currentFields, fieldValue];
                                                              } else {
                                                                // Remove field from selection
                                                                updatedFields = currentFields.filter((f: string) => f !== fieldValue);
                                                              }
                                                              
                                                              handleRowValueChange(row.id, column.id, updatedFields);
                                                              console.log('Updated schema fields:', updatedFields);
                                                            }}
                                                            className="rounded border-gray-300 text-[#4D55CC] focus:ring-[#4D55CC] mr-3 h-4 w-4"
                                                          />
                                                          <span className="text-sm text-gray-700 flex-1">
                                                            {field.displayName || field.field}
                                                          </span>
                                                          {selectedFields.includes(field.field) && (
                                                            <svg className="h-4 w-4 text-[#4D55CC] ml-2" fill="currentColor" viewBox="0 0 20 20">
                                                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                          )}
                                                        </label>
                                                      ));
                                                    } else {
                                                      // Show all fields from all schemas if no schema is selected
                                                      return schemasList.map(schema => 
                                                        schema.schema && schema.schema.map((field: any) => (
                                                          <label key={field.field} className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors">
                                                            <input
                                                              type="checkbox"
                                                              checked={(row.values[column.id] || []).includes(field.field)}
                                                              onChange={(e) => {
                                                                e.stopPropagation();
                                                                const fieldValue = field.field;
                                                                const currentFields = row.values[column.id] || [];
                                                                
                                                                let updatedFields;
                                                                if (e.target.checked) {
                                                                  // Add field to selection
                                                                  updatedFields = [...currentFields, fieldValue];
                                                                } else {
                                                                  // Remove field from selection
                                                                  updatedFields = currentFields.filter((f: string) => f !== fieldValue);
                                                                }
                                                                
                                                                handleRowValueChange(row.id, column.id, updatedFields);
                                                                console.log('Updated schema fields:', updatedFields);
                                                              }}
                                                              className="rounded border-gray-300 text-[#4D55CC] focus:ring-[#4D55CC] mr-3 h-4 w-4"
                                                            />
                                                            <span className="text-sm text-gray-700 flex-1">
                                                              {field.displayName || field.field}
                                                            </span>
                                                            {(row.values[column.id] || []).includes(field.field) && (
                                                              <svg className="h-4 w-4 text-[#4D55CC] ml-2" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                              </svg>
                                                            )}
                                                          </label>
                                                        ))
                                                      ).flat();
                                                    }
                                                  })()}
                                                </div>
                                                
                                                {/* Footer */}
                                                {(() => {
                                                  const selectedFields = row.values[column.id] || [];
                                                  if (selectedFields.length > 0) {
                                                    return (
                                                      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                                                        <div className="text-sm text-gray-600">
                                                          {selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''} selected
                                                        </div>
                                                      </div>
                                                    );
                                                  }
                                                  return null;
                                                })()}
                                              </div>
                                            )}
                                          </div>
                                        ) : column.type === 'text' ? (
                                          <input
                                            type="text"
                                            value={row.values[column.id] || ''}
                                            onChange={e => handleRowValueChange(row.id, column.id, e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
                                            placeholder={`Enter ${column.name}`}
                                          />
                                        ) : null}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Observation Entry Table Configuration */}
                  {includeObservationEntry && (
                    <div className="mt-10">
                      <h2 className="text-xl font-semibold text-[#4D55CC] mb-4">Observation Table</h2>
                      {/* Columns config for Observation Entry table */}
                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center">
                          <label className="block text-sm font-medium text-gray-700">
                            Columns ({observationColumns.length})
                          </label>
                          <button
                            onClick={handleAddObservationColumn}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-[#4D55CC] hover:text-[#211C84]"
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Add Column
                          </button>
                        </div>
                        <div className="space-y-3">
                          {observationColumns.map((column) => (
                            <div key={column.id} className="border border-blue-200 rounded-lg p-3">
                              <div className="flex items-center space-x-3">
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    value={column.name}
                                    onChange={(e) => handleObservationColumnChange(column.id, 'name', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
                                    placeholder="Column name"
                                    disabled={column.id === '1' || column.id === '2'}
                                  />
                                </div>
                                <select
                                  value={column.type}
                                  onChange={(e) => handleObservationColumnChange(column.id, 'type', e.target.value)}
                                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
                                  disabled={column.id === '1' || column.id === '2'}
                                >
                                  <option value="text">Text</option>
                                  <option value="schema">Schema</option>
                                </select>
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={column.required}
                                    onChange={(e) => handleObservationColumnChange(column.id, 'required', e.target.checked)}
                                    className="mr-1"
                                    disabled={column.id === '1' || column.id === '2'}
                                  />
                                  <span className="text-xs text-gray-600">Required</span>
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={column.averageCalculationRequired || false}
                                    onChange={(e) => handleObservationColumnChange(column.id, 'averageCalculationRequired', e.target.checked)}
                                    className="mr-1"
                                  />
                                  <span className="text-xs text-gray-600">Avg Calc</span>
                                </label>
                                {column.id !== '1' && column.id !== '2' && (
                                  <button
                                    onClick={() => handleRemoveObservationColumn(column.id)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Rows config for Observation Entry table */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Rows ({observationRows.length})
                          </label>
                          <button
                            onClick={handleAddObservationRow}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-[#4D55CC] hover:text-[#211C84] border border-[#4D55CC] rounded-md hover:bg-[#4D55CC] hover:text-white"
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Add Row
                          </button>
                        </div>
                        <div className="overflow-x-auto" style={{ overflow: 'visible' }}>
                          <div className="inline-block min-w-full" style={{ overflow: 'visible' }}>
                            <div className="space-y-3" style={{ overflow: 'visible' }}>
                              {observationRows.map((row, rowIndex) => (
                                <div key={row.id} className="border border-blue-200 rounded-lg p-4 relative bg-blue-50" style={{ zIndex: rowIndex + 1, overflow: 'visible' }}>
                                  <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-sm font-medium text-gray-700">Row {rowIndex + 1}</h4>
                                    <button
                                      onClick={() => handleRemoveObservationRow(row.id)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3" style={{ overflow: 'visible' }}>
                                    {observationColumns.map((column) => (
                                      <div key={column.id} className="min-w-0" style={{ overflow: 'visible' }}>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                          {column.name} {column.required && <span className="text-red-500">*</span>}
                                        </label>
                                        {column.name === 'Test' ? (
                                          <select
                                            key={`${row.id}-${column.id}-${row.values[column.id] || 'empty'}-obs`}
                                            value={row.values[column.id] || ''}
                                            onChange={(e) => {
                                              const selectedValue = e.target.value;
                                              // Update row value
                                              const updatedRows = observationRows.map(r =>
                                                r.id === row.id
                                                  ? { ...r, values: { ...r.values, [column.id]: selectedValue } }
                                                  : r
                                              );
                                              setObservationRows(updatedRows);
                                              // Filter schemas for this test and store in row
                                              if (selectedValue && allSchemas.length > 0) {
                                                const filteredSchemas = allSchemas.filter((schema: any) =>
                                                  schema.testMappings && schema.testMappings.find((test:any) => test.testId == selectedValue)
                                                );
                                                const rowsWithSchemas = updatedRows.map(r =>
                                                  r.id === row.id
                                                    ? { ...r, values: { ...r.values, filteredSchemas } }
                                                    : r
                                                );
                                                setObservationRows(rowsWithSchemas);
                                                // Clear the TestSchema selection when test changes
                                                const rowsWithClearedSchema = rowsWithSchemas.map(r =>
                                                  r.id === row.id
                                                    ? { ...r, values: { ...r.values, 'obs-2': '', selectedSchema: null } }
                                                    : r
                                                );
                                                setObservationRows(rowsWithClearedSchema);
                                              } else {
                                                // Clear schemas if no test selected
                                                const rowsWithClearedSchemas = updatedRows.map(r =>
                                                  r.id === row.id
                                                    ? { ...r, values: { ...r.values, filteredSchemas: [], 'obs-2': '', selectedSchema: null } }
                                                    : r
                                                );
                                                setObservationRows(rowsWithClearedSchemas);
                                              }
                                            }}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
                                          >
                                            <option value="">Select a test</option>
                                            {tests.map(test => (
                                              <option key={test.id} value={test.id}>
                                                {test.name}
                                              </option>
                                            ))}
                                          </select>
                                        ) : column.name === 'TestSchema' ? (
                                          <select
                                            key={`${row.id}-${column.id}-${row.values[column.id] || 'empty'}-obs`}
                                            value={row.values[column.id] || ''}
                                            onChange={(e) => {
                                              const selectedValue = e.target.value;
                                              // Get the filtered schemas for this specific row
                                              const rowFilteredSchemas = row.values.filteredSchemas || [];
                                              // Update row value
                                              const updatedRows = observationRows.map(r =>
                                                r.id === row.id
                                                  ? { ...r, values: { ...r.values, 'obs-2':selectedValue, [column.id]: selectedValue } }
                                                  : r
                                              );
                                              setObservationRows(updatedRows);
                                              // Update selected schema to filter fields for schema type columns
                                              const selectedSchema = rowFilteredSchemas.filter((schema: any) => schema.id === selectedValue)[0];
                                              if (selectedSchema) {
                                                const rowsWithSchema = updatedRows.map(r =>
                                                  r.id === row.id
                                                    ? { ...r, values: { ...r.values, selectedSchema } }
                                                    : r
                                                );
                                                setObservationRows(rowsWithSchema);
                                              }
                                            }}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
                                          >
                                            <option value="">Select a test schema</option>
                                            {(() => {
                                              const currentTestId = row.values['1'];
                                              const currentSchemaId = row.values[column.id];
                                              const usedCombinations = observationRows
                                                .filter(r => r.id !== row.id)
                                                .map(r => ({
                                                  testId: r.values['1'],
                                                  schemaId: r.values['2']
                                                }))
                                                .filter(combo => combo.testId && combo.schemaId);
                                              const availableSchemas = (row.values.filteredSchemas || []).filter((schema: any) => {
                                                if (schema.id === currentSchemaId) {
                                                  return true;
                                                }
                                                const isUsed = usedCombinations.some(combo =>
                                                  combo.testId === currentTestId && combo.schemaId === schema.id
                                                );
                                                return !isUsed;
                                              });
                                              return availableSchemas.map((schema: any) => (
                                                <option key={schema.id} value={schema.id}>
                                                  {schema.name}
                                                </option>
                                              ));
                                            })()}
                                          </select>
                                        ) : column.type === 'text' ? (
                                          <input
                                            type="text"
                                            value={row.values[column.id] || ''}
                                            onChange={e => handleObservationRowValueChange(row.id, column.id, e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
                                            placeholder={`Enter ${column.name}`}
                                          />
                                        ) : column.type === 'schema' ? (
                                          <div className="w-full relative schema-dropdown" style={{ zIndex: 1000 }}>
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                // Toggle dropdown visibility
                                                const currentOpen = row.values[`${column.id}_open`] || false;
                                                handleObservationRowValueChange(row.id, `${column.id}_open`, !currentOpen);
                                              }}
                                              className="w-full px-3 py-2 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4D55CC] bg-white hover:bg-gray-50 transition-colors"
                                            >
                                              <span className="block truncate text-sm">
                                                {(() => {
                                                  const selectedFields = row.values[column.id] || [];
                                                  if (selectedFields.length === 0) {
                                                    return "Select schema fields";
                                                  } else if (selectedFields.length === 1) {
                                                    return selectedFields[0];
                                                  } else {
                                                    return `${selectedFields.length} fields selected`;
                                                  }
                                                })()}
                                              </span>
                                              <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                <svg className={`h-4 w-4 text-gray-400 transition-transform ${(row.values[`${column.id}_open`] || false) ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                              </span>
                                            </button>
                                            
                                            {(row.values[`${column.id}_open`] || false) && (
                                              <div className="absolute z-[99999] w-full bottom-full mb-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-auto" style={{ minWidth: '300px' }}>
                                                {/* Header */}
                                                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                                                  <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-medium text-gray-900">Select Schema Fields</h3>
                                                    <button
                                                      onClick={() => handleObservationRowValueChange(row.id, `${column.id}_open`, false)}
                                                      className="text-gray-400 hover:text-gray-600"
                                                    >
                                                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                      </svg>
                                                    </button>
                                                  </div>
                                                </div>
                                                
                                                {/* Content */}
                                                <div className="py-2">
                                                  {(() => {
                                                    // Get the selected schema for this row
                                                    const selectedSchema = row.values.selectedSchema;
                                                    const selectedFields = row.values[column.id] || [];
                                                    
                                                    if (selectedSchema && selectedSchema.schema) {
                                                      // Show fields only from the selected schema
                                                      return selectedSchema.schema.map((field: any) => (
                                                        <label key={field.field} className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors">
                                                          <input
                                                            type="checkbox"
                                                            checked={selectedFields.includes(field.field)}
                                                            onChange={(e) => {
                                                              e.stopPropagation();
                                                              const fieldValue = field.field;
                                                              const currentFields = row.values[column.id] || [];
                                                              
                                                              let updatedFields;
                                                              if (e.target.checked) {
                                                                // Add field to selection
                                                                updatedFields = [...currentFields, fieldValue];
                                                              } else {
                                                                // Remove field from selection
                                                                updatedFields = currentFields.filter((f: string) => f !== fieldValue);
                                                              }
                                                              
                                                              handleObservationRowValueChange(row.id, column.id, updatedFields);
                                                              console.log('Updated schema fields:', updatedFields);
                                                            }}
                                                            className="rounded border-gray-300 text-[#4D55CC] focus:ring-[#4D55CC] mr-3 h-4 w-4"
                                                          />
                                                          <span className="text-sm text-gray-700 flex-1">
                                                            {field.displayName || field.field}
                                                          </span>
                                                          {selectedFields.includes(field.field) && (
                                                            <svg className="h-4 w-4 text-[#4D55CC] ml-2" fill="currentColor" viewBox="0 0 20 20">
                                                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                          )}
                                                        </label>
                                                      ));
                                                    } else {
                                                      // Show all fields from all schemas if no schema is selected
                                                      return schemasList.map(schema => 
                                                        schema.schema && schema.schema.map((field: any) => (
                                                          <label key={field.field} className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors">
                                                            <input
                                                              type="checkbox"
                                                              checked={(row.values[column.id] || []).includes(field.field)}
                                                              onChange={(e) => {
                                                                e.stopPropagation();
                                                                const fieldValue = field.field;
                                                                const currentFields = row.values[column.id] || [];
                                                                
                                                                let updatedFields;
                                                                if (e.target.checked) {
                                                                  // Add field to selection
                                                                  updatedFields = [...currentFields, fieldValue];
                                                                } else {
                                                                  // Remove field from selection
                                                                  updatedFields = currentFields.filter((f: string) => f !== fieldValue);
                                                                }
                                                                
                                                                handleObservationRowValueChange(row.id, column.id, updatedFields);
                                                                console.log('Updated schema fields:', updatedFields);
                                                              }}
                                                              className="rounded border-gray-300 text-[#4D55CC] focus:ring-[#4D55CC] mr-3 h-4 w-4"
                                                            />
                                                            <span className="text-sm text-gray-700 flex-1">
                                                              {field.displayName || field.field}
                                                            </span>
                                                            {(row.values[column.id] || []).includes(field.field) && (
                                                              <svg className="h-4 w-4 text-[#4D55CC] ml-2" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                              </svg>
                                                            )}
                                                          </label>
                                                        ))
                                                      ).flat();
                                                    }
                                                  })()}
                                                </div>
                                                
                                                {/* Footer */}
                                                {(() => {
                                                  const selectedFields = row.values[column.id] || [];
                                                  if (selectedFields.length > 0) {
                                                    return (
                                                      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                                                        <div className="text-sm text-gray-600">
                                                          {selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''} selected
                                                        </div>
                                                      </div>
                                                    );
                                                  }
                                                  return null;
                                                })()}
                                              </div>
                                            )}
                                          </div>
                                        ) : column.type === 'text' ? (
                                          <input
                                            type="text"
                                            value={row.values[column.id] || ''}
                                            onChange={e => handleObservationRowValueChange(row.id, column.id, e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
                                            placeholder={`Enter ${column.name}`}
                                          />
                                        ) : null}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Navigation Buttons for Configuration Step */}
                  <div className="pt-4 flex space-x-2">
                    <button
                      onClick={handlePreviousStep}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Previous: Basic Info
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex-1 px-4 py-2 bg-[#4D55CC] text-white rounded-md hover:bg-[#211C84]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Schema'}
                    </button>
                    <button
                      onClick={resetForm}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          )
          }
        </div>
      
      <Toaster position="top-right" />
    </div>
  );
}

export { TestReportTableSchemas };