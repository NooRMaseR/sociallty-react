import { Box, TextField, TextFieldVariants } from "@mui/material";
import react from "react";

interface FloatingLabelInputProps {
  name?: string;
  type?: react.HTMLInputTypeAttribute;
  label?: string;
  suffexIcon?: react.ReactNode;
  updater?: (value: string) => void;
  variant?: TextFieldVariants;
  autoComplete?: react.HTMLInputAutoCompleteAttribute;
  required?: boolean;
  inputProps?: object;
  slotProps?: object;
  children?: react.ReactNode[];
}

export default function FloatingLabelInput({
  name,
  type,
  label,
  updater,
  variant = "filled",
  suffexIcon,
  required = false,
  autoComplete,
  inputProps,
  slotProps,
  children,
}: FloatingLabelInputProps) {
  return (
    <Box className="d-flex align-items-center gap-2">
      {suffexIcon}
      <TextField
        fullWidth
        name={name}
        type={type}
        label={label}
        variant={variant}
        autoComplete={autoComplete}
        {...inputProps}
        onChange={(e) => updater && updater(e.target.value)}
        slotProps={slotProps}
        sx={{
          ".MuiFormLabel-root": {
            color: "#ababab",
          },
          ".MuiFormLabel-root.Mui-focused": {
            color: "#1976d2",
          },
          ".MuiFilledInput-root": {
            color: "#fff",
          },
          ".MuiOutlinedInput-root": {
            color: "#fff",
          },
          ".MuiInput-root": {
            color: "#fff",
          },
          ".MuiInput-root::before": {
            borderBottom: "1px solid rgb(173 173 173 / 42%); !important",
          },
          ".MuiInput-root:hover::before": {
            borderBottom: "1px solid rgb(213 213 213 / 87%); !important",
          },
        }}
        required={required}
      >
        {children}
      </TextField>
    </Box>
  );
}
