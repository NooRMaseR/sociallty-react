import {
  Alert,
  AlertColor,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
  Tooltip,
} from "@mui/material";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { ApiUrls, UserSettings } from "../utils/constants";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import api from "../utils/api";

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    is_private_account: false,
  } as UserSettings);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [settingsLoaded, setSettingsLoaded] = useState<boolean>(false);
  const [alertColor, setAlertColor] = useState<AlertColor>("success");
  const [alertContent, setAlertContent] = useState<string>("Settings updated successfully");
  const [dialogOpend, setDialogOpend] = useState<boolean>(false);
  const [dlgAcceptedToDelete, setDlgAcceptedToDelete] = useState<boolean>(false);
  const [inputError, setInputError] = useState<string>("");
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const getUserSettings = useCallback(async () => {
    const res = await api.get<UserSettings>(ApiUrls.settings);
    if (res.status === 200) {
      setSettings(res.data);
      setSettingsLoaded(true);
    }
  }, []);

  useEffect(() => {
    getUserSettings();
  }, [getUserSettings]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateSetting = useCallback((key: keyof UserSettings, value: any) => {
    setSettings((pre) => ({ ...pre, [key]: value }));
  }, []);

  const handleUpdateSettings = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      try {
        const res = await api.put(ApiUrls.settings, { ...settings });

        if (res.status === 200) {
          setAlertColor("success");
          setAlertContent("Settings updated successfully");
          setAlertOpen(true);
          setTimeout(() => setAlertOpen(false), 3000);
        }
      } catch {
        setAlertColor("error");
        setAlertContent("Failed to update settings");
        setAlertOpen(true);
        setTimeout(() => setAlertOpen(false), 3000);
      }
    },
    [settings]
  );

  const openDialog = () => setDialogOpend(true);
  const closeDialog = () => {
    setDialogOpend(false);
    setDlgAcceptedToDelete(false);
  };
  const confirmDeleteUser = () => setDlgAcceptedToDelete(true);

  const deleteUser = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      try {
        const res = await api.delete(ApiUrls.edit_user, {
          data: { password: passwordInputRef.current?.value },
        });
        if (res.status === 200) {
          navigate("/logout");
          closeDialog();
        }
      } catch {
        setInputError("Wrong Password");
      }
    },
    [navigate]
  );

  const DlgContent = () => {
    if (dlgAcceptedToDelete) {
      return (
        <>
          <form onSubmit={deleteUser} className="no-style">
            <DialogTitle>Confirming</DialogTitle>

            <DialogContent>
              <DialogContentText>
                Please Confirm Your Password.
              </DialogContentText>
              <TextField
                ref={passwordInputRef}
                label="Password"
                type="password"
                variant="filled"
                onChange={(e) =>
                  passwordInputRef.current &&
                  (passwordInputRef.current.value = e.target.value)
                }
                error={inputError !== ""}
                helperText={inputError}
              />
            </DialogContent>

            <DialogActions>
              <Button type="submit" variant="outlined" color="error">
                Confirm
              </Button>
              <Button variant="contained" onClick={closeDialog}>
                Cancel
              </Button>
            </DialogActions>
          </form>
        </>
      );
    } else {
      return (
        <>
          <DialogTitle>Warning</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are Your Sure You Want to Delete Your Account? you won't be able
              to restore it again!!!
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={confirmDeleteUser}
              color="error"
            >
              Yes
            </Button>
            <Button variant="contained" onClick={closeDialog}>
              Cancel
            </Button>
          </DialogActions>
        </>
      );
    }
  };

  return (
    <>
      <Helmet>
        <title>Settings</title>
        <meta
          name="description"
          content="Update Your Social Settings From Here Now"
        />
      </Helmet>
      <Dialog open={dialogOpend} onClose={closeDialog}>
        <DlgContent />
      </Dialog>
      {alertOpen && <Alert severity={alertColor}>{alertContent}</Alert>}
      <Box
        component="form"
        onSubmit={handleUpdateSettings}
        sx={{
          backgroundColor: "transparent",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
        className="no-style"
      >
        <Box
          className="d-flex gap-4"
          sx={{ flexDirection: "row", alignItems: "center" }}
        >
          <FormControlLabel
            label="Private Account"
            labelPlacement="start"
            sx={{ width: "fit-content" }}
            control={
              <Switch
                disabled={settingsLoaded === false}
                checked={settings.is_private_account}
                onChange={(e) =>
                  updateSetting("is_private_account", e.target.checked)
                }
              />
            }
          />
          <Tooltip title="If enabled, no one can view your posts except your friends">
            <InfoOutlinedIcon sx={{ color: "#fff" }} />
          </Tooltip>
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: "2rem",
            placeContent: "center",
            width: "100%",
          }}
        >
          <Button
            type="submit"
            variant="contained"
            disabled={settingsLoaded === false}
          >
            Save
          </Button>
          <Button
            variant="outlined"
            color="error"
            disabled={settingsLoaded === false}
            onClick={openDialog}
          >
            Delete Account
          </Button>
        </Box>
      </Box>
    </>
  );
}
