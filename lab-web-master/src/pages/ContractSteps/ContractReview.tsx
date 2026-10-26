import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { contractApi, mobileRequestApi, requestApi } from '../../services/api';

interface ContractReviewData {
  TRFNo: string;
  customerName: string;
  address: string;
  contactPerson: string;
  mobileNo: string;
  emailId: string;
  nameOfWork: string;
  location: string;
  dateOfCastingAndGradeOfConcrete: string;
  isStatementOfConformityRequired: string;
  decisionRule: string;
  deviationFromTestMethods: string;
  isMethodInappropriate: string;
  witnessRequest: string;
  witnessDetails: string;
  witnessName: string;
  witnessDesignation: string;
  witnessContactNo: string;
  witnessEmailId: string;
  modeOfDelivery: string;
  isSimplifiedReport: string;
  isOtherOrgAddress: string;
  otherOrgDetails: string;
  customerLetterDate: Date;
  customerLetterNo: string;
  miscellaneous: string;
  TOCRNo: string;
  issueNo: string;
  issueDate: string;
  revisionNo: string;
  revisionDate: string;
  sizeOfMetal: string;
  shapeOfBlock: string;
  source: string;
  sampleReceivedBy: string;
  sampleCondition: string;
  remarks: string;
  resourcesAvailable: boolean;
  testMethodVerified: boolean;
  pertinentDiscussion: boolean;
  sampleEfficiency: boolean;
  sampleConditionReceived: boolean;
  environmentCondition?: string;
  brandName?: string;
  humidity?: string;
  detailsOfMachine?: string;
  dateOfCalibration?: string;
  loadingRange?: string;
  curingCondition?: string; 
  sampleReceivedDate?: string;
  temperature?: string;
  reportType?: string;
  authorisedSignatory?: string;
}

interface ContractReviewProps {
  formData: any;
  onFormDataChange: (data: any) => void;
  onValidationChange: (isValid: boolean) => void;
  showValidation: boolean; // Add this prop
  numberErrors?: Record<string, string>;
}

