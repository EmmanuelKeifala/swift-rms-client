import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider, PushNotificationProvider } from '@/providers';

export const metadata: Metadata = {
  title: 'RMS | Referral Management System',
  description: 'Sierra Leone Referral Management System - Strengthening Patient Referral Pathways',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <PushNotificationProvider>
            {children}
          </PushNotificationProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
