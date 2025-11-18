import React, { useState } from 'react';
import { HolidayConfig } from '../types';

interface Props {
  config: HolidayConfig;
  onSave: (config: HolidayConfig) => Promise<void>;
  onClose: () => void;
}

const EditConfigModal: React.FC<Props> = ({ config, onSave, onClose }) => {
  const [formData, setFormData] = useState<HolidayConfig>(config);
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof HolidayConfig, value: string | number) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Holiday Configuration</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="config-form">
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input
              id="description"
              type="text"
              value={formData.offset_description}
              onChange={(e) => handleChange('offset_description', e.target.value)}
              required
              placeholder="e.g., Holiday offset configuration for 2025"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="greg_year">Gregorian Year</label>
              <input
                id="greg_year"
                type="number"
                value={formData.offset_greg_year}
                onChange={(e) => handleChange('offset_greg_year', parseInt(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="ethio_year">Ethiopian Year</label>
              <input
                id="ethio_year"
                type="number"
                value={formData.offset_ethio_year}
                onChange={(e) => handleChange('offset_ethio_year', parseInt(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="hirji_year">Hijri Year</label>
              <input
                id="hirji_year"
                type="number"
                value={formData.offset_hirji_year}
                onChange={(e) => handleChange('offset_hirji_year', parseInt(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="eid_adha">Eid al-Adha Offset (days)</label>
              <input
                id="eid_adha"
                type="number"
                value={formData.offset_eid_al_adha}
                onChange={(e) => handleChange('offset_eid_al_adha', parseInt(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="eid_fitr">Eid al-Fitr Offset (days)</label>
              <input
                id="eid_fitr"
                type="number"
                value={formData.offset_eid_al_fitr}
                onChange={(e) => handleChange('offset_eid_al_fitr', parseInt(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="mawlid">Mawlid Offset (days)</label>
              <input
                id="mawlid"
                type="number"
                value={formData.offset_mawlid}
                onChange={(e) => handleChange('offset_mawlid', parseInt(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="stage">Stage</label>
            <select
              id="stage"
              value={formData.offset_stage}
              onChange={(e) => handleChange('offset_stage', e.target.value)}
              required
            >
              <option value="dev">Development</option>
              <option value="staging">Staging</option>
              <option value="prod">Production</option>
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditConfigModal;
