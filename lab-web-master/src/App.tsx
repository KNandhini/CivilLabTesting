import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { TestsPage } from './pages/TestsPage';
import { ResultsPage } from './pages/ResultsPage';
import { ProductsTable } from './pages/ProductsTable';
import { LabTest } from './pages/LabTest';
import { TestSchemaMapping } from './pages/TestSchemaMapping';
import { ContractTable } from './pages/ContractTable';
import { ObservationEntry } from './pages/ObservationEntry';
import { Report } from './pages/Report';
import { Users } from './pages/Users';
import { ChangePassword } from './pages/ChangePassword';
import { Profile } from './pages/Profile';
import { LabTestTable } from './pages/LabTestTable';
import { AppRequestsPage } from './pages/AppRequestsPage';
import { QuotationPage } from './pages/QuotationPage';
import SystemSettings from './pages/SystemSettings';
import { InvoicePage } from './pages/InvoicePage';
import { TestReportTableSchemas } from './pages/TestReportTableSchemas';
import { ReportDownload } from './pages/ReportDownload';
 

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/download-report/:requestId" element={<ReportDownload />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<ContractTable />} />
          <Route path="products" element={<ProductsTable/>} />
          <Route path="product/new" element={<ProductsPage/>} />
          <Route path="contract-create/:requestId?/:apprequestId?/:step?" element={<LabTest/>} />
          <Route path="contract-edit/:requestId/:step?" element={<LabTest/>} />
          <Route path="contracts" element={<ContractTable/>} />
          <Route path="tests" element={<TestsPage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="test-schema" element={<TestSchemaMapping />} />
          // Add this route to your existing routes
          <Route path="/observation-entry/:requestId" element={<ObservationEntry />} />
          <Route path="/report/:requestId" element={<Report />} />
          <Route path="users" element={<Users />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/lab-tests" element={ <LabTestTable /> } />
          <Route path="/app-requests" element={ <AppRequestsPage /> } />
          <Route path="/quotation/:requestId" element={ <QuotationPage /> } />
          <Route path="/system-settings" element={<SystemSettings />} />
          <Route path="/invoice/:requestId" element={ <InvoicePage /> } />
          <Route path='report-schema' element={<TestReportTableSchemas />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
