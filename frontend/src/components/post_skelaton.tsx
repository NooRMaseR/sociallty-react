import { Box, Skeleton } from "@mui/material";

export default function PostSkelaton({ animationType = "wave", useBox = true }: { animationType?: "wave" | "pulse", useBox?: boolean }) {
  const renderSkeleton = () => (
    <>
      <div className="post-profile">
        <Skeleton variant="circular" animation={animationType} width="3.5rem" height="3.5rem" />
        <div className="profile-name d-flex" style={{ textAlign: "end", flexDirection: 'column', alignItems: 'end' }}>
          <Skeleton variant="text" animation={animationType} width={160} height={30} />
          <Skeleton variant="text" animation={animationType} width={120} height={30} />
          <Skeleton variant="text" animation={animationType} width={100} height={30} />
        </div>
      </div>

      {/* post description */}
      <Skeleton variant="text" animation={animationType} width={150} height={30} />

      {/* the post media */}
      <div className="post-content">
        <Skeleton variant="rectangular" animation={animationType} width="100%" height={400} />
      </div>

      {/* bottons for the post */}
      <Box className="d-flex" width="100%" height={100} sx={{ justifyContent: 'space-evenly', flexDirection: 'row', gap: '1rem' }}>
        <Skeleton component='div' variant="rounded" width={100} height={60} animation={animationType} className="likes" />
        <Skeleton component='div' variant="rounded" width={100} height={60} animation={animationType} className="comments" />
        <Skeleton component='div' variant="rounded" width={100} height={60} animation={animationType} className="share" />
      </Box>
    </>
  );

  return useBox ? (
        <Box className="post-container" height={700}>
          {renderSkeleton()}
        </Box >
      ) : renderSkeleton();
  
}
