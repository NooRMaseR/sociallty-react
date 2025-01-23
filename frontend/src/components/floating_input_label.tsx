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
          "& .MuiFormLabel-root": {
            color: "#ababab",
          },
          "& .MuiFormLabel-root.Mui-focused": {
            color: "#1976d2",
          },
          "& .MuiFilledInput-root": {
            color: "#fff",
          },
        }}
        required={required}
      />
    </Box>
  );
}
