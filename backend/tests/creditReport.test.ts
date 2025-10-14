import { XMLParser } from '../src/utils/xmlParser';
import { database } from '../src/config/database';
import { CreditReport } from '../src/models/CreditReport';

describe('Credit Report Analyzer', () => {
  let xmlParser: XMLParser;

  beforeAll(async () => {
    await database.connect();
    xmlParser = new XMLParser();
  });

  afterAll(async () => {
    if (process.env['NODE_ENV'] === 'test') {
      await database.clearDatabase();
    }
    await database.disconnect();
  });

  describe('XMLParser', () => {
    const sampleXML = `<?xml version="1.0" encoding="UTF-8"?>
    <INProfileResponse>
      <CreditProfileHeader>
        <ReportNumber>1595504758919</ReportNumber>
        <ReportDate>20200723</ReportDate>
        <ReportTime>171559</ReportTime>
        <Version>V2.4</Version>
      </CreditProfileHeader>
      <Current_Application>
        <Current_Application_Details>
          <Current_Applicant_Details>
            <First_Name>Sagar</First_Name>
            <Last_Name>Ugle</Last_Name>
            <MobilePhoneNumber>9819137672</MobilePhoneNumber>
            <IncomeTaxPan>AOZPB0247S</IncomeTaxPan>
            <Date_Of_Birth_Applicant>19820322</Date_Of_Birth_Applicant>
          </Current_Applicant_Details>
        </Current_Application_Details>
      </Current_Application>
      <CAIS_Account>
        <CAIS_Summary>
          <Credit_Account>
            <CreditAccountTotal>4</CreditAccountTotal>
            <CreditAccountActive>3</CreditAccountActive>
            <CreditAccountClosed>1</CreditAccountClosed>
          </Credit_Account>
          <Total_Outstanding_Balance>
            <Outstanding_Balance_All>245000</Outstanding_Balance_All>
          </Total_Outstanding_Balance>
        </CAIS_Summary>
        <CAIS_Account_DETAILS>
          <Subscriber_Name>ICICI Bank</Subscriber_Name>
          <Account_Number>ICIVB20994</Account_Number>
          <Portfolio_Type>R</Portfolio_Type>
          <Account_Type>10</Account_Type>
          <Current_Balance>80000</Current_Balance>
          <Amount_Past_Due>4000</Amount_Past_Due>
          <CAIS_Holder_Address_Details>
            <First_Line_Of_Address_non_normalized>ANANDI VIHAR</First_Line_Of_Address_non_normalized>
            <City_non_normalized>PUNE</City_non_normalized>
            <State_non_normalized>27</State_non_normalized>
            <ZIP_Postal_Code_non_normalized>411047</ZIP_Postal_Code_non_normalized>
            <CountryCode_non_normalized>IB</CountryCode_non_normalized>
          </CAIS_Holder_Address_Details>
        </CAIS_Account_DETAILS>
      </CAIS_Account>
      <SCORE>
        <BureauScore>719</BureauScore>
        <BureauScoreConfidLevel>H</BureauScoreConfidLevel>
      </SCORE>
    </INProfileResponse>`;

    test('should validate XML structure', () => {
      const isValid = xmlParser.validateXMLStructure(sampleXML);
      expect(isValid).toBe(true);
    });

    test('should parse XML data correctly', async () => {
      const parsedData = await xmlParser.parseXML(sampleXML);
      
      expect(parsedData.reportNumber).toBe('1595504758919');
      expect(parsedData.basicDetails.firstName).toBe('Sagar');
      expect(parsedData.basicDetails.lastName).toBe('Ugle');
      expect(parsedData.basicDetails.pan).toBe('AOZPB0247S');
      expect(parsedData.creditScore).toBe(719);
      expect(parsedData.reportSummary.totalAccounts).toBe(4);
    });

    test('should reject invalid XML', () => {
      const invalidXML = '<invalid>content</invalid>';
      const isValid = xmlParser.validateXMLStructure(invalidXML);
      expect(isValid).toBe(false);
    });
  });

  describe('CreditReport Model', () => {
    test('should create and save credit report', async () => {
      const reportData = {
        reportNumber: 'TEST123456',
        reportDate: '2023-07-23',
        reportTime: '17:15:59',
        version: 'V2.4',
        basicDetails: {
          firstName: 'Test',
          lastName: 'User',
          mobilePhone: '9876543210',
          pan: 'TESTPAN123',
          dateOfBirth: '1990-01-01'
        },
        reportSummary: {
          totalAccounts: 2,
          activeAccounts: 1,
          closedAccounts: 1,
          defaultAccounts: 0,
          outstandingBalanceSecured: 50000,
          outstandingBalanceUnsecured: 30000,
          outstandingBalanceAll: 80000,
          enquiriesLast7Days: 0,
          enquiriesLast30Days: 1,
          enquiriesLast90Days: 1,
          enquiriesLast180Days: 2
        },
        creditAccounts: [],
        creditScore: 750
      };

      const creditReport = new CreditReport(reportData);
      const savedReport = await creditReport.save();

      expect(savedReport._id).toBeDefined();
      expect(savedReport.reportNumber).toBe('TEST123456');
      expect(savedReport.basicDetails.firstName).toBe('Test');
    });
  });
});