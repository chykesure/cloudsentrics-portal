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

  // ===============================
  // Request flow (Step1 → Step6)
  // ===============================
  selectedStorageCount?: number | null;
  selectedAwsCount?: number | null;
  reporterEmail?: string;
  awsAliases?: { [key: string]: string };
  storageAliases?: { [key: string]: string };
  bucketNote?: string;
  acknowledgements?: string[];
  awsCountText?: string; // descriptive text for Jira

  // ✅ NEW: distinguish between AWS or Storage flow
  // ✅ NEW: distinguish between AWS or Storage flow
  requestType?: string;


  // ===============================
  // Step3 / Step4: Storage aliases (A–F)
  // ===============================
  storageNames?: { [key: string]: string }; // e.g., { A: "ALIAS1", B: "ALIAS2" }

  // ===============================
  // Step1 "Change Request" fields
  // ===============================
  existingAccountId?: string;
  existingStorageName?: string;
  changesRequested?: string[];
  details?: string;

  // ===============================
  // Step2 field (Tier Selection)
  // ===============================
  selectedTier?: string | null;

  // ===============================
  // Step3 field (Access List)
  // ===============================
  accessList?: {
    fullName: string;
    email: string;
    accessLevel: string;
  }[];

  // ===============================
  // Step4 Configuration fields
  // ===============================
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

// Props shared across steps
export interface StepProps {
  goNext?: () => void;
  goBack?: () => void;
  jumpToStep?: (step: number) => void;
  onSubmit?: () => void;
  formData: ReportFormData;
  setFormData: React.Dispatch<React.SetStateAction<ReportFormData>>;
}
