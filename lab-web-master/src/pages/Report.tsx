import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// Add Image to the imports at the top
import { Page, Text, View, Document, StyleSheet, PDFViewer, Image, pdf } from '@react-pdf/renderer';
import { observationApi, sampleCollectionApi, requestApi, contractApi, mobileRequestApi, reportApi } from '../services/api';
import logoImage from '../assets/react.svg';
import { images } from '../types/images'
import { Request } from '../types/request';
import { Observation } from '../types/observationEntry';
import * as base64 from 'base64-js'; // Import base64 for encoding

// Define styles for PDF
// Update the styles
// Add these new styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  reportTable: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#000',
    marginTop: 10,
  },
  reportRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  reportCell: {
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  reportHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  header: {
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 1,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    justifyContent: 'center',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  table: {
    width: '100%',
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 2,
  },
  tableCell: {
    flex: 1,
    padding: 4,
    fontSize: 10,
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    width: 100,
  },
  value: {
    fontSize: 10,
    flex: 1,
  },
  headerTable: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#000',
    marginTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    // minHeight: 60, // Add fixed height
    // alignItems: 'center', // Center content vertically
  },
  headerCell: {
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#000',
    justifyContent: 'center', // Center content vertically
  },
  headerTitle: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  logo: {
    width: 48,
    height: 48,
    margin: 2,
  },
  subHeaderRow: {
    flexDirection: 'row',
  },
  subHeaderCell: {
    flex: 1,
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
});

// Update the TestReport component
// Update the header section in TestReport