export const ContractReview: React.FC<ContractReviewProps> = ({ formData, onFormDataChange, onValidationChange, numberErrors = {} }) => {
  const { requestId, apprequestId } = useParams();
  const latestForm = useRef(formData);
  latestForm.current = formData;

  // Add useEffect to fetch data when requestId is present
  // Add state to store the original request data
  const [requestData, setRequestData] = useState<any>(null);
  
  // Update the fetch useEffect
  useEffect(() => {
    const fetchRequestData = async () => {
      console.log('requestId: ' + requestId);
      if (requestId != 'null' && requestId !== undefined) {
        try {
          const response = await requestApi.getById(requestId??'');
          setRequestData(response.data);
          const contractReview = response.data.contractReview;
          
          // Update form data with fetched values while preserving the request data
          onFormDataChange({
            ...response.data,
            customerName: contractReview.customerName,
            address: contractReview.address,
            contactPerson: contractReview.contactPerson,
            mobileNo: contractReview.mobileNo,
            emailId: contractReview.emailId,
            nameOfWork: contractReview.nameOfWork,
            location: contractReview.location,
            dateOfCastingAndGradeOfConcrete: contractReview.dateOfCastingAndGradeOfConcrete,
            isStatementOfConformityRequired: contractReview.isStatementOfConformityRequired,
            decisionRule: contractReview.decisionRule,
            deviationFromTestMethods: contractReview.deviationFromTestMethods,
            isMethodInappropriate: contractReview.isMethodInappropriate,
            witnessRequest: contractReview.witnessRequest,
            witnessDetails: contractReview.witnessDetails,
            witnessName: contractReview.witnessName,
            witnessDesignation: contractReview.witnessDesignation,
            modeOfDelivery: contractReview.modeOfDelivery,
            isSimplifiedReport: contractReview.isSimplifiedReport,
            isOtherOrgAddress: contractReview.isOtherOrgAddress,
            otherOrgDetails: contractReview.otherOrgDetails,
            customerLetterNo: contractReview.customerLetterNo,
            customerLetterDate: contractReview.customerLetterDate,
            witnessContactNo: contractReview.witnessContactNo,
            witnessEmailId: contractReview.witnessEmailId,
            TRFNo: contractReview.TRFNo,
            miscellaneous: contractReview.miscellaneous,
            TOCRNo: contractReview.TOCRNo,
            issueNo: contractReview.issueNo,
            issueDate: contractReview.issueDate,
            revisionNo: contractReview.revisionNo,
            revisionDate: contractReview.revisionDate,
            sizeOfMetal: contractReview.sizeOfMetal,
            shapeOfBlock: contractReview.shapeOfBlock,
            source: contractReview.source,
            sampleReceivedBy: contractReview.sampleReceivedBy,
            sampleCondition: contractReview.sampleCondition,
            remarks: contractReview.remarks,
            resourcesAvailable: contractReview.resourcesAvailable,
            testMethodVerified: contractReview.testMethodVerified,
            pertinentDiscussion: contractReview.pertinentDiscussion,
            sampleEfficiency: contractReview.sampleEfficiency,
            sampleConditionReceived: contractReview.sampleConditionReceived,
            environmentCondition: contractReview.environmentCondition,
            brandName: contractReview.brandName,
            humidity: contractReview.humidity,
            detailsOfMachine: contractReview.detailsOfMachine,
            dateOfCalibration: contractReview.dateOfCalibration,
            loadingRange: contractReview.loadingRange,
            curingCondition: contractReview.curingCondition,
            sampleReceivedDate: contractReview.sampleReceivedDate,
            temperature: contractReview.temperature,
            reportType: contractReview.reportType || 'NABL',
            authorisedSignatory: contractReview.authorisedSignatory
          });
        } catch (error) {
          console.error('Error fetching request data:', error);
        }

       
      }
      else{
        const appRequest = (apprequestId && apprequestId !== 'null' && apprequestId !== 'undefined')
          ? await getAppRequest(apprequestId)
          : undefined;
        onFormDataChange({
          ...formData,
          customerName: appRequest?.name || '',
          address: appRequest?.address || '',
          mobileNo: appRequest?.mobileNumber || '',
          emailId: appRequest?.email || '',
          nameOfWork: appRequest?.nameOfWork || '',
          location: appRequest?.siteLocation || '',
          reportType: 'NABL',
        });

      }
    };
  
    fetchRequestData();
  }, [requestId, apprequestId]);

  async function getAppRequest(appRequestId:string) {
    try{
    const response = await mobileRequestApi.getById(appRequestId);
    if(response) {
      console.log('response', response);
      return response.data;
    }
  }
  catch(e){
    return undefined;
  }
  }

  function generateTRFNumber(reportType: string = 'NABL') {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    if (reportType === 'NON-NABL') {
      return `TPT/${currentYear}/TRF-001`;
    }
    return `TPT/${currentYear}-${nextYear}/TRF-001`;
  }

  function extractTOCRNo(trfNo: string): string {
    const match = trfNo.match(/(\d+)$/);
    return match ? match[1] : '';
  }

  // Add useEffect to check required fields
  useEffect(() => {
    const requiredFields = [
      'customerName',
      'contactPerson',
      'mobileNo',
      'isStatementOfConformityRequired',
      'deviationFromTestMethods',
      'modeOfDelivery',
      'isSimplifiedReport'
    ];

    const isValid = requiredFields.every(field => 
      formData[field] && formData[field].toString().trim() !== ''
    );

    onValidationChange(isValid);
  }, [formData, onValidationChange]);

   // Add error state
   const [errors, setErrors] = useState<Record<string, string>>({});
            
   // Add validation function
   const validateField = (name: string, value: string) => {
     if (value.trim() === '') {
       setErrors(prev => ({
         ...prev,
         [name]: 'This field is required'
       }));
       return false;
     }
     setErrors(prev => ({
       ...prev,
       [name]: ''
     }));
     return true;
   };

   // Add validateAllFields function
   const validateAllFields = () => {
    const requiredFields = [
      'customerName',
      'TRFNo',
      'contactPerson',
      'mobileNo',
      'isStatementOfConformityRequired',
      'deviationFromTestMethods',
      'modeOfDelivery',
      'isSimplifiedReport',
      'witnessRequest',
    ];
  
    let newErrors: Record<string, string> = {};
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });
  
    setErrors(newErrors);
    console.log('newErrors',newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Update useEffect to include validation
  useEffect(() => {
    const isValid = validateAllFields();
    onValidationChange(isValid);
  }, [formData]);

  // When report type changes for a new request, regenerate TRF No and sync TOCR No
  useEffect(() => {
    if ((requestId === 'null' || requestId === undefined) && formData.reportType) {
      let cancelled = false;
      const fetchingForType = formData.reportType;
      contractApi.getNextTRFNumber(fetchingForType)
        .then(res => {
          if (cancelled || latestForm.current.TRFNo !== formData.TRFNo) return;
          const newTRFNumber = res.data || generateTRFNumber(fetchingForType);
          onFormDataChange({
            ...latestForm.current,
            TRFNo: newTRFNumber,
            TOCRNo: extractTOCRNo(newTRFNumber),
            reportType: fetchingForType,
          });
        })
        .catch(() => {
          if (cancelled || latestForm.current.TRFNo !== formData.TRFNo) return;
          const newTRFNumber = generateTRFNumber(fetchingForType);
          onFormDataChange({
            ...latestForm.current,
            TRFNo: newTRFNumber,
            TOCRNo: extractTOCRNo(newTRFNumber),
            reportType: fetchingForType,
          });
        });
      return () => { cancelled = true; };
    }
  }, [formData.reportType]);

  // Update all required input fields to show errors, example for one field:
  
   
   // Update input fields to show error messages
  return (
    <div className="col-span-2">
      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Test Request/Contract Review</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="flex flex-col">
           
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className={`w-full px-4 py-2.5 border ${
                  errors.customerName ? 'border-red-500' : 'border-gray-300'
                } rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-[#4D55CC] focus:border-[#4D55CC] transition-all duration-200 ease-in-out`}
                value={formData.customerName}
                onChange={(e) => {
                  const newValue = e.target.value;
                  validateField('customerName', newValue);
                  onFormDataChange({ ...formData, customerName: newValue });
                }}
                onBlur={() => validateField('customerName', formData.customerName)}
              />
              {errors.customerName && (
                <p className="mt-1 text-sm text-red-500">{errors.customerName}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
            Address (As mentioned by Addressee) 
            </label>
            <textarea
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-[#4D55CC] focus:border-[#4D55CC] transition-all duration-200 ease-in-out"
              value={formData.address}
              onChange={(e) => onFormDataChange({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
            Name of work (As mentioned by Addressee)
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-[#4D55CC] focus:border-[#4D55CC] transition-all duration-200 ease-in-out"
              value={formData.nameOfWork}
              onChange={(e) => onFormDataChange({ ...formData, nameOfWork: e.target.value })}
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Person <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className={`w-full px-4 py-2.5 border ${
                errors.contactPerson ? 'border-red-500' : 'border-gray-300'
              } rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-[#4D55CC] focus:border-[#4D55CC] transition-all duration-200 ease-in-out`}
              value={formData.contactPerson}
              onChange={(e) => onFormDataChange({ ...formData, contactPerson: e.target.value })}
            />
            {errors.contactPerson && (
              <p className="mt-1 text-sm text-red-500">{errors.contactPerson}</p>
            )}
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile No <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
              value={formData.mobileNo}
              onChange={(e) => onFormDataChange({ ...formData, mobileNo: e.target.value })}
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email ID
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
              value={formData.emailId}
              onChange={(e) => onFormDataChange({ ...formData, emailId: e.target.value })}
            />
          </div>

          {/* Radio Groups */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Statement of Conformity Required? <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-6">
              {['Yes', 'No'].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    className="h-4 w-4 text-[#4D55CC] border-gray-300 focus:ring-[#4D55CC]"
                    value={option}
                    checked={formData.isStatementOfConformityRequired === option}
                    onChange={(e) => onFormDataChange({ ...formData, isStatementOfConformityRequired: e.target.value })}
                  />
                  <span className="ml-2 text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
          {formData.isStatementOfConformityRequired === 'Yes' && (
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">
              If yes, mention the decision rule to be followed 
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                value={formData.decisionRule}
                onChange={(e) => onFormDataChange({ ...formData, decisionRule: e.target.value })}
              />
            </div>
          )}
           <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Witness Request? <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-6">
              {['Yes', 'No'].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    className="h-4 w-4 text-[#4D55CC] border-gray-300 focus:ring-[#4D55CC]"
                    value={option}
                    checked={formData.witnessRequest === option}
                    onChange={(e) => onFormDataChange({ ...formData, witnessRequest: e.target.value })}
                  />
                  <span className="ml-2 text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {formData.witnessRequest === 'Yes' && (
            <>
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Witness Details
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                  value={formData.witnessDetails}
                  onChange={(e) => onFormDataChange({ ...formData, witnessDetails: e.target.value })}
                />
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Witness Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                  value={formData.witnessName}
                  onChange={(e) => onFormDataChange({ ...formData, witnessName: e.target.value })}
                />
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Witness contact no.
                </label>
                <input
                  type="number"
                  maxLength={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                  value={formData.witnessContactNo}
                  onChange={(e) => onFormDataChange({ ...formData, witnessContactNo: e.target.value })}
                />
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Witness email address
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                  value={formData.witnessEmailId}
                  onChange={(e) => onFormDataChange({ ...formData, witnessEmailId: e.target.value })}
                />
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Witness Designation
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                  value={formData.witnessDesignation}
                  onChange={(e) => onFormDataChange({ ...formData, witnessDesignation: e.target.value })}
                />
              </div>
            </>
          )}

          {/* Additional Information Section */}
          <fieldset className="space-y-6 border border-gray-300 rounded-lg p-6">
            <legend className="text-lg font-semibold text-gray-900 px-2">Additional Information</legend>
            
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Sample & Test Request Received by</label>
              <div className="flex flex-wrap gap-4">
                {['Post', 'Courier', 'In-Person', 'Email'].map((option) => (
                  <label key={option} className="inline-flex items-center">
                    <input
                      type="radio"
                      className="h-4 w-4 text-[#4D55CC] border-gray-300 focus:ring-[#4D55CC]"
                      value={option}
                      checked={formData.sampleReceivedBy === option}
                      onChange={(e) => onFormDataChange({ ...formData, sampleReceivedBy: e.target.value })}
                    />
                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Condition of sample received</label>
              <div className="flex space-x-6">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                  placeholder="Enter condition of sample received"
                  value={formData.sampleCondition || ''}
                  onChange={(e) => onFormDataChange({ ...formData, sampleCondition: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                value={formData.remarks}
                onChange={(e) => onFormDataChange({ ...formData, remarks: e.target.value })}
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Environment Condition</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                value={formData.environmentCondition || ''}
                onChange={(e) => onFormDataChange({ ...formData, environmentCondition: e.target.value })}
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                value={formData.brandName || ''}
                onChange={(e) => onFormDataChange({ ...formData, brandName: e.target.value })}
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Humidity</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                value={formData.humidity || ''}
                onChange={(e) => onFormDataChange({ ...formData, humidity: e.target.value })}
              />
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Details of Machine</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                value={formData.detailsOfMachine || ''}
                onChange={(e) => onFormDataChange({ ...formData, detailsOfMachine: e.target.value })}
              />
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Calibration</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                value={formData.dateOfCalibration || ''}
                onChange={(e) => onFormDataChange({ ...formData, dateOfCalibration: e.target.value })}
              />
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Loading Range</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                value={formData.loadingRange || ''}
                onChange={(e) => onFormDataChange({ ...formData, loadingRange: e.target.value })}
              />
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Curing Condition (As Mentioned by Addressee)</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                value={formData.curingCondition || ''}
                onChange={(e) => onFormDataChange({ ...formData, curingCondition: e.target.value })}
              />
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sample Received on - Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                value={formData.sampleReceivedDate || ''}
                onChange={(e) => onFormDataChange({ ...formData, sampleReceivedDate: e.target.value })}
              />
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                value={formData.temperature || ''}
                onChange={(e) => onFormDataChange({ ...formData, temperature: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Report Type</label>
              <div className="flex flex-wrap gap-4">
                {['NABL', 'NON-NABL'].map((option) => (
                  <label key={option} className="inline-flex items-center">
                    <input
                      type="radio"
                      className="h-4 w-4 text-[#4D55CC] border-gray-300 focus:ring-[#4D55CC]"
                      value={option}
                      checked={formData.reportType === option}
                      onChange={(e) => onFormDataChange({ ...formData, reportType: e.target.value })}
                    />
                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-[#4D55CC] border-gray-300 rounded focus:ring-[#4D55CC]"
                  checked={formData.resourcesAvailable}
                  onChange={(e) => onFormDataChange({ ...formData, resourcesAvailable: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700">Resources availability for testing</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-[#4D55CC] border-gray-300 rounded focus:ring-[#4D55CC]"
                  checked={formData.sampleEfficiency}
                  onChange={(e) => onFormDataChange({ ...formData, sampleEfficiency: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700">Efficiency of sample supplied</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-[#4D55CC] border-gray-300 rounded focus:ring-[#4D55CC]"
                  checked={formData.testMethodVerified}
                  onChange={(e) => onFormDataChange({ ...formData, testMethodVerified: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700">Verification of test method</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-[#4D55CC] border-gray-300 rounded focus:ring-[#4D55CC]"
                  checked={formData.sampleConditionReceived}
                  onChange={(e) => onFormDataChange({ ...formData, sampleConditionReceived: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700">Conditions of Sample received</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-[#4D55CC] border-gray-300 rounded focus:ring-[#4D55CC]"
                  checked={formData.pertinentDiscussion}
                  onChange={(e) => onFormDataChange({ ...formData, pertinentDiscussion: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700">Pertinent Discussion if any</span>
              </label>
            </div>
          </fieldset>
        </div>

        

        {/* Right Column */}
        <div className="space-y-6">
        <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
            TRF No. <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
              value={formData.TRFNo}
              aria-invalid={!!numberErrors.TRFNo} aria-describedby="trf-number-error"
              onChange={(e) => onFormDataChange({ ...formData, TRFNo: e.target.value })}
            />
            {(numberErrors.TRFNo || errors.TRFNo) && <p id="trf-number-error" role="alert" className="mt-1 text-sm text-red-600">{numberErrors.TRFNo || errors.TRFNo}</p>}
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
            Issue No.
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
              value={formData.issueNo}
              onChange={(e) => onFormDataChange({ ...formData, issueNo: e.target.value })}
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
            Issue Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
              value={formData.issueDate}
              onChange={(e) => onFormDataChange({ ...formData, issueDate: e.target.value })}
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
            Revision No.
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
              value={formData.revisionNo}
              onChange={(e) => onFormDataChange({ ...formData, revisionNo: e.target.value })}
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
            Revision Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
              value={formData.revisionDate}
              onChange={(e) => onFormDataChange({ ...formData, revisionDate: e.target.value })}
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
            Sample
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
              value={formData.sizeOfMetal}
              onChange={(e) => onFormDataChange({ ...formData, sizeOfMetal: e.target.value })}
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
            Shape of the block 
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
              value={formData.shapeOfBlock}
              onChange={(e) => onFormDataChange({ ...formData, shapeOfBlock: e.target.value })}
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
            Source
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
              value={formData.source}
              onChange={(e) => onFormDataChange({ ...formData, source: e.target.value })}
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
            Location (As mentioned by Addressee)
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
              value={formData.location}
              onChange={(e) => onFormDataChange({ ...formData, location: e.target.value })}
            />
          </div>

                      <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Casting & Grade of Concrete (As mentioned by Addressee)
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                placeholder="e.g., dd.mm.yyyy & M25"
                value={formData.dateOfCastingAndGradeOfConcrete || ''}
                onChange={(e) => {
                  console.log(e.target.value)
                  onFormDataChange({ 
                    ...formData, 
                    dateOfCastingAndGradeOfConcrete: e.target.value
                  });
                  console.log(formData.dateOfCastingAndGradeOfConcrete)
                }}
              />
            </div>

          

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Deviation from Test Methods? <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-6">
              {['Yes', 'No'].map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    className="h-4 w-4 text-[#4D55CC] border-gray-300 focus:ring-[#4D55CC]"
                    value={option}
                    checked={formData.deviationFromTestMethods === option}
                    onChange={(e) => onFormDataChange({ ...formData, deviationFromTestMethods: e.target.value })}
                  />
                  <span className="ml-2 text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IS Method Requested Inappropriate/Out of Date
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
              value={formData.isMethodInappropriate}
              onChange={(e) => onFormDataChange({ ...formData, isMethodInappropriate: e.target.value })}
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer letter No 
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
              value={formData.customerLetterNo}
              onChange={(e) => onFormDataChange({ ...formData, customerLetterNo: e.target.value })}
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer letter date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
              value={formData.customerLetterDate}
              onChange={(e) => onFormDataChange({ ...formData, customerLetterDate: e.target.value.trim() === '' ? null : e.target.value })}
            />
          </div>

         
          <fieldset className="border border-gray-300 rounded-lg p-6 space-y-6">
            <legend className="text-lg font-semibold text-gray-900 px-2">
              Specify Test Report Request
            </legend>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Mode of Delivery <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-4">
                {['Post', 'Courier', 'In Person', 'Email'].map((option) => (
                  <label key={option} className="inline-flex items-center">
                    <input
                      type="radio"
                      className="h-4 w-4 text-[#4D55CC] border-gray-300 focus:ring-[#4D55CC]"
                      value={option}
                      checked={formData.modeOfDelivery === option}
                      onChange={(e) => onFormDataChange({ ...formData, modeOfDelivery: e.target.value })}
                    />
                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Test Report Required in Simplified Way? <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-6">
                {['Yes', 'No'].map((option) => (
                  <label key={option} className="inline-flex items-center">
                    <input
                      type="radio"
                      className="h-4 w-4 text-[#4D55CC] border-gray-300 focus:ring-[#4D55CC]"
                      value={option}
                      checked={formData.isSimplifiedReport === option}
                      onChange={(e) => onFormDataChange({ ...formData, isSimplifiedReport: e.target.value })}
                    />
                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Test Report to be Addressed to Other Organization? <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-6">
                {['Yes', 'No'].map((option) => (
                  <label key={option} className="inline-flex items-center">
                    <input
                      type="radio"
                      className="h-4 w-4 text-[#4D55CC] border-gray-300 focus:ring-[#4D55CC]"
                      value={option}
                      checked={formData.isOtherOrgAddress === option}
                      onChange={(e) => onFormDataChange({ ...formData, isOtherOrgAddress: e.target.value })}
                    />
                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.isOtherOrgAddress === 'Yes' && (
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Details
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                  value={formData.otherOrgDetails}
                  onChange={(e) => onFormDataChange({ ...formData, otherOrgDetails: e.target.value })}
                />
              </div>
            )}
          </fieldset>
        </div>
      </div>
      <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">
              Miscellaneous
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                value={formData.miscellaneous}
                onChange={(e) => onFormDataChange({ ...formData, miscellaneous: e.target.value })}
              />
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Authorised signatory
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                value={formData.authorisedSignatory || ''}
                onChange={(e) => onFormDataChange({ ...formData, authorisedSignatory: e.target.value })}
              >
                <option value="">Select an authorised signatory</option>
                <option value="Dr.R.Lavanya - Quality Manager">Dr.R.Lavanya - Quality Manager</option>
                <option value="Dr.V.Karthikeyan - Director">Dr.V.Karthikeyan - Director</option>
                <option value="S.Loganathan - Technical Manager">S.Loganathan - Technical Manager</option>
              </select>
            </div>
    </div>
  );
};
