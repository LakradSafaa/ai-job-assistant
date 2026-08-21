interface Props {
  children: React.ReactNode;
  hero: React.ReactNode;
}

export default function AuthLayout({
  children,
  hero,
}: Props) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">

      <div className="hidden lg:block">
        {hero}
      </div>

      <div className="flex items-center justify-center bg-white p-8">

        <div className="w-full max-w-md">

          {children}

        </div>

      </div>

    </div>
  );
}