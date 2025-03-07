import styles from "../styles/files-picker.module.css";
import { Tooltip, Typography } from "@mui/material";
import { ChangeEvent, useRef } from "react";

interface FilePickerProps {
  label?: string;
  acceptMultiple?: boolean;
  onChangeMethod: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function FilePicker({
  label = "Click To Pick Media",
  acceptMultiple = true,
  onChangeMethod,
}: FilePickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFileClick = () => fileRef?.current?.click();
  
  return (
    <Tooltip title="Media Picker">
      <div id={styles["picker-main-container"]}>
        <div id={styles["picker-container"]} onClick={handleFileClick}>
          <input
            ref={fileRef}
            type="file"
            onChange={(e) => onChangeMethod(e)}
            accept="image/*,video/*"
            multiple={acceptMultiple}
            id="files"
          />
          <Typography>{label}</Typography>
        </div>
      </div>
    </Tooltip>
  );
}
