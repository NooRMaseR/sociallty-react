import { Box, Typography } from "@mui/material";

export default function Page404() {
    return (
        <Box className="d-flex justify-content-center align-items-center" sx={{ height: "100svh", flexDirection: "column" }}>
            <Typography component="h1">Opps...</Typography>
            <Typography component="h2">Page Not Found</Typography>
            <Typography component="h3">404</Typography>
        </Box>
    );
}