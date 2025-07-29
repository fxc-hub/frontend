import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/components/NotificationSystem";

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_APP_NAME ?? 'FXCHUB'} - Forex Trading Platform`,
  description: 'Professional forex trading platform with advanced analytics and admin management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <AuthProvider>
          <ThemeProvider>
            <SettingsProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </SettingsProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
