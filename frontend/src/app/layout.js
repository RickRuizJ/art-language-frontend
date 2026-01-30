import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Art & Language Campus',
  description: 'Modern Learning Management System for Art & Language Education',
  keywords: 'LMS, education, worksheets, learning, art, language',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
