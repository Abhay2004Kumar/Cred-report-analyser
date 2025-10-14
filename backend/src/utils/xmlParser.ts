import xml2js from 'xml2js';
import { 
  ICreditReport, 
  IBasicDetails, 
  IReportSummary, 
  ICreditAccount, 
  IAddress, 
  IAccountHistory 
} from '../models/CreditReport';

export interface ParsedXMLData {
  reportNumber: string;
  reportDate: string;
  reportTime: string;
  version: string;
  basicDetails: IBasicDetails;
  reportSummary: IReportSummary;
  creditAccounts: ICreditAccount[];
  creditScore?: number | undefined;
  creditScoreConfidence?: string | undefined;
}

export class XMLParser {
  private parser: xml2js.Parser;

  constructor() {
    this.parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: false,
      trim: true,
      normalize: true
    });
  }

  public async parseXML(xmlContent: string): Promise<ParsedXMLData> {
    try {
      const result = await this.parser.parseStringPromise(xmlContent);
      const profileResponse = result.INProfileResponse;

      if (!profileResponse) {
        throw new Error('Invalid XML format: INProfileResponse not found');
      }

      return {
        reportNumber: this.extractReportNumber(profileResponse),
        reportDate: this.extractReportDate(profileResponse),
        reportTime: this.extractReportTime(profileResponse),
        version: this.extractVersion(profileResponse),
        basicDetails: this.extractBasicDetails(profileResponse),
        reportSummary: this.extractReportSummary(profileResponse),
        creditAccounts: this.extractCreditAccounts(profileResponse),
        creditScore: this.extractCreditScore(profileResponse),
        creditScoreConfidence: this.extractCreditScoreConfidence(profileResponse)
      };
    } catch (error) {
      console.error('XML parsing error:', error);
      throw new Error(`Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractReportNumber(data: any): string {
    return data.CreditProfileHeader?.ReportNumber || 
           data.Header?.ReportNumber || 
           `RPT_${Date.now()}`;
  }

  private extractReportDate(data: any): string {
    return data.CreditProfileHeader?.ReportDate || 
           data.Header?.ReportDate || 
           new Date().toISOString().split('T')[0];
  }

  private extractReportTime(data: any): string {
    return data.CreditProfileHeader?.ReportTime || 
           data.Header?.ReportTime || 
           new Date().toTimeString().split(' ')[0];
  }

  private extractVersion(data: any): string {
    return data.CreditProfileHeader?.Version || 'V2.4';
  }

  private extractBasicDetails(data: any): IBasicDetails {
    const currentApplicant = data.Current_Application?.Current_Application_Details?.Current_Applicant_Details;
    const holderDetails = data.CAIS_Account?.CAIS_Account_DETAILS?.[0]?.CAIS_Holder_Details || 
                         (Array.isArray(data.CAIS_Account?.CAIS_Account_DETAILS) ? 
                          data.CAIS_Account.CAIS_Account_DETAILS[0]?.CAIS_Holder_Details : 
                          data.CAIS_Account?.CAIS_Account_DETAILS?.CAIS_Holder_Details);

    const firstName = currentApplicant?.First_Name || 
                     holderDetails?.First_Name_Non_Normalized || 
                     holderDetails?.Surname_Non_Normalized || '';
    
    const lastName = currentApplicant?.Last_Name || 
                    holderDetails?.Surname_Non_Normalized || 
                    holderDetails?.First_Name_Non_Normalized || '';

    const mobilePhone = currentApplicant?.MobilePhoneNumber || 
                       data.CAIS_Account?.CAIS_Account_DETAILS?.[0]?.CAIS_Holder_Phone_Details?.Telephone_Number || '';

    const pan = currentApplicant?.IncomeTaxPan || 
               holderDetails?.Income_TAX_PAN || '';

    const dateOfBirth = this.formatDate(currentApplicant?.Date_Of_Birth_Applicant || 
                                       holderDetails?.Date_of_birth || '');

    const gender = holderDetails?.Gender_Code === '1' ? 'Male' : 
                   holderDetails?.Gender_Code === '2' ? 'Female' : '';

    return {
      firstName,
      lastName,
      mobilePhone,
      pan,
      dateOfBirth,
      gender
    };
  }

  private extractReportSummary(data: any): IReportSummary {
    const caisSummary = data.CAIS_Account?.CAIS_Summary;
    const capsSummary = data.CAPS?.CAPS_Summary;
    const totalCapsSummary = data.TotalCAPS_Summary;

    return {
      totalAccounts: parseInt(caisSummary?.Credit_Account?.CreditAccountTotal || '0', 10),
      activeAccounts: parseInt(caisSummary?.Credit_Account?.CreditAccountActive || '0', 10),
      closedAccounts: parseInt(caisSummary?.Credit_Account?.CreditAccountClosed || '0', 10),
      defaultAccounts: parseInt(caisSummary?.Credit_Account?.CreditAccountDefault || '0', 10),
      outstandingBalanceSecured: parseInt(caisSummary?.Total_Outstanding_Balance?.Outstanding_Balance_Secured || '0', 10),
      outstandingBalanceUnsecured: parseInt(caisSummary?.Total_Outstanding_Balance?.Outstanding_Balance_UnSecured || '0', 10),
      outstandingBalanceAll: parseInt(caisSummary?.Total_Outstanding_Balance?.Outstanding_Balance_All || '0', 10),
      enquiriesLast7Days: parseInt(capsSummary?.CAPSLast7Days || totalCapsSummary?.TotalCAPSLast7Days || '0', 10),
      enquiriesLast30Days: parseInt(capsSummary?.CAPSLast30Days || totalCapsSummary?.TotalCAPSLast30Days || '0', 10),
      enquiriesLast90Days: parseInt(capsSummary?.CAPSLast90Days || totalCapsSummary?.TotalCAPSLast90Days || '0', 10),
      enquiriesLast180Days: parseInt(capsSummary?.CAPSLast180Days || totalCapsSummary?.TotalCAPSLast180Days || '0', 10)
    };
  }

  private extractCreditAccounts(data: any): ICreditAccount[] {
    const accountsData = data.CAIS_Account?.CAIS_Account_DETAILS;
    
    if (!accountsData) {
      return [];
    }

    const accounts = Array.isArray(accountsData) ? accountsData : [accountsData];

    return accounts.map((account: any) => {
      const address: IAddress = {
        firstLine: account.CAIS_Holder_Address_Details?.First_Line_Of_Address_non_normalized || '',
        secondLine: account.CAIS_Holder_Address_Details?.Second_Line_Of_Address_non_normalized || '',
        thirdLine: account.CAIS_Holder_Address_Details?.Third_Line_Of_Address_non_normalized || '',
        city: account.CAIS_Holder_Address_Details?.City_non_normalized || '',
        state: account.CAIS_Holder_Address_Details?.State_non_normalized || '',
        pinCode: account.CAIS_Holder_Address_Details?.ZIP_Postal_Code_non_normalized || '',
        country: account.CAIS_Holder_Address_Details?.CountryCode_non_normalized || 'IB'
      };

      const accountHistory: IAccountHistory[] = this.extractAccountHistory(account.CAIS_Account_History);

      return {
        subscriberName: account.Subscriber_Name?.trim() || '',
        accountNumber: account.Account_Number || '',
        portfolioType: account.Portfolio_Type || '',
        accountType: account.Account_Type || '',
        openDate: this.formatDate(account.Open_Date || ''),
        creditLimit: parseInt(account.Credit_Limit_Amount || '0', 10) || 0,
        highestCredit: parseInt(account.Highest_Credit_or_Original_Loan_Amount || '0', 10) || 0,
        currentBalance: parseInt(account.Current_Balance || '0', 10),
        amountPastDue: parseInt(account.Amount_Past_Due || '0', 10),
        accountStatus: account.Account_Status || '',
        paymentRating: account.Payment_Rating || '',
        dateReported: this.formatDate(account.Date_Reported || ''),
        dateClosed: account.Date_Closed ? this.formatDate(account.Date_Closed) : '',
        repaymentTenure: parseInt(account.Repayment_Tenure || '0', 10) || 0,
        address,
        accountHistory
      };
    });
  }

  private extractAccountHistory(historyData: any): IAccountHistory[] {
    if (!historyData) {
      return [];
    }

    const history = Array.isArray(historyData) ? historyData : [historyData];

    return history.map((item: any) => ({
      year: parseInt(item.Year || '0', 10),
      month: parseInt(item.Month || '0', 10),
      daysPastDue: parseInt(item.Days_Past_Due || '0', 10),
      assetClassification: item.Asset_Classification || undefined
    }));
  }

  private extractCreditScore(data: any): number | undefined {
    const score = data.SCORE?.BureauScore;
    return score ? parseInt(score, 10) : undefined;
  }

  private extractCreditScoreConfidence(data: any): string | undefined {
    return data.SCORE?.BureauScoreConfidLevel || undefined;
  }

  private formatDate(dateString: string): string {
    if (!dateString || dateString.length !== 8) {
      return dateString;
    }

    // Convert YYYYMMDD to YYYY-MM-DD
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    
    return `${year}-${month}-${day}`;
  }

  public validateXMLStructure(xmlContent: string): boolean {
    try {
      // Basic validation for XML structure
      if (!xmlContent.includes('<INProfileResponse>')) {
        return false;
      }

      // Check for required sections
      const requiredSections = [
        'CreditProfileHeader',
        'Current_Application',
        'CAIS_Account'
      ];

      return requiredSections.some(section => xmlContent.includes(section));
    } catch (error) {
      return false;
    }
  }
}