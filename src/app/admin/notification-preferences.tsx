import { useEffect, useState } from 'react';

interface NotificationSetting {
  id: string;
  provider: string;
  displayName: string;
  description: string;
  isActive: boolean;
}

export default function NotificationPreferences() {
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testResult, setTestResult] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/admin/notification-settings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setSettings(data);
        else setError(data.error || 'Failed to fetch settings');
      } catch (err) {
        setError('Failed to fetch settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleTest = async (setting: NotificationSetting) => {
    setTestLoading(true);
    setTestResult('');
    const recipient = prompt('Enter test recipient (email, phone, or Telegram chat ID):');
    if (!recipient) {
      setTestLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/notification-settings/test', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settingId: setting.id,
          recipient,
          testMessage: `Test notification via ${setting.provider}`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) setTestResult('Test sent successfully!');
      else setTestResult(data.details || 'Failed to send test');
    } catch (err) {
      setTestResult('Error sending test notification');
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Notification Preferences (Admin)</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Provider</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {settings.map((setting) => (
              <tr key={setting.id}>
                <td className="px-4 py-2">{setting.displayName}</td>
                <td className="px-4 py-2">{setting.description}</td>
                <td className="px-4 py-2">{setting.isActive ? 'Active' : 'Inactive'}</td>
                <td className="px-4 py-2">
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                    onClick={() => handleTest(setting)}
                    disabled={testLoading}
                  >
                    Test
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {testResult && <div className="mt-4 text-green-500">{testResult}</div>}
    </div>
  );
} 