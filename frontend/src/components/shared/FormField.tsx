"use client";

import { Input } from "@/components/ui/input";

interface FormFieldProps {
  label: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  type?: string;
  register?: any;
}

export default function FormField({
  label,
  placeholder,
  required = false,
  error,
  type = "text",
  register,
}: FormFieldProps) {
  return (
    <div className="space-y-2">

      <label className="text-sm font-semibold text-stone-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <Input
        type={type}
        placeholder={placeholder}
        className={`h-11 ${
          error
            ? "border-red-500 focus-visible:ring-red-500"
            : "border-stone-300"
        }`}
        {...register}
      />

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}

    </div>
  );
}