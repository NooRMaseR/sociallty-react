import FloatingLabelInput from "../components/floating_input_label";
import Stepper, { Step } from "../components/Stepper/Stepper";
import { PasswordField } from "../components/password_field";
import { ApiUrls, TokenResponse } from "../utils/constants";
import { LazyAvatar } from "../components/media_skelatons";
import styles from "../styles/forget_password.module.css";
import { useCallback, useEffect, useState } from "react";
import VerificationInput from "react-verification-input";
import { useLoadingBar } from "react-top-loading-bar";
import EmailIcon from "@mui/icons-material/Email";
import { Box, Typography } from "@mui/material";
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
  const [activeStep, setActiveStep] = useState<number>(1);
  const { register, handleSubmit, setValue } =
    useForm<ChangePasswordStepsProps>();
  const { start, complete } = useLoadingBar();
  const navigate = useNavigate();

  const handelOnEmailSubmit = useCallback(
    async (data: ChangePasswordStepsProps, onSuccess: () => void) => {
      setLoading(true);
      setErrors({});
      try {
        const res = await api.post<TokenResponse>(ApiUrls.forget_password, {
          email: data.email,
        });

        if (res && res.status == 200) {
          onSuccess();
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
      return false;
    },
    []
  );

  const handelOnCodeSubmit = useCallback(
    async (data: ChangePasswordStepsProps, onSuccess: () => void) => {
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
          onSuccess();
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
      return false;
    },
    []
  );

  const handelOnPasswordChangeSubmit = useCallback(
    async (data: ChangePasswordStepsProps) => {
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
    },
    [navigate, start]
  );

  useEffect(() => {
    complete();
  }, [complete]);

  const ChangePasswordFuncsSteps = useCallback(
    async (updater?: (step: number) => void) => {
      switch (activeStep) {
        case 1:
          await handleSubmit((data) =>
            handelOnEmailSubmit(data, () => updater?.(2))
          )();
          break;

        case 2:
          await handleSubmit((data) =>
            handelOnCodeSubmit(data, () => updater?.(3))
          )();
          break;

        default:
          break;
      }
    },
    [activeStep]
  );

  return (
    <Box sx={{ placeItems: "center" }}>
      <Helmet>
        <title>Forget Password</title>
        <meta
          name="description"
          content="Forget Your Password ?, Authenticate To Change your Password Now."
        />
      </Helmet>
      <Box
        component="form"
        className="no-style"
        sx={{ width: "100%" }}
        onSubmit={(e) => e.preventDefault()}
      >
        <Stepper
          initialStep={activeStep}
          disableStepIndicators
          loading={loading}
          onStepChange={setActiveStep}
          beforeStepChange={ChangePasswordFuncsSteps}
          onFinalStepCompleted={handleSubmit(handelOnPasswordChangeSubmit)}
          style={{ width: "100%" }}
        >
          <Step>
            <Box id="header">
              <Typography
                component="h3"
                color={errors.email ? "error" : "primary"}
              >
                Enter Your Email
              </Typography>
              <LazyAvatar src="/favicon.ico" width="10rem" height="10rem" />
            </Box>
            <FloatingLabelInput
              type="email"
              label="Email"
              preffexIcon={<EmailIcon sx={{ color: "var(--text-color)" }} />}
              autoComplete="email"
              inputProps={{
                error: !!errors.email,
                helperText: errors.email,
              }}
              {...register("email", { required: true })}
              disableDetectTextDir
              required
            />
          </Step>
          <Step>
            <Box id="header">
              <Typography color={errors.code ? "error" : "primary"}>
                {errors.code ? "error Verifying your Email" : "Verify Email"}
              </Typography>
              <LazyAvatar src="/favicon.ico" width="10rem" height="10rem" />
            </Box>
            <Box sx={{ display: "flex", placeContent: "center" }}>
              <VerificationInput
                validChars="0-9"
                placeholder=""
                inputProps={{
                  inputMode: "numeric",
                  autoComplete: "one-time-code",
                }}
                onComplete={(code) => {
                  setValue("code", +code);
                }}
                classNames={{
                  character: styles.character,
                }}
              />
            </Box>
          </Step>
          <Step>
            <Box id="header">
              <Typography color={errors.passwordError ? "error" : "primary"}>
                Change Your Password
              </Typography>
              <LazyAvatar src="/favicon.ico" width="10rem" height="10rem" />
            </Box>
            <PasswordField
              label="New Password"
              inputProps={{
                error: !!errors.passwordError,
                helperText: errors.passwordError,
              }}
              {...register("password")}
            />
            <PasswordField
              label="Confirm Password"
              inputProps={{
                error: !!errors.passwordError,
                helperText: errors.passwordError,
              }}
              {...register("confirm_password")}
              
            />
          </Step>
        </Stepper>
      </Box>
    </Box>
  );
}
