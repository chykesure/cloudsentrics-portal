// types.ts
export interface ReportFormData {
  // Issue1
  fullName: string;
  email: string;
  phone: string;
  company: string;
  accountId: string;
  bucketName: string;

  // Issue2
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  date?: string;
  time?: string;
  category?: string;
  otherCategoryDesc?: string;

  // Issue3
  steps: string;
  image: File | null;
  confirm: boolean;
}


// Keep StepProps the same
export type StepProps = {
  goNext?: () => void;   // 👈 optional
  goBack: () => void;
  formData: ReportFormData;
  setFormData: React.Dispatch<React.SetStateAction<ReportFormData>>;
  onSubmit?: () => void;
};
