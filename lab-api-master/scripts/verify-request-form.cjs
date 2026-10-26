const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const PDFDocument = require('pdfkit');
const { ContractReviewForm } = require('../dist/reports/generate-report');
const output = path.join(__dirname, '../artifacts/report-layout');
fs.mkdirSync(output, { recursive: true });
const base = {
  TRFNo: 'TPT/2026-2027/TRF-011', date: '15.10.2026',
  customerName: 'The Commissioner', address: 'municipal office\nAnna Nagar, Salem Main Road\nKallakuruchi District - 606202',
  contactPerson: 'Chidambaram', phone: '9791204424', email: '',
  customerLetterNoDate: '31.08.2026', workName: 'Construction and operation of a municipal facility.',
  location: 'Kallakuruchi', dateOfCastingAndGradeOfConcrete: '01.09.2026 & M30',
  decisionRule: '', isMethodInappropriate: 'NA', witnessName: 'Witness', witnessDesignation: 'Engineer',
  witnessEmailId: 'witness@example.com', witnessContactNo: '9999999999', witnessDetails: 'Site inspection',
  modeOfDelivery: 'In Person', simplifiedWay: false, addressedToOtherOrg: false,
  sizeOfMetal: '20 mm', shapeOfBlock: 'Cube', source: 'Site', brandName: 'Sample',
  revisionNo: '01', revisionDate: '24.03.2023', issueNo: '01', issueDate: '01.09.2021'
};
async function verify(name, overrides, settings = {}) {
  const doc = new PDFDocument({ margin: 20, size: 'A4', bufferPages: true });
  doc.registerFont('Calibri', path.join(__dirname, '../src/calibri/calibri-regular.ttf'));
  doc.registerFont('Calibri-Bold', path.join(__dirname, '../src/calibri/calibri-bold.ttf'));
  const stream = fs.createWriteStream(path.join(output, `${name}.pdf`));
  const done = new Promise((resolve, reject) => { stream.on('finish', resolve); stream.on('error', reject); doc.on('error', reject); });
  doc.pipe(stream);
  let currentRow;
  let imageCount = 0;
  const image = doc.image;
  doc.image = function(...args) {
    const result = image.apply(this, args);
    imageCount++;
    return result;
  };
  const texts = [];
  const rect = doc.rect;
  doc.rect = function(x, y, w, h) {
    if (w === 540 && y >= 130) currentRow = { x, y, w, h };
    return rect.call(this, x, y, w, h);
  };
  const text = doc.text;
  doc.text = function(value, x, y, options) {
    texts.push({ value: String(value), x, y, align: options?.align, rowHeight: currentRow?.h });
    if (currentRow) {
      const height = this.heightOfString(String(value), options);
      assert(y >= currentRow.y, `${name}: text above its row: ${value}`);
      assert(y + height <= currentRow.y + currentRow.h + 0.01, `${name}: text overflows its row: ${value}`);
      assert(x + options.width <= currentRow.x + currentRow.w + 0.01, `${name}: text exceeds table width`);
    }
    return text.call(this, value, x, y, options);
  };
  const data = { ...base, ...overrides };
  ContractReviewForm(doc, data, settings);
  assert.equal(imageCount, 1, `${name}: header must contain a valid logo`);
  assert.equal(doc.bufferedPageRange().count, 1, `${name}: form must occupy exactly one page`);
  assert(currentRow.y + currentRow.h <= doc.page.height - 28 + 0.01, `${name}: form exceeds bottom margin`);
  const values = texts.map(t => t.value);
  assert(values.includes(data.workName), 'Work description must be complete');
  for (const value of [data.workName, data.address, data.customerName]) {
    assert.equal(texts.find(t => t.value === value).align, 'justify', `${name}: cell value must be justified`);
  }
  for (const [first, second] of [
    ['For Customer Use only', 'Is Statement of conformity Required'],
    ['If yes Specify the Witness details:', 'Witness Name & Designation'],
    ['Specify Test Report Request', 'Mode of delivery']
  ]) assert.equal(values.indexOf(second), values.indexOf(first) + 1, `${first}: section order`);
  assert(values.includes('Witness Contact Details'));
  const organization = texts.find(t => t.value === 'ORGANIZATION');
  assert.equal(organization.x, texts.find(t => t.value === 'DEPARTMENT').x);
  assert.equal(organization.x, texts.find(t => t.value === 'ISSUE NO./DATE').x);
  doc.end();
  await done;
  console.log(`PASS ${name}: one page, complete text, no cell overflow, logo present, justified values`);
  return texts.find(t => t.value === data.workName).rowHeight;
}
(async () => {
  const shortHeight = await verify('normal', {});
  const longerHeight = await verify('work-8-lines', { workName: Array.from({ length: 8 }, (_, i) => `Work description line ${i + 1}: municipal construction.`).join('\n') });
  assert(longerHeight > shortHeight, 'Work cell must grow with the number of input lines');
  await verify('invalid-logo-fallback', {}, { consultancyDetails: { logo: 'invalid-image' } });
  await verify('configured-logo', {}, { consultancyDetails: { logo: require('../dist/reports/images').images.logo } });
  await verify('work-12-lines', { workName: Array.from({ length: 12 }, (_, i) => `Work description line ${i + 1}: municipal construction.`).join('\n') });
  await verify('long-fields', {
    workName: Array.from({ length: 30 }, (_, i) => `Work item ${i + 1}: construction, operation and maintenance.`).join('\n'),
    address: base.address.repeat(3), witnessDetails: 'Inspection details with extended observations. '.repeat(12),
    addressedToOtherOrg: true, otherOrgDetails: 'Municipal Engineering Department, Salem. '.repeat(10),
    decisionRule: 'Conformity based on the specified test method. '.repeat(5),
    shapeOfBlock: 'Concrete cubes of standard dimensions. '.repeat(4)
  });
})().catch(error => { console.error(error); process.exitCode = 1; });