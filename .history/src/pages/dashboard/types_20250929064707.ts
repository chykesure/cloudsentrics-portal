// types.ts
export type ReportFormData = {
  // Issue1 fields
  fullName: string;
  email: string;
  phone: string;
  company: string;
  accountId?: string;
  bucketName?: string;

  // Issue2 fields
  title: string;
  description: string;
  priority: string;

  // Issue3 fields
  steps?: string;
  image?: File | null;
  confirm?: boolean;
};

// Keep StepProps the same
export type StepProps = {
  goNext?: () => void;   // 👈 optional
  goBack: () => void;
  formData: ReportFormData;
  setFormData: React.Dispatch<React.SetStateAction<ReportFormData>>;
  onSubmit?: () => void;
};
