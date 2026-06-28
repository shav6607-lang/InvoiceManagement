export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
} as const;

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  INVOICES: '/invoices',
  INVOICES_CREATE: '/invoices/create',
  DC: '/dc',
  DC_CREATE: '/dc/create',
  REPORTS: '/reports',
  USERS: '/users',
  COMPANIES: '/companies',
  MATERIALS: '/materials',
} as const;

export const API_ENDPOINTS = {
  LOGIN: '/Login',
  INVOICE_LIST: '/Invoice/GetInvoiceList',
  INVOICE_ADD: '/Invoice/AddInvoice',
  DC_LIST: '/DC/GetDCList',
  DC_ADD: '/DC/AddDC',
  DC_DELETE: (id: number) => `/DC/DeleteDC/${id}`,
  COMPANIES: '/Material/GetCompanies',
  MATERIALS: '/Material/GetList',
  MATERIAL_ADD: '/Material/AddMaterial',
} as const;

/** Endpoints callable without an auth token */
export const PUBLIC_API_ENDPOINTS = [API_ENDPOINTS.LOGIN] as const;
