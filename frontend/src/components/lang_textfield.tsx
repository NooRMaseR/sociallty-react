import { ChangeEvent, ReactNode, useCallback, useState } from "react";
import { textDir } from "../utils/functions";
import { TextField } from "@mui/material";

interface LangTextFieldProps {
    children: ReactNode;
    onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    disableDetectTextDir?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
};

export default function LangTextField({ children, onChange, disableDetectTextDir = false, ...props }: LangTextFieldProps) {
    const [dir, setDir] = useState<"ltr" | "rtl">("ltr");
    const change_lang = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const text = e.target.value.trim();
        if (text.length > 0) {
            const first_letter = text[0].toLowerCase();
            const nextDir = textDir(first_letter)
            if (dir !== nextDir) setDir(nextDir);
        }
    }, [dir]);

    const onClick = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!disableDetectTextDir) change_lang(e);
        onChange?.(e);
    }, [change_lang, disableDetectTextDir, onChange]);

    return (
        <TextField
            dir={dir}
            onChange={onClick}
            {...props}
        >
            {children}
        </TextField>
    )
}