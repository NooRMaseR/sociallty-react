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
        <LazyAccountCard user={user} key={user.id} forFriends={true} />
      )),
    [users]
  );
  return <Suspense fallback={<CardsSkelaton />}>{renderCards}</Suspense>;
});

export default function SeeUserFriendsPage() {
  const [users, setUsers] = useState<FullUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [isFirst, setIsFirst] = useState<boolean>(true);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const { complete } = useLoadingBar();

  const getAccounts = useCallback(async () => {
    setButtonLoading(true);
    setError(null);
    try {
      const res = await api.get<{ users: FullUser[]; has_next: boolean }>(
        ApiUrls.see_user_friends + pageNumber.toString()
      );
      if (res && res.status === 200) {
        setUsers((pre) => [...pre, ...res.data.users]);
        setHasNext(res.data.has_next);
        setLoading(false);
        if (isFirst) {
          setIsFirst(false);
          complete();
        }
      }
    } catch {
      setError(
        "somthing went wrong while getting your friends, please refresh the page"
      );
    }
    setButtonLoading(false);
  }, [pageNumber]);

  useEffect(() => {
    getAccounts();
  }, [getAccounts]);

  return (
    <>
      <Helmet>
        <title>My Friends</title>
        <meta
          name="description"
          content="see your Social friends via sociallty"
        />
      </Helmet>
      {error ? (
        <h1 className="text-white">{error}</h1>
      ) : (
        <>
          <div className="cards-holder">
            {loading ? <CardsSkelaton /> : <Cards users={users} />}
          </div>
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
      )}
    </>
  );
}
