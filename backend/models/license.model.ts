
export interface LicenseBase {
  id: string;
  beatId: string;
  name: string;
  price: number;
  rightsText: string;
  createdAt: Date;
}

export interface LicenseInput {
  name: string;
  price: number;
  rightsText: string;
}