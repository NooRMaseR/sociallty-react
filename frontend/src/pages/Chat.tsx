import {
  Box,
  Container,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  ListItemText,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import MessageBubble, {
  MessageCommonProps,
  MessageRecive,
  Reaction,
} from "../components/chat/message_bubble";
import {
  ACCESS,
  ApiUrls,
  FullUser,
  MEDIA_URL,
  reactionsEmojis,
  WEBSOCKET_URL,
} from "../utils/constants";
import { useParams, useNavigate, NavigateFunction } from "react-router-dom";
import MessageContextMenu from "../components/chat/message_context_menu";
import React, { useState, useRef, useEffect, useCallback } from "react";
import FloatingLabelInput from "../components/floating_input_label";
import ReplyBox, { ReplyBoxProps } from "../components/chat/reply";
import { LazyAvatar } from "../components/media_skelatons";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { removeFriend } from "../utils/functions";
import SendIcon from "@mui/icons-material/Send";
import styles from "../styles/chat.module.css";
import api from "../utils/api";

interface FullUserWithReport extends FullUser {
  reported: boolean;
}

interface WSMessageSend {
  from_user: string;
  from_user_id: number;
  from_user_profile_picture: string;

  to_user: string;
  to_user_id: number;
  to_user_profile_picture: string;

  id: number;
  message: string;
  sent_at: string;
  replied_to: ReplyBoxProps["reply"]
}

interface WSMessageReact {
  id: number;
  message: number;
  reaction: keyof typeof reactionsEmojis;
  event_type: "react";
  msg_event_type: "add" | "remove" | "replace";
  created_at: string;
  from_user: UserNeededData;
}

export interface UserNeededData {
  id: number;
  username: string;
}

interface UserMessageOnly {
  id: number;
  message: string;
  from_user: UserNeededData;
  to_user: UserNeededData;
  sent_at: string;
  reactions: Reaction[];
  replied_to?: ReplyBoxProps["reply"];
}

interface MessagesProps extends MessageCommonProps {
  messages: UserMessageOnly[];
}

const UserMenuOptions = React.memo(
  ({
    user,
    element,
    handleClose,
    handelOnReportClick,
    handelUnfriendClick,
    navigate,
  }: {
    user: FullUserWithReport;
    element: HTMLElement | null;
    handleClose: () => void;
    handelOnReportClick: (value: boolean) => void;
    handelUnfriendClick: (value: boolean) => void;
    navigate: NavigateFunction;
  }) => {
    const handelUserProfile = useCallback(() => {
      handleClose();
      navigate(`/social-user-profile?username=${user.username}&id=${user.id}`);
    }, [user.id, user.username, navigate, handleClose]);

    const handelReport = useCallback(() => {
      handelOnReportClick(true);
      handleClose();
    }, [handelOnReportClick, handleClose]);

    const handelUnfriend = useCallback(() => {
      handelUnfriendClick(true);
      handleClose();
    }, [handelUnfriendClick, handleClose]);

    return (
      <Menu open={!!element} anchorEl={element} onClose={handleClose}>
        <MenuItem onClick={handelUserProfile}>
          <ListItemText>Show Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={handelUnfriend}>
          <ListItemText sx={{ color: "red" }}>UnFriend</ListItemText>
        </MenuItem>
        <MenuItem onClick={handelReport}>
          <ListItemText sx={{ color: "red" }}>Report</ListItemText>
        </MenuItem>
      </Menu>
    );
  }
);

const Messages = React.memo(
  ({
    messages,
    username,
    user_id,
    elementToContextMenu,
    setElementToContextMenu,
  }: MessagesProps) =>
    messages
      .map((message) => {
        return (
        <MessageBubble
          key={message.id}
          message={message as unknown as MessageRecive}
          username={username}
          user_id={user_id}
          elementToContextMenu={elementToContextMenu}
          setElementToContextMenu={setElementToContextMenu}
          reactions={message.reactions}
          myReaction={
            message.reactions.find(
              (reaction) => reaction.from_user.id === user_id
            )?.reaction ?? ""
          }
          reply={message.replied_to}
          />
        )
      }).reverse()
);

export default function Chat() {
  const { userId: send_to_id } = useParams<{ userId: string }>();
  const [messages, setMessages] = useState<UserMessageOnly[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [userToChat, setUserToChat] = useState<FullUserWithReport | null>(null);
  const [reportReason, setReportReason] = useState<string>("");
  const [isReportReady, setIsReportReady] = useState<boolean>(false);
  const [isUnfriendReady, setIsUnfriendReady] = useState<boolean>(false);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [userMenu, setUserMenu] = useState<HTMLElement | null>(null);
  const [msgIdFromRelpy, setMsgIdFromRelpy] = useState<number>(0);
  const ws = useRef<WebSocket | null>(null);

  const [elementToContextMenu, setElementToContextMenu] = useState<{
    element: null | HTMLElement;
    messageId: null | number;
    myMessage: boolean;
    myReaction: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isScrolled = useRef<boolean>(false);
  const hasMore = useRef<boolean>(false);

  const navigate = useNavigate();
  const username: string = localStorage.getItem("username") ?? "";
  const user_id: number = parseInt(localStorage.getItem("id") ?? "0");

  const scrollToBottom = useCallback(
    (scrollBehave: ScrollBehavior = "smooth"): void =>
      messagesEndRef.current?.scrollIntoView({ behavior: scrollBehave }),
    []
  );

  const getChatUser = useCallback(async () => {
    if (!send_to_id) return;
    try {
      const res = await api.get<{
        user_to_chat?: FullUserWithReport;
        messages?: UserMessageOnly[];
        has_more: boolean;
      }>(`${ApiUrls.chat}${send_to_id}/?page=${pageNumber}`);
      if (res.status === 200) {
        setMessages((msgs) => [...msgs, ...(res.data?.messages ?? [])]);
        hasMore.current = res.data?.has_more;
        if (!isScrolled.current) {
          setUserToChat(res.data?.user_to_chat ?? null);
        }
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      navigate("/chat");
    }
  }, [send_to_id, navigate, pageNumber]);

  const connect_socket = useCallback(() => {
    if (!userToChat?.username || !userToChat?.id) return null;

    const token = localStorage.getItem(ACCESS);
    const sw = new WebSocket(
      `${WEBSOCKET_URL}/chat/${userToChat.username}/${userToChat.id}/`,
      token ? [token + token.substring(0, 5)] : undefined
    );

    sw.onmessage = (e) => {
      const check_data = JSON.parse(e.data);
      switch (check_data.event_type) {
        case "send": {
          const data: WSMessageSend = check_data;
          setMessages((msgs) => [
            {
              id: data.id,
              message: data.message,
              from_user: {
                id: data.from_user_id,
                username: data.from_user,
                profile_picture: data.from_user_profile_picture,
              },
              to_user: {
                id: data.to_user_id,
                username: data.to_user,
                profile_picture: data.to_user_profile_picture,
              },
              sent_at: data.sent_at,
              reactions: [],
              replied_to: data.replied_to?.id ? data.replied_to : undefined,
            },
            ...msgs,
          ]);
          scrollToBottom();
          break;
        }

        case "delete": {
          const data: { id: number } = check_data;
          setMessages((msgs) => msgs.filter((msg) => msg.id !== data.id));
          break;
        }

        case "react": {
          const data: WSMessageReact = check_data;

          if (data.msg_event_type === "replace") {
            const msg = messages.find((msg) => msg.id == data.message);
            if (msg) {
              msg.reactions = msg.reactions.filter((r) => r.id !== data.id);
              msg.reactions.push({
                id: data.id,
                reaction: data.reaction,
                created_at: data.created_at,
                from_user: data.from_user,
              });
              setMessages((msgs) =>
                msgs.map((innerMsg) =>
                  innerMsg.id == data.message ? msg : innerMsg
                )
              );
            }
            return;
          }
          setMessages((msgs) =>
            msgs.map((innerMsg) =>
              innerMsg.id == data.message
                ? {
                    ...innerMsg,
                    reactions:
                      data.msg_event_type === "add"
                        ? [
                            ...innerMsg.reactions,
                            {
                              id: data.id,
                              reaction: data.reaction,
                              created_at: data.created_at,
                              from_user: data.from_user,
                            },
                          ]
                        : innerMsg.reactions.filter((r) => r.id !== data.id),
                  }
                : innerMsg
            )
          );
          break;
        }
        default:
          break;
      }
    };
    return sw;
  }, [userToChat?.id, userToChat?.username, scrollToBottom, messages]);

  useEffect(() => {
    async function start() {
      await getChatUser();
      if (pageNumber === 1) scrollToBottom();
    }
    document.body.addEventListener("contextmenu", (e) => e.preventDefault());
    start();

    return () => {
      window.removeEventListener("contextmenu", (e) => e.preventDefault());
    };
  }, [scrollToBottom]);

  useEffect(() => {
    if (userToChat) {
      if (!ws.current) {
        const newWs = connect_socket();
        if (newWs) {
          ws.current = newWs;
        }
      }
    }
  }, [connect_socket]);

  useEffect(() => {
    if (pageNumber === 1) return;
    async function get() {
      await getChatUser();
      isScrolled.current = false;
    }
    get();
  }, [pageNumber, getChatUser]);

  useEffect(() => {
    const handleScrollEvent = () => {
      if (window.scrollY <= 100 && !isScrolled.current && hasMore.current) {
        isScrolled.current = true;
        setPageNumber((num) => num + 1);
      }
    };

    // Adding a small delay to ensure DOM is loaded
    const timer = setTimeout(() => {
      if (pageNumber === 1) scrollToBottom();
      window.addEventListener("scroll", handleScrollEvent);
    }, 100);

    return () => {
      window.removeEventListener("scroll", handleScrollEvent);
      clearTimeout(timer);
    };
  }, [scrollToBottom, messages]);

  useEffect(() => {
    if (pageNumber === 1) scrollToBottom("instant");
  }, [messages.length, scrollToBottom]);

  const handleSendMessage = useCallback(async () => {
    if (newMessage.trim()) {
      ws.current?.send(
        JSON.stringify({
          event_type: "send",
          message: newMessage,
          to_user: parseInt(send_to_id ?? "-1"),
          from_user: user_id,
          replying_to: msgIdFromRelpy,
        })
      );
      setNewMessage("");
      setMsgIdFromRelpy(0)
      scrollToBottom();
    }
  }, [newMessage, send_to_id, user_id, scrollToBottom, msgIdFromRelpy]);

  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent) => {
      if (navigator.userAgent.includes("Android")) {
        if (event.key !== "Enter") {
          event.preventDefault();
        }
      } else {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          handleSendMessage();
        }
      }
    },
    [handleSendMessage]
  );

  const handleBackButton = useCallback(() => navigate("/chat"), [navigate]);

  const handleDelete = useCallback(
    async (messageId: number) => {
      ws.current?.send(
        JSON.stringify({
          event_type: "delete",
          id: messageId,
          to_user: parseInt(send_to_id ?? "-1"),
          from_user: user_id,
        })
      );
    },
    [send_to_id, user_id]
  );

  const getReplyObject = useCallback(() => {
    const m = messages.find(msg => msg.id === msgIdFromRelpy);
    return {
      id: m?.id ?? 0,
      message: m?.message ?? "",
      to_user: m?.to_user ?? {} as UserNeededData,
      from_user: m?.from_user ?? {} as UserNeededData,
    }
  }, [messages, msgIdFromRelpy])

  const handelOnReply = useCallback((msg_id: number) => {
    setMsgIdFromRelpy(msg_id);
  }, [])

  const handleOpenUserMenu = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setUserMenu(e.currentTarget);
  }, []);

  const handleCloseUserMenu = useCallback(() => {
    setUserMenu(null);
  }, []);

  const handelOnReact = useCallback((msg_id: number, value: string) => {
    ws.current?.send(
      JSON.stringify({
        event_type: "react",
        message_id: msg_id,
        reaction: value,
      })
    );
  }, []);

  const reportUser = useCallback(async () => {
    try {
      const res = await api.post(ApiUrls.report, {
        user_id: userToChat?.id,
        reason: reportReason,
      });

      if (res.status === 201) {
        navigate("/chat");
      } else if (res.status === 208) {
        setIsReportReady(false);
      }
    } catch (error) {
      console.error(error);
    }
  }, [userToChat?.id, reportReason]);

  const UnfriendUser = useCallback(async () => {
    const res = await removeFriend(userToChat?.id ?? 0);
    if (res.success) {
      navigate("/chat");
    }
  }, [userToChat?.id]);

  return (
    <Box
      className="d-flex align-items-center flex-column"
      sx={{ width: "100%" }}
    >
      <Box id={styles["header-container"]}>
        <div>
          <Tooltip title="Back">
            <IconButton onClick={handleBackButton}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <LazyAvatar
            src={`${MEDIA_URL}${userToChat?.profile_picture}`}
            alt={username}
            width="2.5rem"
            height="2.5rem"
          />
          <Typography variant="h6">{userToChat?.username}</Typography>
        </div>
        <UserMenuOptions
          element={userMenu}
          handleClose={handleCloseUserMenu}
          handelOnReportClick={setIsReportReady}
          handelUnfriendClick={setIsUnfriendReady}
          user={userToChat ?? ({} as FullUserWithReport)}
          navigate={navigate}
        />
        <Tooltip title="More">
          <IconButton aria-haspopup="true" onClick={handleOpenUserMenu}>
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Dialog open={isReportReady}>
        {userToChat?.reported ? (
          <>
            <DialogTitle>{userToChat?.username} Aready Reported</DialogTitle>
            <DialogContent>
              <DialogContentText>
                You Have Already Reported {userToChat?.username}, you can't
                Report {userToChat?.gender === "male" ? "him" : "her"} Twice
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsReportReady(false)}>Ok</Button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogTitle>Report {userToChat?.username}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Tell Us Why you want to Report {userToChat?.username}
              </DialogContentText>
              <FloatingLabelInput
                label="Reason"
                onChangeUpdater={setReportReason}
                inputProps={{ multiline: true }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsReportReady(false)}>cancel</Button>
              <Button color="error" variant="outlined" onClick={reportUser}>
                Report
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={isUnfriendReady}>
        <DialogTitle>UnFreind {userToChat?.username}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure that you want to UnFreind {userToChat?.username}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsUnfriendReady(false)}>Cancel</Button>
          <Button color="error" variant="outlined" onClick={UnfriendUser}>
            Unfrend
          </Button>
        </DialogActions>
      </Dialog>

      <Container maxWidth="md" sx={{ paddingBottom: 10 }}>
        <MessageContextMenu
          element={elementToContextMenu?.element}
          messageId={elementToContextMenu?.messageId}
          myMessage={elementToContextMenu?.myMessage}
          setElementToContextMenu={setElementToContextMenu}
          handleDelete={handleDelete}
          setOnReact={handelOnReact}
          setOnReply={handelOnReply}
          myReaction={elementToContextMenu?.myReaction ?? ""}
        />
        <Box id={styles["message-container"]}>
          <Messages
            messages={messages}
            username={username}
            user_id={user_id}
            elementToContextMenu={elementToContextMenu}
            setElementToContextMenu={setElementToContextMenu}
          />
          <div ref={messagesEndRef} />
        </Box>
      </Container>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
          width: "100%",
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: 1,
          backgroundColor: "#292929",
          borderTop: "1px solid #333",
        }}
      >
        <Box>
          {msgIdFromRelpy > 0 ? <ReplyBox reply={getReplyObject()} onClose={() => setMsgIdFromRelpy(0)} /> : null}

          <Box sx={{display: "flex", justifyContent: "center", alignItems: "center",}}>
            <FloatingLabelInput
              label="Message"
              value={newMessage}
              onChangeUpdater={setNewMessage}
              onKeyUp={handleKeyPress}
              boxSx={{ width: "80vw" }}
              inputProps={{
                multiline: true,
              }}
            />
            <Tooltip title="Send Message">
              <span>
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <SendIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
