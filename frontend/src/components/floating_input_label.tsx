import { Box, SxProps, TextField, TextFieldVariants } from "@mui/material";
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
  sx?: SxProps
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
  sx,
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
        required={required}
        sx={{...sx}}
      >
        {children}
      </TextField>
    </Box>
  );
}
