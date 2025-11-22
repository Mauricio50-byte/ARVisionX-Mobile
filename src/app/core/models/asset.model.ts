export type AssetType = 'model' | 'image' | 'pattern';

export interface Asset {
  id: number;
  name: string;
  type: AssetType;
  url: string;
  format?: string;
  sizeBytes?: number;
}
