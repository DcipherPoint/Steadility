import React, { useState } from 'react';
import { Card, CardContent, Typography, Switch, FormControlLabel, Button, Divider } from '@mui/material';

const Settings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    stockAlerts: true,
    darkMode: false,
    autoSync: true
  });

  const handleSettingChange = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSave = () => {
    // Save settings to backend
    console.log('Saving settings:', settings);
  };

  return (
    <div className="p-6">
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Card className="mt-4">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications}
                onChange={() => handleSettingChange('emailNotifications')}
                color="primary"
              />
            }
            label="Email Notifications"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.stockAlerts}
                onChange={() => handleSettingChange('stockAlerts')}
                color="primary"
              />
            }
            label="Low Stock Alerts"
          />

          <Divider className="my-4" />

          <Typography variant="h6" gutterBottom>
            Appearance
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={settings.darkMode}
                onChange={() => handleSettingChange('darkMode')}
                color="primary"
              />
            }
            label="Dark Mode"
          />

          <Divider className="my-4" />

          <Typography variant="h6" gutterBottom>
            Data Synchronization
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={settings.autoSync}
                onChange={() => handleSettingChange('autoSync')}
                color="primary"
              />
            }
            label="Auto-sync Data"
          />

          <div className="mt-6">
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              className="w-full"
            >
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings; 