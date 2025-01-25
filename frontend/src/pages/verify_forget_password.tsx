import { ApiUrls, ForgetPasswordStateType, TokenResponse } from "../utils/constants";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import FloatingLabelInput from "../components/floating_input_label";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Box, Button } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import { useNavigate } from "react-router-dom";
import { FormEvent, useState } from "react";
import { setEmail } from "../utils/store";
import api from "../utils/api";

export default function VerifyForgetPasswordPage() {
  const [code, setCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [codeCorrect, setCodeCorrect] = useState<boolean>(false);
  const userEmail = useSelector(
    (state: ForgetPasswordStateType) => state.forget_password.email
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handelOnSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!codeCorrect) {
      try {
        const res = await api.delete<TokenResponse>(ApiUrls.forget_password, {
          data: {
            code,
            email: userEmail
          },
        });

        if (res && res.status == 200) {
          setCodeCorrect(true);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error(error);
        if (error.response.status === 404) {
          setError(error.response.data.details);
        } else {
          setError("Somthing went wrong, please try Again.");
        }
      } finally {
        setLoading(false);
      }
    } else {
      if (newPassword !== confirmPassword) {
        setError("Password and Confirm Password must be the same.");
        return;
      }
      try {
        const res = await api.put<TokenResponse>(ApiUrls.forget_password, {
          code,
          email: userEmail,
          password: newPassword,
          confirm_password: confirmPassword,
        });

        if (res && res.status == 200) {
          dispatch(setEmail(''));
          navigate("/login");
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error.response.status === 404) {
          setError(error.response.data.details);
        } else {
          setError("Somthing went wrong, please try Again.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div id="container">
      <form onSubmit={handelOnSubmit}>
        <Button sx={{ float: "left", width: "fit-content" }} onClick={() => navigate("/user/forget-password")}>
          <ArrowBackRoundedIcon />
        </Button>
        <Box id="header">
          <h1 id="pic-label">
            {codeCorrect ? "Set New Password" : "Forget Password"}
          </h1>
          <Avatar src="/favicon.png" sx={{ width: "10rem", height: "10rem" }} />
        </Box>
        {!codeCorrect ? (
          <FloatingLabelInput
            name="code"
            type="number"
            label="Code"
            updater={setCode}
            suffexIcon={<EmailIcon sx={{ color: "#fff" }} />}
            slotProps={{htmlInput: {inputMode: "numeric", maxLength: 6} }}
            required
          />
        ) : (
          <>
            <FloatingLabelInput
              name="password"
              type="password"
              label="New Password"
              updater={setNewPassword}
              suffexIcon={<LockIcon sx={{ color: "#fff" }} />}
              slotProps={{ htmlInput: { minLength: 8 } }}
              required
            />
            <FloatingLabelInput
              name="confirm_password"
              type="password"
              label="Confirm Password"
              updater={setConfirmPassword}
              suffexIcon={<LockIcon sx={{ color: "#fff" }} />}
              slotProps={{ htmlInput: { minLength: 8 } }}
              required
            />
          </>
        )}
        <Box sx={{display: 'flex', placeContent: 'center'}}>
          {error && <p style={{color: 'red'}}>{error}</p>}
        </Box>
        <Button
          type="submit"
          variant="contained"
          loading={loading}
          loadingPosition="start"
          sx={{ width: "100%", marginTop: "1rem" }}
        >
          {loading ? 'Please wait....' : "Send Email"}
        </Button>
      </form>
    </div>
  );
}
