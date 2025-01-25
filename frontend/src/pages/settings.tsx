import { Alert, AlertColor, Box, Button, FormControlLabel, Switch, Tooltip } from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { ApiUrls, UserSettings } from "../utils/constants";
import { FormEvent, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import api from "../utils/api";


export default function SettingsPage() {
    const [settings, setSettings] = useState<UserSettings>({
        is_private_account: false
    } as UserSettings);
    const [alertOpen, setAlertOpen] = useState<boolean>(false);
    const [settingsLoaded, setSettingsLoaded] = useState<boolean>(false);
    const [alertColor, setAlertColor] = useState<AlertColor>('success');
    const [alertContent, setAlertContent] = useState<string>('Settings updated successfully');
    

    // Fetch initial settings
    useEffect(() => {
        const getUserSettings = async () => {
            const res = await api.get<UserSettings>(ApiUrls.settings);
            if (res.status === 200) {
                setSettings(res.data);
                setSettingsLoaded(true);
            }
        };
        getUserSettings();
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateSetting = (key: keyof UserSettings, value: any) => {
        setSettings((pre) => ({ ...pre, [key]: value }));
    }

    // Handle settings update
    const handleUpdateSettings = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.put(ApiUrls.settings, {...settings});
            
            if (res.status === 200) {
                setAlertColor('success');
                setAlertContent('Settings updated successfully');
                setAlertOpen(true);
                setTimeout(() => setAlertOpen(false), 3000);
            }
        } catch {
            setAlertColor('error');
            setAlertContent('Failed to update settings');
            setAlertOpen(true);
            setTimeout(() => setAlertOpen(false), 3000);
        }
    };

    return (
        <>
            <Helmet>
                <title>Settings</title>
                <meta name="description" content="Update Your Social Settings From Here Now" />
            </Helmet>
            {alertOpen && <Alert severity={alertColor}>{alertContent}</Alert>}
            <Box component='form' onSubmit={handleUpdateSettings} sx={{backgroundColor: 'transparent'}}>
                <Box className="d-flex gap-4" sx={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FormControlLabel
                        label='Private Account'
                        labelPlacement="start"
                        sx={{ width: 'fit-content' }}
                        control={
                            <Switch
                                disabled={settingsLoaded === false}
                                checked={settings.is_private_account}
                                onChange={(e) => updateSetting('is_private_account', e.target.checked)}
                            />
                        }
                    />
                    <Tooltip title='If enabled, no one can view your posts except your friends'>
                        <InfoOutlinedIcon sx={{ color: '#fff' }} />
                    </Tooltip>
                </Box>
                <Button type="submit" variant="contained" disabled={settingsLoaded === false}>Save</Button>
                <Button variant="outlined" color="error" sx={{ mt: '4rem', ml: '1rem' }} disabled={settingsLoaded === false}>
                    Delete Account
                </Button>
            </Box>
        </>
    );
}