import { MEDIA_URL, FullUser, reactionsEmojis } from "../../utils/constants";
import { textDir, formatDate, formatNumbers } from "../../utils/functions";
import { Badge, Box, Paper, Typography } from "@mui/material";
import { UserNeededData } from "../../pages/Chat";
import styles from "../../styles/chat.module.css";
import { LazyAvatar } from "../media_skelatons";
import { styled } from "@mui/material/styles";

export interface MessageRecive {
  id: number;
  message: string;
  from_user: FullUser;
  to_user: FullUser;
  sent_at: string;
}

export interface Reaction {
  id: number;
  reaction: string;
  created_at: string;
  from_user: UserNeededData;
}

export interface ContextMenu {
  element?: HTMLElement | null;
  messageId?: number | null;
  myMessage?: boolean;
  myReaction: string;
  setElementToContextMenu: (
    element: {
      element: HTMLElement | null;
      messageId: number | null;
      myMessage: boolean;
      myReaction: string;
    } | null
  ) => void;
}

export interface MessageCommonProps {
  username: string;
  user_id: number;
  elementToContextMenu: {
    element: null | HTMLElement;
    messageId: null | number;
    myMessage: boolean;
    myReaction: string;
  } | null;
  setElementToContextMenu: (
    element: {
      element: HTMLElement | null;
      messageId: number | null;
      myMessage: boolean;
      myReaction: string;
    } | null
  ) => void;
}

export interface MessageBubbleProps extends MessageCommonProps {
  message: MessageRecive;
  reactions: Reaction[];
  myReaction: string;
}

function createReaction(reactions: Reaction[]): string {
  const reacts: Record<string, number> = {};
  reactions.forEach((reaction) => {
    const emoje =
      reactionsEmojis[reaction.reaction as keyof typeof reactionsEmojis];
    if (reacts[emoje]) {
      reacts[emoje]++;
    } else {
      reacts[emoje] = 1;
    }
  });
  return Object.entries(reacts)
    .map(([reaction, count]) => `${reaction} ${formatNumbers(count)}`)
    .join(" ");
}

const MessageBubbleStyled = styled(Paper)<{ sender: "user" | "other" }>`
  padding: 1rem;
  width: fit-content;
  margin: ${({ sender }) => (sender === "user" ? "0 0 0 auto" : "0")};
  background-color: ${({ sender }) =>
    sender === "user" ? "#1976d2" : "#292929"};

  &:hover {
    background-color: ${({ sender }) =>
      sender === "user" ? "#1565c0" : "#333"};
  }
`;

const MessageBubbleReactionStyled = styled(Badge) <{ sender: "user" | "other" }>`
  display: flex;
  width: fit-content;
  margin: ${({ sender }) => (sender === "user" ? "0 0 0 auto" : "0")};
  background-color: ${({ sender }) =>
  sender === "user" ? "#1565c0" : "#333"};
  
  & > span {
    width: max-content;
  }
`;

export default function MessageBubble({
  message,
  elementToContextMenu,
  setElementToContextMenu,
  user_id,
  username,
  reactions,
  myReaction,
}: MessageBubbleProps) {
  const reacts: string = createReaction(reactions);
  const belongsToUser: boolean = message.from_user.id === user_id;
  return (
    <Box
      key={message.id}
      id={`message-${message.id}`}
      className={
        elementToContextMenu?.element
          ? elementToContextMenu.messageId === message.id
            ? styles["has-context-menu"]
            : styles["has-no-context-menu"]
          : styles["has-context-menu"]
      }
      aria-haspopup="true"
      sx={{
        display: "flex",
        alignItems: "flex-start",
        flexDirection: belongsToUser ? "row-reverse" : "row",
        userSelect: "none",
        gap: 1,
      }}
    >
      <LazyAvatar
        src={`${MEDIA_URL}${message.from_user.profile_picture}`}
        width="2.8rem"
        height="2.8rem"
        alt={message.from_user.username}
      >
        {belongsToUser
          ? username[0].toUpperCase()
          : message.from_user.username[0].toUpperCase()}
      </LazyAvatar>
      <Box
        sx={{ width: "fit-content", maxWidth: "70%" }}
        onContextMenu={(e) => {
          e.preventDefault();
          setElementToContextMenu({
            element: e.currentTarget,
            messageId: message.id,
            myMessage: belongsToUser,
            myReaction: myReaction,
          });
        }}
      >
        {reacts ? (
          <MessageBubbleReactionStyled
            badgeContent={reacts} color="primary"
            sender={belongsToUser ? "user" : "other"}
            anchorOrigin={{
              vertical: "top",
              horizontal: belongsToUser ? "left" : "right",
            }}
          >
            <MessageBubbleStyled
              sender={belongsToUser ? "user" : "other"}
            >
              <Typography dir={textDir(message.message)}>
                {message.message}
              </Typography>
            </MessageBubbleStyled>
          </MessageBubbleReactionStyled>
        ) : (
          <MessageBubbleStyled
            sender={belongsToUser ? "user" : "other"}
          >
            <Typography dir={textDir(message.message)}>
              {message.message}
            </Typography>
          </MessageBubbleStyled>
        )}
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: belongsToUser ? "right" : "left",
            mt: 0.5,
            color: "#9e9e9e",
          }}
        >
          {formatDate(message.sent_at)}
        </Typography>
      </Box>
    </Box>
  );
}
