import styles from "../styles/profile.module.css";
import { Skeleton } from "@mui/material";

export default function Profileskeleton() {
    const animationType = "wave";
    return (
      <>
        <div id={styles["user-profile-pic"]}>
          <Skeleton
            variant="rounded"
            animation={animationType}
            sx={{ width: "80%", height: "50svh", mb: "2rem" }}
          />
        </div>
        <div id={styles["info"]}>
          <div id={styles["counters"]} className="d-flex gap-4">
            <div>
              <Skeleton
                variant="text"
                animation={animationType}
                sx={{ width: "7rem", height: "6rem" }}
              />
            </div>
            <div>
              <Skeleton
                variant="text"
                animation={animationType}
                sx={{ width: "7rem", height: "6rem" }}
              />
            </div>
          </div>
          <div id={styles["user-info"]}>
            <div style={{ width: "100%" }}>
              <Skeleton
                variant="text"
                animation={animationType}
                sx={{ width: "6rem", height: "2rem" }}
              />
              <Skeleton
                variant="text"
                animation={animationType}
                sx={{ width: "100%", height: "2rem" }}
              />
              <Skeleton
                variant="text"
                animation={animationType}
                sx={{ width: "60%", height: "2rem" }}
              />
              <Skeleton
                variant="text"
                animation={animationType}
                sx={{ width: "20%", height: "2rem" }}
              />
            </div>
            <Skeleton
              variant="rectangular"
              animation={animationType}
              sx={{ width: "7rem", height: "2rem" }}
            />
          </div>
        </div>
      </>
    );
  };