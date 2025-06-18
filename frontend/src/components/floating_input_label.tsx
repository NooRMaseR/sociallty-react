import { Box, SxProps, TextFieldVariants } from "@mui/material";
import LangTextField from "./lang_textfield";
import react from "react";

interface FloatingLabelInputProps {
  name?: string;
  type?: react.HTMLInputTypeAttribute;
  label?: string;
  preffexIcon?: react.ReactNode;
  onChangeUpdater?: (value: string) => void;
  variant?: TextFieldVariants;
  autoComplete?: react.HTMLInputAutoCompleteAttribute;
  required?: boolean;
  inputProps?: object;
  slotProps?: object;
  children?: react.ReactNode[];
  disableDetectTextDir?: boolean;
  sx?: SxProps;
  boxSx?: SxProps;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export default function FloatingLabelInput({
  name,
  type,
  label,
  onChangeUpdater: updater,
  variant = "filled",
  preffexIcon: suffexIcon,
  required = false,
  autoComplete,
  inputProps,
  slotProps,
  children,
  disableDetectTextDir = false,
  sx,
  boxSx,
  ...props
}: FloatingLabelInputProps) {
  return (
    <Box className="d-flex align-items-center gap-2" sx={boxSx}>
      {suffexIcon}
      <LangTextField
        fullWidth
        placeholder=""
        name={name}
        type={type}
        label={label}
        variant={variant}
        autoComplete={autoComplete}
        {...inputProps}
        onChange={(e) => updater && updater(e.target.value)}
        slotProps={slotProps}
        required={required}
        sx={{ ...sx }}
        disableDetectTextDir={disableDetectTextDir}
        {...props}
      >
        {children}
      </LangTextField>
    </Box>
  );
}
