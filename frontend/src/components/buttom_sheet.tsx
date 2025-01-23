import { removePost, setBottomSheetOpen } from "../utils/store";
import { useDispatch, useSelector } from "react-redux";
import { handleShare } from "../utils/functions";
import { useNavigate } from "react-router-dom";
import "../styles/bottom-sheet.css";
import { useEffect } from "react";
import api from "../utils/api";

export default function ButtomSheet() {
  const opened = useSelector(
    (state: { bottomSheetState: { open: boolean } }) =>
      state.bottomSheetState.open
  );
  const last_post_id = useSelector(
    (state: { bottomSheetState: { last_post_id: number } }) =>
      state.bottomSheetState.last_post_id
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleShareButton = () => {
    handleShare(last_post_id);
    dispatch(setBottomSheetOpen({ open: false, last_post_id: -1 }));
  };

  const handelDeleteButton = async () => {
    const res = await api.delete("/api/post/", {
      data: { postID: last_post_id },
    });

    if (res.status === 200) {
      dispatch(removePost(last_post_id));
      dispatch(setBottomSheetOpen({ open: false, last_post_id: -1 }));
    }
  };

  const handelEdit = () => {
    navigate(`/edit-post-page/${last_post_id}`);
    dispatch(setBottomSheetOpen({ open: false, last_post_id: -1 }));
  };

  useEffect(() => {
    document.body.style.overflow = opened ? "hidden" : "initial";
  }, [opened]);

  return (
    <>
      <div id="back-bg" className={opened ? "open-back-bg" : ""} onClick={() => dispatch(setBottomSheetOpen({last_post_id: -1, open: false}))}></div>
      <div id="bottom-sheet" style={{ bottom: opened ? 0 : "-100%" }}>
        <div>
          <p id="sheet-title">Options</p>
          <hr />
          <div id="options">
            <div
              className="sheet-btn"
              id="sheet-share-btn"
              onClick={handleShareButton}
            >
              Share
            </div>
            <div className="sheet-btn" id="sheet-edit-btn" onClick={handelEdit}>
              Edit
            </div>
            <div
              className="sheet-btn"
              id="sheet-delete-btn"
              onClick={handelDeleteButton}
              style={{ color: "red" }}
            >
              Delete
            </div>
            <div
              className="sheet-btn"
              id="sheet-cancel-btn"
              onClick={() =>
                dispatch(setBottomSheetOpen({ open: false, last_post_id: -1 }))
              }
            >
              Cancel
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
