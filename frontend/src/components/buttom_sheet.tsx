import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from "@mui/material";
import { ApiUrls, BackBgStateType, BottomSheetStateType } from "../utils/constants";
import { removePost, setBottomSheetOpen } from "../utils/store";
import { useDispatch, useSelector } from "react-redux";
import { useLoadingBar } from "react-top-loading-bar";
import { memo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { share } from "../utils/functions";
import "../styles/bottom-sheet.css";
import api from "../utils/api";

const DialogCom = memo(({ open, onCancel, onDelete }: { open: boolean, onCancel: (action: boolean) => void, onDelete: () => void }) => {
  const [deleteButtonLoading, setDeleteButtonLoading] = useState<boolean>(false);
  const Dl = () => {
    setDeleteButtonLoading(true);
    onDelete();
    setDeleteButtonLoading(false);
  }
  return (
    <Dialog open={open}>
      <DialogTitle>Delete Post?</DialogTitle>
      <DialogContent>
        <DialogContentText>Are you sure you want to delete this post, you won't be able to restore it again</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={() => onCancel(false)}>Cancel</Button>
        <Button variant="outlined" color="error" loading={deleteButtonLoading} loadingPosition="start" onClick={Dl}>Delete</Button>
      </DialogActions>
    </Dialog>
  )
});


export default function ButtomSheet() {
  const { start } = useLoadingBar();
  const [openDlg, setOpenDlg] = useState<boolean>(false);
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

  const handleShareButton = useCallback(() => {
    share(last_post_id);
    dispatch(setBottomSheetOpen({ open: false, last_post_id: -1 }));
  }, [last_post_id]);


  const confirmDelete = useCallback(() => setOpenDlg(true),[]);

  const handelDeleteButton = useCallback(async () => {
    const res = await api.delete(ApiUrls.post, {
      data: { postID: last_post_id },
    });
    
    if (res.status === 200) {
      closeBottomSheet();
      dispatch(removePost(last_post_id));
    }
    setOpenDlg(false);
  }, [last_post_id]);

  const handelEdit = () => {
    start();
    navigate(`/edit-post-page/${last_post_id}`);
    dispatch(setBottomSheetOpen({ open: false, last_post_id: -1 }));
  };

  const closeBottomSheet = useCallback(() => dispatch(setBottomSheetOpen({ last_post_id: -1, open: false })), []);

  return (
    <>
      <DialogCom open={openDlg} onCancel={() => setOpenDlg(false)} onDelete={handelDeleteButton} />
      <div id="back-bg" className={(buttom_opened || back_opened) ? "open-back-bg" : ""} onClick={closeBottomSheet}></div>
      <div id="bottom-sheet" style={{ bottom: buttom_opened ? 0 : "-100%" }}>
        <div>
          <Typography id="sheet-title">Options</Typography>
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
              onClick={confirmDelete}
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
