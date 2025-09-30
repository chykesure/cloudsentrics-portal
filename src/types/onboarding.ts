// src/types/onboarding.ts
export interface OnboardingData {
  companyInfo: {
    companyName: string;
    companyEmail: string;
    primaryContact: {
      name: string;
      phone: string;
      email: string;
    };
    secondaryContact: {
      name: string;
      phone: string;
      email: string;
    };
  };

  awsSetup: {
    numberOfAccounts: number | null;
    aliases: {
      A?: string;
      B?: string;
      C?: string;
      D?: string;
      E?: string;
      F?: string;
    };
    extraAliases?: string;
  };

  agreements: {
    agree: boolean;
    acknowledge: boolean;
    confirm: boolean;
  };

  createdAt?: string;
  userId?: string;
}
