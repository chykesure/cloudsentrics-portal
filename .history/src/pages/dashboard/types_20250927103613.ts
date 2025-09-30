// types.ts
export type ReportFormData = {
  title: string;
  description: string;
  priority: string;
};

export type StepProps = {
  goNext: () => void;
  goBack: () => void;
  formData: ReportFormData;
  setFormData: React.Dispatch<React.SetStateAction<ReportFormData>>;
  onSubmit?: () => void; // only Issue3 will use this
};
