"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReport = generateReport;
exports.ContractReviewForm = ContractReviewForm;
exports.TestReportPage = TestReportPage;
const observation_value_1 = require("./observation-value");
const pdfkit_1 = __importDefault(require("pdfkit"));
const QRCode = __importStar(require("qrcode"));
const images_1 = require("./images");
const observation_average_1 = require("./observation-average");
const path_1 = __importDefault(require("path"));
const configuration_json_1 = __importDefault(require("../configuration.json"));
function drawCheckbox(doc, x, y, checked) {
    const originalStrokeColor = '#A0A0A0';
    const originalLineWidth = 0.5;
    doc.strokeColor('black');
    doc.lineWidth(0.8);
    doc.rect(x, y, 10, 10).stroke();
    if (checked) {
        doc.moveTo(x + 2, y + 5).lineTo(x + 5, y + 8).lineTo(x + 8, y + 2).stroke();
    }
    doc.strokeColor(originalStrokeColor);
    doc.lineWidth(originalLineWidth);
}
function getTextHeight(doc, text, options) {
    const { width, fontSize, font } = options;
    doc.font(font || 'Calibri').fontSize(fontSize || 10);
    return doc.heightOfString(text, { width });
}
async function generateReport(data, res, productService, requestsService, appRequestService, mobileRequest = false, referrer, systemSettingsService, inline = false) {
    const doc = new pdfkit_1.default({ margin: 20, size: 'A4' });
    doc.registerFont('Calibri-Bold-Italic', path_1.default.join(__dirname, '../calibri/calibri-bold-italic.ttf'));
    doc.registerFont('Calibri-Bold', path_1.default.join(__dirname, '../calibri/calibri-bold.ttf'));
    doc.registerFont('Calibri-Italic', path_1.default.join(__dirname, '../calibri/calibri-italic.ttf'));
    doc.registerFont('Calibri', path_1.default.join(__dirname, '../calibri/calibri-regular.ttf'));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', inline ? 'inline; filename="test-report.pdf"' : 'attachment; filename="test-request-form.pdf"');
    doc.pipe(res);
    doc.strokeColor('#A0A0A0');
    doc.lineWidth(0.5);
    const observationGroups = Object.entries(data?.observationEntries?.reduce((groups, observation) => {
        const testId = observation.productTestSampleMapping.test.id;
        if (!groups[testId]) {
            groups[testId] = [];
        }
        groups[testId].push(observation);
        return groups;
    }, {}) || {});
    if (!mobileRequest) {
        if (data.contractData) {
            ContractReviewForm(doc, data.contractData, data.systemSettings);
        }
        doc.addPage();
        if (data.mappings) {
            sampleCollectionReport(doc, data);
        }
        doc.addPage();
        generateTOCRReport(doc, data);
        for (const [testId, observations] of observationGroups) {
            const typedObservations = observations;
            doc.addPage();
            await generateObservationEntryPage(doc, data, typedObservations);
        }
    }
    const observationGroupAverages = observationGroups.map(([testId, observations]) => {
        const typedObservations = observations;
        if (!typedObservations.length)
            return { testId, schemaId: '', averages: {}, testName: '', testingMethod: '', startDate: '', endDate: '', productName: '', unit: '' };
        const schemaId = typedObservations[0]?.schemaId || '';
        const resultFields = typedObservations[0].result.map((r) => r.field);
        const averages = {};
        for (let i = 0; i < resultFields.length; i++) {
            const field = resultFields[i];
            let sum = 0;
            let count = 0;
            let nil = '';
            const fieldType = typedObservations[0]?.result[i]?.type;
            const isStringField = fieldType === 'text' || fieldType === 'string';
            for (const entry of typedObservations) {
                const value = entry.result[i]?.value;
                if (isStringField) {
                    nil = value;
                    continue;
                }
                const num = Number(value);
                if (!isNaN(num)) {
                    sum += num;
                    count++;
                }
                else {
                    nil = value;
                }
            }
            if (!isStringField && count > 0) {
                const avg = sum / count;
                const avgStr = avg.toFixed(2);
                averages[field] = avgStr.endsWith('.00') ? avg.toFixed(0) : avgStr;
            }
            else {
                averages[field] = nil;
            }
        }
        const testName = typedObservations[0]?.productTestSampleMapping?.test?.name || '';
        const unit = typedObservations[0]?.productTestSampleMapping?.test?.unit || '';
        const testingMethod = typedObservations[0]?.productTestSampleMapping?.test?.testingMethod || '';
        const startDate = typedObservations[0]?.testStartDate;
        const endDate = typedObservations[0]?.testCompletionDate;
        const productName = typedObservations[0]?.productTestSampleMapping?.product?.name;
        const productId = typedObservations[0]?.productTestSampleMapping?.product?.id;
        const productShortForm = typedObservations[0]?.productTestSampleMapping?.product?.productShortForm;
        const reportNo = typedObservations[0]?.productTestSampleMapping?.product?.reportNo;
        return { testId, schemaId, averages, testName, testingMethod, startDate, endDate, productName, productId, productShortForm, reportNo };
    });
    const observationGroupRawResults = observationGroups.map(([testId, observations]) => {
        const typedObservations = observations;
        if (!typedObservations.length)
            return { testId, schemaId: '', results: [], testName: '', testingMethod: '', sampleId: '', startDate: '', endDate: '', productName: '', unit: '' };
        const schemaId = typedObservations[0]?.schemaId || '';
        const resultFields = typedObservations[0].result.map((r) => r.field);
        const results = typedObservations.map(entry => {
            const resultObj = {};
            for (let i = 0; i < resultFields.length; i++) {
                const field = resultFields[i];
                resultObj[field] = (0, observation_value_1.formatObservationValue)(entry.result[i]?.value, entry.result[i]?.type, 'nil');
            }
            resultObj['sampleId'] = entry.productTestSampleMapping.sample.sampleId;
            return resultObj;
        });
        const testName = typedObservations[0]?.productTestSampleMapping?.test?.name || '';
        const unit = typedObservations[0]?.productTestSampleMapping?.test?.unit || '';
        const testingMethod = typedObservations[0]?.productTestSampleMapping?.test?.testingMethod || '';
        const sampleId = typedObservations[0]?.productTestSampleMapping.sample.sampleId;
        const startDate = typedObservations[0]?.testStartDate;
        const endDate = typedObservations[0]?.testCompletionDate;
        const productName = typedObservations[0]?.productTestSampleMapping?.product?.name;
        const productId = typedObservations[0]?.productTestSampleMapping?.product?.id;
        const productShortForm = typedObservations[0]?.productTestSampleMapping?.product?.productShortForm;
        const reportNo = typedObservations[0]?.productTestSampleMapping?.product?.reportNo;
        return { testId, schemaId, results, testName, testingMethod, sampleId, startDate, endDate, productName, productId, productShortForm, reportNo, unit };
    });
    observationGroupRawResults.forEach(group => {
        if (Array.isArray(group.results)) {
            group.results.sort((a, b) => {
                const aId = a.SampleId ?? a.sampleId;
                const bId = b.SampleId ?? b.sampleId;
                const aNum = Number(aId);
                const bNum = Number(bId);
                if (!isNaN(aNum) && !isNaN(bNum)) {
                    return aNum - bNum;
                }
                return String(aId).localeCompare(String(bId), undefined, { numeric: true, sensitivity: 'base' });
            });
        }
    });
    const averagesMap = new Map();
    for (const avg of observationGroupAverages) {
        if (avg && avg.testId && avg.schemaId) {
            averagesMap.set(`${avg.testId}__${avg.schemaId}`, avg.averages);
        }
    }
    const processedReportSchemas = Array.isArray(data.reportSchemas)
        ? data.reportSchemas
            .map((schema) => {
            const hasTestReportSchema = schema?.TestReportSchema?.TestReportSchema?.rows &&
                Array.isArray(schema.TestReportSchema.TestReportSchema.rows) &&
                Array.isArray(schema.TestReportSchema.TestReportSchema.columns);
            const hasObservationEntrySchema = schema?.TestReportSchema?.ObservationEntrySchema?.rows &&
                Array.isArray(schema.TestReportSchema.ObservationEntrySchema.rows) &&
                Array.isArray(schema.TestReportSchema.ObservationEntrySchema.columns);
            if (!hasTestReportSchema && !hasObservationEntrySchema)
                return null;
            let processedTestReportRows = null;
            let processedObservationEntryRows = null;
            if (hasTestReportSchema) {
                const testIdCol = 0;
                const schemaIdCol = 1;
                const filteredRows = schema.TestReportSchema.TestReportSchema.rows.filter((row) => {
                    const testId = row.values?.[schema.TestReportSchema.TestReportSchema.columns[testIdCol]?.id];
                    const schemaId = row.values?.[schema.TestReportSchema.TestReportSchema.columns[schemaIdCol]?.id];
                    const hasMatchingAverage = observationGroupAverages.some((avg) => avg.testId === testId && avg.schemaId === schemaId);
                    const hasExistingData = schema.TestReportSchema.TestReportSchema.columns.some((col) => {
                        if (col.type === 'schema') {
                            const value = row.values?.[col.id];
                            return value !== undefined && value !== null && value !== '';
                        }
                        return false;
                    });
                    return hasMatchingAverage || hasExistingData;
                });
                if (filteredRows.length > 0) {
                    processedTestReportRows = filteredRows.map((row) => {
                        const testId = row.values?.[schema.TestReportSchema.TestReportSchema.columns[testIdCol]?.id];
                        const schemaId = row.values?.[schema.TestReportSchema.TestReportSchema.columns[schemaIdCol]?.id];
                        const matchingAverage = observationGroupAverages.find((avg) => avg.testId === testId && avg.schemaId === schemaId);
                        const matchingRawResult = observationGroupRawResults.find((raw) => raw.testId === testId && raw.schemaId === schemaId);
                        const newValues = {};
                        const newRawValues = {};
                        for (const col of schema.TestReportSchema.TestReportSchema.columns) {
                            if (col.id === '1') {
                                newValues[col.id] = row.values?.[col.id];
                                newRawValues[col.id] = row.values?.[col.id];
                            }
                            else if (col.id === '2') {
                                newValues[col.id] = row.values?.[col.id];
                                newRawValues[col.id] = row.values?.[col.id];
                            }
                            else if (col.type === 'schema') {
                                newValues[col.id] =
                                    matchingAverage && matchingAverage.averages && matchingAverage.averages[col.id] !== undefined
                                        ? matchingAverage.averages[col.id]
                                        : (row.values?.[col.id] || '');
                                newRawValues[col.id] =
                                    matchingRawResult && matchingRawResult.results && Array.isArray(matchingRawResult.results)
                                        ? matchingRawResult.results.map((resultObj) => resultObj[col.id] !== undefined ? resultObj[col.id] : '')
                                        : (row.values?.[col.id] ? [row.values?.[col.id]] : []);
                            }
                            else {
                                newValues[col.id] = row.values?.[col.id];
                                newRawValues[col.id] = row.values?.[col.id];
                            }
                        }
                        return {
                            ...row,
                            values: newValues,
                        };
                    });
                }
            }
            if (hasObservationEntrySchema) {
                const testIdCol = 0;
                const schemaIdCol = 1;
                const filteredRows = schema.TestReportSchema.ObservationEntrySchema.rows.filter((row) => {
                    const testId = row.values?.[schema.TestReportSchema.ObservationEntrySchema.columns[testIdCol]?.id];
                    const schemaId = row.values?.[schema.TestReportSchema.ObservationEntrySchema.columns[schemaIdCol]?.id];
                    return observationGroupRawResults.some((raw) => raw.testId === testId && raw.schemaId === schemaId);
                });
                if (filteredRows.length > 0) {
                    processedObservationEntryRows = filteredRows.map((row) => {
                        const testId = row.values?.[schema.TestReportSchema.ObservationEntrySchema.columns[testIdCol]?.id];
                        const schemaId = row.values?.[schema.TestReportSchema.ObservationEntrySchema.columns[schemaIdCol]?.id];
                        const matchingRawResult = observationGroupRawResults.find((raw) => raw.testId === testId && raw.schemaId === schemaId);
                        const newRawValues = {};
                        for (const col of schema.TestReportSchema.ObservationEntrySchema.columns) {
                            if (col.type === 'schema') {
                                newRawValues[col.id] =
                                    matchingRawResult && matchingRawResult.results && Array.isArray(matchingRawResult.results)
                                        ? matchingRawResult.results.map((resultObj) => resultObj[col.id] !== undefined ? resultObj[col.id] : '')
                                        : [];
                            }
                            else {
                                newRawValues[col.id] = row.values?.[col.id];
                            }
                        }
                        return {
                            ...row,
                            observationEntry: newRawValues
                        };
                    });
                }
            }
            if (processedTestReportRows || processedObservationEntryRows) {
                return {
                    ...schema,
                    TestReportSchema: processedTestReportRows ? {
                        ...schema.TestReportSchema,
                        TestReportSchema: {
                            ...schema.TestReportSchema.TestReportSchema,
                            rows: processedTestReportRows
                        }
                    } : schema.TestReportSchema,
                    ObservationEntrySchema: processedObservationEntryRows ? {
                        ...schema.TestReportSchema.ObservationEntrySchema,
                        rows: processedObservationEntryRows
                    } : schema.TestReportSchema.ObservationEntrySchema
                };
            }
            return null;
        })
            .filter((schema) => schema !== null)
        : [];
    const processedReportHeaders = Array.isArray(processedReportSchemas)
        ? processedReportSchemas.map((schema) => {
            const hasTestReportSchema = schema?.TestReportSchema?.TestReportSchema?.columns &&
                Array.isArray(schema.TestReportSchema.TestReportSchema.columns);
            const hasObservationEntrySchema = schema?.TestReportSchema?.ObservationEntrySchema?.columns &&
                Array.isArray(schema.TestReportSchema.ObservationEntrySchema.columns);
            if (!hasTestReportSchema && !hasObservationEntrySchema)
                return [];
            let dataColumns = [];
            let rows = [];
            let averageHeaders = [];
            let rawHeaders = [];
            if (hasTestReportSchema) {
                dataColumns = schema.TestReportSchema.TestReportSchema.columns.slice(2);
                averageHeaders = [
                    { id: 'slNo', label: 'Sl. No' },
                    ...dataColumns.map((col) => ({
                        id: col.id,
                        label: col.name || col.id,
                        averageCalculationRequired: col.averageCalculationRequired || false
                    }))
                ];
                rows = schema.TestReportSchema.TestReportSchema.rows;
            }
            const testNames = [];
            const testingMethod = [];
            const startDates = [];
            const endDates = [];
            const productNames = [];
            let productId = '';
            let productShortForm = '';
            let reportNo = 0;
            let averageDataRows = [];
            let rawDataRows = [];
            if (hasTestReportSchema && Array.isArray(schema.TestReportSchema.TestReportSchema.rows)) {
                averageDataRows = schema.TestReportSchema.TestReportSchema.rows.map((row, idx) => {
                    const testIdCol = schema.TestReportSchema.TestReportSchema.columns[0]?.id;
                    const schemaIdCol = schema.TestReportSchema.TestReportSchema.columns[1]?.id;
                    const testId = row.values?.[testIdCol];
                    const schemaId = row.values?.[schemaIdCol];
                    const filteredObj = observationGroupAverages.find((avg) => avg.testId === testId && avg.schemaId === schemaId);
                    if (filteredObj) {
                        if (!productId && filteredObj.productId) {
                            productId = filteredObj.productId;
                        }
                        if (!productShortForm && filteredObj.productShortForm) {
                            productShortForm = filteredObj.productShortForm;
                        }
                        if (!reportNo && filteredObj.productId) {
                            const product = data.contractData.products.find((p) => p.id === filteredObj.productId);
                            if (product) {
                                const isNabl = data.contractData.reportType !== 'NON-NABL';
                                reportNo = isNabl ? (Number(product.reportNo) || 0) : (Number(product.reportNoNonNabl) || 0);
                            }
                        }
                        console.log('TestReportSchema - Set productId:', productId, 'productShortForm:', productShortForm);
                        return {
                            slNo: idx + 1,
                            ...dataColumns.reduce((acc, col) => {
                                if (filteredObj.productName && !productNames.includes(filteredObj.productName)) {
                                    productNames.push(filteredObj.productName);
                                }
                                if (filteredObj.startDate && !startDates.includes(filteredObj?.startDate?.toString())) {
                                    startDates.push(filteredObj?.startDate?.toString());
                                }
                                if (filteredObj.endDate && !endDates.includes(filteredObj?.endDate?.toString())) {
                                    endDates.push(filteredObj?.endDate?.toString());
                                }
                                const unitRecords = schema.TestReportSchema.TestReportSchema.columns.find((col) => col.name === 'Units');
                                if (row.values[col.id] === 'TestName') {
                                    acc[col.id] = filteredObj.testName ?? '';
                                }
                                else if (row.values[col.id] === 'TestingMethod') {
                                    acc[col.id] = filteredObj.testingMethod ?? '';
                                }
                                else if (col.type == 'text') {
                                    acc[col.id] = row.values[col.id];
                                }
                                else if (unitRecords && unitRecords.id === col.id && col.name === 'Units') {
                                    acc[col.id] = row.values[col.id];
                                }
                                else {
                                    let resultArray = row.values?.[col.id];
                                    if (resultArray === undefined) {
                                        const rowKeys = Object.keys(row.values || {});
                                        const fieldArrays = rowKeys
                                            .filter(key => Array.isArray(row.values[key]) && row.values[key].length > 0)
                                            .map(key => ({ key, value: row.values[key] }));
                                        const columnIndex = dataColumns.findIndex(c => c.id === col.id);
                                        if (fieldArrays.length > columnIndex) {
                                            resultArray = fieldArrays[columnIndex].value;
                                        }
                                        else if (fieldArrays.length > 0) {
                                            resultArray = fieldArrays[0].value;
                                        }
                                    }
                                    let value = '';
                                    if (Array.isArray(resultArray)) {
                                        const valueArray = resultArray.map((item) => {
                                            if (typeof item === 'string') {
                                                const avgValue = filteredObj.averages?.[item];
                                                return avgValue ?? '';
                                            }
                                            return '';
                                        });
                                        value = valueArray.join(' X ');
                                    }
                                    else {
                                        if (filteredObj?.averages) {
                                            value = filteredObj.averages[col.id];
                                            if (value === undefined || value === '') {
                                                value = filteredObj.averages[col.name];
                                            }
                                            if (value === undefined || value === '') {
                                                const fieldNames = Object.keys(filteredObj.averages);
                                                for (const fieldName of fieldNames) {
                                                    if (fieldName.toLowerCase().includes(col.name?.toLowerCase() || '') ||
                                                        col.name?.toLowerCase().includes(fieldName.toLowerCase() || '')) {
                                                        value = filteredObj.averages[fieldName];
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                        if (value === undefined || value === '') {
                                            value = row.values?.[col.id];
                                        }
                                    }
                                    acc[col.id] = value ?? '';
                                }
                                return acc;
                            }, {})
                        };
                    }
                }).filter(row => row !== undefined);
            }
            if (hasObservationEntrySchema) {
                dataColumns = schema.TestReportSchema.ObservationEntrySchema.columns.slice(2);
                rawHeaders = [
                    { id: 'slNo', label: 'Sl. No' },
                    ...dataColumns.map((col) => ({
                        id: col.id,
                        label: col.name || col.id,
                        averageCalculationRequired: col.averageCalculationRequired || false
                    }))
                ];
                rows = schema.TestReportSchema.ObservationEntrySchema.rows;
            }
            if (hasObservationEntrySchema && Array.isArray(schema.TestReportSchema.ObservationEntrySchema.rows)) {
                const dataColumnsObservation = schema.TestReportSchema.ObservationEntrySchema.columns.slice(2);
                const firstMatchingRawResult = observationGroupRawResults.find((raw) => {
                    const testIdCol = schema.TestReportSchema.ObservationEntrySchema.columns[0]?.id;
                    const schemaIdCol = schema.TestReportSchema.ObservationEntrySchema.columns[1]?.id;
                    const firstRow = schema.TestReportSchema.ObservationEntrySchema.rows[0];
                    if (firstRow) {
                        const testId = firstRow.values?.[testIdCol];
                        const schemaId = firstRow.values?.[schemaIdCol];
                        return raw.testId === testId && raw.schemaId === schemaId;
                    }
                    return false;
                });
                if (firstMatchingRawResult) {
                    productId = firstMatchingRawResult.productId || '';
                    productShortForm = firstMatchingRawResult.productShortForm || '';
                    const product = data.contractData.products.find((p) => p.id === firstMatchingRawResult.productId);
                    if (product) {
                        const isNabl = data.contractData.reportType !== 'NON-NABL';
                        reportNo = isNabl ? (Number(product.reportNo) || 0) : (Number(product.reportNoNonNabl) || 0);
                    }
                    console.log('ObservationEntrySchema - Extracted productId:', productId, 'productShortForm:', productShortForm);
                }
                if (Array.isArray(observationGroupRawResults)) {
                    observationGroupRawResults.sort((a, b) => {
                        if (a.sampleId !== undefined && b.sampleId !== undefined) {
                            const aNum = Number(a.sampleId);
                            const bNum = Number(b.sampleId);
                            if (!isNaN(aNum) && !isNaN(bNum)) {
                                return aNum - bNum;
                            }
                            return String(a.sampleId).localeCompare(String(b.sampleId));
                        }
                        if (a.sampleId !== undefined)
                            return -1;
                        if (b.sampleId !== undefined)
                            return 1;
                        return 0;
                    });
                }
                const rowsObservation = schema.TestReportSchema.ObservationEntrySchema.rows;
                rawDataRows = Array.isArray(rowsObservation)
                    ? rowsObservation.map((row, idx) => {
                        const testIdCol = schema.TestReportSchema.ObservationEntrySchema.columns[0]?.id;
                        const schemaIdCol = schema.TestReportSchema.ObservationEntrySchema.columns[1]?.id;
                        const testId = row.values?.[testIdCol];
                        const schemaId = row.values?.[schemaIdCol];
                        const filteredRawObj = observationGroupRawResults.find((raw) => raw.testId === testId && raw.schemaId === schemaId);
                        if (filteredRawObj && Array.isArray(filteredRawObj.results) && filteredRawObj.results.length > 0) {
                            return filteredRawObj.results.map((resultObj, resultIdx) => {
                                if (filteredRawObj.testName && !testNames.includes(filteredRawObj.testName)) {
                                    testNames.push(filteredRawObj.testName);
                                }
                                if (filteredRawObj.testingMethod && !testingMethod.includes(filteredRawObj.testingMethod)) {
                                    testingMethod.push(filteredRawObj.testingMethod);
                                }
                                if (filteredRawObj.productName && !productNames.includes(filteredRawObj.productName)) {
                                    productNames.push(filteredRawObj.productName);
                                }
                                if (filteredRawObj.startDate && !startDates.includes(filteredRawObj?.startDate?.toString())) {
                                    startDates.push(filteredRawObj?.startDate?.toString());
                                }
                                if (filteredRawObj.endDate && !endDates.includes(filteredRawObj?.endDate?.toString())) {
                                    endDates.push(filteredRawObj?.endDate?.toString());
                                }
                                return {
                                    slNo: idx + 1,
                                    ...dataColumnsObservation.reduce((acc, col) => {
                                        const resultArray = row.values?.[col.id];
                                        if (row.values[col.id] === 'TestName') {
                                            acc[col.id] = filteredRawObj.testName ?? '';
                                        }
                                        else if (row.values[col.id] === 'TestingMethod') {
                                            acc[col.id] = filteredRawObj.testingMethod ?? '';
                                        }
                                        else if (row.values[col.id] == "SampleId") {
                                            acc[col.id] = resultObj.sampleId ?? '';
                                        }
                                        else if (row.values[col.id] === 'Unit') {
                                            acc[col.id] = filteredRawObj.unit ?? '';
                                        }
                                        else if (Array.isArray(resultArray) && resultArray?.length > 1) {
                                            {
                                                const valueArray = resultArray.map((item) => resultObj[item]);
                                                acc[col.id] = valueArray.join(' X ');
                                            }
                                        }
                                        else {
                                            const value = resultObj[row.values?.[col.id]];
                                            const hasNonNumericChars = /[^0-9.]/.test(value);
                                            if (hasNonNumericChars) {
                                                acc[col.id] = value ?? '';
                                            }
                                            else {
                                                const parsed = parseFloat(value);
                                                if (!isNaN(parsed)) {
                                                    acc[col.id] = value;
                                                }
                                                else {
                                                    acc[col.id] = value ?? '';
                                                }
                                            }
                                        }
                                        return acc;
                                    }, {})
                                };
                            });
                        }
                    }).filter((row) => row !== undefined) : [];
            }
            if (Array.isArray(rawDataRows)) {
                rawDataRows = rawDataRows.filter(row => row !== undefined);
            }
            let slNoCounter = 1;
            const combinedRawDataRows = Array.isArray(rawDataRows)
                ? rawDataRows.reduce((acc, curr) => {
                    const rows = Array.isArray(curr) ? curr : [curr];
                    for (const row of rows) {
                        if (row && Object.prototype.hasOwnProperty.call(row, 'slNo')) {
                            row.slNo = slNoCounter++;
                        }
                        acc.push(row);
                    }
                    return acc.sort((a, b) => a.sampleId - b.sampleId);
                }, [])
                : [];
            let lowestStartDate = '';
            if (startDates.length > 0) {
                const ymdDates = startDates
                    .map(s => { const m = String(s).match(/^(\d{4}-\d{2}-\d{2})/); return m ? m[1] : ''; })
                    .filter(Boolean)
                    .sort();
                if (ymdDates.length > 0) {
                    const [yyyy, mm, dd] = ymdDates[0].split('-');
                    lowestStartDate = `${dd}/${mm}/${yyyy}`;
                }
            }
            let highestEndDate = '';
            if (endDates.length > 0) {
                const ymdDates = endDates
                    .map(s => { const m = String(s).match(/^(\d{4}-\d{2}-\d{2})/); return m ? m[1] : ''; })
                    .filter(Boolean)
                    .sort();
                if (ymdDates.length > 0) {
                    const [yyyy, mm, dd] = ymdDates[ymdDates.length - 1].split('-');
                    highestEndDate = `${dd}/${mm}/${yyyy}`;
                }
            }
            if ((Array.isArray(averageDataRows) && averageDataRows.length > 0) ||
                (Array.isArray(combinedRawDataRows) && combinedRawDataRows.length > 0)) {
                let finalReportNo = '';
                let finalUlrNo = '';
                const savedNumbers = data.contractData.reportNo?.find(item => item.reportSchemaId === schema.id);
                finalReportNo = savedNumbers?.reportNo || '';
                finalUlrNo = data.contractData.reportType === 'NABL' ? savedNumbers?.ulrno || '' : '';
                if (Array.isArray(averageDataRows)) {
                    averageDataRows.forEach((row, idx) => {
                        if (row && typeof row === 'object') {
                            row.slNo = idx + 1;
                        }
                    });
                }
                return {
                    headers: Array.isArray(averageDataRows) && averageDataRows.length > 0 ? averageHeaders : [],
                    dataRows: averageDataRows,
                    observationEntryHeaders: Array.isArray(combinedRawDataRows) && combinedRawDataRows.length > 0 ? rawHeaders : [],
                    observationEntryRows: combinedRawDataRows,
                    testNames: testNames,
                    startDate: lowestStartDate,
                    endDate: highestEndDate,
                    productNames,
                    productId,
                    productShortForm,
                    reportNo,
                    reportSchemaId: schema?.id,
                    finalReportNo,
                    finalUlrNo,
                    testingMethod,
                    schema
                };
                console.log('Final return - productId:', productId, 'productShortForm:', productShortForm, 'schemaId:', schema?.id);
            }
        })
        : [];
    const validHeaders = processedReportHeaders.filter((header) => header !== undefined);
    if (data.contractData.appRequestId) {
        appRequestService.updateReport(data.contractData.appRequestId);
    }
    for (let i = 0; i < validHeaders.length; i++) {
        if (!(mobileRequest && i === 0)) {
            doc.addPage();
        }
        await TestReportPage(doc, data, observationGroups, validHeaders[i], true, data.contractData.requestId, referrer);
        const reportBaseUrl = process.env.PUBLIC_API_URL || `${res.req.protocol}://${res.req.get('host')}${res.req.baseUrl || ''}`;
        await addQRCodeToPage(doc, data.contractData.requestId, reportBaseUrl);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    doc.end();
}
function drawRequestHeader(doc, title, formNo, data, settings, top = 20) {
    const left = 28;
    const widths = [140, 90, 115, 195];
    const boundaries = [left, left + 140, left + 230, left + 345, left + 540];
    const rows = [38, 30, 25];
    const text = (value, x, y, width, bold = false, align = bold ? 'left' : 'justify') => {
        doc.font(bold ? 'Calibri-Bold' : 'Calibri').fontSize(10)
            .text(String(value ?? ''), x + 5, y + 5, { width: width - 10, lineGap: 0, align });
    };
    doc.rect(left, top, 540, rows.reduce((sum, h) => sum + h, 0)).stroke();
    const bottom = top + rows.reduce((sum, h) => sum + h, 0);
    for (const x of boundaries.slice(2, 4))
        doc.moveTo(x, top).lineTo(x, bottom).stroke();
    doc.moveTo(left + 500, top).lineTo(left + 500, top + rows[0]).stroke();
    doc.moveTo(boundaries[1], top + rows[0]).lineTo(boundaries[1], bottom).stroke();
    doc.moveTo(left, top + rows[0]).lineTo(left + 540, top + rows[0]).stroke();
    doc.moveTo(left, top + rows[0] + rows[1]).lineTo(left + 540, top + rows[0] + rows[1]).stroke();
    text(title, left, top + 6, widths[0] + widths[1], true, 'center');
    text('ORGANIZATION', boundaries[2], top + 6, widths[2], true);
    text('THIAGARAJAR POLYTECHNIC COLLEGE', boundaries[3], top, widths[3] - 40, true);
    for (const logo of [settings?.consultancyDetails?.logo, images_1.images.logo]) {
        if (!logo)
            continue;
        try {
            doc.image(logo, left + 540 - 38, top + 4, { fit: [32, 30], align: 'center', valign: 'center' });
            break;
        }
        catch { }
    }
    const revision = [data.revisionNo, data.revisionDate].filter(v => v !== undefined && v !== null && String(v).trim()).join(' / ');
    const issue = [data.issueNo, data.issueDate].filter(v => v !== undefined && v !== null && String(v).trim()).join(' / ');
    const values = [
        ['FORM NO.', formNo, 'DEPARTMENT', 'Centre for Civil Testing and Consultancy, Salem'],
        ['REVISION NO./DATE', revision, 'ISSUE NO./DATE', issue],
    ];
    let y = top + rows[0];
    values.forEach((row, index) => {
        row.forEach((value, column) => text(value, boundaries[column], y, widths[column], column % 2 === 0));
        y += rows[index + 1];
    });
    return bottom;
}
function ContractReviewForm(doc, data, systemSettings) {
    const left = 28, width = 540, labelWidth = 250, valueWidth = width - labelWidth;
    let y = drawRequestHeader(doc, 'TEST REQUEST FORM', configuration_json_1.default.formNumbers.testRequest, data, systemSettings) + 5;
    doc.font('Calibri-Bold').fontSize(11).text('TEST REQUEST/CONTRACT REVIEW FORM', left, y, { width, align: 'center', underline: true });
    y += 18;
    const yesNo = (value) => [{ label: 'Yes', checked: !!value }, { label: 'No', checked: !value }];
    const rows = [
        { label: 'TRF No.', value: data.TRFNo },
        { label: 'Date', value: data.date },
        { label: 'Name of the Customer/ Organization', value: data.customerName },
        { label: 'Address (As mentioned by Addressee)', value: data.address },
        { label: 'Contact Person', value: data.contactPerson },
        { label: 'Mobile No./Email ID', value: [data.phone, data.email].filter(Boolean).join(' / ') },
        { label: 'Customer letter No. & Date', value: data.customerLetterNoDate },
        { label: 'Name of Work (As mentioned by Addressee)', value: data.workName },
        { label: 'Location (As Mentioned by Addressee)', value: data.location },
        { label: 'Date of Casting & Grade of Concrete (As mentioned by Addressee)', value: data.dateOfCastingAndGradeOfConcrete },
        { label: 'For Customer Use only', section: true },
        { label: 'Is Statement of conformity Required', choices: yesNo(data.conformityRequired) },
        { label: 'If yes, mention the decision rule to be followed', value: data.decisionRule },
        { label: 'Deviation from Test Methods (if any)', choices: yesNo(data.deviationFromTestMethods) },
        { label: 'IS Method requested Inappropriate (or) out of date', value: data.isMethodInappropriate },
        { label: 'Witness Request (if any)', choices: yesNo(data.witnessRequest) },
        { label: 'If yes Specify the Witness details:', section: true },
        { label: 'Witness Name & Designation', value: formatWitnessNameAndDesignation(data.witnessName, data.witnessDesignation) },
        { label: 'Witness Contact Details', value: `Email ID: ${data.witnessEmailId || ''}\nContact No: ${data.witnessContactNo || ''}\nDetails: ${data.witnessDetails || ''}` },
        { label: 'Specify Test Report Request', section: true },
        { label: 'Mode of delivery', choices: ['Post', 'Courier', 'In Person', 'Email'].map(label => ({ label, checked: data.modeOfDelivery === label })) },
        { label: 'Is Test Report required in Simplified way', choices: yesNo(data.simplifiedWay) },
        { label: 'Is Test Report to be addressed to any other organization', choices: yesNo(data.addressedToOtherOrg) },
    ];
    if (data.addressedToOtherOrg && data.otherOrgDetails)
        rows.push({ label: 'Organization Details', value: data.otherOrgDetails });
    rows.push({ label: '', cells: ['Material Sample', data.sizeOfMetal || '', 'Shape & Size', data.shapeOfBlock || '', 'Source / Brand', [data.source, data.brandName].filter(Boolean).join(' / ')] });
    const sampleWidths = [80, 80, 90, 90, 70, 130];
    const available = doc.page.height - 28 - y;
    let spacing = 1;
    const measure = (value, cellWidth, bold, scale) => {
        doc.font(bold ? 'Calibri-Bold' : 'Calibri').fontSize((bold ? 10 : 9.5) * scale);
        return doc.heightOfString(String(value ?? ''), { width: cellWidth - 10 * scale, lineGap: 0, align: bold ? 'left' : 'justify' });
    };
    const rowHeight = (row, scale) => {
        let heights = [measure(row.label, row.section ? width : labelWidth, true, scale)];
        if (row.cells)
            heights = row.cells.map((cell, index) => measure(cell, sampleWidths[index], index % 2 === 0, scale));
        else if (!row.section)
            heights.push(row.choices ? 11 * scale : measure(row.value, valueWidth, false, scale));
        return Math.max(21 * scale * spacing, ...heights.map(height => height + 8 * scale * spacing));
    };
    let scale = 1;
    while (rows.reduce((sum, row) => sum + rowHeight(row, scale), 0) > available && spacing > 0.65)
        spacing *= 0.9;
    while (rows.reduce((sum, row) => sum + rowHeight(row, scale), 0) > available)
        scale *= 0.95;
    const renderText = (value, x, cellWidth, bold) => {
        doc.font(bold ? 'Calibri-Bold' : 'Calibri').fontSize((bold ? 10 : 9.5) * scale)
            .text(String(value ?? ''), x + 5 * scale, y + 4 * scale * spacing, { width: cellWidth - 10 * scale, lineGap: 0, align: bold ? 'left' : 'justify' });
    };
    rows.forEach(row => {
        const height = rowHeight(row, scale);
        doc.rect(left, y, width, height).stroke();
        if (row.cells) {
            let x = left;
            row.cells.forEach((cell, index) => {
                if (index)
                    doc.moveTo(x, y).lineTo(x, y + height).stroke();
                renderText(cell, x, sampleWidths[index], index % 2 === 0);
                x += sampleWidths[index];
            });
        }
        else {
            renderText(row.label, left, row.section ? width : labelWidth, true);
            if (!row.section) {
                doc.moveTo(left + labelWidth, y).lineTo(left + labelWidth, y + height).stroke();
                if (row.choices) {
                    let x = left + labelWidth + 6 * scale;
                    row.choices.forEach(choice => {
                        const size = 9 * scale;
                        const checkboxY = y + (height - size) / 2;
                        doc.rect(x, checkboxY, size, size).stroke();
                        if (choice.checked)
                            doc.moveTo(x + size * 0.2, checkboxY + size * 0.5).lineTo(x + size * 0.45, checkboxY + size * 0.8).lineTo(x + size * 0.85, checkboxY + size * 0.2).stroke();
                        renderText(choice.label, x + size + 2 * scale, 49, false);
                        x += valueWidth / (row.choices.length === 2 ? 5 : 4);
                    });
                }
                else
                    renderText(row.value, left + labelWidth, valueWidth, false);
            }
        }
        y += height;
    });
}
function sampleCollectionReport(doc, data) {
    if (!data.mappings)
        return;
    doc.strokeColor('#A0A0A0');
    doc.lineWidth(0.5);
    const TABLE_WIDTH = 600;
    const tableLeft = 28;
    const tableTop = 20;
    const pageWidth = 595.28;
    const pageHeight = 842;
    const pageBottomMargin = 40;
    let currentPageY = tableTop;
    let pageNumber = 1;
    const samples = data.mappings?.samples || [];
    const mappings = data.mappings?.mappings || [];
    const checkAndAddPage = (requiredHeight) => {
        const availableHeight = pageHeight - tableTop - pageBottomMargin;
        if (currentPageY + requiredHeight > availableHeight) {
            doc.addPage();
            currentPageY = tableTop;
            pageNumber++;
            return true;
        }
        return false;
    };
    const tableWidth = 540;
    let y = drawRequestHeader(doc, 'TEST REQUEST FORM', configuration_json_1.default.formNumbers.testRequest, data.contractData, data.systemSettings, currentPageY) + 10;
    currentPageY = y;
    const infoTableHeaders = ['Material or Product to be Tested', 'Name of the test (Tick required test)', 'Method of Test'];
    const groupedMappings = mappings.reduce((acc, mapping) => {
        const key = mapping.test.id;
        if (!acc[key])
            acc[key] = { test: mapping.test.name, method: mapping.test.testingMethod, products: new Set() };
        acc[key].products.add(mapping.product.name);
        return acc;
    }, {});
    const infoTableValues = Object.values(groupedMappings).map((group) => [
        Array.from(group.products).join('\n'), group.test, group.method
    ]);
    const infoTableCols = [185, 195, 160];
    const infoTableY = y;
    const infoTableRows = [infoTableHeaders, ...infoTableValues];
    let infoTableRowHeights = [];
    for (let row = 0; row < infoTableRows.length; row++) {
        let maxHeight = 0;
        for (let col = 0; col < infoTableCols.length; col++) {
            const cellHeight = getTextHeight(doc, infoTableRows[row][col], { width: infoTableCols[col] - 10, font: row === 0 ? 'Calibri-Bold' : 'Calibri', fontSize: 10 }) + 10;
            if (cellHeight > maxHeight)
                maxHeight = cellHeight;
        }
        infoTableRowHeights.push(maxHeight);
    }
    const infoTableTotalHeight = infoTableRowHeights.reduce((a, b) => a + b, 0);
    checkAndAddPage(infoTableTotalHeight);
    doc.rect(tableLeft, infoTableY, infoTableCols.reduce((a, b) => a + b, 0), infoTableTotalHeight).stroke();
    let infoCurrentY = infoTableY;
    for (let i = 0; i < infoTableRows.length; i++) {
        doc.moveTo(tableLeft, infoCurrentY).lineTo(tableLeft + infoTableCols.reduce((a, b) => a + b, 0), infoCurrentY).stroke();
        infoCurrentY += infoTableRowHeights[i];
    }
    doc.moveTo(tableLeft, infoCurrentY).lineTo(tableLeft + infoTableCols.reduce((a, b) => a + b, 0), infoCurrentY).stroke();
    let infoColX = tableLeft;
    for (let i = 0; i < infoTableCols.length; i++) {
        infoColX += infoTableCols[i];
        doc.moveTo(infoColX, infoTableY).lineTo(infoColX, infoTableY + infoTableTotalHeight).stroke();
    }
    infoCurrentY = infoTableY;
    for (let row = 0; row < infoTableRows.length; row++) {
        let cellX = tableLeft;
        for (let col = 0; col < infoTableCols.length; col++) {
            doc.font(row === 0 ? 'Calibri-Bold' : 'Calibri').fontSize(10).text(infoTableRows[row][col], cellX + 5, infoCurrentY + 5, { width: infoTableCols[col] - 10 });
            cellX += infoTableCols[col];
        }
        infoCurrentY += infoTableRowHeights[row];
    }
    y = infoTableY + infoTableTotalHeight + 6;
    currentPageY = y;
    doc.font('Calibri-Bold').fontSize(11).text('Samples', tableLeft - 50, y, { width: TABLE_WIDTH, align: 'center', underline: true });
    y += 45;
    currentPageY = y;
    const sampleTableCols = [50, 200, 80, 100, 110];
    const sampleTableHeaders = ['S.No', 'Sample ID or location', 'No. of samples', 'Sample type', 'Sample Availability'];
    const sampleTableWidth = sampleTableCols.reduce((a, b) => a + b, 0);
    const sampleTableX = tableLeft;
    const sampleRows = samples.map((sample, index) => [
        `${index + 1}.`, sample.sampleId,
        (mappings.filter((m) => m.sampleId === sample.id).length).toString(),
        sample.sampleType, sample.sampleAvailability
    ]);
    const sampleHeaderHeight = 20;
    const sampleDataRowHeights = [];
    for (let i = 0; i < sampleRows.length; i++) {
        let maxHeight = 0;
        for (let j = 0; j < sampleRows[i].length; j++) {
            const cellHeight = getTextHeight(doc, sampleRows[i][j] || '', { width: sampleTableCols[j] - 6, font: 'Calibri', fontSize: 10 }) + 8;
            if (cellHeight > maxHeight)
                maxHeight = cellHeight;
        }
        sampleDataRowHeights.push(maxHeight);
    }
    const samplePageBottom = pageHeight - pageBottomMargin;
    const drawSampleTableHeader = (startY) => {
        doc.moveTo(sampleTableX, startY).lineTo(sampleTableX + sampleTableWidth, startY).stroke();
        doc.moveTo(sampleTableX, startY + sampleHeaderHeight).lineTo(sampleTableX + sampleTableWidth, startY + sampleHeaderHeight).stroke();
        let hx = sampleTableX;
        for (let i = 0; i < sampleTableHeaders.length; i++) {
            doc.font('Calibri-Bold').fontSize(11).text(sampleTableHeaders[i], hx + 2, startY + 4, { width: sampleTableCols[i] - 4 });
            hx += sampleTableCols[i];
        }
    };
    const drawSampleTableColLines = (topY, bottomY) => {
        doc.moveTo(sampleTableX, topY).lineTo(sampleTableX, bottomY).stroke();
        let cx = sampleTableX;
        for (let i = 0; i < sampleTableCols.length; i++) {
            cx += sampleTableCols[i];
            doc.moveTo(cx, topY).lineTo(cx, bottomY).stroke();
        }
    };
    const samplePageWasAdded = checkAndAddPage(sampleHeaderHeight + (sampleDataRowHeights[0] || 20));
    let sampleSectionTopY = samplePageWasAdded ? tableTop : (y - 30);
    currentPageY = sampleSectionTopY;
    drawSampleTableHeader(sampleSectionTopY);
    let sampleRowY = sampleSectionTopY + sampleHeaderHeight;
    for (let i = 0; i < sampleRows.length; i++) {
        const rowHeight = sampleDataRowHeights[i];
        if (sampleRowY + rowHeight > samplePageBottom) {
            doc.moveTo(sampleTableX, sampleRowY).lineTo(sampleTableX + sampleTableWidth, sampleRowY).stroke();
            drawSampleTableColLines(sampleSectionTopY, sampleRowY);
            doc.addPage();
            pageNumber++;
            currentPageY = tableTop;
            sampleSectionTopY = tableTop;
            sampleRowY = sampleSectionTopY + sampleHeaderHeight;
            drawSampleTableHeader(sampleSectionTopY);
        }
        doc.moveTo(sampleTableX, sampleRowY + rowHeight).lineTo(sampleTableX + sampleTableWidth, sampleRowY + rowHeight).stroke();
        let cellX = sampleTableX;
        for (let j = 0; j < sampleRows[i].length; j++) {
            doc.font('Calibri').fontSize(10).text(sampleRows[i][j] || '', cellX + 2, sampleRowY + 4, { width: sampleTableCols[j] - 4 });
            cellX += sampleTableCols[j];
        }
        sampleRowY += rowHeight;
    }
    doc.moveTo(sampleTableX, sampleRowY).lineTo(sampleTableX + sampleTableWidth, sampleRowY).stroke();
    drawSampleTableColLines(sampleSectionTopY, sampleRowY);
    y = sampleRowY + 10;
    currentPageY = y;
    const LAB_TABLE_WIDTH = 540;
    const labTableLeft = 28;
    const labTableCols = [180, LAB_TABLE_WIDTH - 180];
    let labY = y + 10;
    currentPageY = labY;
    const labRowHeights = [24, 24, 24, 24, 70];
    const labTableTotalHeight = labRowHeights.reduce((a, b) => a + b, 0);
    checkAndAddPage(labTableTotalHeight);
    let labCurrentY = labY;
    for (let i = 0; i <= labRowHeights.length; i++) {
        doc.moveTo(labTableLeft, labCurrentY).lineTo(labTableLeft + LAB_TABLE_WIDTH, labCurrentY).stroke();
        if (i < labRowHeights.length)
            labCurrentY += labRowHeights[i];
    }
    let labColX = labTableLeft + labTableCols[0];
    doc.moveTo(labColX, labY).lineTo(labColX, labY + labTableTotalHeight).stroke();
    doc.rect(labTableLeft, labY, LAB_TABLE_WIDTH, labTableTotalHeight).stroke();
    labCurrentY = labY;
    doc.font('Calibri-Bold').fontSize(11).text('For laboratory use only', labTableLeft + 5, labCurrentY + 6, { width: LAB_TABLE_WIDTH - 10, align: 'left' });
    labCurrentY += labRowHeights[0];
    const labRadioOptions = ['Post', 'Courier', 'In-Person', 'Email'];
    const observationEntry = data.observationEntries?.[0];
    doc.font('Calibri').fontSize(10).text('Sample & Test Request Received by:', labTableLeft + 5, labCurrentY + 6, { width: labTableCols[0] - 10 });
    let labRadioX = labTableLeft + labTableCols[0] + 10;
    for (let i = 0; i < labRadioOptions.length; i++) {
        doc.strokeColor('black').lineWidth(0.8);
        doc.circle(labRadioX, labCurrentY + 12, 6).stroke();
        if (data.contractData.sampleReceivedBy === labRadioOptions[i]) {
            doc.moveTo(labRadioX - 3, labCurrentY + 12).lineTo(labRadioX, labCurrentY + 16).lineTo(labRadioX + 5, labCurrentY + 8).stroke();
        }
        doc.strokeColor('#A0A0A0').lineWidth(0.5);
        doc.font('Calibri').fontSize(10).text(labRadioOptions[i], labRadioX + 10, labCurrentY + 7);
        labRadioX += 60;
    }
    labCurrentY += labRowHeights[1];
    doc.font('Calibri').fontSize(10).text('Condition of sample received:', labTableLeft + 5, labCurrentY + 6, { width: labTableCols[0] - 10 });
    doc.font('Calibri').fontSize(10).text(data.contractData.sampleCondition || '', labTableLeft + labTableCols[0] + 10, labCurrentY + 6);
    labCurrentY += labRowHeights[2];
    doc.font('Calibri').fontSize(10).text('Remarks', labTableLeft + 5, labCurrentY + 6, { width: labTableCols[0] - 10 });
    doc.font('Calibri').fontSize(10).text(data.contractData.remarks || '', labTableLeft + labTableCols[0] + 10, labCurrentY + 6);
    labCurrentY += labRowHeights[3];
    const labReviewOptions = ['Resources availability for testing', 'Sufficiency of sample supplied', 'Verification of test method', 'Conditions of Sample received', 'Pertinent Discussion if any'];
    doc.font('Calibri').fontSize(10).text('Review of Test Request', labTableLeft + 5, labCurrentY + 6, { width: labTableCols[0] - 10 });
    let labCheckY = labCurrentY + 6;
    const checkboxStates = [data.contractData.resourcesAvailable, data.contractData.sampleEfficiency, data.contractData.testMethodVerified, data.contractData.sampleConditionReceived, data.contractData.pertinentDiscussion];
    for (let i = 0; i < labReviewOptions.length; i++) {
        doc.strokeColor('black').lineWidth(0.8);
        doc.rect(labTableLeft + labTableCols[0] + 10, labCheckY, 10, 10).stroke();
        if (checkboxStates[i]) {
            doc.moveTo(labTableLeft + labTableCols[0] + 12, labCheckY + 5).lineTo(labTableLeft + labTableCols[0] + 15, labCheckY + 8).lineTo(labTableLeft + labTableCols[0] + 18, labCheckY + 2).stroke();
        }
        doc.strokeColor('#A0A0A0').lineWidth(0.5);
        doc.font('Calibri').fontSize(10).text(labReviewOptions[i], labTableLeft + labTableCols[0] + 25, labCheckY + 2);
        labCheckY += 12;
    }
    const bottomY = pageHeight - pageBottomMargin - 20;
    doc.font('Calibri').fontSize(10).text('Date :', tableLeft, bottomY);
    doc.text(observationEntry?.testCompletionDate ? formatDateDMY(String(observationEntry.testCompletionDate)) : '', tableLeft + 40, bottomY);
    doc.text('Place :', tableLeft, bottomY + 20);
    doc.text('Salem', tableLeft + 40, bottomY + 20);
    doc.text('Reviewed by,', tableLeft + 250, bottomY);
    doc.text('Customer Co - Ordinator/Technical Manager ', tableLeft + 250, bottomY + 20);
}
async function generateTOCRReport(doc, data) {
    doc.strokeColor('#A0A0A0');
    doc.lineWidth(0.5);
    const pageWidth = 595;
    const pageHeight = 842;
    const tableLeft = 28;
    const tableWidth = 540;
    let y = drawRequestHeader(doc, 'TEST ORDER CUM REPORT - TOCR', configuration_json_1.default.formNumbers.tocr, data.contractData, data.systemSettings, tableLeft) + 10;
    doc.font('Calibri-Bold').fontSize(11).text('TEST ORDER CUM REPORT - TOCR', tableLeft, y, { align: 'center', width: tableWidth, underline: true });
    y += 15;
    const observationEntry = data.observationEntries?.[0];
    const grouped = {};
    if (data.mappings && data.mappings.mappings) {
        for (const mapping of data.mappings.mappings) {
            const productId = mapping.product?.id || '';
            const testId = mapping.test?.id || '';
            const key = `${productId}__${testId}`;
            if (!grouped[key]) {
                grouped[key] = { testName: mapping.test?.name || '', testMethod: (mapping.test?.testingMethod || '').replace('\t', ''), unit: mapping.test?.unit || '', sampleIds: [], productName: mapping.product?.name || '' };
            }
            grouped[key].sampleIds.push(mapping.sample?.sampleId || '');
        }
    }
    const tDetailsFields = [
        { label: 'TOCR No.', value: data.contractData.TOCR || '' },
        { label: 'TRF Ref. No.', value: data.contractData.TRFNo || '' },
        { label: 'Test Conducted on', value: observationEntry?.testStartDate ? formatDateDMY(String(observationEntry.testStartDate)) : '' },
        { label: 'Test Completed Date', value: observationEntry?.testCompletionDate ? formatDateDMY(String(observationEntry.testCompletionDate)) : '' },
        { label: 'Sample Description', value: observationEntry?.productTestSampleMapping?.product?.name || '' },
        { label: 'Sample Condition', value: data.contractData.sampleCondition || '' },
        { label: 'Sample Code No.', value: observationEntry?.codeNo || '' },
        { label: 'Test to be Conducted', value: Object.values(grouped).map((g) => g.testName).filter((n) => !!n).join(', ') },
        { label: 'Material Status', value: observationEntry?.materialStatus || '' },
        { label: 'Test Allotted to', value: (observationEntry?.productTestSampleMapping?.user?.firstName || '') + ' ' + (observationEntry?.productTestSampleMapping?.user?.lastName || '') },
        { label: 'Sample Storage condition(Before & After Testing if any)', value: observationEntry?.sampleStorageCondition || '' },
        { label: 'No. of Samples', value: Object.values(grouped).flatMap((g) => Array.isArray(g.sampleIds) ? g.sampleIds : []).length.toString() },
    ];
    const colWidths1 = [120, 150, 120, 150];
    const tableX = tableLeft;
    let tableY = y;
    const cellPadding = 4;
    const getCellHeight = (text, width, font, fontSize) => {
        doc.font(font).fontSize(fontSize);
        return doc.heightOfString(text, { width: width - 2 * cellPadding }) + 2 * cellPadding;
    };
    for (let i = 0; i < tDetailsFields.length; i += 2) {
        const left = tDetailsFields[i];
        const right = tDetailsFields[i + 1];
        const leftLabelH = getCellHeight(left.label, colWidths1[0], 'Calibri-Bold', 10);
        const leftValueH = getCellHeight(left.value, colWidths1[1], 'Calibri', 10);
        const rightLabelH = right ? getCellHeight(right.label, colWidths1[2], 'Calibri-Bold', 10) : 0;
        const rightValueH = right ? getCellHeight(right.value, colWidths1[3], 'Calibri', 10) : 0;
        const rowHeight = Math.max(leftLabelH, leftValueH, rightLabelH, rightValueH);
        let rx = tableX;
        doc.rect(rx, tableY, colWidths1[0], rowHeight).stroke();
        rx += colWidths1[0];
        doc.rect(rx, tableY, colWidths1[1], rowHeight).stroke();
        rx += colWidths1[1];
        doc.rect(rx, tableY, colWidths1[2], rowHeight).stroke();
        rx += colWidths1[2];
        doc.rect(rx, tableY, colWidths1[3], rowHeight).stroke();
        rx = tableX;
        doc.font('Calibri-Bold').fontSize(10).text(left.label, rx + cellPadding, tableY + cellPadding, { width: colWidths1[0] - 2 * cellPadding });
        rx += colWidths1[0];
        doc.font('Calibri').fontSize(10).text(left.value, rx + cellPadding, tableY + cellPadding, { width: colWidths1[1] - 2 * cellPadding, align: 'justify' });
        if (right) {
            rx += colWidths1[1];
            doc.font('Calibri-Bold').fontSize(10).text(right.label, rx + cellPadding, tableY + cellPadding, { width: colWidths1[2] - 2 * cellPadding });
            rx += colWidths1[2];
            doc.font('Calibri').fontSize(10).text(right.value, rx + cellPadding, tableY + cellPadding, { width: colWidths1[3] - 2 * cellPadding, align: 'justify' });
        }
        tableY += rowHeight;
    }
    y = tableY + 20;
    const testTableRows = Object.values(grouped).map((group, idx) => [
        `${idx + 1}`, group.testName, group.testMethod, group.unit, group.sampleIds.filter(Boolean).sort().join('\n')
    ]);
    const testTableCols = [40, 150, 150, 40, 160];
    const testTableHeader = ['Sl. No.', 'Test Description', 'Method of Test', 'Units', 'Sample ID'];
    const testTableData = [testTableHeader, ...testTableRows];
    const testTableHeight = drawSimpleTable(doc, testTableData, tableLeft, y, testTableCols, 20, '#f0f0f0', 'center');
    y += testTableHeight + 8;
    const witnessBlockHeight = 20 + 16 + 16 + 16 + 20;
    const tocrBottomMargin = 40;
    const tocrPageLimit = pageHeight - tocrBottomMargin - 60;
    if (y + witnessBlockHeight > tocrPageLimit) {
        doc.addPage();
        y = 30;
    }
    doc.font('Calibri-Bold').fontSize(10).text('Witness Name & Designation:', tableLeft, y);
    doc.font('Calibri').fontSize(10).text(formatWitnessNameAndDesignation(data.contractData.witnessName, data.contractData.witnessDesignation), tableLeft + 130, y);
    y += 20;
    doc.font('Calibri-Bold').fontSize(10).text('Witness Contact Details:', tableLeft, y);
    y += 16;
    doc.font('Calibri-Bold').fontSize(10).text('Email ID:', tableLeft + 20, y);
    doc.font('Calibri').fontSize(10).text(data.contractData.witnessEmailId || '', tableLeft + 80, y);
    y += 16;
    doc.font('Calibri-Bold').fontSize(10).text('Contact No:', tableLeft + 20, y);
    doc.font('Calibri').fontSize(10).text(data.contractData.witnessContactNo || '', tableLeft + 80, y);
    y += 16;
    doc.font('Calibri-Bold').fontSize(10).text('Details:', tableLeft + 20, y);
    doc.font('Calibri').fontSize(10).text(data.contractData.witnessDetails || '', tableLeft + 80, y);
    y += 20;
    const reviewedByText = 'Reviewed by,';
    const managerText = 'Technical Manager';
    const rightMargin = 20;
    const bottomMargin = 40;
    const reviewedByY = pageHeight - bottomMargin - 20;
    const managerY = reviewedByY + 25;
    const reviewedByWidth = doc.widthOfString(reviewedByText);
    const managerWidth = doc.widthOfString(managerText);
    const reviewedByX = pageWidth - rightMargin - reviewedByWidth - 100;
    const managerX = pageWidth - rightMargin - managerWidth - 100;
    doc.font('Calibri').fontSize(12).text(reviewedByText, reviewedByX, reviewedByY);
    doc.text(managerText, managerX, managerY);
}
async function generateObservationEntryPage(doc, data, observationEntries) {
    doc.strokeColor('#A0A0A0');
    doc.lineWidth(0.5);
    const pageWidth = 595;
    const tableLeft = 28;
    let y = 20;
    const observationEntry = observationEntries[0];
    const colWidths = [100, 110, 90, 180, 60];
    const titleRowHeight = 28;
    const rowHeight = 45;
    const row2Height = 22;
    const headerHeight = titleRowHeight + rowHeight + row2Height;
    doc.rect(tableLeft, y, colWidths.reduce((a, b) => a + b, 0), headerHeight).stroke();
    let x = tableLeft;
    const titleCellWidth = colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3];
    doc.rect(x, y, titleCellWidth, titleRowHeight).stroke();
    doc.font('Calibri-Bold').fontSize(11).text('Observation Entry', x, y + 6, { width: titleCellWidth, align: 'center', lineGap: 1 });
    x += titleCellWidth;
    doc.rect(x, y, colWidths[4], headerHeight).stroke();
    try {
        const logoSize = colWidths[4] - 10;
        doc.image(data.systemSettings?.consultancyDetails?.logo, x + (colWidths[4] - logoSize) / 2, y + (headerHeight - logoSize) / 2, { width: logoSize, height: logoSize });
    }
    catch (e) {
        const logoSize = colWidths[4] - 10;
        doc.rect(x + (colWidths[4] - logoSize) / 2, y + (headerHeight - logoSize) / 2, logoSize, logoSize).stroke();
        doc.fontSize(8).text('LOGO', x + 10, y + headerHeight / 2 - 4);
    }
    y += titleRowHeight;
    x = tableLeft;
    doc.rect(x, y, colWidths[0], rowHeight).stroke();
    doc.font('Calibri-Bold').fontSize(11).text('Form no.', x + 4, y + 6, { width: colWidths[0] - 8 });
    x += colWidths[0];
    doc.rect(x, y, colWidths[1], rowHeight).stroke();
    doc.font('Calibri').fontSize(10).text(configuration_json_1.default.formNumbers.observationEntry || '', x + 4, y + 6, { width: colWidths[1] - 8 });
    x += colWidths[1];
    doc.rect(x, y, colWidths[2], rowHeight + row2Height).stroke();
    doc.font('Calibri-Bold').fontSize(11).text('Department &\nOrganization', x + 4, y + 6, { width: colWidths[2] - 8 });
    x += colWidths[2];
    doc.rect(x, y, colWidths[3], rowHeight + row2Height).stroke();
    doc.font('Calibri').fontSize(10).text('Centre for Civil Testing & Consultancy\nThiagarajar Polytechnic College, Salem', x + 4, y + 6, { width: colWidths[3] - 8, lineGap: 1 });
    y += rowHeight;
    x = tableLeft;
    const revisionNoValue = [data.contractData.revisionNo, data.contractData.revisionDate].filter(v => v !== undefined && v !== null && String(v).trim() !== '').join(' - ');
    const issueNoValue = [data.contractData.issueNo, data.contractData.issueDate].filter(v => v !== undefined && v !== null && String(v).trim() !== '').join(' - ');
    doc.rect(x, y, colWidths[0], row2Height).stroke();
    doc.font('Calibri-Bold').fontSize(11).text('Revision No./Date', x + 4, y + 6, { width: colWidths[0] - 8 });
    x += colWidths[0];
    doc.rect(x, y, colWidths[1], row2Height).stroke();
    doc.font('Calibri').fontSize(10).text(revisionNoValue, x + 4, y + 6, { width: colWidths[1] - 8 });
    x += colWidths[1];
    doc.rect(x, y, colWidths[2], row2Height).stroke();
    doc.font('Calibri-Bold').fontSize(11).text('Issue No./ Date', x + 4, y + 6, { width: colWidths[2] - 8 });
    x += colWidths[2];
    doc.rect(x, y, colWidths[3], row2Height).stroke();
    doc.font('Calibri').fontSize(10).text(issueNoValue, x + 4, y + 6, { width: colWidths[3] - 8 });
    y += row2Height;
    const testDetailColWidths = [100, 110, 90, 75, 105, 60];
    x = tableLeft;
    let row1Height = Math.max(getTextHeight(doc, 'Date of test starting', { width: testDetailColWidths[0] - 8, font: 'Calibri-Bold', fontSize: 11 }), getTextHeight(doc, formatDateDMY(String(observationEntry.testStartDate)) || '', { width: testDetailColWidths[0] - 8, font: 'Calibri', fontSize: 10 }), getTextHeight(doc, 'Date of test completion', { width: testDetailColWidths[2] - 8, font: 'Calibri-Bold', fontSize: 11 })) + 8;
    row1Height = Math.max(row1Height, 22);
    doc.rect(x, y, testDetailColWidths[0], row1Height).stroke();
    doc.font('Calibri-Bold').fontSize(11).text('Date of test starting', x + 4, y + 4, { width: testDetailColWidths[0] - 8 });
    x += testDetailColWidths[0];
    doc.rect(x, y, testDetailColWidths[1], row1Height).stroke();
    doc.font('Calibri').fontSize(10).text(formatDateDMY(String(observationEntry.testStartDate)) || '', x + 4, y + 4, { width: testDetailColWidths[1] - 8 });
    x += testDetailColWidths[1];
    doc.rect(x, y, testDetailColWidths[2], row1Height).stroke();
    doc.font('Calibri-Bold').fontSize(11).text('Date of test completion', x + 4, y + 4, { width: testDetailColWidths[2] - 8 });
    x += testDetailColWidths[2];
    doc.rect(x, y, testDetailColWidths[3], row1Height).stroke();
    doc.font('Calibri').fontSize(10).text(formatDateDMY(String(observationEntry.testCompletionDate)) || '', x + 4, y + 4, { width: testDetailColWidths[3] - 8 });
    x += testDetailColWidths[3];
    doc.rect(x, y, testDetailColWidths[4], row1Height).stroke();
    doc.font('Calibri-Bold').fontSize(11).text('Temperature', x + 4, y + 4, { width: testDetailColWidths[4] - 8 });
    x += testDetailColWidths[4];
    doc.rect(x, y, testDetailColWidths[5], row1Height).stroke();
    const tempValue = observationEntries[0].temperature
        ? (observationEntries[0].temperature.includes('Â°C') ? observationEntries[0].temperature : `${observationEntries[0].temperature}Â°C`)
        : '';
    doc.font('Calibri').fontSize(10).text(tempValue, x + 4, y + 4, { width: testDetailColWidths[5] - 8 });
    y += row1Height;
    x = tableLeft;
    let row2HeightDyn = Math.max(22, getTextHeight(doc, 'Staff Id', { width: testDetailColWidths[0] - 8, font: 'Calibri-Bold', fontSize: 11 }) + 15);
    doc.rect(x, y, testDetailColWidths[0], row2HeightDyn).stroke();
    doc.font('Calibri-Bold').fontSize(11).text('Staff Id', x + 4, y + 4, { width: testDetailColWidths[0] - 8 });
    x += testDetailColWidths[0];
    doc.rect(x, y, testDetailColWidths[1], row2HeightDyn).stroke();
    doc.font('Calibri').fontSize(10).text(observationEntries[0].staffId || '', x + 4, y + 4, { width: testDetailColWidths[1] - 8 });
    x += testDetailColWidths[1];
    doc.rect(x, y, testDetailColWidths[2], row2HeightDyn).stroke();
    doc.font('Calibri-Bold').fontSize(11).text('Code No.', x + 4, y + 4, { width: testDetailColWidths[2] - 8 });
    x += testDetailColWidths[2];
    doc.rect(x, y, testDetailColWidths[3], row2HeightDyn).stroke();
    doc.font('Calibri').fontSize(10).text(observationEntries[0].codeNo || '', x + 4, y + 4, { width: testDetailColWidths[3] - 8 });
    x += testDetailColWidths[3];
    doc.rect(x, y, testDetailColWidths[4], row2HeightDyn).stroke();
    doc.font('Calibri-Bold').fontSize(11).text('Humidity', x + 4, y + 4, { width: testDetailColWidths[4] - 8 });
    x += testDetailColWidths[4];
    doc.rect(x, y, testDetailColWidths[5], row2HeightDyn).stroke();
    const humidityValue = observationEntries[0].humidity
        ? (observationEntries[0].humidity.includes('%') ? observationEntries[0].humidity : `${observationEntries[0].humidity}%`)
        : '';
    doc.font('Calibri').fontSize(8.5).text(humidityValue, x + 4, y + 4, { width: testDetailColWidths[5] - 8, align: 'left' });
    y += row2HeightDyn;
    x = tableLeft;
    const testNameValue = observationEntry.productTestSampleMapping?.test?.name || '';
    const testNameCellWidth = testDetailColWidths[1] + testDetailColWidths[2] - 8;
    let row3Height = Math.max(22, getTextHeight(doc, 'Test name', { width: testDetailColWidths[0] - 8, font: 'Calibri-Bold', fontSize: 11 }), getTextHeight(doc, testNameValue, { width: testNameCellWidth, font: 'Calibri', fontSize: 10 })) + 8;
    doc.rect(x, y, testDetailColWidths[0], row3Height).stroke();
    doc.font('Calibri-Bold').fontSize(11).text('Test name', x + 4, y + 4, { width: testDetailColWidths[0] - 8 });
    x += testDetailColWidths[0];
    doc.rect(x, y, testDetailColWidths[1] + testDetailColWidths[2], row3Height).stroke();
    doc.font('Calibri').fontSize(10).text(testNameValue, x + 4, y + 4, { width: testNameCellWidth });
    x += testDetailColWidths[1] + testDetailColWidths[2];
    const compValueWidth = testDetailColWidths[3] + testDetailColWidths[4] + testDetailColWidths[5];
    doc.rect(x, y, compValueWidth, row3Height).stroke();
    doc.font('Calibri').fontSize(10).text(observationEntry.productTestSampleMapping?.product?.name || '', x + 4, y + 4, { width: compValueWidth - 8 });
    y += row3Height;
    x = tableLeft;
    let row4Height = Math.max(15, getTextHeight(doc, 'Method of Test', { width: testDetailColWidths[0] - 8, font: 'Calibri-Bold', fontSize: 11 }), getTextHeight(doc, 'Date of Casting and \nGrade of Concrete', { width: testDetailColWidths[2] + 17, font: 'Calibri-Bold', fontSize: 11 }), getTextHeight(doc, data.contractData.dateOfCastingAndGradeOfConcrete || '', { width: testDetailColWidths[2] + 27, font: 'Calibri', fontSize: 10 })) + 4;
    doc.rect(x, y, testDetailColWidths[0], row4Height).stroke();
    doc.font('Calibri-Bold').fontSize(11).text('Method of Test', x + 4, y + 4, { width: testDetailColWidths[0] - 8 });
    x += testDetailColWidths[0];
    doc.rect(x, y, testDetailColWidths[1] + testDetailColWidths[2], row4Height).stroke();
    doc.font('Calibri').fontSize(10).text(observationEntry.productTestSampleMapping?.test?.testingMethod || '', x + 4, y + 4, { width: testDetailColWidths[1] + testDetailColWidths[2] - 8 });
    x += testDetailColWidths[1] + testDetailColWidths[2];
    doc.rect(x, y, testDetailColWidths[2] + 25, row4Height).stroke();
    doc.font('Calibri-Bold').fontSize(11).text('Date of Casting and \nGrade of Concrete', x + 4, y + 4, { width: testDetailColWidths[2] + 17 });
    x += testDetailColWidths[2] + 25;
    doc.rect(x, y, testDetailColWidths[2] + 35, row4Height).stroke();
    doc.font('Calibri').fontSize(10).text(data.contractData.dateOfCastingAndGradeOfConcrete || '', x + 4, y + 4, { width: testDetailColWidths[2] + 27 });
    y += row4Height + 10;
    const firstEntry = observationEntries[0];
    const resultHeaders = firstEntry.result.map((r) => r.displayName);
    const tableHeaders = ['Sample ID', ...resultHeaders];
    const tableRows = observationEntries.map((entry) => [
        String(entry.productTestSampleMapping.sample.sampleId || ''),
        ...entry.result.map((r) => (0, observation_value_1.formatObservationValue)(r.value, r.type))
    ]);
    tableRows.sort((a, b) => {
        const aNum = parseFloat(a[0]);
        const bNum = parseFloat(b[0]);
        if (!isNaN(aNum) && !isNaN(bNum))
            return aNum - bNum;
        return String(a[0]).localeCompare(String(b[0]), undefined, { numeric: true, sensitivity: 'base' });
    });
    const averages = (0, observation_average_1.calculateEntryPageAverageRow)(firstEntry.result.map(result => result.field), tableRows, data.reportSchemas, firstEntry.productTestSampleMapping.test.id, firstEntry.schemaId, firstEntry.productTestSampleMapping.product.id);
    const tableDataWithAverage = [tableHeaders, ...tableRows];
    if (averages)
        tableDataWithAverage.push(averages);
    const firstAverageColumn = averages?.findIndex((value, index) => index > 0 && value !== '') ?? -1;
    const averageLabelSpan = averages ? (firstAverageColumn > 0 ? firstAverageColumn : averages.length) : 1;
    const totalTableWidth = 540;
    const colWidthsAvgTable = calculateColumnWidths(doc, tableDataWithAverage, 60, 150);
    const totalCalculatedWidth = colWidthsAvgTable.reduce((sum, w) => sum + w, 0);
    const scaleFactor = totalTableWidth / totalCalculatedWidth;
    const adjustedColWidths = colWidthsAvgTable.map((w) => Math.round(w * scaleFactor));
    const entryTableHeight = drawSimpleTable(doc, tableDataWithAverage, tableLeft, y, adjustedColWidths, 20, '#f0f0f0', 'center', averageLabelSpan);
    y += entryTableHeight + 10;
    const bottomMargin = 40;
    const managerY = doc.page.height - bottomMargin - 20 + 25;
    const managerText = 'Reviewed by';
    const managerWidth = doc.widthOfString(managerText);
    doc.font('Calibri').fontSize(10).text('Tested by', tableLeft, managerY);
    doc.text(managerText, pageWidth - 20 - managerWidth - 100, managerY);
}
function calculateColumnWidths(doc, data, minWidth = 60, maxWidth = 150) {
    const numCols = data[0].length;
    const colWidths = new Array(numCols).fill(minWidth);
    data.forEach(row => {
        row.forEach((cell, colIndex) => {
            let cellWidth = Math.min(Math.max(doc.font('Calibri').fontSize(8).widthOfString(String(cell || '')) + 16, minWidth), maxWidth);
            if (isNaN(cellWidth))
                cellWidth = minWidth;
            colWidths[colIndex] = Math.max(colWidths[colIndex], cellWidth);
        });
    });
    const totalWidth = colWidths.reduce((sum, w) => sum + w, 0);
    const availableWidth = doc.page.width - 100;
    if (totalWidth > availableWidth) {
        const ratio = availableWidth / totalWidth;
        colWidths.forEach((w, i) => { colWidths[i] = Math.floor(w * ratio); });
    }
    return colWidths;
}
function formatDateDMY(dateStr) {
    if (!dateStr)
        return '';
    const str = String(dateStr).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        const [yyyy, mm, dd] = str.split('-');
        return `${dd}.${mm}.${yyyy}`;
    }
    const dmy = str.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/);
    if (dmy)
        return `${dmy[1]}.${dmy[2]}.${dmy[3]}`;
    const date = new Date(str);
    if (isNaN(date.getTime()))
        return '';
    const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
    return `${String(istDate.getUTCDate()).padStart(2, '0')}.${String(istDate.getUTCMonth() + 1).padStart(2, '0')}.${istDate.getUTCFullYear()}`;
}
function formatWitnessNameAndDesignation(name, designation) {
    const hasName = name && name.trim() !== '';
    const hasDesignation = designation && designation.trim() !== '';
    let result = '';
    if (hasName)
        result += name;
    if (hasDesignation)
        result += ` & ${designation}`;
    return result;
}
async function TestReportPage(doc, data, observationEntries, reportData, includeHeader = false, requestId, referrer) {
    doc.strokeColor('#A0A0A0');
    doc.lineWidth(0.5);
    const margin = 20;
    const rightMargin = 35;
    const tableWidth = 540;
    const pageWidth = 595.28;
    const pageHeight = 842;
    const tableLeft = 28;
    let y = margin;
    const logoSize = 50;
    const logoY = y - 15;
    try {
        doc.image(data.systemSettings?.consultancyDetails?.logo, margin, logoY, { width: logoSize, height: logoSize });
    }
    catch (e) {
        doc.rect(margin, logoY, logoSize, logoSize).stroke();
        doc.fontSize(8).text('LOGO', margin + 15, logoY + logoSize / 2 - 4);
    }
    if (data.contractData.reportType === 'NABL') {
        try {
            doc.image(data.systemSettings?.consultancyDetails?.nablLogo, pageWidth - rightMargin - logoSize - 20, logoY, { width: logoSize + 30, height: logoSize });
        }
        catch (e) {
            doc.rect(pageWidth - rightMargin - logoSize, logoY, logoSize, logoSize).stroke();
            doc.fontSize(8).text('NABL', pageWidth - rightMargin - logoSize + 15, logoY + logoSize / 2 - 4);
        }
    }
    else {
        try {
            doc.image(data.systemSettings?.consultancyDetails?.nonNablLogo, pageWidth - rightMargin - logoSize - 20, logoY, { width: logoSize + 30, height: logoSize });
        }
        catch (e) {
            doc.rect(pageWidth - rightMargin - logoSize, logoY, logoSize, logoSize).stroke();
            doc.fontSize(8).text('NON-NABL', pageWidth - rightMargin - logoSize + 15, logoY + logoSize / 2 - 4);
        }
    }
    y = y - 10;
    if (includeHeader) {
        doc.font('Calibri-Bold').fontSize(13).text('THIAGARAJAR POLYTECHNIC COLLEGE', tableLeft, y, { width: tableWidth, align: 'center' });
        y += 15;
    }
    if (data.contractData.reportType === 'NABL') {
        doc.font('Calibri-Bold').fontSize(10).text('CENTRE FOR CIVIL TESTING AND CONSULTANCY', tableLeft, y, { width: tableWidth, align: 'center' });
        y += 12;
        doc.font('Calibri-Bold').fontSize(7).text('NABL Accredited Laboratory (A Constituent Board of Quality Council of India, Govt of India)', tableLeft, y, { width: tableWidth, align: 'center' });
    }
    else {
        doc.font('Calibri-Bold').fontSize(8).text('| Govt.Aided | Autonomous |', tableLeft, y, { width: tableWidth, align: 'center' });
        y += 12;
        doc.font('Calibri-Bold').fontSize(10).text('CENTRE FOR CIVIL TESTING AND CONSULTANCY', tableLeft, y, { width: tableWidth, align: 'center' });
    }
    y = Math.max(y + 14, logoY + logoSize + 5);
    doc.font('Calibri-Bold').fontSize(9).text('TEST REPORT', tableLeft, y, { width: tableWidth, align: 'center' });
    if (data.contractData.reportType === 'NABL') {
        doc.font('Calibri').fontSize(9).text(formatDateDMY(reportData.endDate) || '', tableLeft, y + 1, { width: tableWidth, align: 'right' });
    }
    y += 25;
    const colWidths = [130, 140, 130, 140];
    const detailsRowPairs = [
        [
            { label: 'Test Report No.', value: reportData.finalReportNo },
            data.contractData.reportType === 'NABL'
                ? { label: 'ULR No.', value: reportData.finalUlrNo }
                : { label: 'Date of Test Report', value: formatDateDMY(reportData.endDate) || '' },
        ],
        [
            { label: 'Customer Address & Contact Details', value: `${data.contractData.customerName} \n${data.contractData.address}` },
            { label: 'Description of sample received', value: Array.isArray(reportData.productNames) ? reportData.productNames.join(', ') : (reportData.productNames || '') },
        ],
        [
            { label: 'Customer letter No. & Date', value: (data.contractData.customerLetterNoDate || '').split('-').map(s => s.trim()).filter(s => s !== '').join(' - ') },
            { label: 'Sample Condition', value: data.contractData.sampleCondition },
        ],
        [
            { label: 'Name of Work (As Mentioned by Addressee)', value: data.contractData.workName },
            { label: 'Details of Machine', value: data.contractData.detailsOfMachine },
        ],
        [
            { label: '', value: '' },
            { label: 'Date of Calibration', value: data.contractData.dateOfCalibration },
        ],
        [
            { label: '', value: '' },
            { label: 'Loading Range', value: data.contractData.loadingRange },
        ],
        [
            { label: 'Date of Casting and Grade of Concrete (As Mentioned by Addressee)', value: data.contractData.dateOfCastingAndGradeOfConcrete },
            { label: 'Curing Condition (As Mentioned by Addressee)', value: data.contractData.curingCondition },
        ],
        [
            { label: 'Sample', value: data.contractData.sizeOfMetal },
            { label: 'Location (As Mentioned by Addressee)', value: data.contractData.location },
        ],
        [
            { label: 'Source', value: data.contractData.source },
            { label: 'Shape', value: data.contractData.shapeOfBlock },
        ],
        [
            { label: 'Environmental Condition', value: data.contractData.environmentCondition },
            { label: 'Brand Name', value: data.contractData.brandName },
        ],
        [
            { label: '', value: '' },
            { label: 'Name of Supplier', value: data.contractData.nameOfSupplier || '' },
        ],
        [
            { label: 'Humidity', value: data.contractData.humidity },
            { label: 'Temperature', value: data.contractData.temperature },
        ],
        [
            { label: '', value: '' },
            { label: 'Sample received on', value: data.contractData.sampleReceivedDate },
        ],
        [
            { label: '', value: '' },
            { label: 'Start of Test', value: formatDateDMY(reportData.startDate) },
        ],
        [
            { label: '', value: '' },
            { label: 'End of Test', value: formatDateDMY(reportData.endDate) },
        ],
        ...(reportData.productShortForm === 'CC' || reportData.productShortForm === 'ST' ? [[
                { label: 'Testing Method', value: Array.isArray(reportData.testingMethod) ? reportData.testingMethod.join(', ') : (reportData.testingMethod || '') },
                { label: '', value: '' },
            ]] : []),
    ];
    const isEmpty = (v) => v === undefined || v === null || String(v).trim() === '';
    const detailsRows = detailsRowPairs
        .filter(([left, right]) => !isEmpty(left.value) || !isEmpty(right.value))
        .map(([left, right]) => [
        isEmpty(left.value) ? { label: '', value: '' } : left,
        isEmpty(right.value) ? { label: '', value: '' } : right,
    ]);
    const isTestDateLabel = (label) => label === 'Start of Test' || label === 'End of Test';
    const dateLabelWidth = 40;
    const rowHeights = detailsRows.map(([left, right]) => {
        const leftEmpty = !left.label && isEmpty(left.value);
        const rightEmpty = !right.label && isEmpty(right.value);
        const lLabelH = getTextHeight(doc, left.label, { width: colWidths[0] - 8, font: 'Calibri-Bold', fontSize: 10 });
        const lValueH = getTextHeight(doc, String(left.value ?? ''), { width: colWidths[1] - 8, font: 'Calibri', fontSize: 9 });
        const rLabelH = getTextHeight(doc, right.label, { width: colWidths[2] - (isTestDateLabel(right.label) ? dateLabelWidth : 0) - 8, font: 'Calibri-Bold', fontSize: 10 });
        const rValueH = getTextHeight(doc, String(right.value ?? ''), { width: colWidths[3] - 8, font: 'Calibri', fontSize: 9 });
        if (leftEmpty)
            return Math.max(rLabelH + 3, rValueH + 3, 10);
        if (rightEmpty)
            return Math.max(lLabelH + 3, lValueH + 3, 10);
        return Math.max(lLabelH + 3, lValueH + 3, rLabelH + 3, rValueH + 3, 14);
    });
    const isLeftEmpty = (r) => !r[0].label && isEmpty(r[0].value);
    const isRightEmpty = (r) => !r[1].label && isEmpty(r[1].value);
    const buildSpans = (emptyCheck) => {
        const spans = [];
        let i = 0;
        while (i < detailsRows.length) {
            let count = 1;
            if (!emptyCheck(detailsRows[i])) {
                while (i + count < detailsRows.length && emptyCheck(detailsRows[i + count]) && !(emptyCheck === isRightEmpty && isTestDateLabel(detailsRows[i][1].label)))
                    count++;
            }
            spans.push({ start: i, count, totalHeight: rowHeights.slice(i, i + count).reduce((a, b) => a + b, 0) });
            i += count;
        }
        return spans;
    };
    const leftSpans = buildSpans(isLeftEmpty);
    const rightSpans = buildSpans(isRightEmpty);
    const detailsStartY = y - 10;
    let lY = detailsStartY;
    for (const span of leftSpans) {
        const [left] = detailsRows[span.start];
        let lx = tableLeft;
        doc.rect(lx, lY, colWidths[0], span.totalHeight).stroke();
        if (left.label)
            doc.font('Calibri-Bold').fontSize(10).text(left.label, lx + 4, lY + 3, { width: colWidths[0] - 8, align: 'left' });
        lx += colWidths[0];
        doc.rect(lx, lY, colWidths[1], span.totalHeight).stroke();
        if (!isEmpty(left.value))
            doc.font('Calibri').fontSize(9).text(String(left.value), lx + 4, lY + 3, { width: colWidths[1] - 8, align: 'left' });
        lY += span.totalHeight;
    }
    let rY = detailsStartY;
    for (const span of rightSpans) {
        const [, right] = detailsRows[span.start];
        let rx = tableLeft + colWidths[0] + colWidths[1];
        if (isTestDateLabel(right.label)) {
            const firstDateIndex = detailsRows.findIndex(([, pair]) => isTestDateLabel(pair.label));
            if (span.start === firstDateIndex) {
                const dateHeight = detailsRows.reduce((height, [, pair], index) => height + (isTestDateLabel(pair.label) ? rowHeights[index] : 0), 0);
                doc.rect(rx, rY, dateLabelWidth, dateHeight).stroke();
                doc.font('Calibri-Bold').fontSize(10);
                const labelHeight = doc.heightOfString('Date', { width: dateLabelWidth - 8 });
                doc.text('Date', rx + 4, rY + (dateHeight - labelHeight) / 2, { width: dateLabelWidth - 8, align: 'center' });
            }
            doc.rect(rx + dateLabelWidth, rY, colWidths[2] - dateLabelWidth, span.totalHeight).stroke();
            doc.font('Calibri-Bold').fontSize(10).text(right.label, rx + dateLabelWidth + 4, rY + 3, { width: colWidths[2] - dateLabelWidth - 8, align: 'left' });
        }
        else {
            doc.rect(rx, rY, colWidths[2], span.totalHeight).stroke();
            if (right.label)
                doc.font('Calibri-Bold').fontSize(10).text(right.label, rx + 4, rY + 3, { width: colWidths[2] - 8, align: 'left' });
        }
        rx += colWidths[2];
        doc.rect(rx, rY, colWidths[3], span.totalHeight).stroke();
        if (!isEmpty(right.value))
            doc.font('Calibri').fontSize(9).text(String(right.value), rx + 4, rY + 3, { width: colWidths[3] - 8, align: 'left' });
        rY += span.totalHeight;
    }
    y = lY + 12;
    doc.font('Calibri-Bold').fontSize(9).text('TEST RESULTS', tableLeft, y, { width: tableWidth, align: 'center' });
    y += 16;
    const sieveAnalysisProducts = ['coarse aggregate', 'fine aggregate', 'paver block'];
    const isSieveProduct = Array.isArray(reportData.productNames) &&
        reportData.productNames.some((name) => typeof name === 'string' &&
            sieveAnalysisProducts.some((p) => name.toLowerCase().includes(p)));
    if (reportData && reportData.observationEntryHeaders?.length > 0 && reportData.observationEntryRows?.length > 0) {
        if (isSieveProduct) {
            const testNameValue = Array.isArray(reportData.testNames)
                ? reportData.testNames.join(', ')
                : reportData.testNames || '';
            const testMethodValue = Array.isArray(reportData.testingMethod)
                ? reportData.testingMethod.join(', ')
                : reportData.testingMethod || '';
            const infoColWidths = [130, 140, 130, 140];
            const rowH = Math.max(14, getTextHeight(doc, 'Name of the Test', { width: infoColWidths[0] - 8, font: 'Calibri-Bold', fontSize: 8 }) + 5, getTextHeight(doc, testNameValue, { width: infoColWidths[1] - 8, font: 'Calibri', fontSize: 8 }) + 5, getTextHeight(doc, 'Testing method', { width: infoColWidths[2] - 8, font: 'Calibri-Bold', fontSize: 8 }) + 5, getTextHeight(doc, testMethodValue, { width: infoColWidths[3] - 8, font: 'Calibri', fontSize: 8 }) + 5);
            let ix = tableLeft;
            doc.rect(ix, y, infoColWidths[0], rowH).stroke();
            doc.font('Calibri-Bold').fontSize(8).text('Name of the Test', ix + 4, y + 3, { width: infoColWidths[0] - 8 });
            ix += infoColWidths[0];
            doc.rect(ix, y, infoColWidths[1], rowH).stroke();
            doc.font('Calibri').fontSize(8).text(testNameValue, ix + 4, y + 3, { width: infoColWidths[1] - 8 });
            ix += infoColWidths[1];
            doc.rect(ix, y, infoColWidths[2], rowH).stroke();
            doc.font('Calibri-Bold').fontSize(8).text('Testing method', ix + 4, y + 3, { width: infoColWidths[2] - 8 });
            ix += infoColWidths[2];
            doc.rect(ix, y, infoColWidths[3], rowH).stroke();
            doc.font('Calibri').fontSize(8).text(testMethodValue, ix + 4, y + 3, { width: infoColWidths[3] - 8 });
            y += rowH;
        }
        const fixedTableWidth = 540;
        const maxColWidth = 180;
        const padding = 4;
        const getTextWidthObs = (text, font, fontSize, widthLimit) => {
            doc.font(font).fontSize(fontSize);
            return Math.min(doc.widthOfString(text, { width: widthLimit }), widthLimit);
        };
        let colWidthsArrObs = reportData.observationEntryHeaders.map((header, colIdx) => {
            let maxWidth = getTextWidthObs(header.label, 'Calibri-Bold', 10, maxColWidth);
            for (let rowIdx = 0; rowIdx < reportData.observationEntryRows.length; rowIdx++) {
                let value = reportData.observationEntryRows[rowIdx][header.id];
                if (Array.isArray(value))
                    value = value.join(', ');
                value = value !== undefined && value !== null ? String(value) : '';
                const valueWidth = getTextWidthObs(value, 'Calibri', 10, maxColWidth);
                if (valueWidth > maxWidth)
                    maxWidth = valueWidth;
            }
            return Math.max(60, Math.min(maxColWidth, Math.ceil(maxWidth + padding)));
        });
        const lastColIdx = colWidthsArrObs.length - 1;
        if (lastColIdx >= 0)
            colWidthsArrObs[lastColIdx] = 60;
        const otherColsTotal = colWidthsArrObs.slice(0, lastColIdx).reduce((a, b) => a + b, 0);
        const scale = (fixedTableWidth - 60) / (otherColsTotal || 1);
        for (let i = 0; i < lastColIdx; i++)
            colWidthsArrObs[i] = Math.floor(colWidthsArrObs[i] * scale);
        const newTotal = colWidthsArrObs.reduce((a, b) => a + b, 0);
        if (newTotal < fixedTableWidth)
            colWidthsArrObs[lastColIdx] += (fixedTableWidth - newTotal);
        const tableData = [reportData.observationEntryHeaders.map((h) => h.label)];
        for (const row of reportData.observationEntryRows) {
            const tableRow = [];
            for (const header of reportData.observationEntryHeaders) {
                let value = row[header.id];
                if (Array.isArray(value))
                    value = value.join(', ');
                tableRow.push(value !== undefined && value !== null ? String(value) : '');
            }
            tableData.push(tableRow);
        }
        const averagesObs = (0, observation_average_1.calculateObservationAverageRow)(reportData.observationEntryHeaders, reportData.observationEntryRows, reportData.schema?.TestReportSchema);
        if (averagesObs)
            tableData.push(averagesObs);
        const firstAverageColumn = averagesObs?.findIndex((value, index) => index > 0 && value !== '') ?? -1;
        const averageLabelSpan = averagesObs ? (firstAverageColumn > 0 ? firstAverageColumn : averagesObs.length) : 1;
        const tableHeightObs = drawSimpleTable(doc, tableData, tableLeft, y + 3, colWidthsArrObs, 20, '#f0f0f0', 'center', averageLabelSpan);
        y += tableHeightObs + 5;
    }
    let containsSteel = false;
    if (Array.isArray(reportData.productNames)) {
        containsSteel = reportData.productNames.some((name) => typeof name === 'string' && name.toLowerCase().includes('steel'));
    }
    let gradeOfSteel = '';
    let includeBendRebendTest = false;
    if (containsSteel && Array.isArray(observationEntries)) {
        for (const [, obs] of observationEntries) {
            const entries = obs;
            if (entries.length > 0 && entries[0].gradeOfSteel) {
                gradeOfSteel = entries[0].gradeOfSteel;
                includeBendRebendTest = entries[0].includeBendRebendTest === true;
                break;
            }
        }
    }
    if (reportData && reportData.headers?.length > 0 && reportData.dataRows?.length > 0) {
        const fixedTableWidth = 540;
        const maxColWidth = 180;
        const padding = 8;
        const getTextWidth = (text, font, fontSize, widthLimit) => {
            doc.font(font).fontSize(fontSize);
            return Math.min(doc.widthOfString(text, { width: widthLimit }), widthLimit);
        };
        let colWidthsArr = reportData.headers.map((header) => {
            let maxWidth = getTextWidth(header.label, 'Calibri-Bold', 10, maxColWidth);
            for (let rowIdx = 0; rowIdx < reportData.dataRows.length; rowIdx++) {
                let value = reportData.dataRows[rowIdx][header.id];
                if (Array.isArray(value))
                    value = value.join(', ');
                value = value !== undefined && value !== null ? String(value) : '';
                const valueWidth = getTextWidth(value, 'Calibri', 10, maxColWidth);
                if (valueWidth > maxWidth)
                    maxWidth = valueWidth;
            }
            return Math.max(60, Math.min(maxColWidth, Math.ceil(maxWidth + padding)));
        });
        let totalColWidth = colWidthsArr.reduce((a, b) => a + b, 0);
        if (totalColWidth !== fixedTableWidth) {
            const scale = fixedTableWidth / totalColWidth;
            colWidthsArr = colWidthsArr.map((w) => Math.floor(w * scale));
            const newTotal = colWidthsArr.reduce((a, b) => a + b, 0);
            if (newTotal < fixedTableWidth)
                colWidthsArr[colWidthsArr.length - 1] += (fixedTableWidth - newTotal);
        }
        const tableData = [reportData.headers.map((h) => h.label)];
        for (let rowIdx = 0; rowIdx < reportData.dataRows.length; rowIdx++) {
            const row = reportData.dataRows[rowIdx];
            const tableRow = [];
            for (const col of reportData.headers) {
                let value = row[col.id];
                if (Array.isArray(value))
                    value = value.join(', ');
                tableRow.push(value !== undefined && value !== null ? String(value) : '');
            }
            tableData.push(tableRow);
        }
        const tableHeight = drawSimpleTable(doc, tableData, tableLeft, y, colWidthsArr);
        y = y + tableHeight;
    }
    y += 5;
    if (containsSteel && gradeOfSteel) {
        const steelGradeStandards = data.systemSettings?.steelGradeStandards || {};
        const gradeStandard = steelGradeStandards[gradeOfSteel] || {};
        const yieldStress = gradeStandard.yieldStress || '';
        const ultimateTensileStress = gradeStandard.ultimateTensileStress || '';
        const elongation = gradeStandard.elongation || '';
        const steelLines = [
            `For ${gradeOfSteel} Grade (BIS Standards):`,
            ...(yieldStress ? [`i) Yield stress (Min) - ${yieldStress}`] : []),
            ...(ultimateTensileStress ? [`ii) Ultimate Tensile stress (Min) - ${ultimateTensileStress}`] : []),
            ...(elongation ? [`iii) % of Elongation (Min) - ${elongation}`] : []),
            ...(includeBendRebendTest ? ['Bend & Rebend: As per BIS specification the rods were found without cracking during bend and rebend and hence safe.'] : []),
        ];
        doc.font('Calibri-Italic').fontSize(9).text(steelLines.join('\n'), tableLeft, y, { width: tableWidth, align: 'left' });
        y += doc.heightOfString(steelLines.join('\n'), { width: tableWidth }) + 10;
    }
    const disclaimerLabelWidth = doc.font('Calibri-Bold').fontSize(9).widthOfString('Disclaimer:');
    doc.font('Calibri-Bold').fontSize(9).text('Disclaimer:', tableLeft, y);
    doc.font('Calibri-Italic').fontSize(9).text(' The test results are related only to the samples submitted for testing. The Addressee is requested to check up the results with their ', tableLeft + disclaimerLabelWidth, y, { width: tableWidth - disclaimerLabelWidth, align: 'left' });
    doc.font('Calibri-Italic').fontSize(9).text('norms noted in the work order conditions and as per relevant codes. This test report shall not be reproduced in part, without the permission of this laboratory. Any correction invalidates this test report. Balance sample, if any shall be discarded after 1 month from the date of issue of this Test Report, unless specified otherwise.', tableLeft, y + 11, { width: tableWidth, align: 'left' });
    y += 45;
    doc.font('Calibri-Bold').fontSize(9).text('** End of test report **', tableLeft, y, { width: tableWidth, align: 'center' });
    y += 20;
    doc.font('Calibri').fontSize(9).text('Test Conducted by', tableLeft, y);
    doc.font('Calibri').fontSize(9).text('Reviewed by', tableLeft, y, { width: tableWidth, align: 'right' });
    y += 26;
    doc.font('Calibri-Bold').fontSize(9).text('Authorized Signatory', tableLeft, y, { width: tableWidth, align: 'center' });
    y += 14;
    if (data.contractData.authorisedSignatory) {
        const signatories = data.contractData.authorisedSignatory.split('-').map(s => s.trim()).filter(Boolean);
        let signatoryY = y;
        for (const signatory of signatories) {
            doc.font('Calibri-Bold').fontSize(9).text(signatory, tableLeft, signatoryY, { width: tableWidth, align: 'center' });
            signatoryY += 12;
        }
        y = signatoryY;
    }
    if (data.systemSettings?.consultancyDetails?.footerBanner) {
        try {
            const footerBannerHeight = 50;
            const footerBannerY = pageHeight - footerBannerHeight;
            doc.image(data.systemSettings.consultancyDetails.footerBanner, -2, footerBannerY, { width: doc.page.width, height: footerBannerHeight });
        }
        catch (e) {
            const footerBannerHeight = 60;
            const footerBannerY = pageHeight - footerBannerHeight;
            doc.rect(tableLeft, footerBannerY, doc.page.width, footerBannerHeight).stroke();
            doc.fontSize(8).text('Footer Banner', tableLeft + doc.page.width / 2 - 30, footerBannerY + footerBannerHeight / 2 - 4);
        }
    }
}
async function addQRCodeToPage(doc, requestId, reportBaseUrl) {
    try {
        const qrData = `${reportBaseUrl.replace(/\/$/, '')}/reports/test-report/${encodeURIComponent(requestId)}`;
        const qrCodeDataUrl = await QRCode.toDataURL(qrData, { width: 180, margin: 4, color: { dark: '#000000', light: '#FFFFFF' } });
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const qrSize = 45;
        const margin = 20;
        doc.image(qrCodeDataUrl, pageWidth - qrSize - margin - 10, pageHeight - qrSize - margin - 15, { width: qrSize, height: qrSize });
    }
    catch (error) {
        console.error('Error generating QR code:', error);
    }
}
function drawSimpleTable(doc, tableData, startX, startY, colWidths, rowHeight = 20, headerBgColor = '#f0f0f0', valueAlign = 'center', lastRowLabelSpan = 1) {
    const totalCols = tableData[0]?.length || 0;
    let adjustedColWidths = colWidths.slice();
    const totalWidth = adjustedColWidths.reduce((a, b) => a + b, 0);
    if (totalWidth !== 540) {
        adjustedColWidths = adjustedColWidths.map(w => Math.round(w * 540 / totalWidth));
        const diff = 540 - adjustedColWidths.reduce((a, b) => a + b, 0);
        if (diff !== 0 && adjustedColWidths.length > 0)
            adjustedColWidths[adjustedColWidths.length - 1] += diff;
    }
    const rowHeights = [];
    for (let rowIdx = 0; rowIdx < tableData.length; rowIdx++) {
        let maxHeight = 0;
        for (let colIdx = 0; colIdx < totalCols; colIdx++) {
            const span = rowIdx === tableData.length - 1 && colIdx === 0 ? Math.min(lastRowLabelSpan, totalCols) : 1;
            const cellWidth = adjustedColWidths.slice(colIdx, colIdx + span).reduce((sum, width) => sum + width, 0);
            const text = tableData[rowIdx][colIdx] || '';
            const baseFontSize = 10;
            doc.font(rowIdx === 0 || (rowIdx === tableData.length - 1 && colIdx === 0 && tableData[rowIdx][colIdx] === 'Average') ? 'Calibri-Bold' : 'Calibri').fontSize(baseFontSize);
            const padding = rowIdx === 0 ? 4 : 3;
            const textHeight = doc.heightOfString(text, { width: cellWidth - padding });
            const cellHeight = textHeight + padding;
            if (cellHeight > maxHeight)
                maxHeight = cellHeight;
            colIdx += span - 1;
        }
        rowHeights.push(maxHeight);
    }
    let y = startY;
    let totalTableHeight = 0;
    for (let rowIdx = 0; rowIdx < tableData.length; rowIdx++) {
        let x = startX;
        for (let colIdx = 0; colIdx < totalCols; colIdx++) {
            const renderSpan = rowIdx === tableData.length - 1 && colIdx === 0 ? Math.min(lastRowLabelSpan, totalCols) : 1;
            const renderWidth = adjustedColWidths.slice(colIdx, colIdx + renderSpan).reduce((sum, width) => sum + width, 0);
            doc.rect(x, y, renderWidth, rowHeights[rowIdx]).stroke();
            if (rowIdx === 0 && headerBgColor) {
                doc.rect(x, y, adjustedColWidths[colIdx], rowHeights[rowIdx]).fillAndStroke(headerBgColor, '#808080').fillColor('#000');
            }
            const baseFontSize = 10;
            doc.font(rowIdx === 0 || (rowIdx === tableData.length - 1 && colIdx === 0 && tableData[rowIdx][colIdx] === 'Average') ? 'Calibri-Bold' : 'Calibri').fontSize(baseFontSize);
            const span = rowIdx === tableData.length - 1 && colIdx === 0 ? Math.min(lastRowLabelSpan, totalCols) : 1;
            const cellWidth = adjustedColWidths.slice(colIdx, colIdx + span).reduce((sum, width) => sum + width, 0);
            const text = tableData[rowIdx][colIdx] || '';
            const padding = rowIdx === 0 ? 4 : 3;
            const textHeight = doc.heightOfString(text, { width: cellWidth - padding });
            const yCentered = y + (rowHeights[rowIdx] - textHeight) / 2;
            doc.text(text, x + padding / 2, yCentered, { width: cellWidth - padding, align: rowIdx === tableData.length - 1 && colIdx === 0 && lastRowLabelSpan > 1 ? 'right' : rowIdx === 0 ? 'center' : valueAlign });
            x += renderWidth;
            colIdx += renderSpan - 1;
        }
        totalTableHeight += rowHeights[rowIdx];
        y += rowHeights[rowIdx];
    }
    return totalTableHeight;
}
//# sourceMappingURL=generate-report.js.map