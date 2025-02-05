import { Card, Skeleton } from "@mui/material";

export default function CommentSkeleton() {
  return (
    <Card className="user-comment">
      <div className="d-flex gap-2">
        <Skeleton variant="circular" animation="wave" width={60} height={60} />
        <Skeleton animation="wave" width={200} height={30} />
      </div>
      <Skeleton animation="wave" width={200} height={20} />
      <Skeleton animation="wave" width={100} height={20} />
      <Skeleton animation="wave" width={500} height={20} />
      <div style={{ width: "100%", display: "flex", justifyContent: "end" }}>
        <Skeleton animation="wave" width={100} height={20} />
      </div>
    </Card>
  );
}
