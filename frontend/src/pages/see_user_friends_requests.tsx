import { memo, ReactNode, useCallback, useEffect, useState } from "react";
import AccountCardSkelaton from "../components/account_card_skelaton";
import { ApiUrls, FullUser } from "../utils/constants";
import AccountCard from "../components/account_card";
import { Box, Button } from "@mui/material";
import { Helmet } from "react-helmet";
import api from "../utils/api";

export default function SeeUserFriendsRequestsPage() {
  const [users, setUsers] = useState<FullUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const CardsSkelaton = memo(() => {
    const cards: ReactNode[] = [];
    for (let i = 0; i < 10; i++) {
      cards.push(<AccountCardSkelaton key={i} />);
    }

    return cards;
  });
  
  const getAccounts = useCallback(async () => {
    setButtonLoading(true);
    setError(null);
    try {
      const res = await api.get<{ users: FullUser[]; has_next: boolean }>(
        ApiUrls.see_friends_requests + `?list=${pageNumber}`
      );
      if (res && res.status === 200) {
        setUsers((pre) => [...pre, ...res.data.users]);
        setHasNext(res.data.has_next);
        setLoading(false);
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

  const UsersCards = memo(() =>
    loading ? (
      <CardsSkelaton />
    ) : (
      users.map((user) => (
        <AccountCard user={user} key={user.id} forFriends forAcceptRequests />
      ))
    )
  );

  return (
    <>
      <Helmet>
        <title>Friends Requests</title>
        <meta
          name="description"
          content="see your Social friends Requests via sociallty from here!!"
        />
      </Helmet>
      {error ? (
        <h1 className="text-white">{error}</h1>
      ) : (
        <>
          <div className="cards-holder">
            <UsersCards />
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
            ) : (
              <p>No More Friend Requests...</p>
            )}
          </Box>
        </>
      )}
    </>
  );
}
