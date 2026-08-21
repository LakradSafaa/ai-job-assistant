interface FormLabelProps {
  children: React.ReactNode;
  required?: boolean;
}

export default function FormLabel({
  children,
  required = false,
}: FormLabelProps) {
  return (
    <label className="mb-2 block text-sm font-semibold text-stone-700">
      {children}
      {required && (
        <span className="ml-1 text-red-500">*</span>
      )}
    </label>
  );
}