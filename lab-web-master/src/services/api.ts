import axios from 'axios';
import { data } from 'react-router-dom';

const api = axios.create({
  baseURL: 'http://103.62.146.210:88/',
});

// Auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const configurationApi = {
  get: () => api.get(`configuration`),
  update: (data: any) => api.put(`configuration`, data),
};

// Auth APIs
export const authApi = {
  login: (data: { email: string; password: string }) => 
    api.post('/users/login', data),
  register: (data: { firstName:string, lastName:string, email: string; password: string, role:string }) =>
    api.post('/users/register', data),
  getAll: (params:any) => api.get('/users',{params: {search: params.search,page:params.page, limit:params.pageSize}}),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch(`/users/change-password`, data),
  getById(id?: string) {
    return api.get(`/users/getById`,{params:{id}}); 
  },
  delete(id:string){
    console.log(id)
    return api.delete(`/users/${id}`);
  },
  update:(id:string, data:any) => api.patch(`/users/update/${id}`, data),
  resetPassword:(id:string,data:any) => api.patch(`/users/reset-password/${id}`,data)
};

// Customer APIs
export const customerApi = {
  register: (data: any) => api.post('/customers/register', data),
  getAll: () => api.get('/customers'),
};

// Product APIs
export const productApi = {
  create: (data: any) => api.post('/products', data),
  getAll: () => api.get('/products'),
  update: (id: string, data: any) => api.patch(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  resetAllReportNumbers: () => api.post(`/products/reset-report-no`),
};

// Test APIs
export const testApi = {
  create: (data: any) => api.post('/tests/', data),
  getTestbyProductId: (productId: string) => api.get(`/tests/product/${productId}`),
  getAll: () => api.get('/tests'),
  getTestResults: (materialId: string) => api.get(`/tests/results/${materialId}`),
  delete: (id: string) => api.delete(`/tests/${id}`),
  update: (id: string, data: any) => api.patch(`/tests/${id}`, data), // Add update endpoin
};

// Add this new API group
// Add interface for test schema data
interface TestSchemaData {
  name: string;
  schema: Array<{
    field: string;
    displayName: string;
    type: 'string' | 'number' | 'formula';
    value?: string;
  }>;
  testIds: string[];
}

export const testSchemaApi = {
  create: (data: TestSchemaData) => api.post('/test-schemas', data),
  getAll: () => api.get('/test-schemas'),
  getById: (id: string) => api.get(`/test-schemas/${id}`),
  update: (id: string, data: any) => api.patch(`/test-schemas/${id}`, data),
  delete: (id: string) => api.delete(`/test-schemas/${id}`),
};

export const contractApi = {
  create: (data: any) => api.post('/contract-review', data),
  getAll: () => api.get('/contract-review'),
  getById: (id: string) => api.get(`/contract-review/${id}`),
  update: (id: string, data: any) => api.patch(`/contract-review/${id}`, data),
  delete: (id: string) => api.delete(`/contract-review/${id}`),
  getByRequestId: (id: string) => api.get(`/contract-review/request/${id}`),
  updateByRequestId: (id: string, data: any) => api.patch(`/contract-review/request/${id}`, data),
  getNextTRFNumber: (reportType: string = 'NABL') => api.get(`/contract-review/next-trf-number?reportType=${reportType}`),
}

export const requestApi = {
  create: (data: any) => api.post('/requests', data),
  getAll: (params:any) => api.get('/requests', {params: {formId: params.formId, customerName: params.customerName, mobileNo:params.mobileNo, status:params.status,page:params.page, limit:params.pageSize}}),
  getById: (id: string) => api.get(`/requests/${id}`),
  getRequestStatuses: () => api.get('/requests/statuses'),
  update: (id: string, data: any) => api.patch(`/requests/${id}`, data), // Add update endpoint
  getRequestsByLabUser: (page:number, limit:number, searchFormId:string, searchCustomerName:string, searchMobileNo:string, searchEmailId:string) => api.get(`/requests/getRequestsByLabUser/1`,{params: {page,limit,formId:searchFormId,name: searchCustomerName,mobileNo:searchMobileNo,emailId:searchEmailId}}),
  delete: (id: string) => api.delete(`/requests/${id}`),
  uploadPdf: (formData: FormData) => api.post('/requests/upload-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

export const sampleCollectionApi = {
  createSample: (data: any) => api.post('/sample-collection/samples', data),
  createMapping: (data: any) => api.post('/sample-collection/mappings', data),
  getSamples: () => api.get('/sample-collection/samples'),
  getMappings: () => api.get('/sample-collection/mappings'),
  getSamplesByRequestId: (requestId: string) => api.get(`/sample-collection/request/${requestId}`),
  getMappingsByRequestId: (requestId: string) => api.get(`/sample-collection/mappings/request/${requestId}`),
  getUserMappingsByRequestId: (requestId: string) => api.get(`/sample-collection/mappings/request/user/${requestId}`),
  deleteSample: (sampleId: string) => api.delete(`/sample-collection/samples/${sampleId}`),
  deleteMapping: (mappingId: string) => api.delete(`/sample-collection/mappings/${mappingId}`),
  updateSample: (sampleId: string, data: any) => api.patch(`/sample-collection/samples/${sampleId}`, data),
  assignUserToMapping: (mappingId: string, userId: string) => api.patch(`/sample-collection/mapping/${mappingId}/assign-user`, { userId }),
}

export const receiptApi = {
  create: (data: any) => api.post('/receipts', data),
  getAll: () => api.get('/receipts'),
  getById: (id: string) => api.get(`/receipts/${id}`), 
  getByRequestId: (id: string) => api.get(`/receipts/request/${id}`),
}

export const observationApi = {
  create: (data: any) => api.post('/observation-entry', data),
  getAll: () => api.get('/observation-entry'),
  getById: (id: string) => api.get(`/observation-entry/${id}`),
  getByRequestId: (id: string) => api.get(`/observation-entry/request/${id}`), 
  getByUserAndRequestId: (requestId: string) => api.get(`/observation-entry/request/user/${requestId}`),
  updateAdditionalInfo: (data: any) => api.patch(`/observation-entry/additional-info/1`, data),
  find: (params:any) => api.get('/observation-entry/find',{params: {productTestSampleMappingId: params.productTestSampleMappingId,requestId:params.requestId}}),
}

export const mobileRequestApi = {
 create: (data: any) => api.post('/mobile-app/app-requests', data),
 getAll: (page:number, limit:number, searchName:string, searchMobileNo:string, searchEmailId:string) => api.get('mobile-app/app-requests',{params: {page, limit, name: searchName, mobileNo:searchMobileNo, emailId:searchEmailId}}),
 getById: (id: string) => api.get(`/mobile-app/app-requests/getById/${id}`),
 getByRequestId: (id: string) => api.get(`/mobile-app/app-requests/request/${id}`), 
 updateStatus:(id: string, data: any) => api.patch(`/mobile-app/app-requests/updateStatus/${id}/status`, data),
 reportCreate: (id:string,data: any) => api.patch(`/mobile-app/app-requests/${id}/report`, data, {
  headers: {
   'Content-Type': 'multipart/form-data',
 },
 responseType: 'arraybuffer'
}),
}

export const mobileTestsApi = {
  getAll: () => api.get('/mobile-app/app-tests'),
  getById: (id: string) => api.get(`/mobile-app/app-tests/${id}`),
  getByRequestId: (id: string) => api.get(`/mobile-app/app-tests/by-request/${id}`), 
}

export const mobileQuotationApi = {
create: (data: any) => api.post('/mobile-app/app-quotation', data), 
getInvoice: (id: string) => api.get(`/mobile-app/app-quotation/${id}/invoice`,
  {
    responseType: 'arraybuffer'
  }
),

}

export const reportApi = {
  getReport: (id: string) => api.get(`reports/test-request-form-by-request?requestId=${id}`,
    {
      responseType: 'arraybuffer'
    }
  ),
  getReportByMobileRequest: (id: string) => api.get(`reports/test-report/${encodeURIComponent(id)}`,
    {
      responseType: 'arraybuffer'
    }
  ),
}

export const systemSettingsApi = {
  create: (data: any) => api.post(`system-settings`, {data: data}),
  get: () => api.get(`system-settings`),
  update: (data: any) => api.put(`system-settings`, data),
}

export const reportSchemaApi = {
  create: (data:any) => api.post('report-schema', data),
  get: () => api.get('report-schema'),
  update: (id: string, data: any) => api.patch(`report-schema/${id}`, data),
  delete:(id:string) => api.delete(`report-schema/${id}`),
}

export default api;

export const reportNumberApi = {
  get: (requestId: string) => api.get(`/report-numbers/${encodeURIComponent(requestId)}`),
  save: (requestId: string, reports: any[]) => api.patch(`/report-numbers/${encodeURIComponent(requestId)}`, { reports }),
};