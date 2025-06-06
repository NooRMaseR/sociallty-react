import api from "../utils/api";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LazyAvatar } from "./media_skelatons";
import { decrementCount } from "../utils/store";
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import { memo, useCallback, useState } from "react";
import { useInView } from "react-intersection-observer";
import AccountCardSkelaton from "./account_card_skelaton";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { ApiUrls, FullUser, MEDIA_URL } from "../utils/constants";
import { Button, IconButton, Tooltip, Typography } from "@mui/material";
import { addFriend, deleteRequest, FriendRequest, removeFriend } from "../utils/functions";

export default function AccountCard({
  user,
  forFriends = true,
  forAcceptRequests = false,
}: {
  user: FullUser;
  forFriends?: boolean;
  forAcceptRequests?: boolean;
}) {
  const [toggleButton, setToggleButton] = useState<boolean>(forFriends);
  const [Loaded, setLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const dispatch = useDispatch();

  const handelSendRemoveFriend = useCallback(async () => {
    setIsLoading(true);
    let data: FriendRequest;
    if (!toggleButton) {
      // add
      data = await addFriend(user.id);
      if (data.success) {
        setToggleButton(true);
      }
    } else {
      // remove
      if (!forFriends) {
        data = await deleteRequest(user.id);
        if (data.success) {
          setToggleButton(false);
          setAccepted(false);
          dispatch(decrementCount());
        }
      } else {
        data = await removeFriend(user.id);
        if (data.success) {
          setToggleButton(false);
        }
      }
    }
    setIsLoading(false);
  }, [dispatch, forFriends, toggleButton, user.id]);

  if (inView && !Loaded) {
    setLoaded(true);
  }
  
  const acceptRequest = useCallback(async () => {
    setIsLoading(true);
    const res = await api.put(ApiUrls.see_friends_requests, { friendID: user.id });
    
    if (res.status === 202) {
      setAccepted(true);
      dispatch(decrementCount());
    }

    setIsLoading(false);
  }, [dispatch, user.id]);

  const deleteRequestCom = useCallback(async () => {
    setIsLoading(true);
    const data = await deleteRequest(user.id);
    if (data.success) setAccepted(false);
  }, [user.id]);

  const Buttons = memo(() => {
    if (forAcceptRequests && forFriends) {
      if (accepted === null) {
        return (
          <div className="d-flex gap-2">
            <Tooltip title="Accept the request">
              <IconButton color="success" loading={isLoading} onClick={acceptRequest}>
                <CheckIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete the request">
              <IconButton color="error" loading={isLoading} onClick={deleteRequestCom}>
                <ClearIcon />
              </IconButton>
            </Tooltip>
          </div>
        );
      } else if (accepted === false) {
          return <Typography>Rejected</Typography>
      } else if (accepted) {
          return <Typography>Accepted</Typography>
      }
    } else
      return (
        <>
          <Tooltip title={!toggleButton ? "Add Friend" : "Remove Friend"}>
            <Button
              onClick={handelSendRemoveFriend}
              loading={isLoading}
              loadingPosition="start"
              >
              {!toggleButton ? (
                <PersonAddAlt1Icon
                  className="right re"
                  sx={{ width: "3rem", height: "3rem", bgcolor: '#0169ff' }}
                  titleAccess="Add"
                />
              ) : (
                <PersonRemoveIcon
                  className="right"
                  sx={{ width: "3rem", height: "3rem" }}
                  titleAccess="Remove"
                />
              )}
            </Button>
          </Tooltip>
        </>
      );
  });

  return (
    <>
      <div className="card" ref={ref}>
        {Loaded ? (
          <>
            <div className="left">
              <Tooltip title={`${user.first_name} ${user.last_name}'s profile picture`}>
                <LazyAvatar
                  src={`${MEDIA_URL}${user.profile_picture}`}
                  width="4rem"
                  height="4rem"
                  alt={`${user.first_name} ${user.last_name}`}
                />
              </Tooltip>
              <div className="username">
                <Link
                  to={{
                    pathname: `/social-user-profile`,
                    search: `?username=${user.username}&id=${user.id}`,
                  }}
                >
                  {user.username}
                </Link>
              </div>
            </div>
            <Buttons />
          </>
        ) : (
          <AccountCardSkelaton />
        )}
      </div>
    </>
  );
}
