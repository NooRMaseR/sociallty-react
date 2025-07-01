import CloseIcon from "@mui/icons-material/Close";
import ReplyIcon from "@mui/icons-material/Reply";
import { UserNeededData } from "../../pages/Chat";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";

export interface ReplyBoxProps {
    reply?: {
      id: number;
      message: string;
      from_user: UserNeededData;
      to_user: UserNeededData;
    }
    inTextBoxBox?: boolean;
    onClose?: () => void;
}

export default function ReplyBox({ reply, onClose = () => { }, inTextBoxBox = true }: ReplyBoxProps) {
  return (
    <Box>
      {inTextBoxBox ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Box sx={{ display: "flex", gap: "5px" }}>
            <ReplyIcon sx={{ color: "var(--text-color)" }} />
            <Typography>Replying To</Typography>
          </Box>
          <Tooltip title="close reply">
            <IconButton onClick={onClose}>
              <CloseIcon fontSize="small" sx={{ color: "var(--text-color)" }} />
            </IconButton>
          </Tooltip>
        </Box>
      ) : null}
      <Typography variant="subtitle1" color="textDisabled" sx={{
        backgroundColor: inTextBoxBox ? "transparent" : "#376ebf", 
        textAlign: "left",
        padding: "0.3rem",
        borderRadius: "7px",
        borderLeft: "2px solid #ababab"
      }}>
        {reply?.from_user?.username} • {reply?.message}
      </Typography>
    </Box>
  );
}
