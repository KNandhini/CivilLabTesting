const fs=require('fs'),path=require('path'),PDFDocument=require('pdfkit');
const {TestReportPage}=require('../dist/reports/generate-report');
const {images}=require('../dist/reports/images');
(async()=>{
 const doc=new PDFDocument({margin:20,size:'A4',bufferPages:true});
 for(const [font,file] of [['Calibri','regular'],['Calibri-Bold','bold'],['Calibri-Italic','italic']])doc.registerFont(font,path.join(__dirname,`../src/calibri/calibri-${file}.ttf`));
 const logoFile=path.join(__dirname,'../artifacts/report-layout/preview-logos.json');
 const logos=fs.existsSync(logoFile)?JSON.parse(fs.readFileSync(logoFile,'utf8')):{logo:images.logo};
 const stream=fs.createWriteStream(path.join(__dirname,'../artifacts/report-layout/test-report-header-nabl.pdf'));
 const done=new Promise((resolve,reject)=>{stream.on('finish',resolve);stream.on('error',reject);doc.on('error',reject)});doc.pipe(stream);
 await TestReportPage(doc,{contractData:{reportType:'NABL',customerName:'Example Customer',address:'Salem',workName:'Municipal construction works',sampleReceivedDate:'01.09.2026'},systemSettings:{consultancyDetails:logos}},[],{finalReportNo:'TPT/CCTC/Test/2026/001',finalUlrNo:'TC116132026000000001F',startDate:'2026-09-02',endDate:'2026-09-09',productNames:['Concrete'],productShortForm:'CC',testingMethod:'IS 516',headers:[{id:'test',label:'Test'},{id:'result',label:'Result'}],dataRows:[{test:'Compressive Strength',result:'32.0'}]},true,'preview','');
 if(doc.bufferedPageRange().count!==1)throw Error('Sample report exceeds one page');
 doc.end();await done;console.log('PASS: NABL letterhead sample generated on one page.');
})().catch(e=>{console.error(e.message);process.exitCode=1});