import { Box, Container, Typography, List, ListItem, ListItemAvatar, ListItemText, Avatar, Divider, IconButton } from '@mui/material';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { ApiUrls, FullUser, MEDIA_URL } from '../utils/constants';
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

const UserList = memo(({ users, onUserClick }: { users: FullUser[], onUserClick: (user: FullUser) => void }) => {
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
            <Avatar
              alt={user.username}
              src={`${MEDIA_URL}${user.profile_picture}`}
            />
          </ListItemAvatar>
            <ListItemText
            sx={{color: 'var(--text-color)'}}
            primary={user.username}
            secondary={user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : 'No name set'}
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
  const { complete } = useLoadingBar();
  const navigate = useNavigate();

  const getUsers = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get<{ users: FullUser[]; has_next: boolean }>(
        ApiUrls.see_user_friends + '1'
      );
      if (res && res.status === 200) {
        setUsers(res.data.users);
        setLoading(false);
        complete();
      }
    } catch {
      setError('Something went wrong while getting your friends. Please refresh the page.');
    }
  }, []);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

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
              <Typography sx={{color: 'var(--text-color)'}}>Loading...</Typography>
            </Box>
          ) : users.length > 0 ? (
            <UserList users={users} onUserClick={handleUserClick} />
          ) : (
            <Typography variant="body1" align="center" sx={{ mt: 4, color: 'var(--text-color)' }}>
              No friends found. Add some friends to start chatting!
            </Typography>
          )}
        </Box>
      </Container>
    </>
  );
} 