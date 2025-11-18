export interface HolidayConfig {
  offset_description: string;
  offset_eid_al_adha: number;
  offset_eid_al_fitr: number;
  offset_mawlid: number;
  offset_greg_year: number;
  offset_ethio_year: number;
  offset_hirji_year: number;
  offset_stage: string;
  offset_update_timestamp?: number;
}

export interface MessagePayload {
  topic?: string;
  token?: string;
  title: string;
  body: string;
  category?: 'HOLIDAY' | 'SEASONAL' | 'DAILY_INSIGHT' | 'APP_UPDATE' | 'GENERAL';
  priority?: 'LOW' | 'NORMAL' | 'HIGH';
  actionType?: 'URL' | 'IN_APP_HOLIDAY' | 'IN_APP_EVENT' | 'IN_APP_CONVERTER' | 'IN_APP_SETTINGS';
  actionTarget?: string;
  actionLabel?: string;
  imageUrl?: string;
}

export type AppVariant = 'android-debug' | 'android-prod' | 'ios-debug' | 'ios-prod';
