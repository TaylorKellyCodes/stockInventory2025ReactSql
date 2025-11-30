import * as React from "react";

// Placeholder Form components for testing / frontend rendering
// No external dependencies required

export const Form = ({ children, ...props }) => <form {...props}>{children}</form>;

export const FormField = ({ children, ...props }) => (
  <div className="mb-4" {...props}>
    {children}
  </div>
);

export const FormItem = ({ children, ...props }) => (
  <div className="mb-2" {...props}>
    {children}
  </div>
);

export const FormLabel = ({ children, ...props }) => (
  <label className="block text-sm font-medium text-gray-700" {...props}>
    {children}
  </label>
);

export const FormControl = ({ children, ...props }) => (
  <div className="mt-1" {...props}>
    {children}
  </div>
);

export const FormMessage = ({ children, ...props }) => (
  <p className="text-xs text-red-500 mt-1" {...props}>
    {children}
  </p>
);

// Added Input component so QuickActions.jsx can import it without error
export const Input = (props) => (
  <input className="border rounded p-2 w-full" {...props} />
);
