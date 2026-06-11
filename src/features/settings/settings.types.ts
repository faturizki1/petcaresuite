export interface ClinicProfile {
  id: string;
  name: string;
  logoUrl?: string;
  address: string;
  phone: string;
  email: string;
  description?: string;
  updatedAt: string;
}

export interface BusinessHours {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isClosed: boolean;
}

export interface InvoiceSettings {
  prefix: string;
  nextNumber: number;
  headerText?: string;
  footerText?: string;
}

export default {};
