import { ClickAwayListener, Tooltip } from "@mui/material"
import { ReactElement, useState } from "react";

interface InfoButtonProps {
    title: string;
    children: ReactElement;
}

export default function InfoButton({ title, children }: InfoButtonProps) {
    const [open, setOpened] = useState<boolean>(false);
    return (
        <ClickAwayListener onClickAway={() => setOpened(false)}>
            <Tooltip
                open={open}
                onClose={() => setOpened(false)}
                title={title}
                disableFocusListener
                disableHoverListener
                disableTouchListener
            >
                <div onClick={() => setOpened(true)}>
                    {children}
                </div>
            </Tooltip>
        </ClickAwayListener>
    )
}