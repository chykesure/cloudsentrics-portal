// types.ts
export type ReportFormData = {
  title: string;
  description: string;
  priority: string;
};

// types.ts
export type StepProps = {
  goNext?: () => void;   // 👈 optional
  goBack: () => void;
  formData: ReportFormData;
  setFormData: React.Dispatch<React.SetStateAction<ReportFormData>>;
  onSubmit?: () => void;
};

