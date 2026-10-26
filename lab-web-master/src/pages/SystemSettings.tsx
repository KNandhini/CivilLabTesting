import React, { useState, useEffect } from 'react';
import { systemSettingsApi, productApi } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import LogoUploader from '../components/LogoUploader';

const STEEL_GRADES = ['Fe 415', 'Fe 415D', 'Fe 500', 'Fe 500D', 'Fe 550', 'Fe 550D', 'Fe 600'];

type SteelGradeStandard = {
  yieldStress: string;
  ultimateTensileStress: string;
  elongation: string;
};

type SystemSettings = {
  consultancyDetails: {
    name: string;
    address: string;
    logo: string;
    nablLogo: string;
    nonNablLogo: string;
    footerBanner: string;
    gstNo: string;
  };
  bankDetails: {
    accountName: string;
    accountNumber: string;
    accountType: string;
    bankName: string;
    branch: string;
    ifscCode: string;
    pan: string;
    stateCode: string;
  };
  formNumbers: {
    observationEntry: string;
    testRequest: string;
    tocr: string;
  };
  numberPrefixes: {
    testReport: string;
    ulr: string;
    annualTestRequest: string;
  };
  codeFormats: {
    sample: string;
  };
  authorisedSignatories: string[];
  steelGradeStandards: Record<string, SteelGradeStandard>;
};

const defaultSteelGradeStandards: Record<string, SteelGradeStandard> = STEEL_GRADES.reduce(
  (acc, grade) => ({ ...acc, [grade]: { yieldStress: '', ultimateTensileStress: '', elongation: '' } }),
  {}
);

const defaultSettings: SystemSettings = {
  consultancyDetails: { name: '', address: '', logo: '', nablLogo: '', nonNablLogo: '', footerBanner: '', gstNo: '' },
  bankDetails: {
    accountName: '',
    accountNumber: '',
    accountType: '',
    bankName: '',
    branch: '',
    ifscCode: '',
    pan: '',
    stateCode: '',
  },
  formNumbers: { observationEntry: '', testRequest: '', tocr: '' },
  numberPrefixes: { testReport: '', ulr: '', annualTestRequest: '' },
  codeFormats: { sample: '' },
  authorisedSignatories: [],
  steelGradeStandards: defaultSteelGradeStandards,
};

