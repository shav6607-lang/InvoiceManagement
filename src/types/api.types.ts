export interface ApiUserDetails {
  UserId?: number;
  UserName?: string;
  RoleId?: number;
  RoleName?: string;
  DisplayName?: string;
  CompanyName?: string;
}

export interface LoginResponse {
  access_token?: string;
  accessToken?: string;
  token?: string;
  Message?: string;
  message?: string;
  userDetails?: ApiUserDetails;
  user?: ApiUserDetails;
  data?: {
    access_token?: string;
    token?: string;
    userDetails?: ApiUserDetails;
    user?: ApiUserDetails;
  };
}

export interface ApiInvoiceLineItem {
  productId: string;
  productName: string;
  hsnCode: string;
  Qty: number;
  RatePerUnit: number;
  Unit: string;
  Disc: number;
  TaxAmount?: number;
  Total?: number;
}

export interface ApiInvoice {
  SlNo: number;
  InvoiceNo: string;
  InvoiceDate: string;
  BuyerName?: string;
  BuyerAddress?: string;
  GSTNo?: string;
  BuyerPhone?: string;
  State?: string;
  StateCode?: string;
  DispatchThrough?: string;
  Destination?: string;
  VehicleNo?: string;
  URN?: boolean;
  WeightmentNo?: string;
  CGST?: number;
  SGST?: number;
  IGST?: number;
  Tax?: number;
  CGSTPer?: number;
  SGSTPer?: number;
  GSTPer?: number;
  TaxAmount?: number;
  TotalAmount?: number;
  JsonInvoiceDetails?: ApiInvoiceLineItem[];
}

export interface ApiWrappedResponse<T> {
  data?: T;
  result?: T;
}
