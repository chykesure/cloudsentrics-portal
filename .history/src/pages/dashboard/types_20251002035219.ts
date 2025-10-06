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
  reporterEmail?: string;      // ✅ Add this
  awsAliases?: { [key: string]: string }; // change this
  bucketNote?: string;
  acknowledgements?: string[];
  // Add this line:
  awsCountText?: string; // ✅ descriptive text for Jira
}

export interface StepProps {
  goNext?: () => void;
  goBack?: () => void;
  jumpToStep?: (step: number) => void;
  onSubmit?: () => void;
  formData: ReportFormData;
  setFormData: React.Dispatch<React.SetStateAction<ReportFormData>>;
  
}