export default function SystemSettings() {
  const [formData, setFormData] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchConfigurationData();
  }, []);

  const fetchConfigurationData = async () => {
    setLoading(true);
    try {
      const response = await systemSettingsApi.get();
      if (response.data && response.data.data) {
        const apiData = response.data.data;
        const mergedData: SystemSettings = {
          consultancyDetails: { ...defaultSettings.consultancyDetails, ...apiData.consultancyDetails },
          bankDetails: { ...defaultSettings.bankDetails, ...apiData.bankDetails },
          formNumbers: { ...defaultSettings.formNumbers, ...apiData.formNumbers },
          numberPrefixes: { ...defaultSettings.numberPrefixes, ...apiData.numberPrefixes },
          codeFormats: { ...defaultSettings.codeFormats, ...apiData.codeFormats },
          authorisedSignatories: Array.isArray(apiData.authorisedSignatories)
            ? apiData.authorisedSignatories
            : [],
          steelGradeStandards: STEEL_GRADES.reduce((acc, grade) => ({
            ...acc,
            [grade]: {
              ...defaultSteelGradeStandards[grade],
              ...(apiData.steelGradeStandards?.[grade] || {}),
            },
          }), {} as Record<string, SteelGradeStandard>),
        };
        setFormData(mergedData);
      }
    } catch (error) {
      console.error('Error fetching configuration:', error);
      toast.error('Failed to load configuration data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (path: string, value: string) => {
    const paths = path.split('.');
    setFormData(prev => ({
      ...prev,
      [paths[0]]: {
        ...prev[paths[0] as keyof SystemSettings],
        [paths[1]]: value,
      },
    }));
  };

  const handleLogoChange = (logoType: 'logo' | 'nablLogo' | 'nonNablLogo' | 'footerBanner', base64: string) => {
    setFormData(prev => ({
      ...prev,
      consultancyDetails: { ...prev.consultancyDetails, [logoType]: base64 },
    }));
  };

  /* ── Authorised Signatories ── */
  const handleSignatoryChange = (index: number, value: string) => {
    setFormData(prev => {
      const updated = [...prev.authorisedSignatories];
      updated[index] = value;
      return { ...prev, authorisedSignatories: updated };
    });
  };

  const addSignatory = () => {
    setFormData(prev => ({ ...prev, authorisedSignatories: [...prev.authorisedSignatories, ''] }));
  };

  const removeSignatory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      authorisedSignatories: prev.authorisedSignatories.filter((_, i) => i !== index),
    }));
  };

  /* ── Steel Grade Standards ── */
  const handleSteelGradeChange = (grade: string, field: keyof SteelGradeStandard, value: string) => {
    setFormData(prev => ({
      ...prev,
      steelGradeStandards: {
        ...prev.steelGradeStandards,
        [grade]: { ...prev.steelGradeStandards[grade], [field]: value },
      },
    }));
  };

  const handleResetReportNumbers = async () => {
    const confirmed = window.confirm('Are you sure you want to reset all report numbers? This action cannot be undone.');
    if (!confirmed) return;
    setResetting(true);
    try {
      await productApi.resetAllReportNumbers();
      toast.success('All report numbers have been reset successfully');
    } catch (error) {
      console.error('Error resetting report numbers:', error);
      toast.error('Failed to reset report numbers');
    } finally {
      setResetting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await systemSettingsApi.create(formData);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const renderSection = (title: string, fields: [string, string][]) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(([label, path]) => (
          <div key={path}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              type="text"
              value={(formData as any)[path.split('.')[0]][path.split('.')[1]]}
              onChange={(e) => handleInputChange(path, e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#4D55CC] focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
            />
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4D55CC]"></div>
          <span className="text-gray-500">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <Toaster position="top-right" />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="mt-2 text-sm text-gray-600">Configure system-wide settings and preferences</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Consultancy Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Consultancy Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.consultancyDetails.name}
                onChange={(e) => handleInputChange('consultancyDetails.name', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#4D55CC] focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={formData.consultancyDetails.address}
                onChange={(e) => handleInputChange('consultancyDetails.address', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#4D55CC] focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
              <input
                type="text"
                value={formData.consultancyDetails.gstNo}
                onChange={(e) => handleInputChange('consultancyDetails.gstNo', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#4D55CC] focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 pt-6 border-t border-gray-200">
            <LogoUploader label="TPT Logo" logoUrl={formData.consultancyDetails.logo} onLogoChange={(b) => handleLogoChange('logo', b)} />
            <LogoUploader label="NABL Logo" logoUrl={formData.consultancyDetails.nablLogo} onLogoChange={(b) => handleLogoChange('nablLogo', b)} />
            <LogoUploader label="NON-NABL Logo" logoUrl={formData.consultancyDetails.nonNablLogo} onLogoChange={(b) => handleLogoChange('nonNablLogo', b)} />
            <LogoUploader label="Footer Banner" logoUrl={formData.consultancyDetails.footerBanner} onLogoChange={(b) => handleLogoChange('footerBanner', b)} />
          </div>
        </div>

        {renderSection('Bank Details', [
          ['Account Name', 'bankDetails.accountName'],
          ['Account No.', 'bankDetails.accountNumber'],
          ['Account Type', 'bankDetails.accountType'],
          ['Bank Name', 'bankDetails.bankName'],
          ['Bank Branch', 'bankDetails.branch'],
          ['IFSC', 'bankDetails.ifscCode'],
          ['PAN', 'bankDetails.pan'],
          ['State Code', 'bankDetails.stateCode'],
        ])}

        {renderSection('Form Numbers', [
          ['Observation Entry', 'formNumbers.observationEntry'],
          ['Test Request', 'formNumbers.testRequest'],
          ['TOCR', 'formNumbers.tocr'],
        ])}

        {renderSection('Number Prefixes', [
          ['Test Report', 'numberPrefixes.testReport'],
          ['ULR', 'numberPrefixes.ulr'],
          ['Annual Test Request', 'numberPrefixes.annualTestRequest'],
        ])}

        {renderSection('Code Formats', [['Sample Format', 'codeFormats.sample']])}

        {/* Authorised Signatories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Authorised Signatories</h3>
          <p className="text-sm text-gray-500 mb-4">
            Manage the list of authorised signatories available in the dropdown when creating contracts.
          </p>
          <div className="space-y-3">
            {formData.authorisedSignatories.map((signatory, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  value={signatory}
                  onChange={(e) => handleSignatoryChange(index, e.target.value)}
                  placeholder="e.g. Dr.V.Karthikeyan - Director"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-[#4D55CC] focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
                />
                <button
                  type="button"
                  onClick={() => removeSignatory(index)}
                  className="px-3 py-2 text-sm font-medium rounded-md border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
            {formData.authorisedSignatories.length === 0 && (
              <p className="text-sm text-gray-400 italic">No signatories added yet.</p>
            )}
          </div>
          <button
            type="button"
            onClick={addSignatory}
            className="mt-4 px-4 py-2 text-sm font-medium rounded-md border border-[#4D55CC] text-[#4D55CC] hover:bg-[#4D55CC] hover:text-white transition-colors"
          >
            + Add Signatory
          </button>
        </div>

        {/* Steel Grade Standards */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Steel Grade Standards (BIS)</h3>
          <p className="text-sm text-gray-500 mb-4">
            Configure the BIS standard values for each steel grade. These values are used in the steel material test report.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 font-semibold text-gray-700 w-24">Grade</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-700">Yield Stress (Min)</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-700">Ultimate Tensile Stress (Min)</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-700">% of Elongation (Min)</th>
                </tr>
              </thead>
              <tbody>
                {STEEL_GRADES.map((grade) => (
                  <tr key={grade} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium text-gray-800">{grade}</td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={formData.steelGradeStandards[grade]?.yieldStress || ''}
                        onChange={(e) => handleSteelGradeChange(grade, 'yieldStress', e.target.value)}
                        placeholder="e.g. 415 N/mm²"
                        className="w-full rounded-md border border-gray-300 px-2 py-1.5 focus:border-[#4D55CC] focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={formData.steelGradeStandards[grade]?.ultimateTensileStress || ''}
                        onChange={(e) => handleSteelGradeChange(grade, 'ultimateTensileStress', e.target.value)}
                        placeholder="e.g. 485 N/mm²"
                        className="w-full rounded-md border border-gray-300 px-2 py-1.5 focus:border-[#4D55CC] focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={formData.steelGradeStandards[grade]?.elongation || ''}
                        onChange={(e) => handleSteelGradeChange(grade, 'elongation', e.target.value)}
                        placeholder="e.g. 14.50%"
                        className="w-full rounded-md border border-gray-300 px-2 py-1.5 focus:border-[#4D55CC] focus:outline-none focus:ring-1 focus:ring-[#4D55CC]"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Report Number Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Number Management</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Reset all report numbers to their initial values. This action will reset the counter for all products.
              </p>
              <p className="text-xs text-red-600">⚠️ This action cannot be undone and will affect all products.</p>
            </div>
            <button
              type="button"
              onClick={handleResetReportNumbers}
              disabled={resetting}
              className="px-6 py-3 text-sm font-medium rounded-md border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resetting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  <span>Resetting...</span>
                </div>
              ) : (
                'Reset All Report Numbers'
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 text-sm font-medium rounded-md border border-transparent bg-[#4D55CC] text-white hover:bg-[#211C84] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D55CC] shadow-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </div>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
