const fs = require('fs');

// ── Helper: safe literal string replacement (replaces FIRST occurrence only)
// Works on normalized (LF-only) content
function replaceFirst(content, search, replacement) {
  const idx = content.indexOf(search);
  if (idx === -1) {
    console.error('❌ Could not find target string:\n', search.substring(0, 120) + '...');
    return content;
  }
  return content.substring(0, idx) + replacement + content.substring(idx + search.length);
}

// Normalize CRLF -> LF for consistent searching/replacing
function normalize(s) { return s.replace(/\r\n/g, '\n'); }

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INVOICES/index.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let inv = normalize(fs.readFileSync('src/pages/Invoices/index.tsx', 'utf8'));

// 1. Add CompanyInfo interface + companies state + fetch useEffect
const invOld1 = `// ─── Main Invoices Component ────────────────────────────────────────────────
const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { invoices, loading, error } = useAppSelector((state) => state.invoices);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Date and search filters applied on submit
  const [filterSearch, setFilterSearch] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');

  // Fetch invoices on component mount
  useEffect(() => {
    console.log('📋 Invoices component mounted, fetching data...');
    dispatch(fetchInvoices());
  }, [dispatch]);`;

const invNew1 = `// ─── Company Info Interface ─────────────────────────────────────────────────
interface CompanyInfo {
  CompanyId: number;
  Name: string;
  Address?: string;
  GSTNo?: string;
  State?: string;
  StateCode?: string;
  Email?: string;
  Phone?: string;
  BankName?: string;
  BankBranch?: string;
  AccountNo?: string;
  IFSCCode?: string;
  BankAddress?: string;
}

// ─── Main Invoices Component ────────────────────────────────────────────────
const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { invoices, loading, error } = useAppSelector((state) => state.invoices);
  const { token } = useAppSelector((state) => state.auth);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);

  // Date and search filters applied on submit
  const [filterSearch, setFilterSearch] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');

  // Fetch invoices on component mount
  useEffect(() => {
    console.log('📋 Invoices component mounted, fetching data...');
    dispatch(fetchInvoices());
  }, [dispatch]);

  // Fetch company details from API
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = \`Bearer \${token}\`;
        const res = await fetch(\`\${API_BASE}/Material/GetCompanies\`, { headers });
        const json = await res.json();
        if (Array.isArray(json?.Data)) {
          setCompanies(json.Data);
        }
      } catch (e) {
        console.error('Failed to fetch companies:', e);
      }
    };
    fetchCompanies();
  }, [token, API_BASE]);`;

inv = replaceFirst(inv, invOld1, invNew1);

// 2. Replace hardcoded header block
const invOld2 = `              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 1 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '18px', color: 'black' }}>STONE CRUSH COMPANY</Typography>
                <Typography sx={{ fontSize: '11px', color: 'black' }}>123 Industrial Area, Bangalore, Karnataka</Typography>
                <Typography sx={{ fontSize: '11px', color: 'black' }}>GSTIN: 29AAACS2300D1Z4 | State: Karnataka (29)</Typography>
              </Box>
              `;

const invNew2 = `              {/* Header – Dynamic Company Details */}
              {(() => {
                const co = companies.length > 0 ? companies[0] : null;
                const coName = co?.Name || 'M/s. SRI MADESHWARA STONE CRUSHER';
                const coAddress = co?.Address || 'Sy No: 136/4A2, Kakalachinte Village, Mandikal Hobli, Chikkaballapur Taluk, Chikkaballapur - 562104';
                const coGST = co?.GSTNo || '29ABKFS9495G1Z9';
                const coState = co?.State || 'KARNATAKA';
                const coCode = co?.StateCode || '29';
                const coEmail = co?.Email || 'srimadeshwaragroup@gmail.com';
                const coPhone = co?.Phone || '';
                return (
                  <Box sx={{ textAlign: 'center', borderBottom: '2px solid black', pb: 1, mb: 1 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '16px', color: 'black', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {coName}
                    </Typography>
                    <Typography sx={{ fontSize: '10px', color: 'black' }}>{coAddress}</Typography>
                    <Typography sx={{ fontSize: '10px', color: 'black' }}>
                      GSTIN: {coGST} | State: {coState} ({coCode})
                    </Typography>
                    {(coPhone || coEmail) && (
                      <Typography sx={{ fontSize: '10px', color: 'black' }}>
                        {coPhone ? \`Ph: \${coPhone}\` : ''}{coPhone && coEmail ? ' | ' : ''}Email: {coEmail}
                      </Typography>
                    )}
                  </Box>
                );
              })()}
              `;

