import { AuthProvider } from "@/app/providers/AuthProvider";
import DashboardLayout from "@/app/components/layout/DashboardLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthProvider>
  );
}
