import { ACCESS, ApiUrls, REFRESH, TokenResponse } from "../utils/constants";
import FloatingLabelInput from "../components/floating_input_label";
import { PasswordField } from "../components/password_field";
import { LazyAvatar } from "../components/media_skelatons";
import { useCallback, useEffect, useState } from "react";
import { useLoadingBar } from "react-top-loading-bar";
import { Link, useNavigate } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import { setHasToken } from "../utils/store";
import { Box, Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { Helmet } from "react-helmet";
import api from "../utils/api";
import "../styles/login.css";

interface LoginProps {
  email: string;
  password: string;
}

export default function Login() {
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { register, handleSubmit } = useForm<LoginProps>();
  const { start, complete } = useLoadingBar();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handelOnSubmit = useCallback(async (data: LoginProps) => {
    setLoading(true);
    setErrors([]);
    try {
      const res = await api.post<TokenResponse>(ApiUrls.user_log_sign, {
        ...data
      });

      if (res && res.status == 200) {
        start();
        localStorage.setItem(ACCESS, res.data.access);
        localStorage.setItem(REFRESH, res.data.refresh);
        localStorage.setItem("id", res.data.id.toString());
        localStorage.setItem("username", res.data.username);
        localStorage.setItem("profile_pic", res.data.profile_picture);
        dispatch(setHasToken(true));
        navigate("/");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      if (error?.response?.status === 400) {
        setErrors(Object.values(error.response.data));
      } else {
        setErrors(["Somthing went wrong, please try Again."]);
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch, navigate, start]);

  const startLoading = useCallback(() => start(), [start]);

  useEffect(() => {
    (document.getElementById("root") as HTMLDivElement).style.height = "100%";
    complete();
  }, [complete]);

  return (
    <div id="container">
      <Helmet>
        <title>Sociallty Login</title>
        <meta name="description" content="Log in To be Social and be with commounty of sociallty" />
      </Helmet>
      <form onSubmit={handleSubmit(handelOnSubmit)}>
        <Box id="header">
          <h1 id="pic-label">Welcome</h1>
          <LazyAvatar src="/favicon.ico" width="10rem" height="10rem" alt="Sociallty Icon" />
        </Box>
        <FloatingLabelInput
          type="email"
          label="Email"
          preffexIcon={<EmailIcon sx={{ color: "var(--text-color)" }} />}
          {...register('email', {required: true})}
          autoComplete="email"
          disableDetectTextDir
          required
        />
        <PasswordField {...register('password', { required: true })}/>
        {errors.length != 0 ? (
          <ul>
            {errors.map((value, index) => (
              <li style={{ color: "red" }} key={index}>
                {value}
              </li>
            ))}
          </ul>
        ): null}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            placeItems: "center",
          }}
        >
          <Button
            loading={loading}
            loadingPosition="start"
            variant="contained"
            type="submit"
            disabled={loading}
            sx={{ width: "12rem", ":disabled": { color: "var(--text-color)" } }}
          >
            {loading ? "Please wait...." : "Login"}
          </Button>
        </Box>
        <div id="links">
          <Link to="/signup" onClick={startLoading} className="link">
            Dont have Account ?
          </Link>
          <Link to="/user/forgot-password" onClick={startLoading} className="link">
            Forget Your Password ?
          </Link>
        </div>
      </form>
    </div>
  );
}
