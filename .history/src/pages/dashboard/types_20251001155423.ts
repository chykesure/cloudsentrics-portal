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

    // ✅ Step6 Acknowledgements
  acknowledgements: string[];
}

export interface StepProps {
  goNext?: () => void;
  goBack?: () => void;
  onSubmit?: () => void;
  formData: ReportFormData;
  setFormData: React.Dispatch<React.SetStateAction<ReportFormData>>;
}
