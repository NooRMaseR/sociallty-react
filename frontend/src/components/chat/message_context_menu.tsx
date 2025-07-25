import {
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { reactionsEmojis } from "../../utils/constants";
import DeleteIcon from "@mui/icons-material/Delete";
import ReplyIcon from "@mui/icons-material/Reply";
import { ContextMenu } from "./message_bubble";
import React from "react";

interface MessageContextMenuProps extends ContextMenu {
  handleDelete: (messageId: number) => void;
  setOnReact: (msg_id: number, value: string) => void;
  setOnReply: (msg_id: number) => void;
}

export default function MessageContextMenu({
  element,
  messageId,
  myMessage = false,
  setElementToContextMenu,
  myReaction,
  setOnReact,
  handleDelete,
  setOnReply,
}: MessageContextMenuProps) {
  const handelClose = React.useCallback(() => {
    setElementToContextMenu(null);
    element?.classList.remove("has-context-menu");
  }, [setElementToContextMenu, element]);

  const handleLike = async (_: React.MouseEvent<HTMLElement>, value: string) => {
    setOnReact(messageId ?? -1, value ?? myReaction);
    handelClose();
  };

  const handleCopy = React.useCallback(async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(
        element?.querySelector("p")?.textContent ?? ""
      );
    }
    handelClose();
  }, [element, handelClose]);

  const onMessageDelete = React.useCallback(() => {
    if (messageId) {
      handleDelete(messageId);
    }
    handelClose();
  }, [messageId, handelClose, handleDelete]);

  const handelReply = React.useCallback(() => {
    setOnReply(messageId ?? -1);
    handelClose();
  }, [handelClose, messageId, setOnReply])

  return (
    <Menu
      aria-hidden={!element}
      open={!!element}
      onClose={handelClose}
      anchorEl={element}
    >
      <ToggleButtonGroup
        value={myReaction}
        exclusive
        onChange={handleLike}
        aria-label="text alignment"
        sx={{ overflowX: "scroll", width: "100%" }}
      >
        {Object.entries(reactionsEmojis).map(([key, emoji]) => (
          <ToggleButton value={key} aria-label={key} sx={{ border: "0" }}>
            {emoji}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      
      <MenuItem onClick={handelReply}>
        <ListItemIcon>
          <ReplyIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Reply</ListItemText>
      </MenuItem>

      <MenuItem onClick={handleCopy}>
        <ListItemIcon>
          <ContentCopyIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Copy</ListItemText>
      </MenuItem>

      {myMessage ? (
        <MenuItem onClick={onMessageDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      ) : null}
    </Menu>
  );
}
