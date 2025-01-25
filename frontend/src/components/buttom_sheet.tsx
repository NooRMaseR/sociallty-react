import { ApiUrls, BackBgStateType, BottomSheetStateType } from "../utils/constants";
import { removePost, setBottomSheetOpen } from "../utils/store";
import { disablePageScroll, share } from "../utils/functions";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "../styles/bottom-sheet.css";
import { useEffect } from "react";
import api from "../utils/api";

export default function ButtomSheet() {
  const buttom_opened = useSelector(
    (state: BottomSheetStateType) => state.bottomSheetState.open
  );
  
  const last_post_id = useSelector(
    (state: BottomSheetStateType) => state.bottomSheetState.last_post_id
  );

  const back_opened = useSelector(
    (state: BackBgStateType) => state.back_bg_state.value
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleShareButton = () => {
    share(last_post_id);
    dispatch(setBottomSheetOpen({ open: false, last_post_id: -1 }));
  };

  const handelDeleteButton = async () => {
    const res = await api.delete(ApiUrls.post, {
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

  const closeBottomSheet = () => dispatch(setBottomSheetOpen({ last_post_id: -1, open: false }));

  useEffect(() => {
    disablePageScroll(buttom_opened || back_opened);
  }, [buttom_opened, back_opened]);

  return (
    <>
      <div id="back-bg" className={(buttom_opened || back_opened) ? "open-back-bg" : ""} onClick={closeBottomSheet}></div>
      <div id="bottom-sheet" style={{ bottom: buttom_opened ? 0 : "-100%" }}>
        <div>
          <p id="sheet-title">Options</p>
          <hr />
          <div id="options">
            <div
              className="sheet-btn"
              onClick={handleShareButton}
            >
              Share
            </div>
            <div className="sheet-btn" id="sheet-edit-btn" onClick={handelEdit}>
              Edit
            </div>
            <div
              className="sheet-btn"
              onClick={handelDeleteButton}
              style={{ color: "red" }}
            >
              Delete
            </div>
            <div
              className="sheet-btn"
              onClick={closeBottomSheet}
            >
              Cancel
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
