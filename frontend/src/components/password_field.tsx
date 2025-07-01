import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import FloatingLabelInput from "./floating_input_label";
import { IconButton, Tooltip } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { useCallback, useState } from "react";

export function PasswordField({ ...other }) {
    const [canSeePassword, setCanSeePassword] = useState<boolean>(false);
    const onShowPasswordClick = useCallback(() => setCanSeePassword((pre) => !pre), []);

    return (
        <FloatingLabelInput
          type={canSeePassword ? "text" :"password"}
          label="Password"
          preffexIcon={<LockIcon sx={{ color: "var(--text-color)" }} />}
          autoComplete="current-password"
          slotProps={{
            htmlInput: {
              minLength: 8,
            },
            input: {
                endAdornment: (
                  <Tooltip title={canSeePassword ? "Hide Password" : "Show Password"}>
                      <IconButton onClick={onShowPasswordClick}>
                          {canSeePassword ? <VisibilityOff sx={{ color: "var(--text-color)" }} /> : <Visibility sx={{ color: "var(--text-color)" }} />}
                      </IconButton>
                  </Tooltip>
              )
            }
          }}
        required
        {...other}
        />
    )
}