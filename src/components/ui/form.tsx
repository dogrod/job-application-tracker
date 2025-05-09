import * as React from "react";
import { useForm, UseFormReturn, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

type FormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown
> = {
  className?: string;
  children: React.ReactNode | ((methods: UseFormReturn<TFieldValues, TContext>) => React.ReactNode);
  onSubmit?: (data: TFieldValues) => void;
  formMethods: UseFormReturn<TFieldValues, TContext>;
} & Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit">;

// This component expects form methods to be passed
const FormWithMethods = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown
>({
  className,
  children,
  onSubmit,
  formMethods,
  ...props
}: FormProps<TFieldValues, TContext>) => {
  return (
    <form
      className={cn(className)}
      onSubmit={onSubmit ? formMethods.handleSubmit(onSubmit) : undefined}
      {...props}
    >
      {typeof children === "function" ? children(formMethods) : children}
    </form>
  );
};

// Public form component that creates its own methods if not provided
const Form = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown
>({
  formMethods,
  ...props
}: Omit<FormProps<TFieldValues, TContext>, "formMethods"> & {
  formMethods?: UseFormReturn<TFieldValues, TContext>;
}) => {
  const methods = useForm<TFieldValues>();
  return <FormWithMethods {...props} formMethods={formMethods || methods} />;
};

const FormField = ({
  name,
  label,
  className,
  children,
  error,
}: {
  name: string;
  label?: string;
  className?: string;
  children: React.ReactNode;
  error?: string;
}) => {
  return (
    <div className={cn("mb-4", className)}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium mb-1"
        >
          {label}
        </label>
      )}
      {children}
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

export { Form, FormField }; 