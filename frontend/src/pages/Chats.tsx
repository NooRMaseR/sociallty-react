import { Box, Container, Typography, List, ListItem, ListItemAvatar, ListItemText, Divider, IconButton, Button, CircularProgress } from '@mui/material';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { ApiUrls, FullUser, MEDIA_URL } from '../utils/constants';
import { LazyAvatar } from '../components/media_skelatons';
import { useLoadingBar } from 'react-top-loading-bar';
import MessageIcon from '@mui/icons-material/Message';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import styled from '@emotion/styled';
import api from '../utils/api';

const StyledListItem = styled(ListItem)`
  &:hover {
    background-color: rgba(25, 118, 210, 0.08);
    cursor: pointer;
  }
`;

interface UserListProps {
  users: Array<FullUser & { last_message: string | null, last_message_from_id: number | null }>;
  onUserClick: (user: FullUser) => void;
}

const UserList = memo(({ users, onUserClick }: UserListProps) => {
  const renderUsers = useMemo(() =>
    users.map((user, index) => (
      <React.Fragment key={user.id}>
        <StyledListItem
          secondaryAction={
            <IconButton edge="end" aria-label="chat" onClick={() => onUserClick(user)}>
              <MessageIcon />
            </IconButton>
          }
          onClick={() => onUserClick(user)}
        >
          <ListItemAvatar>
            <LazyAvatar
              width="3rem"
              height="3rem"
              alt={user.username}
              src={`${MEDIA_URL}${user.profile_picture}`}
            />
          </ListItemAvatar>
            <ListItemText
            sx={{color: 'var(--text-color)'}}
            primary={user.username}
            secondary={user.last_message ? `${user.last_message_from_id === user.id ? "You" : user.username}: ${user.last_message}`: null}
          />
        </StyledListItem>
        {index < users.length - 1 && <Divider variant="inset" component="li" />}
      </React.Fragment>
    )),
    [users, onUserClick]
  );

  return <List sx={{ width: '100%', bgcolor: 'background.paper' }}>{renderUsers}</List>;
});

export default function Chats() {
  const [users, setUsers] = useState<FullUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(true);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const { complete } = useLoadingBar();
  const navigate = useNavigate();

  const getUsers = useCallback(async () => {
    setError(null);
    setButtonLoading(true);
    try {
      const res = await api.get<{ users: FullUser[]; has_next: boolean }>(
        ApiUrls.see_user_friends + pageNumber.toString() + "&request-type=with-message"
      );
      if (res && res.status === 200) {
        setUsers((us) => [...us, ...res.data.users]);
        setHasNext(res.data.has_next);
        setButtonLoading(false);
        setLoading(false);
      }
    } catch {
      setError('Something went wrong while getting your friends. Please refresh the page.');
    } finally {
      setButtonLoading(false);
    }
  }, [pageNumber]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);
  
  useEffect(() => {
    complete();
  }, [])

  const handleUserClick = useCallback((user: FullUser) => {
    navigate(`/chat/${user.id}?username=${user.username}`);
  }, [navigate]);

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography color="error" variant="h6" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Chats</title>
        <meta name="description" content="Chat with your friends on Sociallty" />
      </Helmet>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom sx={{color: 'var(--text-color)'}}>
          Chats
        </Typography>
        <Box sx={{ mt: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : users.length > 0 ? (
            <UserList users={users as UserListProps['users']} onUserClick={handleUserClick} />
          ) : (
            <Typography variant="body1" align="center" sx={{ mt: 4, color: 'var(--text-color)' }}>
                  No friends ?
                  Add some friends to start chating!
            </Typography>
          )}
        </Box>
      </Container>
      <Box sx={{ display: "flex", placeContent: "center", mt: "7rem" }}>
        {hasNext ? (
          <Button
            variant="contained"
            loading={buttonLoading}
            loadingPosition="start"
            onClick={() => setPageNumber((pre) => pre + 1)}
          >
            {buttonLoading ? "Please wait..." : "Load More"}
          </Button>
        ) : null}
      </Box>
    </>
  );
} 