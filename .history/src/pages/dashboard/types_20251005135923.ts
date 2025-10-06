// src/dashboard/types.ts
export interface ReportFormData {
  // Issue1
  fullName: string;
  email: string;
  phone: string;
  company: string;
  accountId: string;
  bucketName: string;

  // Issue2
  date: string;
  time: string;
  category: string;
  otherCategoryDesc: string;
  description: string;
  title: string;
  priority: "Low" | "Medium" | "High";

  // Issue3
  steps: string;
  image: File | null;
  confirm: boolean;

  // Request flow (Step1 → Step6)
  selectedStorageCount?: number | null;
  reporterEmail?: string;      
  awsAliases?: { [key: string]: string }; 
  bucketNote?: string;
  acknowledgements?: string[];
  awsCountText?: string; // descriptive text for Jira

  // Step1 "change" option fields
  existingAccountId?: string;
  existingStorageName?: string;
  changesRequested?: string[];
  details?: string;

  // Step2 field
  selectedTier?: string | null;

  // Step3 field
  accessList?: {
    fullName: string;
    email: string;
    accessLevel: string;
  }[];

  // Step4 Data (Storage configuration)
  step4Data?: {
    fileSharing: string | null;
    fileOptions: string[];
    otpPlan: Record<string, string>;
    customOtp: Record<string, string>;
    accessLogging: string | null;
    lifecycle: string | null;
    customerKey: string | null;
    retentionDays: string;
    retentionMonths: string;
    transitionGlacier: boolean;
    transitionStandard: boolean;
  };
}

export interface StepProps {
  goNext?: () => void;
  goBack?: () => void;
  jumpToStep?: (step: number) => void;
  onSubmit?: () => void;
  formData: ReportFormData;
  setFormData: React.Dispatch<React.SetStateAction<ReportFormData>>;
}
