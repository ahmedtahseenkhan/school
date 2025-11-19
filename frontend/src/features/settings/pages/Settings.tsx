import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <div className="font-semibold">Appearance</div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Theme</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Current: {theme}</div>
            </div>
            <Button onClick={toggleTheme} variant="secondary">Toggle Theme</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="font-semibold">Profile</div>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="First Name" placeholder="John" />
            <Input label="Last Name" placeholder="Doe" />
            <Input label="Email" type="email" placeholder="john@example.com" className="md:col-span-2" />
            <Select label="Language" options={[{ label: 'English', value: 'en' }, { label: 'Arabic', value: 'ar' }]} />
            <Checkbox label="Receive notifications" />
            <div className="md:col-span-2 flex items-center gap-2">
              <Button type="button" onClick={() => setOpen(true)}>Open Modal</Button>
              <Button type="submit" variant="primary">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Alert title="Heads up" variant="info">This is a sample settings page showing form controls, alerts, and modals.</Alert>

      <Modal open={open} onClose={() => setOpen(false)} title="Sample Modal">
        <p className="text-sm text-gray-600 dark:text-gray-300">You can place any content here. Click outside or the × to close.</p>
      </Modal>
    </div>
  );
}
