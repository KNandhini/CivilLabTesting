import React from 'react';

interface ObservationEntryProps {
  formData: {
    selectedTests?: Array<{
      testId: string;
      testName: string;
      productName: string;
      sampleId: number;
      sampleType: string;
      standardReference: string;
    }>;
    observations?: Array<{
      testId: string;
      readings: string;
      notes: string;
      conductedBy: string;
      conductedDate: string;
    }>;
  };
  onFormDataChange: (data: any) => void;
}

export const ObservationEntry: React.FC<ObservationEntryProps> = ({ formData, onFormDataChange }) => {
  const handleObservationChange = (testId: string, field: string, value: string) => {
    const existingObservation = formData.observations?.find(obs => obs.testId === testId);
    let updatedObservations = formData.observations || [];

    if (existingObservation) {
      updatedObservations = updatedObservations.map(obs =>
        obs.testId === testId ? { ...obs, [field]: value } : obs
      );
    } else {
      updatedObservations = [
        ...updatedObservations,
        {
          testId,
          readings: field === 'readings' ? value : '',
          notes: field === 'notes' ? value : '',
          conductedBy: field === 'conductedBy' ? value : '',
          conductedDate: field === 'conductedDate' ? value : new Date().toISOString().split('T')[0]
        }
      ];
    }

    onFormDataChange({
      ...formData,
      observations: updatedObservations
    });
  };

  return (
    <div className="space-y-6">
      {formData.selectedTests?.map((test) => (
        <div key={test.testId} className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Test: {test.testName} ({test.productName})
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Sample: {test.sampleType} (ID: {test.sampleId})
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Standard Reference: {test.standardReference}
            </p>
          </div>

          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Readings</label>
              <textarea
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                placeholder="Enter test readings"
                value={formData.observations?.find(obs => obs.testId === test.testId)?.readings || ''}
                onChange={(e) => handleObservationChange(test.testId, 'readings', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                rows={2}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                placeholder="Add any additional notes"
                value={formData.observations?.find(obs => obs.testId === test.testId)?.notes || ''}
                onChange={(e) => handleObservationChange(test.testId, 'notes', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Conducted By</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                  placeholder="Enter name"
                  value={formData.observations?.find(obs => obs.testId === test.testId)?.conductedBy || ''}
                  onChange={(e) => handleObservationChange(test.testId, 'conductedBy', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#4D55CC] focus:border-[#4D55CC] sm:text-sm"
                  value={formData.observations?.find(obs => obs.testId === test.testId)?.conductedDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleObservationChange(test.testId, 'conductedDate', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {(!formData.selectedTests || formData.selectedTests.length === 0) && (
        <div className="text-center py-12">
          <p className="text-gray-500">No tests selected. Please select tests in the Sample Collection step.</p>
        </div>
      )}
    </div>
  );
};