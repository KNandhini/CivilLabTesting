import { use, useState, useEffect } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { ContractReview } from './ContractSteps/ContractReview';
import { SampleCollection } from './ContractSteps/SampleCollection';
import { ObservationEntry } from './ContractSteps/ObservationEntry';
import { Payment } from './ContractSteps/Payment';
import { Receipt } from './ContractSteps/Receipt';
// Update imports
import { contractApi, requestApi, receiptApi, sampleCollectionApi } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

type Step = {
  id: number;
  name: string;
  status: 'upcoming' | 'current' | 'complete';
};

export const LabTest = () => {
  const { requestId:id, apprequestId, step } = useParams();
  console.log('id',id);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(step?Number(step):1);
  const [requestId, setRequestId] = useState(id=='null'? undefined : id);
  console.log(requestId);
  // Add validation state
  const [isContractReviewValid, setIsContractReviewValid] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [numberErrors, setNumberErrors] = useState<Record<string, string>>({});
  const [numberLoading, setNumberLoading] = useState(false);
  const showSaveError = (error: any) => {
    const errors = error.response?.data?.errors;
    if (errors) setNumberErrors(errors);
    else toast.error(error.response?.data?.message || 'Unable to save contract. Please try again.');
  };

  // State to track if sample collection is mapped to any product-test-sample mapping
  const [isSampleMapped, setIsSampleMapped] = useState(true); // default true to avoid flicker
  const [sampleMappingLoading, setSampleMappingLoading] = useState(false);

  // Update the ContractReview component usage
  // Update the formData state to include observations
  const [formData, setFormData] = useState({
    requestDetails: {
      customerName: '',
      address: '',
      contactPerson: '',
      mobileNo: '',
      emailId: '',
      nameOfWork: '',
      location: '',
      dateOfCastingAndGradeOfConcrete:'',
      isStatementOfConformityRequired: '',
      decisionRule: '',
      deviationFromTestMethods: '',
      isMethodInappropriate: '',
      witnessRequest: '',
      witnessDetails: '',
      witnessName: '',
      witnessDesignation: '',
      modeOfDelivery: '',
      isSimplifiedReport: '',
      isOtherOrgAddress: '',
      otherOrgDetails: '',
      customerLetterNo: '',
      customerLetterDate: '',
      witnessContactNo: '',
      witnessEmailId: '',
      TRFNo:'',
      TOCRNo:'',
      witnessContactDate: '',
      miscellaneous: '',
      issueNo: '',
      issueDate: '',
      revisionNo: '',
      revisionDate: '',
      sizeOfMetal: '',
      shapeOfBlock: '',
      source: '',
      sampleReceivedBy: '',
      sampleCondition: '',
      remarks: '',
      resourcesAvailable: false,
      testMethodVerified: false,
      pertinentDiscussion: false,
      sampleEfficiency: false,
      sampleConditionReceived: false,
      environmentCondition:'',
      brandName:'',
      humidity:'',
      detailsOfMachine:'',
      dateOfCalibration:'',
      loadingRange:'',
      curingCondition:'',
      sampleReceivedDate:'',
      temperature:'',
      reportType:'',
      authorisedSignatory:''
    },
    // Step 2: Sample Collection
    sampleDetails: {
        sampleId: '',
        sampleType: '',
        sampleQuantity: '',
        sampleCondition: '',
        dateOfCollection: '',
        timeOfCollection: '',
        collectedBy: '',
        collectorDesignation: '',
        transportMode: '',
        storageCondition: '',
        specialHandlingInstructions: '',
        remarks: '',
        sampleLocation: '',
        storageConditions: '',
        preservationMethod: '',
    },
    // Step 3: Test Order
    testOrder: {
      testId: '',
      specifications: '',
      methodology: '',
    },
    // Step 4: Observation
    observation: {
      readings: '',
      notes: '',
      conductedBy: '',
    },
    // Step 5: Final Report
    finalReport: {
      conclusion: '',
      recommendations: '',
      approvedBy: '',
    },
    sampleCollection: {
      samples: [],
      selectedTests: []
    }
  });

  const steps: Step[] = [
    { id: 1, name: 'Test Request/Contract Review', status: currentStep === 1 ? 'current' : currentStep > 1 ? 'complete' : 'upcoming' },
    { id: 2, name: 'Sample Collection', status: currentStep === 2 ? 'current' : currentStep > 2 ? 'complete' : 'upcoming' },
  ];

  // Support opening Sample Collection directly for an existing contract.
  useEffect(() => {
    if (currentStep !== 2 || !requestId || formData.requestDetails.TOCRNo) return;
    let cancelled = false;
    setNumberLoading(true);
    contractApi.getByRequestId(requestId).then(response => {
      if (cancelled) return;
      setFormData(previous => ({ ...previous, requestDetails: {
        ...previous.requestDetails,
        TOCRNo: response.data.TOCRNo || '',
        TRFNo: response.data.TRFNo || previous.requestDetails.TRFNo,
      } }));
    }).catch(error => { if (!cancelled) showSaveError(error); })
      .finally(() => { if (!cancelled) setNumberLoading(false); });
    return () => { cancelled = true; };
  }, [currentStep, requestId]);
  // Update handleNext function
  // Add these interfaces at the top of the file
  interface ContractReviewData {
    id?: string;
    requestId?: string;
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
    modeOfDelivery: string;
    isSimplifiedReport: string;
    isOtherOrgAddress: string;
    otherOrgDetails: string;
    status?: string;
    appRequestId?: string;
    customerLetterNo: string;
    customerLetterDate: string;
    witnessContactNo: string;
    witnessContactDate: string;
    miscellaneous:string;
    TOCRNo:string;
    witnessEmailId: string;
    TRFNo:string;
    issueNo?: string,
    issueDate?:Date,
    revisionNo?: string,
    revisionDate?: Date,
    sizeOfMetal?: string,
    shapeOfBlock?: string,
    source?: string,
    sampleReceivedBy?: string;
    sampleCondition?: string;
    remarks?: string;
    resourcesAvailable?: boolean;
    testMethodVerified?: boolean;
    pertinentDiscussion?: boolean;
    sampleEfficiency?: boolean;
    sampleConditionReceived?: boolean;
    environmentCondition?:string;
    brandName?:string,
    humidity?:string,
    detailsOfMachine?: string
            dateOfCalibration?: string,
            loadingRange?: string,
            curingCondition?: string,
            sampleReceivedDate?: string,
            temperature?: string,
            reportType?: string,
            authorisedSignatory?: string  

  }
  
  interface RequestData {
    id?: string;
    formId: string;
    revisionNo: number;
    revisionDate: string;
    issueNo: number;
    issueDate: string;
    createdUserId?: string;
    createdDate?: string;
    modifiedDate?: string;
    modifiedUserId?: string | null;
    status: string;
    contractReview?: ContractReviewData;
  }
  
  const [isNextDisabled, setIsNextDisabled] = useState(false);

  // Effect to check if sample collection is mapped to any product-test-sample mapping
  useEffect(() => {
    const checkSampleMapping = async () => {
      if (currentStep !== 2 || !requestId) {
        setIsSampleMapped(true);
        return;
      }
      setSampleMappingLoading(true);
      try {
        // You may need to adjust the API endpoint and response structure as per your backend
        // For example, let's assume: GET /api/sample-mappings?requestId=...
        // and it returns { mapped: boolean }
        const res = await sampleCollectionApi.getMappingsByRequestId(requestId);
        // If the mapping exists, mapped = true, else false
        setIsSampleMapped(res?.data?.length > 0);
      } catch (err) {
        // If error, assume not mapped (to be safe)
        setIsSampleMapped(false);
      }
      setSampleMappingLoading(false);
    };
    checkSampleMapping();
  }, [currentStep, requestId]);

  // Update the handleNext function
  const handleNext = async () => {
    if (isNextDisabled) return;
    setIsNextDisabled(true);
    if (currentStep === 1) {
      setShowValidation(true);
      if (!isContractReviewValid) {
        setIsNextDisabled(false);
        return;
      }
      try {
        // Create contract review data first
        const contractReviewData = {
          customerName: formData.requestDetails.customerName,
          address: formData.requestDetails.address,
          contactPerson: formData.requestDetails.contactPerson,
          mobileNo: formData.requestDetails.mobileNo,
          emailId: formData.requestDetails.emailId,
          nameOfWork: formData.requestDetails.nameOfWork,
          location: formData.requestDetails.location,
          dateOfCastingAndGradeOfConcrete: formData.requestDetails.dateOfCastingAndGradeOfConcrete == '' ? '' : formData.requestDetails.dateOfCastingAndGradeOfConcrete,
          isStatementOfConformityRequired: formData.requestDetails.isStatementOfConformityRequired || 'No',
          decisionRule: formData.requestDetails.decisionRule || '',
          deviationFromTestMethods: formData.requestDetails.deviationFromTestMethods || 'No',
          isMethodInappropriate: formData.requestDetails.isMethodInappropriate || '',
          witnessRequest: formData.requestDetails.witnessRequest || 'No',
          witnessDetails: formData.requestDetails.witnessDetails || '',
          witnessName: formData.requestDetails.witnessName || '',
          witnessDesignation: formData.requestDetails.witnessDesignation || '',
          modeOfDelivery: formData.requestDetails.modeOfDelivery || 'In Person',
          isSimplifiedReport: formData.requestDetails.isSimplifiedReport || 'No',
          isOtherOrgAddress: formData.requestDetails.isOtherOrgAddress || 'No',
          otherOrgDetails: formData.requestDetails.otherOrgDetails || '',
          appRequestId: apprequestId,
          customerLetterNo: formData.requestDetails.customerLetterNo, // Assuming you have a field for this in your form
          customerLetterDate: formData.requestDetails.customerLetterDate=='' ? undefined : formData.requestDetails.customerLetterDate, // Assuming you have a field for this in your form
          witnessContactNo: formData.requestDetails.witnessContactNo, // Assuming you have a field for this in your form
          witnessEmailId: formData.requestDetails.witnessEmailId == '' ? undefined : formData.requestDetails.witnessEmailId, // Assuming you have a field for this in your form,
          TRFNo: formData.requestDetails.TRFNo, // Assuming you have a field for this in your form,
          TOCRNo: requestId ? formData.requestDetails.TOCRNo : undefined,
          miscellaneous: formData.requestDetails.miscellaneous, // Assuming you have a field for this in your form,
          issueNo: formData.requestDetails.issueNo,
          issueDate: formData.requestDetails.issueDate == '' ? undefined : formData.requestDetails.issueDate,
          revisionNo: formData.requestDetails.revisionNo,
          revisionDate: formData.requestDetails.revisionDate == '' ? undefined : formData.requestDetails.revisionDate,
          sizeOfMetal: formData.requestDetails.sizeOfMetal,
          shapeOfBlock: formData.requestDetails.shapeOfBlock,
          source: formData.requestDetails.source,
          sampleReceivedBy: formData.requestDetails.sampleReceivedBy,
          sampleCondition: formData.requestDetails.sampleCondition,
          remarks: formData.requestDetails.remarks,
          resourcesAvailable: formData.requestDetails.resourcesAvailable,
          testMethodVerified: formData.requestDetails.testMethodVerified,
          pertinentDiscussion: formData.requestDetails.pertinentDiscussion,
          sampleEfficiency: formData.requestDetails.sampleEfficiency,
          sampleConditionReceived: formData.requestDetails.sampleConditionReceived,
          environmentCondition:formData.requestDetails.environmentCondition,
          brandName:formData.requestDetails.brandName,
          humidity: formData.requestDetails.humidity,
          detailsOfMachine: formData.requestDetails.detailsOfMachine,
          dateOfCalibration: formData.requestDetails.dateOfCalibration,
          loadingRange: formData.requestDetails.loadingRange,
          curingCondition: formData.requestDetails.curingCondition,
          sampleReceivedDate: formData.requestDetails.sampleReceivedDate,
          temperature: formData.requestDetails.temperature,
          reportType: formData.requestDetails.reportType || 'NABL',
          authorisedSignatory: formData.requestDetails.authorisedSignatory
        };
        console.log('contractReviewData',contractReviewData);
        const response:any = requestId 
          ? await contractApi.updateByRequestId(requestId, contractReviewData)
          : await contractApi.create(contractReviewData);
        if(!requestId){
          setRequestId(response.data.requestId);
        }
        setFormData(previous => ({ ...previous, requestDetails: { ...previous.requestDetails,
          TRFNo: response.data.TRFNo, TOCRNo: response.data.TOCRNo,
        } }));
        setNumberErrors({});
        setCurrentStep((prev) => Math.min(prev + 1, 5));
        setShowValidation(false);
      } catch (error) {
        showSaveError(error);
      }
      setIsNextDisabled(false);
    } else if (currentStep === 2) {
      // Check if sample is mapped before allowing submit
      if (!isSampleMapped) {
        toast.error('Sample collection is not mapped to any product-test-sample mapping. Please complete the mapping before submitting.');
        setIsNextDisabled(false);
        return;
      }
      try {
        await receiptApi.create({
          requestId,
          totalAmount: 0,
          gst: 0
        });
        setCurrentStep((prev) => Math.min(prev + 1, 5));
      } catch (error) {
        console.error('Error creating receipt:', error);
      }
      setIsNextDisabled(false);
    } else {
      navigate('/contracts');
      setIsNextDisabled(false);
    }
  };

  const handlePrevious = () => {
    navigate(`/contract-edit/${requestId}`);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (isNextDisabled || numberLoading || !requestId) return;
    if (!isSampleMapped) {
      toast.error('Please complete the sample mapping before submitting.');
      return;
    }
    const TOCRNo = formData.requestDetails.TOCRNo.trim();
    if (!TOCRNo) { setNumberErrors({ TOCRNo: 'This field is required' }); return; }
    setIsNextDisabled(true);
    try {
      await contractApi.updateByRequestId(requestId, { TOCRNo });
      setNumberErrors({});
      toast.success('Submitted successfully');
      navigate('/contracts');
    } catch (error) { showSaveError(error); }
    finally { setIsNextDisabled(false); }
  };
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
        {/* Enhanced Steps Design */}
        <nav aria-label="Progress" className="mb-12">
          <ol className="flex items-center justify-between px-8">
            {steps.map((step, stepIdx) => (
              <li key={step.id} className="relative flex-1">
                <div className="flex flex-col items-center">
                  <span className={`
                    text-sm font-medium mb-2 whitespace-nowrap
                    ${step.status === 'complete' ? 'text-[#4D55CC]' : ''}
                    ${step.status === 'current' ? 'text-[#4D55CC]' : ''}
                    ${step.status === 'upcoming' ? 'text-gray-500' : ''}
                  `}>
                    Step {step.id}
                  </span>
                  <div className="flex items-center justify-center z-10 bg-gray-50">
                    <span className={`
                      flex h-10 w-10 items-center justify-center rounded-full
                      ${step.status === 'complete' ? 'bg-[#4D55CC]' : ''}
                      ${step.status === 'current' ? 'border-2 border-[#4D55CC] bg-white' : ''}
                      ${step.status === 'upcoming' ? 'border-2 border-gray-300 bg-white' : ''}
                    `}>
                      {step.status === 'complete' ? (
                        <CheckIcon className="h-6 w-6 text-white" />
                      ) : (
                        <span className={`h-3 w-3 rounded-full ${step.status === 'current' ? 'bg-[#4D55CC]' : 'bg-transparent'}`} />
                      )}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 mt-2 text-center whitespace-nowrap">{step.name}</span>
                </div>
                {stepIdx !== steps.length - 1 && (
                  <div className={`
                    absolute top-12 left-1/2 w-full h-0.5
                    ${step.status === 'complete' ? 'bg-[#4D55CC]' : 'bg-gray-300'}
                  `} />
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Form Content with Improved Layout */}
        <div className="mt-8 bg-white p-8 shadow-sm rounded-lg">
          
          {currentStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ContractReview 
                formData={formData.requestDetails} 
                onFormDataChange={(data) => {
                  setNumberErrors(previous => ({ ...previous,
                    TRFNo: data.TRFNo !== formData.requestDetails.TRFNo ? '' : previous.TRFNo,
                    TOCRNo: data.TOCRNo !== formData.requestDetails.TOCRNo ? '' : previous.TOCRNo,
                  }));
                  setFormData({
                    ...formData,
                    requestDetails: data
                  });
                }}
                numberErrors={numberErrors}
                showValidation={showValidation}
                onValidationChange={setIsContractReviewValid}
              />
            </div>
          )}
          
         
          {currentStep === 2 && (
            <div>
              <div className="mb-6 max-w-md">
                <label htmlFor="contract-tocr-number" className="block text-sm font-medium text-gray-700 mb-1">
                  TOCR No. <span className="text-red-500">*</span>
                </label>
                <input id="contract-tocr-number" type="text" required
                  disabled={numberLoading || isNextDisabled}
                  value={formData.requestDetails.TOCRNo}
                  aria-invalid={!!numberErrors.TOCRNo} aria-describedby="tocr-number-error"
                  className={`w-full px-3 py-2 border rounded-md ${numberErrors.TOCRNo ? 'border-red-500' : 'border-gray-300'}`}
                  onChange={event => {
                    const value = event.target.value;
                    setFormData(previous => ({ ...previous, requestDetails: { ...previous.requestDetails, TOCRNo: value } }));
                    setNumberErrors(previous => ({ ...previous, TOCRNo: '' }));
                  }} />
                {numberErrors.TOCRNo && <p id="tocr-number-error" role="alert" className="mt-1 text-sm text-red-600">{numberErrors.TOCRNo}</p>}
              </div>
              <SampleCollection
                requestId={requestId}
                setIsSampleMapped={setIsSampleMapped}
              ></SampleCollection>
              {!isSampleMapped && !sampleMappingLoading && (
                <div className="mt-4 text-red-600 text-sm">
                  Sample collection is not mapped to any product-test-sample mapping. Please complete the mapping before submitting.
                </div>
              )}
            </div>
          )}
          

          {/* {currentStep === 3 && (
            <div>
              <Receipt
                requestId={requestId}
              />
            </div>
          )} */}
          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={currentStep === 2 ? handleSubmit : handleNext}
              disabled={
                isNextDisabled ||
                (currentStep === 1 && !isContractReviewValid) ||
                (currentStep === 2 && (!isSampleMapped || sampleMappingLoading || numberLoading))
              }
              className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-[#4D55CC] px-4 py-2 text-sm font-medium text-white hover:bg-[#211C84] focus:outline-none focus:ring-2 focus:ring-[#4D55CC] focus:ring-offset-2"
            >
              {currentStep === 2 ? 'Submit' : (
                <>
                  Next
                  <ChevronRightIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
  );
};

// In the render section, update the currentStep === 3 condition
