import { ChangeEvent } from "react";
import "../styles/files-picker.css";

interface FilePickerProps {
  acceptMultiple?: boolean;
  onChangeMethod: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function FilePicker({acceptMultiple = true, onChangeMethod}: FilePickerProps) {
  const handleFileClick = () => {
    document.getElementById("files")?.click();
  };

  return (
    <div id="picker-main-container">
      <div id="picker-container" onClick={handleFileClick}>
        <input
          type="file"
          onChange={(e) => onChangeMethod(e)}
          accept="image/*,video/*"
          multiple={acceptMultiple}
          id="files"
        />
        <p>Pick Images</p>
      </div>
    </div>
  );
}
