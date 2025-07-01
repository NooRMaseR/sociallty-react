import styles from "../styles/files-picker.module.css";
import { Tooltip, Typography } from "@mui/material";
import { useRef, useState } from "react";

interface FilePickerProps {
  label?: string;
  acceptMultiple?: boolean;
  onChangeMethod: (e: FileList | null) => void;
}

/**
 * File Picker component to pick files (media) with Drop Zone support
 * 
 * when `onChange` or `onDrop` are called, they will use `onChangeMethod` and returns `FileList | null`
 * wether the user droped files or clicked to pick files, both will call the same method
 */
export default function FilePicker({
  label = "Drag and Drop or Click To Post Media",
  acceptMultiple = true,
  onChangeMethod,
}: FilePickerProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const handleFileClick = () => fileRef?.current?.click();
  const handelFilesOnEnter = () => {
    setIsDragging(true);
  };
  const handelFilesOnLeave = () => {
    setIsDragging(false);
  };
  const handleFileDroped = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    onChangeMethod(e.dataTransfer.files);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeMethod(e.target.files);
    setIsDragging(false);
  };
  
  return (
    <Tooltip title="Media Picker">
      <div id={styles["picker-main-container"]}>
        <div
          id={styles["picker-container"]}
          className={isDragging ? styles.dragging : undefined}
          onClick={handleFileClick}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDroped}
          onDragEnter={handelFilesOnEnter}
          onDragLeave={handelFilesOnLeave}
        >
          <input
            ref={fileRef}
            type="file"
            onChange={handleFileChange}
            accept="image/*,video/*"
            multiple={acceptMultiple}
            id="files"
          />
          <Typography>{isDragging ? "Let Go..." : label}</Typography>
        </div>
      </div>
    </Tooltip>
  );
}
