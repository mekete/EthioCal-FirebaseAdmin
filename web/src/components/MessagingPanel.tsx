import React, { useState } from 'react';
import { MessagePayload, AppVariant } from '../types';
import { sendMessage } from '../api';

const APP_TOPICS: Record<AppVariant, string> = {
  'android-debug': 'android-debug',
  'android-prod': 'android-prod',
  'ios-debug': 'ios-debug',
  'ios-prod': 'ios-prod',
};

const MessagingPanel: React.FC = () => {
  const [selectedApp, setSelectedApp] = useState<AppVariant>('android-debug');
  const [targetType, setTargetType] = useState<'topic' | 'token'>('topic');
  const [customTarget, setCustomTarget] = useState('');

  const [formData, setFormData] = useState<Partial<MessagePayload>>({
    title: '',
    body: '',
    category: 'GENERAL',
    priority: 'NORMAL',
    actionType: undefined,
    actionTarget: '',
    actionLabel: '',
    imageUrl: '',
  });

  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (field: keyof MessagePayload, value: string) => {
    setFormData({
      ...formData,
      [field]: value || undefined,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.body) {
      setError('Title and body are required');
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const message: MessagePayload = {
        title: formData.title,
        body: formData.body,
        category: formData.category,
        priority: formData.priority,
        actionType: formData.actionType,
        actionTarget: formData.actionTarget || undefined,
        actionLabel: formData.actionLabel || undefined,
        imageUrl: formData.imageUrl || undefined,
      };

      if (targetType === 'topic') {
        message.topic = customTarget || APP_TOPICS[selectedApp];
      } else {
        if (!customTarget) {
          setError('Device token is required');
          setSending(false);
          return;
        }
        message.token = customTarget;
      }

      const messageId = await sendMessage(message);
      setSuccess(`Message sent successfully! Message ID: ${messageId}`);

      // Reset form
      setFormData({
        title: '',
        body: '',
        category: 'GENERAL',
        priority: 'NORMAL',
        actionType: undefined,
        actionTarget: '',
        actionLabel: '',
        imageUrl: '',
      });
      setCustomTarget('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="messaging-panel">
      <h2>Send Push Notification</h2>

      {error && <div className="error-message"><strong>Error:</strong> {error}</div>}
      {success && <div className="success-message"><strong>Success:</strong> {success}</div>}

      <form onSubmit={handleSubmit} className="messaging-form">
        <div className="form-section">
          <h3>Target Selection</h3>

          <div className="form-group">
            <label>Target Type</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="topic"
                  checked={targetType === 'topic'}
                  onChange={(e) => setTargetType(e.target.value as 'topic')}
                />
                Topic
              </label>
              <label>
                <input
                  type="radio"
                  value="token"
                  checked={targetType === 'token'}
                  onChange={(e) => setTargetType(e.target.value as 'token')}
                />
                Device Token
              </label>
            </div>
          </div>

          {targetType === 'topic' && (
            <>
              <div className="form-group">
                <label htmlFor="app-variant">App Variant</label>
                <select
                  id="app-variant"
                  value={selectedApp}
                  onChange={(e) => setSelectedApp(e.target.value as AppVariant)}
                >
                  <option value="android-debug">Android - Debug</option>
                  <option value="android-prod">Android - Production</option>
                  <option value="ios-debug">iOS - Debug</option>
                  <option value="ios-prod">iOS - Production</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="custom-topic">Custom Topic (optional)</label>
                <input
                  id="custom-topic"
                  type="text"
                  value={customTarget}
                  onChange={(e) => setCustomTarget(e.target.value)}
                  placeholder={`Leave empty to use default: ${APP_TOPICS[selectedApp]}`}
                />
              </div>
            </>
          )}

          {targetType === 'token' && (
            <div className="form-group">
              <label htmlFor="device-token">Device Token</label>
              <input
                id="device-token"
                type="text"
                value={customTarget}
                onChange={(e) => setCustomTarget(e.target.value)}
                placeholder="Enter device FCM token"
                required
              />
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>Message Content (Required)</h3>

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              placeholder="e.g., መስቀል Tomorrow!"
            />
          </div>

          <div className="form-group">
            <label htmlFor="body">Body *</label>
            <textarea
              id="body"
              value={formData.body}
              onChange={(e) => handleChange('body', e.target.value)}
              required
              rows={4}
              placeholder="e.g., Meskel celebration begins tomorrow. Join the festivities!"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Optional Fields</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                <option value="GENERAL">General</option>
                <option value="HOLIDAY">Holiday</option>
                <option value="SEASONAL">Seasonal</option>
                <option value="DAILY_INSIGHT">Daily Insight</option>
                <option value="APP_UPDATE">App Update</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="action-type">Action Type</label>
            <select
              id="action-type"
              value={formData.actionType || ''}
              onChange={(e) => handleChange('actionType', e.target.value)}
            >
              <option value="">None</option>
              <option value="URL">URL</option>
              <option value="IN_APP_HOLIDAY">In-App Holiday</option>
              <option value="IN_APP_EVENT">In-App Event</option>
              <option value="IN_APP_CONVERTER">In-App Converter</option>
              <option value="IN_APP_SETTINGS">In-App Settings</option>
            </select>
          </div>

          {formData.actionType && (
            <>
              <div className="form-group">
                <label htmlFor="action-target">Action Target</label>
                <input
                  id="action-target"
                  type="text"
                  value={formData.actionTarget}
                  onChange={(e) => handleChange('actionTarget', e.target.value)}
                  placeholder="e.g., https://example.com or meskel_2024"
                />
              </div>

              <div className="form-group">
                <label htmlFor="action-label">Action Label</label>
                <input
                  id="action-label"
                  type="text"
                  value={formData.actionLabel}
                  onChange={(e) => handleChange('actionLabel', e.target.value)}
                  placeholder="e.g., Learn More"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="image-url">Image URL</label>
            <input
              id="image-url"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => handleChange('imageUrl', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        <div className="form-footer">
          <button type="submit" className="btn-primary btn-large" disabled={sending}>
            {sending ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessagingPanel;
