import React, {
  memo,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CardsSkelaton } from "../components/users_skelaton";
import { ApiUrls, FullUser } from "../utils/constants";
import { useLoadingBar } from "react-top-loading-bar";
import { Box, Button } from "@mui/material";
import { Helmet } from "react-helmet";
import api from "../utils/api";

const LazyAccountCard = React.lazy(() => import("../components/account_card"));

const Cards = memo(({ users }: { users: FullUser[] }) => {
  const renderCards = useMemo(
    () =>
      users.map((user) => (
        <LazyAccountCard user={user} key={user.id} forFriends={false} />
      )),
    [users]
  );
  return <Suspense fallback={<CardsSkelaton />}>{renderCards}</Suspense>;
});

export default function SocialFriendsPage() {
  const [users, setUsers] = useState<FullUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [buttonloading, setButtonLoading] = useState<boolean>(false);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [firstInit, setFirstInit] = useState<boolean>(true);
  const [list, setList] = useState<number>(1);
  const { complete } = useLoadingBar();

  const getAccounts = useCallback(async () => {
    setButtonLoading(true);
    const res = await api.get<{ users: FullUser[]; has_next: boolean }>(
      ApiUrls.social_users + `?list=${list}`
    );
    if (res && res.status === 200) {
      setUsers((prev) => [...prev, ...res.data.users]);
      if (firstInit) {
        setLoading(false);
        setFirstInit(false);
        complete();
      }
      setHasNext(res.data.has_next);
      setButtonLoading(false);
    }
  }, [list, complete]);

  useEffect(() => {
    if (!buttonloading) getAccounts();
  }, [getAccounts]);

  return (
    <>
      <Helmet>
        <title>Social Friends</title>
        <meta
          name="description"
          content="Find and connect with Social Friends in Sociallty"
        />
      </Helmet>
      <div className="cards-holder">
        {loading ? <CardsSkelaton /> : <Cards users={users} />}
      </div>
      {hasNext ? (
        <Box
          sx={{ display: "flex", placeContent: "center", marginBlock: "7rem" }}
        >
          <Button
            variant="contained"
            loading={buttonloading}
            loadingPosition="start"
            onClick={() => setList((prev) => prev + 1)}
          >
            {buttonloading ? "Please wait..." : "Load More"}
          </Button>
        </Box>
      ) : (
        <p>No More Users...</p>
      )}
    </>
  );
}