inv = replaceFirst(inv, invOld2, invNew2);

// 3. Add bank details just before the closing </Box> of renderPrintContent
// The closing sequence is:            </Box>\n  );\n\n  const handleDelete
const invOld3 = `            </Box>
  );

  const handleDelete = () => {`;

const invNew3 = `              {/* Bank Details & Signatory */}
              {(() => {
                const co = companies.length > 0 ? companies[0] : null;
                const bankName = co?.BankName || 'THE FEDERAL BANK LIMITED';
                const bankBranch = co?.BankBranch || 'CHIKKAJALA';
                const accountNo = co?.AccountNo || '20860200000910';
                const ifscCode = co?.IFSCCode || 'FDRL0002086';
                const bankAddress = co?.BankAddress || 'CHIKKAJALA';
                return (
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '10px', marginTop: '-1px' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '6px', width: '60%', border: '1px solid black', verticalAlign: 'top' }}>
                          <div style={{ fontWeight: 700, marginBottom: '4px' }}>Bank Details:</div>
                          <div><strong>Bank Name:</strong> {bankName}</div>
                          <div><strong>Branch:</strong> {bankBranch}</div>
                          <div><strong>Account No:</strong> {accountNo}</div>
                          <div><strong>IFSC Code:</strong> {ifscCode}</div>
                          <div><strong>Bank Address:</strong> {bankAddress}</div>
                        </td>
                        <td style={{ padding: '6px', width: '40%', border: '1px solid black', verticalAlign: 'bottom', textAlign: 'center' }}>
                          <div style={{ marginBottom: '36px', fontSize: '9px' }}>Certified that the particulars given above are true and correct.</div>
                          <div style={{ fontWeight: 700, borderTop: '1px solid black', paddingTop: '4px' }}>Authorised Signatory</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                );
              })()}
            </Box>
  );

  const handleDelete = () => {`;

inv = replaceFirst(inv, invOld3, invNew3);

fs.writeFileSync('src/pages/Invoices/index.tsx', inv);
console.log('✅ Invoices/index.tsx updated');


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DC/index.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let dc = normalize(fs.readFileSync('src/pages/DC/index.tsx', 'utf8'));

// 1. Add CompanyInfo interface before the DC component
const dcOld1 = `// ─── Main DC List Component ─────────────────────────────────────────────────`;
const dcNew1 = `// ─── Company Info Interface ─────────────────────────────────────────────────
interface CompanyInfo {
  CompanyId: number;
  Name: string;
  Address?: string;
  GSTNo?: string;
  State?: string;
  StateCode?: string;
  Email?: string;
  Phone?: string;
  BankName?: string;
  BankBranch?: string;
  AccountNo?: string;
  IFSCCode?: string;
  BankAddress?: string;
}

// ─── Main DC List Component ─────────────────────────────────────────────────`;

dc = replaceFirst(dc, dcOld1, dcNew1);

// 2. Add companies state + fetch after the existing fetchDCs useEffect
const dcOld2 = `  // Fetch DCs on component mount
  useEffect(() => {`;

const dcNew2 = `  const { token } = useAppSelector((state) => state.auth);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);

  // Fetch company details from API
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = \`Bearer \${token}\`;
        const res = await fetch(\`\${API_BASE}/Material/GetCompanies\`, { headers });
        const json = await res.json();
        if (Array.isArray(json?.Data)) {
          setCompanies(json.Data);
        }
      } catch (e) {
        console.error('Failed to fetch companies:', e);
      }
    };
    fetchCompanies();
  }, [token, API_BASE]);

  // Fetch DCs on component mount
  useEffect(() => {`;

dc = replaceFirst(dc, dcOld2, dcNew2);

// 3. Replace hardcoded header
const dcOld3 = `              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 1 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '18px', color: 'black' }}>STONE CRUSH COMPANY</Typography>
                <Typography sx={{ fontSize: '11px', color: 'black' }}>123 Industrial Area, Bangalore, Karnataka</Typography>
                <Typography sx={{ fontSize: '11px', color: 'black' }}>GSTIN: 29AAACS2300D1Z4 | State: Karnataka (29)</Typography>
              </Box>
              `;

