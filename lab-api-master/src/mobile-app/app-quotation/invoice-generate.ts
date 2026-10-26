import PDFDocument from 'pdfkit'
import path, { join } from 'path';
import { AppQuotation } from './entities/app-quotation.entity';
import { logo } from './logo'
import { SystemSettingsDataDto } from '../../system-settings/dto/system-settings.dto';

// Helper function to format dates as dd/mm/yyyy
function formatDateDMY(dateStr?: string | Date): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export function createInvoice(invoice: AppQuotation, systemSettings?: SystemSettingsDataDto) {
    let doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.registerFont('Calibri-Bold-Italic', path.join(__dirname, '../../calibri/calibri-bold-italic.ttf'));
    doc.registerFont('Calibri-Bold', path.join(__dirname,'../../calibri/calibri-bold.ttf'));
    doc.registerFont('Calibri-Italic', path.join(__dirname,'../../calibri/calibri-italic.ttf'));
    doc.registerFont('Calibri', path.join(__dirname,'../../calibri/calibri-regular.ttf'));
    generateHeader(doc, systemSettings);
    generateCustomerInformation(doc, invoice);
    generateInvoiceTable(doc, invoice, systemSettings);
    //generateFooter(doc);
  
    doc.end();
    return doc;
  }
  
  function generateHeader(doc, systemSettings?: SystemSettingsDataDto) {
    // Use logo from system settings if available, otherwise fall back to hardcoded logo
    try {
      if (systemSettings?.consultancyDetails?.logo) {
        doc.image(systemSettings.consultancyDetails.logo, 50, 45, { width: 50 });
      } else {
        doc.image(`data:image/png;base64,${logo}`, 50, 45, { width: 50 });
      }
    } catch (e) {
      // Fallback to hardcoded logo if system settings logo fails
      doc.image(`data:image/png;base64,${logo}`, 50, 45, { width: 50 });
    }
    
    // Calculate page center for proper centering
    const pageWidth = doc.page.width;
    const margin = 50; // Left and right margin
    const textWidth = pageWidth - (2 * margin); // Available width for text
    
    doc
      .fillColor("#000000")
      .fontSize(16)
      .font("Calibri-Bold")
      .text("THIAGARAJAR POLYTECHNIC COLLEGE", margin, 50, { width: textWidth, align: "center", bold: true })
      .font("Calibri")
      .fontSize(10)
      .text("Govt Aided | Autonomous", margin, 70, { width: textWidth, align: "center" })
      .font("Calibri-Bold")
      .fontSize(12)
      .text("CENTRE FOR CIVIL TESTING AND CONSULTANCY", margin, 85, { width: textWidth, align: "center", bold: true })
      .moveDown();
  }
  
  function generateCustomerInformation(doc, invoice) {
    const customerInformationTop = 110;
    generateHr(doc, 100);
    doc
      .fillColor("#444444")
      .fontSize(10)
      .font("Calibri")
      .text("Invoice No. :", 50, customerInformationTop)
      .font("Calibri-Bold")
      .text(invoice.invoiceNo, 110, customerInformationTop)
      .font("Calibri")
      .text("Date :", 465, customerInformationTop)
      .font("Calibri-Bold")
      .text(formatDateDMY(invoice.createdDateTime), 200, customerInformationTop, { align: "right"})
      .font("Calibri-Bold")
      .text("To,", 50, customerInformationTop + 40);
    
    // Calculate dynamic positioning for customer information
    let currentY = customerInformationTop + 60;
    const textWidth = 400; // Width for customer information text
    
    // Add name with proper wrapping
    if (invoice.request.name) {
      const nameHeight = doc.font("Calibri").fontSize(10).heightOfString(invoice.request.name, { width: textWidth });
      doc.font("Calibri").fontSize(10).text(invoice.request.name, 50, currentY, { width: textWidth });
      currentY += nameHeight + 5;
    }
    
    // Add address with proper wrapping
    if (invoice.request.address) {
      const addressHeight = doc.font("Calibri").fontSize(10).heightOfString(invoice.request.address, { width: textWidth });
      doc.font("Calibri").fontSize(10).text(invoice.request.address, 50, currentY, { width: textWidth });
      currentY += addressHeight + 5;
    }
    
    // Add state with proper wrapping
    if (invoice.request.appState?.name) {
      const stateHeight = doc.font("Calibri").fontSize(10).heightOfString(invoice.request.appState.name, { width: textWidth });
      doc.font("Calibri").fontSize(10).text(invoice.request.appState.name, 50, currentY, { width: textWidth });
      currentY += stateHeight + 10;
    }
    
    // Add "Dear Sir," with proper spacing
    doc.font("Calibri-Bold").fontSize(10).text("Sir,", 50, currentY);
    currentY += 20;
    
    // Add subject line with proper spacing
    doc.font("Calibri").fontSize(10).text("Sub: Invoice for Civil Testing & Consultancy Services - Reg. ", 50, currentY);
    currentY += 20;
        
    generateHr(doc, currentY);

    doc
    .fillColor("#444444")
      .fontSize(12)
      .font("Calibri-Bold")
      .text("INVOICE", 50, currentY + 10, { align: "center", bold: true })
     .moveDown();
  }
  
  function generateInvoiceTable(doc, invoice, systemSettings?: SystemSettingsDataDto) {
    let i;
    const invoiceTableTop = 330;

    let data:any = [];
    data.push([
      {text:"Sl.No.", align:'center',  font:{fontWeight:'bold'}}, 
      {text:"Perticulars", align:'center',font:{fontWeight:'bold'}}, 
      {text:"Unit Cost", align:'center',font:{fontWeight:'bold'}}, 
      {text:"Quantity", align:'center',font:{fontWeight:'bold'}}, 
      {text:"Amount", align:'center',font:{fontWeight:'bold'}}]);
    for (i = 0; i < invoice.lineItems.length; i++) {
      const item = invoice.lineItems[i];
      data.push([
        {text:i + 1, align:'center', bold:false}, 
        {text:item.description, bold:false},
        {text:Number(item.price).toFixed(2), align:'right'}, 
        {text:item.quantity,align:'right', bold:false}, 
        {text:(item.price * item.quantity).toFixed(2), align:'right', bold:false}
      ]); 
    }

    if(invoice.request.appState.name.toLowerCase() == 'tamil nadu'){
      data.push([
        {text:'', align:'center', bold:false},
        {text:'CGST (9%)', colSpan:3, bold:false, align:'right'},
        {text:Number(invoice.CGST).toFixed(2), align:'right'},
      ]); 

      data.push([
        {text:'', align:'center', bold:false},
        {text:'SGST (9%)', colSpan:3, bold:false, align:'right'},
        {text:Number(invoice.SGST).toFixed(2), align:'right'},
      ]);
    }
    else{
      data.push([
        {text:'', align:'center', bold:false},
        {text:'IGST (18%)', colSpan:3, bold:false, align:'right'},
        {text:Number(invoice.IGST).toFixed(2), align:'right'},
      ]);
    }

    data.push([
      {text:'', align:'center', bold:false}, 
      {text:'Total Amount', colSpan:3, bold:false, align:'right'},
      {text:Number(invoice.totalAmount).toFixed(2), align:'right'},
    ]); 
  
    doc.font("Calibri");



    doc.font("Calibri");
    doc.fontSize(10);
    doc.table({
      rowStyles: (i) => {
        return { fontWeight: "bold",  };
      },
      columnStyles: [50, 250, 70, 65, 65],
      align: ["left", "left", "right", "right", "right"],
      columnSpacing: 5,
      data: data
    })
    doc.moveDown();
    doc.fontSize(10);
    doc.text(`(${numberToWords(invoice.totalAmount)} only)`, { align: "center", oblique : true });
    doc.moveDown();
    doc.text("The payment can be made through Cheque/DD in favour of \"THIAGARAJAR POLYTECHNIC COLLEGE\" payable at Salem or by Electronic Fund Transfer to our bank account furnished below. ", { align: "left" })
    doc.moveDown();

    doc.table({
      rowStyles: () => {
         return { border: 0 };
      },
     columnStyles: [100, 10, '*'],
      data: [
        [
          {text:"Account Name", align:'left', bold:false},
          {text:":", align:'left', bold:false},
          {text:systemSettings?.bankDetails?.accountName, align:'left', bold:false},
        ],
        [
          {text:"Account No.", align:'left', bold:false},
          {text:":", align:'left', bold:false},
          {text:systemSettings?.bankDetails?.accountNumber, align:'left', bold:false},
        ],
        [
          {text:"Account Type", align:'left', bold:false},
          {text:":", align:'left', bold:false},
          {text:systemSettings?.bankDetails?.accountType, align:'left', bold:false},
        ],
        [
          {text:"Bank Name", align:'left', bold:false},
          {text:":", align:'left', bold:false},
          {text:systemSettings?.bankDetails?.bankName, align:'left', bold:false},
        ],
        [
          {text:"Bank Branch", align:'left', bold:false},
          {text:":", align:'left', bold:false},
          {text:systemSettings?.bankDetails?.branch, align:'left', bold:false},
        ],
        [
          {text:"IFSC", align:'left', bold:false},
          {text:":", align:'left', bold:false},
          {text:systemSettings?.bankDetails?.ifscCode, align:'left', bold:false},
        ],
      ]
    })

    doc.moveDown();

    doc.table({
      rowStyles: () => {
        return { border: 0 };
     },
      data: [
        [
          {text:`PAN    #  ${systemSettings?.bankDetails?.pan}`, align:'left', bold:false},
          {text:"for Thiagarajar Polytechnic College,", align:'right', bold:false},
        ],
        [
          {text:`GSTIN #  ${systemSettings?.consultancyDetails?.gstNo}`, align:'left', bold:false},
          {text:'', align:'right', bold:false},
        ],
        [
          {text:`State Code # ${systemSettings?.bankDetails?.stateCode}`, align:'left', bold:false},
          {text:invoice.creator.firstName + " " + invoice.creator.lastName, align:'right', bold:true, font:'Calibri-Bold'},
        ],
        
        [
          {text:'', align:'left', bold:false},
          {text:"TECHNICAL MANAGER", align:'right', bold:false},
        ], 
      ] 
    })

  
    doc.font("Calibri");
  }
  
  function generateFooter(doc) {
    doc
      .fontSize(10)
      .text(
        'Payment is due within 30 days',
        50,
        700,
        { align: 'left', width: 500 }
      )
      .text(
        'Please include invoice number on your payment',
        50,
        715,
        { align: 'left', width: 500 }
      )
      .text(
        'Make all checks payable to LAB TESTING SERVICES',
        50,
        730,
        { align: 'left', width: 500 }
      );
  }
  
  function generateTableRow(
    doc,
    y,
    item,
    description,
    unitCost,
    quantity,
    lineTotal
  ) {
    // Draw a bordered rectangle for each row
    doc
        .rect(50, y - 10, 500, 20)
        .stroke();

    doc
        .fontSize(10)
        .text(item, 60, y)
      .text(description, 100, y)
      .text(unitCost, 350, y, { width: 90, align: "right" })
      .text(quantity, 400, y, { width: 90, align: "right" })
      .text(lineTotal, 450, y, { width: 90, align: "right" });
  }
  
  function generateHr(doc, y) {
    doc
      .strokeColor("#aaaaaa")
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
  }
  
  function numberToWords(num: number) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    if (num === 0) return 'Zero';
    
    function convertLessThanThousand(n: number): string {
        if (n === 0) return '';
        else if (n < 10) return ones[n];
        else if (n < 20) return teens[n - 10];
        else if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
        else return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
    }
    
    const [rupees, paise] = Number(num).toFixed(2).split('.');
    const rupeesNum = parseInt(rupees);
    const paiseNum = parseInt(paise);
    
    let result = '';
    if (rupeesNum > 0) {
        const billions = Math.floor(rupeesNum / 1000000000);
        const millions = Math.floor((rupeesNum % 1000000000) / 1000000);
        const thousands = Math.floor((rupeesNum % 1000000) / 1000);
        const remainder = rupeesNum % 1000;
        
        if (billions) result += convertLessThanThousand(billions) + ' Billion ';
        if (millions) result += convertLessThanThousand(millions) + ' Million ';
        if (thousands) result += convertLessThanThousand(thousands) + ' Thousand ';
        if (remainder) result += convertLessThanThousand(remainder);
        
        result += ' Rupees';
    }
    
    if (paiseNum > 0) {
        result += ' and ' + convertLessThanThousand(paiseNum) + ' Paise';
    }
    
    return result.trim();
}