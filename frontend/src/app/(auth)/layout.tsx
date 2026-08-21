import AuthLayout from "@/components/auth/AuthLayout";
import RegisterHero from "@/components/auth/RegisterHero";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthLayout hero={<RegisterHero />}>
      {children}
    </AuthLayout>
  );
}