const dcNew3 = `              {/* Header – Dynamic Company Details */}
              {(() => {
                const co = companies.length > 0 ? companies[0] : null;
                const coName = co?.Name || 'M/s. SRI MADESHWARA STONE CRUSHER';
                const coAddress = co?.Address || 'Sy No: 136/4A2, Kakalachinte Village, Mandikal Hobli, Chikkaballapur Taluk, Chikkaballapur - 562104';
                const coGST = co?.GSTNo || '29ABKFS9495G1Z9';
                const coState = co?.State || 'KARNATAKA';
                const coCode = co?.StateCode || '29';
                const coEmail = co?.Email || 'srimadeshwaragroup@gmail.com';
                const coPhone = co?.Phone || '';
                return (
                  <Box sx={{ textAlign: 'center', borderBottom: '2px solid black', pb: 1, mb: 1 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '16px', color: 'black', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {coName}
                    </Typography>
                    <Typography sx={{ fontSize: '10px', color: 'black' }}>{coAddress}</Typography>
                    <Typography sx={{ fontSize: '10px', color: 'black' }}>
                      GSTIN: {coGST} | State: {coState} ({coCode})
                    </Typography>
                    {(coPhone || coEmail) && (
                      <Typography sx={{ fontSize: '10px', color: 'black' }}>
                        {coPhone ? \`Ph: \${coPhone}\` : ''}{coPhone && coEmail ? ' | ' : ''}Email: {coEmail}
                      </Typography>
                    )}
                  </Box>
                );
              })()}
              `;

dc = replaceFirst(dc, dcOld3, dcNew3);

// 4. Replace "Company ID" label with company name
const dcOld4 = `                      <div style={{ fontWeight: 700 }}>DC Details:</div>
                      <div>Company ID: {printData.CompanyId}</div>`;

const dcNew4 = `                      <div style={{ fontWeight: 700 }}>DC Details:</div>
                      <div><strong>Company:</strong> {companies.find(c => c.CompanyId === printData.CompanyId)?.Name || 'M/s. SRI MADESHWARA STONE CRUSHER'}</div>`;

dc = replaceFirst(dc, dcOld4, dcNew4);

// 5. Add bank details + signatory before closing Box of renderPrintContent
const dcOld5 = `            </Box>
  );

  const handleDelete = () => {`;

const dcNew5 = `              {/* Bank Details & Signatory */}
              {(() => {
                const co = companies.length > 0 ? companies[0] : null;
                const bankName = co?.BankName || 'THE FEDERAL BANK LIMITED';
                const bankBranch = co?.BankBranch || 'CHIKKAJALA';
                const accountNo = co?.AccountNo || '20860200000910';
                const ifscCode = co?.IFSCCode || 'FDRL0002086';
                const bankAddress = co?.BankAddress || 'CHIKKAJALA';
                return (
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '10px', marginTop: '-1px' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '6px', width: '60%', border: '1px solid black', verticalAlign: 'top' }}>
                          <div style={{ fontWeight: 700, marginBottom: '4px' }}>Bank Details:</div>
                          <div><strong>Bank Name:</strong> {bankName}</div>
                          <div><strong>Branch:</strong> {bankBranch}</div>
                          <div><strong>Account No:</strong> {accountNo}</div>
                          <div><strong>IFSC Code:</strong> {ifscCode}</div>
                          <div><strong>Bank Address:</strong> {bankAddress}</div>
                        </td>
                        <td style={{ padding: '6px', width: '40%', border: '1px solid black', verticalAlign: 'bottom', textAlign: 'center' }}>
                          <div style={{ marginBottom: '36px', fontSize: '9px' }}>Certified that the particulars given above are true and correct.</div>
                          <div style={{ fontWeight: 700, borderTop: '1px solid black', paddingTop: '4px' }}>Authorised Signatory</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                );
              })()}
            </Box>
  );

  const handleDelete = () => {`;

dc = replaceFirst(dc, dcOld5, dcNew5);

fs.writeFileSync('src/pages/DC/index.tsx', dc);
console.log('✅ DC/index.tsx updated');
