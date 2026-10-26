const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const PDFDocument = require('pdfkit');
const { generateReport } = require('../dist/reports/generate-report');
const { images } = require('../dist/reports/images');
(async () => {
  const segments = [], texts = [];
  const addPage = PDFDocument.prototype.addPage;
  const moveTo = PDFDocument.prototype.moveTo;
  const lineTo = PDFDocument.prototype.lineTo;
  const text = PDFDocument.prototype.text;
  PDFDocument.prototype.addPage = function(...args) {
    this.previewPage = (this.previewPage || 0) + 1;
    return addPage.apply(this, args);
  };
  PDFDocument.prototype.moveTo = function(x, y) { this.previewStart = [x, y]; return moveTo.call(this, x, y); };
  PDFDocument.prototype.lineTo = function(x, y) {
    segments.push({ page: this.previewPage, start: this.previewStart, end: [x, y] });
    return lineTo.call(this, x, y);
  };
  PDFDocument.prototype.text = function(value, x, y, options) {
    texts.push({ page: this.previewPage, value: String(value), x, y });
    return text.call(this, value, x, y, options);
  };
  const file = path.join(__dirname, '../artifacts/report-layout/contract-headers.pdf');
  const response = fs.createWriteStream(file);
  response.setHeader = () => {};
  response.req = { protocol: 'http', get: () => 'localhost:4000', baseUrl: '' };
  const done = new Promise((resolve, reject) => { response.on('finish', resolve); response.on('error', reject); });
  const sample = { id: 'sample-1', sampleId: '1', sampleType: 'Compressive strength', sampleAvailability: 'Sufficient' };
  const mapping = { sampleId: sample.id, sample,
    product: { id: 'product-1', name: 'Concrete Cube' },
    test: { id: 'test-1', name: 'Compressive strength', testingMethod: 'IS 516 (Part 1/Sec 1): 2021', unit: 'MPa' }
  };
  await generateReport({
    contractData: { TRFNo: 'TPT/2026-2027/TRF-001', TOCR: '001', date: '15.10.2026',
      customerName: 'Example Customer', address: 'Salem', phone: '9999999999', contactPerson: 'Engineer',
      workName: 'Concrete construction works', location: 'Salem', dateOfCastingAndGradeOfConcrete: '01.09.2026 / M30',
      modeOfDelivery: 'In Person', sampleReceivedBy: 'In-Person', sampleCondition: 'Acceptable',
      reportType: 'NON-NABL', revisionNo: '01', revisionDate: '24.03.2023', issueNo: '01', issueDate: '01.09.2021',
      products: [], reportNo: [], requestId: 'preview' },
    mappings: { samples: [sample], mappings: [mapping] }, observationEntries: [], reportSchemas: [],
    systemSettings: { consultancyDetails: { logo: images.logo } }
  }, response, {}, {}, {}, false, '', {});
  await done;
  for (const page of [1, 2, 3]) {
    assert(segments.some(line => line.page === page && line.start?.[0] === 528 && line.end[0] === 528 && Math.abs(line.end[1] - line.start[1] - 38) < 0.01), `Page ${page}: college/logo divider missing`);
    const organization = texts.find(item => item.page === page && item.value === 'ORGANIZATION');
    const department = texts.find(item => item.page === page && item.value === 'DEPARTMENT');
    const issue = texts.find(item => item.page === page && item.value === 'ISSUE NO./DATE');
    assert(organization && department && issue);
    assert.equal(organization.x, department.x);
    assert.equal(organization.x, issue.x);
  }
  assert(texts.some(item => item.page === 2 && item.value === 'Material or Product to be Tested'));
  console.log('PASS: college/logo divider and shared aligned header on Test Request, Sample Collection, and TOCR pages.');
})().catch(error => { console.error(error); process.exitCode = 1; });