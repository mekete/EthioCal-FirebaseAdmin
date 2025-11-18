import React, { useState, useEffect } from 'react';
import { HolidayConfig } from '../types';
import { getRemoteConfig, updateRemoteConfig } from '../api';
import EditConfigModal from './EditConfigModal';

const RemoteConfigManager: React.FC = () => {
  const [configs, setConfigs] = useState<HolidayConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<HolidayConfig | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRemoteConfig();
      setConfigs(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigClick = (config: HolidayConfig, index: number) => {
    setSelectedConfig({ ...config });
    setSelectedIndex(index);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    const newConfig: HolidayConfig = {
      offset_description: '',
      offset_eid_al_adha: 0,
      offset_eid_al_fitr: 0,
      offset_mawlid: 0,
      offset_greg_year: new Date().getFullYear(),
      offset_ethio_year: new Date().getFullYear() - 7,
      offset_hirji_year: new Date().getFullYear() - 579,
      offset_stage: 'dev',
      offset_update_timestamp: Date.now(),
    };
    setSelectedConfig(newConfig);
    setSelectedIndex(null);
    setIsModalOpen(true);
  };

  const handleSave = async (updatedConfig: HolidayConfig) => {
    try {
      setError(null);
      const newConfigs = [...configs];

      if (selectedIndex !== null) {
        // Update existing
        newConfigs[selectedIndex] = {
          ...updatedConfig,
          offset_update_timestamp: Date.now(),
        };
      } else {
        // Add new
        newConfigs.push({
          ...updatedConfig,
          offset_update_timestamp: Date.now(),
        });
      }

      await updateRemoteConfig(newConfigs);
      setConfigs(newConfigs);
      setIsModalOpen(false);
      setSelectedConfig(null);
      setSelectedIndex(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (index: number) => {
    if (!window.confirm('Are you sure you want to delete this configuration?')) {
      return;
    }

    try {
      setError(null);
      const newConfigs = configs.filter((_, i) => i !== index);
      await updateRemoteConfig(newConfigs);
      setConfigs(newConfigs);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading configurations...</div>;
  }

  return (
    <div className="remote-config-manager">
      <div className="header">
        <h2>Remote Config Management</h2>
        <button onClick={loadConfigs} className="btn-secondary">
          Refresh
        </button>
        <button onClick={handleAddNew} className="btn-primary">
          Add New Config
        </button>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="config-list">
        {configs.length === 0 ? (
          <div className="empty-state">
            No configurations found. Click "Add New Config" to create one.
          </div>
        ) : (
          configs.map((config, index) => (
            <div key={index} className="config-item">
              <div className="config-item-header" onClick={() => handleConfigClick(config, index)}>
                <h3>{config.offset_description || `Config ${index + 1}`}</h3>
                <span className="config-year">
                  {config.offset_greg_year} / {config.offset_ethio_year} / {config.offset_hirji_year}
                </span>
              </div>
              <div className="config-item-details">
                <span className="badge">{config.offset_stage}</span>
                <span className="offset">Eid al-Adha: {config.offset_eid_al_adha}</span>
                <span className="offset">Eid al-Fitr: {config.offset_eid_al_fitr}</span>
                <span className="offset">Mawlid: {config.offset_mawlid}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(index);
                }}
                className="btn-danger btn-sm"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      {isModalOpen && selectedConfig && (
        <EditConfigModal
          config={selectedConfig}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedConfig(null);
            setSelectedIndex(null);
          }}
        />
      )}
    </div>
  );
};

export default RemoteConfigManager;