const TestReport = ({reportData}:any) => (
    console.log(reportData),
  <Document>
    <Page size="A4" style={styles.page}>
    <View style={styles.headerTable}>
  <View style={styles.headerRow}>
    <View style={[styles.headerCell, { width: 100,flex: 1 }]}>
      <Text style={styles.headerTitle}>TEST REQUEST FORM</Text>
    </View>
    <View style={[styles.headerCell, { width: 100,flex: 1 }]}>
      <Text style={[styles.headerTitle,{width:100}]}>ORGANISATION</Text>
    </View>
    <View style={[styles.headerCell, { width: 200,flex: 1, fontWeight:'bold', alignContent:'center', justifyContent:'center' }]}>
      <Text style={[styles.headerTitle,{width:148, textAlign:'center'}]}>THIAGARAJAR POLYTECHNIC {`\n`}COLLEGE</Text>
    </View>
    <View style={[styles.headerCell, { width: 60, borderRightWidth: 0 }]}>
      <Image source={images.logo} style={styles.logo} />
    </View>
  </View>
  
  <View style={styles.subHeaderRow}>
    <View style={[styles.subHeaderCell, { flex: 1 }]}>
      <Text style={styles.headerTitle}>FORM NO.</Text>
      <Text>{reportData?.request.formId}</Text>
    </View>
    <View style={[styles.subHeaderCell, { flex: 1 }]}>
      <Text style={styles.headerTitle}>DEPARTMENT</Text>
      <Text>Centre for Civil Testing and Consultancy, Salem</Text>
    </View>
  </View>

  <View style={styles.subHeaderRow}>
    <View style={[styles.subHeaderCell, { flex: 1 }]}>
      <Text style={styles.headerTitle}>REVISION NO./DATE</Text>
      <Text>{reportData?.request.revisionNo}/{new Date(reportData?.request.revisionDate).toISOString().split('T')[0]}</Text>
    </View>
    <View style={[styles.subHeaderCell, { flex: 1 }]}>
      <Text style={styles.headerTitle}>ISSUE NO/DATE</Text>
      <Text>{reportData?.request.issueNo}/{new Date(reportData?.request.issueDate).toISOString().split('T')[0]}</Text>
    </View>
  </View>
</View>
<View style={[styles.headerTitle, { display:'flex', alignItems:'center', marginTop:10}]}>
  <Text >TEST REQUEST/CONTRACT REVIEW FORM</Text>
</View>
<View style={[styles.table, { borderWidth: 1, borderColor: '#000' }]}>
  <View style={[styles.tableRow, { borderBottomWidth: 1, borderBottomColor: '#000', marginBottom: 0 }]}>
    <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000', padding: 8, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>Date</Text>
    </View>
    <View style={[styles.tableCell, { padding: 6, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>{new Date(reportData?.request.createdDate).toISOString().split('T')[0]}</Text>
    </View>
  </View>
  <View style={[styles.tableRow, { marginBottom: 0, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
    <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000', padding: 8, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>Name of the Customer/ Organization </Text>
    </View>
    <View style={[styles.tableCell, { padding: 6, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>{reportData?.request.contractReview.customerName}</Text>
    </View>
  </View>
  <View style={[styles.tableRow, { marginBottom: 0, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
    <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000', padding: 8, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>Address</Text>
    </View>
    <View style={[styles.tableCell, { padding: 6, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>{reportData?.request.contractReview.address}</Text>
    </View>
  </View>
  <View style={[styles.tableRow, { marginBottom: 0, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
    <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000', padding: 8, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>Contact Person</Text>
    </View>
    <View style={[styles.tableCell, { padding: 6, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>{reportData?.request.contractReview.contactPerson}</Text>
    </View>
  </View>
  <View style={[styles.tableRow, { marginBottom: 0, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
    <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000', padding: 8, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>Email ID</Text>
    </View>
    <View style={[styles.tableCell, { padding: 6, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>{reportData?.request.contractReview.emailId}</Text>
    </View>
  </View>
  <View style={[styles.tableRow, { marginBottom: 0, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
    <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000', padding: 8, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>Mobile No.</Text>
    </View>
    <View style={[styles.tableCell, { padding: 6, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>{reportData?.request.contractReview.mobileNo}</Text>
    </View>
  </View>
  <View style={[styles.tableRow, { marginBottom: 0, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
    <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000', padding: 8, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>Name of the work</Text>
    </View>
    <View style={[styles.tableCell, { padding: 6, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>{reportData?.request.contractReview.nameOfWork}</Text>
    </View>
  </View>
  <View style={[styles.tableRow, { marginBottom: 0, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
    <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000', padding: 8, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>Location (As Mentioned by Addressee) </Text>
    </View>
    <View style={[styles.tableCell, { padding: 6, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>{reportData?.request.contractReview.location}</Text>
    </View>
  </View>
  <View style={[styles.tableRow, { marginBottom: 0, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
    <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000', padding: 8, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>ul 
      Date of Casting & Grade of Concrete</Text>
    </View>
    <View style={[styles.tableCell, { padding: 6, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>{reportData?.request.contractReview.dateOfCasting} & {reportData?.request.contractReview.gradeOfConcrete}</Text>
    </View>
  </View>
  <View style={[styles.tableRow, { marginBottom: 0, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
    <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000', padding: 8, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>Is Statement of conformity Required </Text>
    </View>
    <View style={[styles.tableCell, { padding: 6, marginTop: 0, flexDirection: 'row', alignItems: 'center' }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: '#000', marginRight: 5, backgroundColor: reportData?.request.contractReview.isStatementOfConformityRequired === 'Yes' ? '#808080' : 'transparent' }} />
        <Text style={{ fontSize: 11 }}>Yes</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: '#000', marginRight: 5,backgroundColor: reportData?.request.contractReview.isStatementOfConformityRequired === 'No' ? '#808080' : 'transparent' }} />
        <Text style={{ fontSize: 11 }}>No</Text>
      </View>
    </View>
  </View>
  <View style={[styles.tableRow, { marginBottom: 0, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
    <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000', padding: 8, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>If yes, mention the decision rule to be followed</Text>
    </View>
    <View style={[styles.tableCell, { padding: 6, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>{reportData?.request.contractReview.decisionRule}</Text>
    </View>
  </View>
  <View style={[styles.tableRow, { marginBottom: 0, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
    <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000', padding: 8, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>Deviation from Test Methods ( if any)</Text>
    </View>
    <View style={[styles.tableCell, { padding: 6, marginTop: 0, flexDirection: 'row', alignItems: 'center' }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: '#000', marginRight: 5, backgroundColor: reportData?.request.contractReview.deviationFromTestMethods === 'Yes' ? '#808080' : 'transparent' }} />
        <Text style={{ fontSize: 11 }}>Yes</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: '#000', marginRight: 5,backgroundColor: reportData?.request.contractReview.deviationFromTestMethods === 'No' ? '#808080' : 'transparent' }} />
        <Text style={{ fontSize: 11 }}>No</Text>
      </View>
    </View>
  </View>
  <View style={[styles.tableRow, { marginBottom: 0, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
    <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000', padding: 8, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>Is Method requested Inappropriate (or) out of 
      date </Text>
    </View>
    <View style={[styles.tableCell, { padding: 6, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>{reportData?.request.contractReview.isMethodInappropriate}</Text>
    </View>
  </View>
  <View style={[styles.tableRow, { marginBottom: 0, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
    <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000', padding: 8, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>Witness Request (if any) </Text>
    </View>
    <View style={[styles.tableCell, { padding: 6, marginTop: 0, flexDirection: 'row', alignItems: 'center' }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: '#000', marginRight: 5, backgroundColor: reportData?.request.contractReview.witnessRequest === 'Yes' ? '#808080' : 'transparent' }} />
        <Text style={{ fontSize: 11 }}>Yes</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: '#000', marginRight: 5,backgroundColor: reportData?.request.contractReview.witnessRequest === 'No' ? '#808080' : 'transparent' }} />
        <Text style={{ fontSize: 11 }}>No</Text>
      </View>
    </View>
  </View>
  <View style={[styles.tableRow, { marginBottom: 0, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
    <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000', padding: 8, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>Witness Name & Designation </Text>
    </View>
    <View style={[styles.tableCell, { padding: 6, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>{reportData?.request.contractReview.witnessName} {reportData?.request.contractReview.witnessDesignation}</Text>
    </View>
  </View>
  
  <View style={[styles.tableRow, { marginBottom: 0, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
    <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000', padding: 8, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>Witness Details </Text>
    </View>
    <View style={[styles.tableCell, { padding: 6, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>{reportData?.request.contractReview.witnessDetails}</Text>
    </View>
  </View>
  <View style={[styles.tableRow, { marginBottom: 0, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
    <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000', padding: 8, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>Mode of delivery </Text>
    </View>
    <View style={[styles.tableCell, { padding: 6, marginTop: 0, flexDirection: 'row', alignItems: 'center' }]}>
      
      <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: '#000', marginRight: 5, backgroundColor: reportData?.request.contractReview.modeOfDelivery === 'Post' ? '#808080' : 'transparent' }} />
        <Text style={{ fontSize: 11 }}>Post</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: '#000', marginRight: 5,backgroundColor: reportData?.request.contractReview.witnessRequest === 'Courier' ? '#808080' : 'transparent' }} />
        <Text style={{ fontSize: 11 }}>Courier</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: '#000', marginRight: 5,backgroundColor: reportData?.request.contractReview.witnessRequest === 'In Person' ? '#808080' : 'transparent' }} />
        <Text style={{ fontSize: 11 }}>In Person</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: '#000', marginRight: 5,backgroundColor: reportData?.request.contractReview.witnessRequest === 'Email' ? '#808080' : 'transparent' }} />
        <Text style={{ fontSize: 11 }}>Email</Text>
      </View>
    </View>
  </View>
  <View style={[styles.tableRow, { marginBottom: 0, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
    <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000', padding: 8, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>Is Test Report required in Simplified way</Text>
    </View>
    <View style={[styles.tableCell, { padding: 6, marginTop: 0, flexDirection: 'row', alignItems: 'center' }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: '#000', marginRight: 5, backgroundColor: reportData?.request.contractReview.isSimplifiedReport === 'Yes' ? '#808080' : 'transparent' }} />
        <Text style={{ fontSize: 11 }}>Yes</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: '#000', marginRight: 5,backgroundColor: reportData?.request.contractReview.isSimplifiedReport === 'No' ? '#808080' : 'transparent' }} />
        <Text style={{ fontSize: 11 }}>No</Text>
      </View>
    </View>
  </View>
  <View style={[styles.tableRow, { marginBottom: 0, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
    <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000', padding: 8, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>Is Test Report to be addressed to any other organization</Text>
    </View>
    <View style={[styles.tableCell, { padding: 6, marginTop: 0, flexDirection: 'row', alignItems: 'center' }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: '#000', marginRight: 5, backgroundColor: reportData?.request.contractReview.isOtherOrgAddress === 'Yes' ? '#808080' : 'transparent' }} />
        <Text style={{ fontSize: 11 }}>Yes</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: '#000', marginRight: 5,backgroundColor: reportData?.request.contractReview.isOtherOrgAddress === 'No' ? '#808080' : 'transparent' }} />
        <Text style={{ fontSize: 11 }}>No</Text>
      </View>
    </View>
  </View>
  <View style={[styles.tableRow, { marginBottom: 0, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
    <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000', padding: 8, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>If Yes, provide details </Text>
    </View>
    <View style={[styles.tableCell, { padding: 6, marginTop: 0 }]}>
      <Text style={{ fontSize: 11 }}>{reportData?.request.contractReview.otherOrgDetails}</Text>
    </View>
  </View>
</View>
</Page>
{Array.from({ length: Math.ceil(reportData?.mappings.length / 5) }).map((_, pageIndex) => (
  <Page key={pageIndex} size="A4" style={styles.page}>
    <View style={styles.headerTable}>
      <View style={styles.headerRow}>
        <View style={[styles.headerCell, { flex: 1 }]}>
          <Text style={styles.headerTitle}>TEST REQUEST FORM</Text>
        </View>
        <View style={[styles.headerCell, { flex: 1 }]}>
          <Text style={styles.headerTitle}>ORGANISATION</Text>
        </View>
        <View style={[styles.headerCell, { width: 200,flex: 1, fontWeight:'bold', alignContent:'center', justifyContent:'center' }]}>
      <Text style={[styles.headerTitle,{width:148, textAlign:'center'}]}>THIAGARAJAR POLYTECHNIC {`\n`}COLLEGE</Text>
    </View>
        <View style={[styles.headerCell, { width: 60, borderRightWidth: 0 }]}>
          <Image source={images.logo} style={styles.logo} />
        </View>
      </View>
      
      <View style={styles.subHeaderRow}>
        <View style={[styles.subHeaderCell, { flex: 1 }]}>
          <Text style={styles.headerTitle}>FORM NO.</Text>
          <Text>{reportData?.request.formId}</Text>
        </View>
        <View style={[styles.subHeaderCell, { flex: 1 }]}>
          <Text style={styles.headerTitle}>DEPARTMENT</Text>
          <Text>Centre for Civil Testing and Consultancy, Salem</Text>
        </View>
      </View>

      <View style={styles.subHeaderRow}>
        <View style={[styles.subHeaderCell, { flex: 1 }]}>
          <Text style={styles.headerTitle}>REVISION NO./DATE</Text>
          <Text>{reportData?.request.revisionNo}/{new Date(reportData?.request.revisionDate).toISOString().split('T')[0]}</Text>
        </View>
        <View style={[styles.subHeaderCell, { flex: 1 }]}>
          <Text style={styles.headerTitle}>ISSUE NO/DATE</Text>
          <Text>{reportData?.request.issueNo}/{new Date(reportData?.request.issueDate).toISOString().split('T')[0]}</Text>
        </View>
      </View>
    </View>

    <View style={[styles.headerTitle, { display:'flex', alignItems:'center', marginTop:10}]}>
      <Text >SAMPLES</Text>
    </View>
    <View style={[styles.table, { borderWidth: 1, borderColor: '#000' }]}>
      {reportData?.mappings.slice(pageIndex * 5, (pageIndex + 1) * 5).map((mapping: any, index: number) => (
        <View key={index} style={[styles.tableRow, { marginBottom: 0, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
          <View style={[styles.tableCell, { padding: 8, borderRightWidth: 1, borderRightColor: '#000', width: '40%' }]}>
            <View style={{ flexDirection: 'column', gap: 4 }}>
              <View style={{ flexDirection: 'column' }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold' }}>Product: </Text>
                <Text style={{ fontSize: 11, marginTop: 2 }}>{mapping.product.name}</Text>
              </View>
              <View style={{ flexDirection: 'column' }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold' }}>Test Name: </Text>
                <Text style={{ fontSize: 11, marginTop: 2 }}>{mapping.test.name}</Text>
              </View>
              <View style={{ flexDirection: 'column' }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold' }}>Test Method: </Text>
                <Text style={{ fontSize: 11, marginTop: 2 }}>{mapping.test.testingMethod}</Text>
              </View>
            </View>
          </View>
          <View style={[styles.tableCell, { padding: 8, width: '50%' }]}>
            <View style={{ flexDirection: 'column', gap: 4 }}>
              <View style={{ flexDirection: 'column' }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', marginRight: 4 }}>Sample: </Text>
                <Text style={{ fontSize: 11 }}>{mapping.sample.sampleId.replace(`${mapping.request.formId}-`,'')} - {mapping.sample.sampleType}</Text>
              </View>
              <View style={{ flexDirection: 'column' }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', marginRight: 4 }}>Availability: </Text>
                <Text style={{ fontSize: 11 }}>{mapping.sample.sampleAvailability}</Text>
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  </Page>
))}
    <Page size="A4" style={styles.page}>
      <View style={styles.headerTable}>
        <View style={styles.headerRow}>
          <View style={[styles.headerCell, { flex: 1 }]}>
            <Text style={styles.headerTitle}>OBSERVATION ENTRY</Text>
          </View>
          <View style={[styles.headerCell, { flex: 1 }]}>
            <Text style={styles.headerTitle}>ORGANISATION</Text>
          </View>
          <View style={[styles.headerCell, { width: 200,flex: 1, fontWeight:'bold', alignContent:'center', justifyContent:'center' }]}>
      <Text style={[styles.headerTitle,{width:148, textAlign:'center'}]}>THIAGARAJAR POLYTECHNIC {`\n`}COLLEGE</Text>
    </View>
          <View style={[styles.headerCell, { width: 60, borderRightWidth: 0 }]}>
            <Image 
              source={images.logo} 
              style={styles.logo} 
            />
          </View>
        </View>

        <View style={styles.subHeaderRow}>
          <View style={[styles.subHeaderCell, { flex: 1 }]}>
            <Text style={styles.headerTitle}>FORM NO.</Text>
            <Text>{reportData?.request.formId}</Text>
          </View>
          <View style={[styles.subHeaderCell, { flex: 1 }]}>
            <Text style={styles.headerTitle}>DEPARTMENT</Text>
            <Text>Centre for Civil Testing and Consultancy, Salem</Text>
          </View>
        </View>

        <View style={styles.subHeaderRow}>
          <View style={[styles.subHeaderCell, { flex: 1 }]}>
            <Text style={styles.headerTitle}>REVISION NO./DATE</Text>
            <Text>{reportData?.request.revisionNo}/{new Date(reportData?.request.revisionDate).toISOString().split('T')[0]}</Text>
          </View>
          <View style={[styles.subHeaderCell, { flex: 1 }]}>
            <Text style={styles.headerTitle}>ISSUE NO/DATE</Text>
            <Text>{reportData?.request.issueNo}/{new Date(reportData?.request.issueDate).toISOString().split('T')[0]}</Text>
          </View>
        </View>
      </View>

      {/* Group observations by test ID and display results */}
      {Object.entries(
        reportData?.observations.reduce((groups: any, observation: Observation) => {
          const testId = observation.productTestSampleMapping.test.id;
          if (!groups[testId]) {
            groups[testId] = [];
          }
          groups[testId].push(observation);
          console.log("groups",groups)
          console.log("observation",observation)
          console.log("testId",testId)
          console.log("observations",reportData?.observations)
          return groups;
        }, {}) || {}
      ).map(([testId, observations]: [string, unknown]) => {
        const typedObservations = observations as Observation[];
        return (
        <View key={testId} style={[styles.table, { borderWidth: 1, borderColor: '#000', marginTop: 20 }]}>
          <View style={[styles.tableRow, { backgroundColor: '#f0f0f0' }]}>
            <View style={[styles.tableCell]}>
              <Text style={{ fontSize: 11, fontWeight: 'bold' }}>
                Test: {(observations as any[])[0].productTestSampleMapping.test.name}
              </Text>
            </View>
          </View>
          
          {typedObservations.map((observation: any, index: number) => (
            <>
            { index === 0 &&
            <View key={index} style={[styles.tableRow, { backgroundColor: '#f0f0f0' }]}>
                <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000' }]}>
                <Text style={{ fontSize: 11 }}>Sample Id</Text>
            </View> 
                {
                    observation.result.map((result: any, index: number) => (
                       
                            <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000' }]}>
                                <Text style={{ fontSize: 11 }}>{result.displayName}</Text>
                            </View> 
                    ))
                }
              
            </View>
      }
            <View key={index} style={styles.tableRow}>
                <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000' }]}>
                    <Text style={{ fontSize: 11, flexWrap: 'wrap' }}>
                        {observation.productTestSampleMapping.sample.sampleId.replace(`${observation.productTestSampleMapping.request.formId}-`,'')}
                    </Text>
                </View>
            {
                observation.result.map((result: any, index: number) => (
                   
                        <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000' }]}>
                            <Text style={{ fontSize: 11 }}>{Number(result.value).toFixed(2)}</Text>
                        </View> 
                ))
            }
        </View>
        </>
          ))}
        </View>
         

      );
      })}
    </Page>

    {Object.entries(
        reportData?.observations.reduce((groups: any, observation: Observation) => {
          const testId = observation.productTestSampleMapping.test.id;
          if (!groups[testId]) {
            groups[testId] = [];
          }
          groups[testId].push(observation);
          return groups;
        }, {}) || {}
      ).map(([testId, observations]: [string, unknown]) => {
        const typedObservations = observations as Observation[];
        return (
    <Page key={testId} size="A4" style={styles.page}>
      <Text style={styles.reportHeader}>CENTRE FOR CIVIL TESTING AND CONSULTANCY</Text>
      <Text style={[styles.reportHeader, { fontSize: 12 }]}>TEST REPORT</Text>
      
      <View style={styles.reportTable}>
        <View style={styles.reportRow}>
          <View style={[styles.reportCell, { flex: 1, fontWeight:'bold' }]}>
            <Text>Test Report No.</Text>
          </View>
          <View style={[styles.reportCell, { flex: 1 }]}>
            <Text>{reportData?.request.formId}</Text>
          </View>
          <View style={[styles.reportCell, { flex: 1, fontWeight:'bold' }]}>
            <Text>ULR No.</Text>
          </View>
          <View style={[styles.reportCell, { flex: 1 }]}>
            <Text>{reportData?.ulrNo || 'TC116132500000013F'}</Text>
          </View>
        </View>
        <View style={styles.reportRow}>
          <View style={[styles.reportCell, { flex: 1, fontWeight:'bold' }]}>
            <Text>Customer Address & {'\n'}Customer Details</Text>
          </View>
          <View style={[styles.reportCell, { flex: 1 }]}>
            <Text>Mr./Mrs. {reportData?.request.contractReview.customerName}{'\n'}
            {reportData?.request.contractReview.address}
            </Text>
          </View>
          <View style={[styles.reportCell, { flex: 1, fontWeight:'bold' }]}>
          <Text>Description of{'\n'}sample received</Text>
          </View>
          <View style={[styles.reportCell, { flex: 1 }]}>
                <Text>{typedObservations[0].productTestSampleMapping.sample.sampleType}</Text>
          </View>
          
        </View>

        <View style={styles.reportRow}>
          <View style={[styles.reportCell, { flex: 1, fontWeight:'bold' }]}>
            <Text>Customer letter No. {'\n'}
            & Date </Text>
          </View>
          <View style={[styles.reportCell, { flex: 1 }]}>
            <Text>{new Date(reportData?.request.contractReview.createdAt).toISOString().split('T')[0]}</Text>
          </View>
          <View style={[styles.reportCell, { flex: 1, fontWeight:'bold' }]}>
          <Text>Location {'\n'}
(As Mentioned by {'\n'}
Addressee) </Text>
          </View>
          <View style={[styles.reportCell, { flex: 1 }]}>
                <Text>{reportData?.request.contractReview.location}</Text>
          </View>
          
        </View>

        <View style={styles.reportRow}>
          <View style={[styles.reportCell, { flex: 1, fontWeight:'bold' }]}>
            <Text>Name of Work (As {'\n'} 
Mentioned by {'\n'}
Addressee)  </Text>
          </View>
          <View style={[styles.reportCell, { flex: 1 }]}>
            <Text>{reportData?.request.contractReview.nameOfWork}</Text>
          </View>
          <View style={[styles.reportCell, { flex: 1, fontWeight:'bold' }]}>
          <Text>Date of Casting & {'\n'}
Grade of Concrete {'\n'}
(As Mentioned by {'\n'}
Addressee)  </Text>
          </View>
          <View style={[styles.reportCell, { flex: 1 }]}>
                <Text>{reportData?.request.contractReview.dateOfCasting} & {reportData?.request.contractReview.gradeOfConcrete}</Text>
          </View>
          
        </View>

        <View style={styles.reportRow}>
          <View style={[styles.reportCell, { flex: 1, fontWeight:'bold' }]}>
            <Text>Sample Condition  </Text>
          </View>
          <View style={[styles.reportCell, { flex: 1 }]}>
            <Text>{typedObservations[0].condition}</Text>
          </View>
          <View style={[styles.reportCell, { flex: 1, fontWeight:'bold' }]}>
          <Text>Sample received on  </Text>
          </View>
          <View style={[styles.reportCell, { flex: 1 }]}>
                <Text>{new Date(reportData?.request.createdDate).toISOString().split('T')[0]}</Text>
          </View>
        </View>

        <View style={styles.reportRow}>
          <View style={[styles.reportCell, { flex: 1, fontWeight:'bold' }]}>
            <Text>Test Start Date  </Text>
          </View>
          <View style={[styles.reportCell, { flex: 1 }]}>
            <Text>{typedObservations[0].testStartDate}</Text>
          </View>
          <View style={[styles.reportCell, { flex: 1, fontWeight:'bold' }]}>
          <Text>Test Completed Date  </Text>
          </View>
          <View style={[styles.reportCell, { flex: 1 }]}>
                <Text>{typedObservations[0].testCompletionDate}</Text>
          </View>
        </View>

        <View style={styles.reportRow}>
          <View style={[styles.reportCell, { flex: 1, fontWeight:'bold' }]}>
            <Text>Test Method  </Text>
          </View>
          <View style={[styles.reportCell, { flex: 1 }]}>
            <Text>{typedObservations[0].productTestSampleMapping.test.testingMethod}</Text>
          </View>
          <View></View>
          <View></View>
          
        </View>

        

        {/* Test Results Table */}
       
        <View  style={[styles.table, { borderWidth: 1, borderColor: '#000', marginTop: 20 }]}>
          
          {typedObservations.map((observation: any, index: number) => (
            <>
            { index === 0 &&
            <View key={index} style={[styles.tableRow, { backgroundColor: '#f0f0f0' }]}>
                <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000' }]}>
                <Text style={{ fontSize: 11 }}>Sample Id</Text>
            </View> 
                {
                    observation.result.map((result: any, index: number) => (
                       
                            <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000' }]}>
                                <Text style={{ fontSize: 11 }}>{result.displayName}</Text>
                            </View> 
                    ))
                }
              
            </View>
      }
            <View key={index} style={styles.tableRow}>
            
                <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000' }]}>
                <Text style={{ fontSize: 11 }}>{observation.productTestSampleMapping.sample.sampleId.replace(`${observation.productTestSampleMapping.request.formId}-`,'')}</Text>
            </View> 
            {
                observation.result.map((result: any, index: number) => (
                   
                        <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000' }]}>
<Text style={{ fontSize: 11 }}>{Number(result.value).toFixed(2)}</Text>
                        </View> 
                ))
            }
        </View>
        </>
          ))}
        </View>
         

     

        {/* Disclaimer */}
        <View style={{ marginTop: 20, fontSize: 9 }}>
          <Text>Disclaimer: The test results are related only to the samples submitted for testing. The Addressee is requested to check up the results with their norms noted in the work order conditions and as per relevant codest. This test report shall not be reproduced in part, without the permission of this laboratory. Any correction invalidates this test report. Balance sample, if any shall be discarded after 1 month from the date of issue of this Test Report, unless specified otherwise.</Text>
        </View>

        {/* Signatures */}
        <View style={[styles.reportRow, { marginTop: 30, borderTopWidth: 1 }]}>
          <View style={[styles.reportCell, { flex: 1, borderBottomWidth: 0 }]}>
            <Text>Test Conducted by: </Text>
            <Text style={{ fontWeight: 'bold' }}>

            {typedObservations[0].productTestSampleMapping.user.firstName} {typedObservations[0].productTestSampleMapping.user.lastName}
            </Text>
          </View>
          <View style={[styles.reportCell, { flex: 1, borderBottomWidth: 0 }]}>
            <Text>Reviewed by</Text>
          </View>
        </View>
      </View>
    </Page>
     );
    })}

{Object.entries(
        reportData?.observations.reduce((groups: any, observation: Observation) => {
          const testId = observation.productTestSampleMapping.test.id;
          if (!groups[testId]) {
            groups[testId] = [];
          }
          groups[testId].push(observation);
          return groups;
        }, {}) || {}
      ).map(([testId, observations]: [string, unknown]) => {
        const typedObservations = observations as Observation[];
        return (
    <Page key={testId} size="A4" style={styles.page}>
      <Text style={[styles.reportHeader,{fontSize:20}]}>THIAGARAJAR POLYTECHNIC COLLEGE</Text>
      <Text style={styles.reportHeader}>CENTRE FOR CIVIL TESTING AND CONSULTANCY</Text>
      <Text style={[styles.reportHeader, { fontSize: 12 }]}>TEST REPORT</Text>
      
      <View style={styles.reportTable}>
        <View style={styles.reportRow}>
          <View style={[styles.reportCell, { flex: 1, fontWeight:'bold' }]}>
            <Text>Test Report No.</Text>
          </View>
          <View style={[styles.reportCell, { flex: 1 }]}>
            <Text>{reportData?.request.formId}</Text>
          </View>
          <View style={[styles.reportCell, { flex: 1, fontWeight:'bold' }]}>
            <Text>ULR No.</Text>
          </View>
          <View style={[styles.reportCell, { flex: 1 }]}>
            <Text>{reportData?.ulrNo || 'TC116132500000013F'}</Text>
          </View>
        </View>
        <View style={styles.reportRow}>
          <View style={[styles.reportCell, { flex: 1, fontWeight:'bold' }]}>
            <Text>Customer Address & {'\n'}Customer Details</Text>
          </View>
          <View style={[styles.reportCell, { flex: 1 }]}>
            <Text>Mr./Mrs. {reportData?.request.contractReview.customerName}{'\n'}
            {reportData?.request.contractReview.address}
            </Text>
          </View>
          <View style={[styles.reportCell, { flex: 1, fontWeight:'bold' }]}>
          <Text>Description of{'\n'}sample received</Text>
          </View>
          <View style={[styles.reportCell, { flex: 1 }]}>
                <Text>{typedObservations[0].productTestSampleMapping.sample.sampleType}</Text>
          </View>
          
        </View>

        <View style={styles.reportRow}>
          <View style={[styles.reportCell, { flex: 1, fontWeight:'bold' }]}>
            <Text>Customer letter No. {'\n'}
            & Date </Text>
          </View>
          <View style={[styles.reportCell, { flex: 1 }]}>
            <Text>{new Date(reportData?.request.contractReview.createdAt).toISOString().split('T')[0]}</Text>
          </View>
          <View style={[styles.reportCell, { flex: 1, fontWeight:'bold' }]}>
          <Text>Location {'\n'}
(As Mentioned by {'\n'}
Addressee) </Text>
          </View>
          <View style={[styles.reportCell, { flex: 1 }]}>
                <Text>{reportData?.request.contractReview.location}</Text>
          </View>
          
        </View>

        <View style={styles.reportRow}>
          <View style={[styles.reportCell, { flex: 1, fontWeight:'bold' }]}>
            <Text>Name of Work (As {'\n'} 
Mentioned by {'\n'}
Addressee)  </Text>
          </View>
          <View style={[styles.reportCell, { flex: 1 }]}>
            <Text>{reportData?.request.contractReview.nameOfWork}</Text>
          </View>
          <View style={[styles.reportCell, { flex: 1, fontWeight:'bold' }]}>
          <Text>Date of Casting & {'\n'}
Grade of Concrete {'\n'}
(As Mentioned by {'\n'}
Addressee)  </Text>
          </View>
          <View style={[styles.reportCell, { flex: 1 }]}>
                <Text>{reportData?.request.contractReview.dateOfCasting} & {reportData?.request.contractReview.gradeOfConcrete}</Text>
          </View>
          
        </View>

        <View style={styles.reportRow}>
          <View style={[styles.reportCell, { flex: 1, fontWeight:'bold' }]}>
            <Text>Sample Condition  </Text>
          </View>
          <View style={[styles.reportCell, { flex: 1 }]}>
            <Text>{typedObservations[0].condition}</Text>
          </View>
          <View style={[styles.reportCell, { flex: 1, fontWeight:'bold' }]}>
          <Text>Sample received on  </Text>
          </View>
          <View style={[styles.reportCell, { flex: 1 }]}>
                <Text>{new Date(reportData?.request.createdDate).toISOString().split('T')[0]}</Text>
          </View>
        </View>

        <View style={styles.reportRow}>
          <View style={[styles.reportCell, { flex: 1, fontWeight:'bold' }]}>
            <Text>Test Start Date  </Text>
          </View>
          <View style={[styles.reportCell, { flex: 1 }]}>
            <Text>{typedObservations[0].testStartDate}</Text>
          </View>
          <View style={[styles.reportCell, { flex: 1, fontWeight:'bold' }]}>
          <Text>Test Completed Date  </Text>
          </View>
          <View style={[styles.reportCell, { flex: 1 }]}>
                <Text>{typedObservations[0].testCompletionDate}</Text>
          </View>
        </View>

        <View style={styles.reportRow}>
          <View style={[styles.reportCell, { flex: 1, fontWeight:'bold' }]}>
            <Text>Test Method  </Text>
          </View>
          <View style={[styles.reportCell, { flex: 1 }]}>
            <Text>{typedObservations[0].productTestSampleMapping.test.testingMethod}</Text>
          </View>
          <View></View>
          <View></View>
          
        </View>

        

        {/* Test Results Table */}
       
        <View  style={[styles.table, { borderWidth: 1, borderColor: '#000', marginTop: 20 }]}>
          
          {typedObservations.map((observation: any, index: number) => (
            <>
            { index === 0 &&
            <View key={index} style={[styles.tableRow, { backgroundColor: '#f0f0f0' }]}>
                <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000' }]}>
                <Text style={{ fontSize: 11 }}>Sample Id</Text>
            </View> 
                {
                    observation.result.map((result: any, index: number) => (
                       
                            <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000' }]}>
                                <Text style={{ fontSize: 11 }}>{result.displayName}</Text>
                            </View> 
                    ))
                }
              
            </View>
      }
            <View key={index} style={styles.tableRow}>
            
                <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000' }]}>
                <Text style={{ fontSize: 11 }}>{observation.productTestSampleMapping.sample.sampleId.replace(`${observation.productTestSampleMapping.request.formId}-`,'')}</Text>
            </View> 
            {
                observation.result.map((result: any, index: number) => (
                   
                        <View style={[styles.tableCell, { borderRightWidth: 1, borderRightColor: '#000' }]}>
<Text style={{ fontSize: 11 }}>{Number(result.value).toFixed(2)}</Text>
                        </View> 
                ))
            }
        </View>
        </>
          ))}
        </View>
         

     

        {/* Disclaimer */}
        <View style={{ marginTop: 20, fontSize: 9 }}>
          <Text>Disclaimer: The test results are related only to the samples submitted for testing. The Addressee is requested to check up the results with their norms noted in the work order conditions and as per relevant codest. This test report shall not be reproduced in part, without the permission of this laboratory. Any correction invalidates this test report. Balance sample, if any shall be discarded after 1 month from the date of issue of this Test Report, unless specified otherwise.</Text>
        </View>

        {/* Signatures */}
        <View style={[styles.reportRow, { marginTop: 30, borderTopWidth: 1 }]}>
          <View style={[styles.reportCell, { flex: 1, borderBottomWidth: 0 }]}>
            <Text>Test Conducted by: </Text>
            <Text style={{ fontWeight: 'bold' }}>

            {typedObservations[0].productTestSampleMapping.user.firstName} {typedObservations[0].productTestSampleMapping.user.lastName}
            </Text>
          </View>
          <View style={[styles.reportCell, { flex: 1, borderBottomWidth: 0 }]}>
            <Text>Reviewed by</Text>
          </View>
        </View>
      </View>
    </Page>
     );
    })}
  </Document>
);



interface ReportData {
  request: Request;
  observations: Observation[];
  samples: any[];
  mappings: Request[];
}

export const Report: React.FC = () => {
  const { requestId } = useParams();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');


  

  const handlePostPDF = async (newReportData:any) => {
    if (!newReportData) return;
    console.log('chetan 123')

    // Generate PDF blob
    const blob = await pdf(<TestReport reportData={newReportData} />).toBlob();
    console.log('chetan 456')

    // Create FormData to send the PDF
    const formData = new FormData();
    formData.append('file', blob, 'report.pdf');
    console.log('chetan 78')

    try {
      // Post the PDF to your API
       const response = await mobileRequestApi.reportCreate(newReportData.request.appRequestId, formData);
    console.log('chetan 98', response)

      console.log('PDF uploaded successfully:', response.data);
    } catch (error) {
      console.error('Error uploading PDF:', error);
    }
  };

  useEffect(() => {
    const fetchPdf = async (id: string) => {
      setLoading(true);
      try {
        const response = await reportApi.getReport(id);
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(blob);
        setPdfUrl(pdfUrl);
      } catch (error) {
        console.error('Error fetching PDF:', error);
      } finally {
        setLoading(false);
      }
    };
  
    if (requestId) {
      fetchPdf(requestId);
    }
  }, [requestId]);


  

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Test Report</h1>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
        {loading ? (
                <div className="text-center py-8">Loading PDF...</div>
              ) : (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full min-h-[500px]"
                  title="Invoice PDF Viewer"
                />
              )}
          {/* <PDFViewer className="w-full h-screen">
            <TestReport reportData={reportData} />
          </PDFViewer> */}
        </div>
      </div>
    </div>
  );
};