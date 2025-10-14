import mongoose, { Document, Schema } from 'mongoose';

// Interface for Basic Details
export interface IBasicDetails {
  firstName: string;
  lastName: string;
  mobilePhone: string;
  pan: string;
  dateOfBirth: string;
  gender?: string;
}

// Interface for Address
export interface IAddress {
  firstLine: string;
  secondLine?: string;
  thirdLine?: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
}

// Interface for Account History
export interface IAccountHistory {
  year: number;
  month: number;
  daysPastDue: number;
  assetClassification?: string;
}

// Interface for Credit Account
export interface ICreditAccount {
  subscriberName: string;
  accountNumber: string;
  portfolioType: string;
  accountType: string;
  openDate: string;
  creditLimit?: number;
  highestCredit?: number;
  currentBalance: number;
  amountPastDue: number;
  accountStatus: string;
  paymentRating: string;
  dateReported: string;
  dateClosed?: string;
  repaymentTenure?: number;
  address: IAddress;
  accountHistory: IAccountHistory[];
}

// Interface for Report Summary
export interface IReportSummary {
  totalAccounts: number;
  activeAccounts: number;
  closedAccounts: number;
  defaultAccounts: number;
  outstandingBalanceSecured: number;
  outstandingBalanceUnsecured: number;
  outstandingBalanceAll: number;
  enquiriesLast7Days: number;
  enquiriesLast30Days: number;
  enquiriesLast90Days: number;
  enquiriesLast180Days: number;
}

// Interface for Credit Report Document
export interface ICreditReport extends Document {
  reportNumber: string;
  reportDate: string;
  reportTime: string;
  version: string;
  basicDetails: IBasicDetails;
  reportSummary: IReportSummary;
  creditAccounts: ICreditAccount[];
  creditScore?: number;
  creditScoreConfidence?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schemas
const AddressSchema = new Schema<IAddress>({
  firstLine: { type: String, required: true },
  secondLine: { type: String },
  thirdLine: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pinCode: { type: String, required: true },
  country: { type: String, required: true }
});

const AccountHistorySchema = new Schema<IAccountHistory>({
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  daysPastDue: { type: Number, default: 0 },
  assetClassification: { type: String }
});

const BasicDetailsSchema = new Schema<IBasicDetails>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  mobilePhone: { type: String, required: true },
  pan: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  gender: { type: String }
});

const ReportSummarySchema = new Schema<IReportSummary>({
  totalAccounts: { type: Number, required: true },
  activeAccounts: { type: Number, required: true },
  closedAccounts: { type: Number, required: true },
  defaultAccounts: { type: Number, default: 0 },
  outstandingBalanceSecured: { type: Number, default: 0 },
  outstandingBalanceUnsecured: { type: Number, default: 0 },
  outstandingBalanceAll: { type: Number, required: true },
  enquiriesLast7Days: { type: Number, default: 0 },
  enquiriesLast30Days: { type: Number, default: 0 },
  enquiriesLast90Days: { type: Number, default: 0 },
  enquiriesLast180Days: { type: Number, default: 0 }
});

const CreditAccountSchema = new Schema<ICreditAccount>({
  subscriberName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  portfolioType: { type: String, required: true },
  accountType: { type: String, required: true },
  openDate: { type: String, required: true },
  creditLimit: { type: Number },
  highestCredit: { type: Number },
  currentBalance: { type: Number, required: true },
  amountPastDue: { type: Number, default: 0 },
  accountStatus: { type: String, required: true },
  paymentRating: { type: String, required: true },
  dateReported: { type: String, required: true },
  dateClosed: { type: String },
  repaymentTenure: { type: Number },
  address: { type: AddressSchema, required: true },
  accountHistory: [AccountHistorySchema]
});

const CreditReportSchema = new Schema<ICreditReport>({
  reportNumber: { type: String, required: true, unique: true },
  reportDate: { type: String, required: true },
  reportTime: { type: String, required: true },
  version: { type: String, required: true },
  basicDetails: { type: BasicDetailsSchema, required: true },
  reportSummary: { type: ReportSummarySchema, required: true },
  creditAccounts: [CreditAccountSchema],
  creditScore: { type: Number },
  creditScoreConfidence: { type: String },
}, {
  timestamps: true
});

// Indexes for better query performance
CreditReportSchema.index({ reportNumber: 1 });
CreditReportSchema.index({ 'basicDetails.pan': 1 });
CreditReportSchema.index({ reportDate: -1 });
CreditReportSchema.index({ createdAt: -1 });

export const CreditReport = mongoose.model<ICreditReport>('CreditReport', CreditReportSchema);