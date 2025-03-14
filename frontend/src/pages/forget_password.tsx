import { Box, Button, Step, StepLabel, Stepper, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import FloatingLabelInput from "../components/floating_input_label";
import { memo, useCallback, useEffect, useState } from "react";
import { ApiUrls, TokenResponse } from "../utils/constants";
import { LazyAvatar } from "../components/media_skelatons";
import styles from "../styles/forget_password.module.css";
import VerificationInput from "react-verification-input";
import { useLoadingBar } from "react-top-loading-bar";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Helmet } from "react-helmet";
import api from "../utils/api";
import "../styles/login.css";

interface ChangePasswordStepsProps {
  email: string;
  code: number;
  password: string;
  confirm_password: string;
}

export default function ForgetPasswordPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const { register, handleSubmit, setValue } = useForm<ChangePasswordStepsProps>();
  const { start, complete } = useLoadingBar();
  const navigate = useNavigate();

  const handelOnEmailSubmit = useCallback(async (data: ChangePasswordStepsProps) => {
    setLoading(true);
    setErrors({});
    try {
      const res = await api.post<TokenResponse>(ApiUrls.forget_password, {
        email: data.email,
      });

      if (res && res.status == 200) {
        setActiveStep(activeStep + 1);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      if (error.response.status === 400) {
        const er: Record<string, string> = {};
        for (const [key, value] of Object.entries<string>(
          error.response.data
        )) {
          er[key] = value;
        }
        setErrors(er);
        console.log(er);
      } else if (error.response.status === 404) {
        setErrors({ email: error.response.data.detail });
      } else {
        setErrors({ error: "Somthing went wrong, please try Again." });
      }
    } finally {
      setLoading(false);
    }
  }, [activeStep]);

  const handelOnCodeSubmit = useCallback(async (data: ChangePasswordStepsProps) => {
    setLoading(true);
    setErrors({});
    try {
      const res = await api.delete<TokenResponse>(ApiUrls.forget_password, {
        data: {
          code: data.code,
          email: data.email,
        },
      });

      if (res && res.status == 200) {
        setActiveStep(activeStep + 1);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      if (error.response.status === 404) {
        setErrors({ ...error.response.data });
      } else {
        setErrors({ error: "Somthing went wrong, please try Again." });
      }
    } finally {
      setLoading(false);
    }
  }, [activeStep]);

  const handelOnPasswordChangeSubmit = useCallback(async (
    data: ChangePasswordStepsProps
  ) => {
    setLoading(true);
    setErrors({});
    if (data.password !== data.confirm_password) {
      setErrors({
        passwordError: "Password and Confirm Password must be the same.",
      });
      setLoading(false);
      return;
    }
    try {
      const res = await api.put<TokenResponse>(ApiUrls.forget_password, {
        ...data,
      });

      if (res && res.status == 200) {
        start();
        navigate("/login");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response.status === 404) {
        setErrors({ ...error.response.data });
      } else {
        setErrors({ error: "Somthing went wrong, please try Again." });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, start]);

  useEffect(() => {
    complete();
  }, [complete]);

  const ChangePasswordSteps = memo(() => {
    switch (activeStep) {
      case 0:
        return (
          <form onSubmit={handleSubmit(handelOnEmailSubmit)}>
            <Box id="header">
              <Typography component="h1" id="pic-label">Forget Password</Typography>
              <LazyAvatar
                src="/favicon.ico"
                width="10rem"
                height="10rem"
              />
            </Box>
            <FloatingLabelInput
              type="email"
              label="Email"
              suffexIcon={<EmailIcon sx={{ color: "var(--text-color)" }} />}
              autoComplete="email"
              inputProps={{
                error: !!errors.email,
                helperText: errors.email,
              }}
              {...register("email")}
              disableDetectTextDir
              required
            />
            <Button
              type="submit"
              variant="contained"
              loading={loading}
              loadingPosition="start"
              sx={{ width: "100%", marginTop: "1rem" }}
            >
              {loading ? "Please wait...." : "Send Email"}
            </Button>
          </form>
        );

      case 1:
        return (
          <form onSubmit={handleSubmit(handelOnCodeSubmit)}>
            <Button
              sx={{ float: "left", width: "fit-content" }}
              onClick={() => navigate("/user/forget-password")}
            >
              <ArrowBackRoundedIcon />
            </Button>
            <Box id="header">
              <h1 id="pic-label">Confirm Email</h1>
              <LazyAvatar
                src="/favicon.ico"
                width="10rem"
                height="10rem"
              />
            </Box>
            <Box sx={{display: 'flex', placeContent: 'center'}}>
              <VerificationInput 
                validChars="0-9" 
                placeholder="" 
                inputProps={{ inputMode: "numeric", autoComplete: "one-time-code" }}
                onComplete={(code) => {
                  setValue('code', +code);
                  handleSubmit(handelOnCodeSubmit)();
                }}
                classNames={{
                  character: styles.character
                }}
              />
            </Box>
          </form>
        );

      case 2:
        return (
          <form onSubmit={handleSubmit(handelOnPasswordChangeSubmit)}>
            <Box id="header">
              <Typography component="h1" id="pic-label">Change Password</Typography>
              <LazyAvatar
                src="/favicon.ico"
                width="10rem"
                height="10rem"
              />
            </Box>
            <FloatingLabelInput
              type="password"
              label="New Password"
              suffexIcon={<LockIcon sx={{ color: "var(--text-color)" }} />}
              slotProps={{ htmlInput: { minLength: 8 } }}
              inputProps={{
                error: !!errors.passwordError,
                helperText: errors.passwordError,
              }}
              {...register("password")}
              required
            />
            <FloatingLabelInput
              type="password"
              label="Confirm Password"
              suffexIcon={<LockIcon sx={{ color: "var(--text-color)" }} />}
              slotProps={{ htmlInput: { minLength: 8 } }}
              inputProps={{
                error: !!errors.passwordError,
                helperText: errors.passwordError,
              }}
              {...register("confirm_password")}
              required
            />
            <Button
              type="submit"
              variant="contained"
              loading={loading}
              loadingPosition="start"
              sx={{ width: "100%", marginTop: "1rem" }}
            >
              {loading ? "Please wait...." : "Change Password Now"}
            </Button>
          </form>
        );

      default:
        break;
    }
  });

  return (
    <Box sx={{ placeItems: "center" }}>
      <Helmet>
        <title>Forget Password</title>
        <meta
          name="description"
          content="Forget Your Password ?, Authenticate To Change your Password Now."
        />
      </Helmet>
      <Stepper alternativeLabel activeStep={activeStep} sx={{ width: "100%" }}>
        <Step>
          <StepLabel error={!!errors.email}>Enter Your Email</StepLabel>
        </Step>
        <Step>
          <StepLabel error={!!errors.code}>Verify Email</StepLabel>
        </Step>
        <Step>
          <StepLabel error={!!errors.passwordError}>
            Change Your Password
          </StepLabel>
        </Step>
      </Stepper>
      <ChangePasswordSteps />
    </Box>
  );
}
