// src/pages/dashboard/types.ts

export type ReportFormData = {
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
};

export type StepProps = {
  goNext: () => void;
  goBack: () => void;
  formData: ReportFormData;
  setFormData: React.Dispatch<React.SetStateAction<ReportFormData>>;
  onSubmit?: () => void; // only for last step (Issue3)
};
