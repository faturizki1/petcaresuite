export interface NotificationLog {
  id: string;
  userId?: string | null;
  channel: 'whatsapp' | 'email' | 'sms';
  recipient: string;
  templateKey?: string | null;
  payload: any;
  status: 'pending' | 'success' | 'failed';
  errorMessage?: string | null;
  sentAt?: string | null;
  createdAt: string;
}

export interface NotificationTemplate {
  id: string;
  key: string;
  title: string;
  body: string;
  variables?: string[];
  updatedAt: string;
}

export interface WhatsAppConfig {
  provider: 'fonnte' | 'wablas';
  apiKey?: string;
  senderNumber?: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  fromEmail: string;
  fromName?: string;
}

export default {};
