const fs = require('fs');

// ── Normalize CRLF→LF, replace first occurrence, write back
function patch(file, oldStr, newStr) {
  let src = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const idx = src.indexOf(oldStr);
  if (idx === -1) {
    console.error('❌ NOT FOUND in', file, ':\n', oldStr.slice(0, 80));
    return;
  }
  src = src.slice(0, idx) + newStr + src.slice(idx + oldStr.length);
  fs.writeFileSync(file, src);
  console.log('✅ Patched:', file);
}


const INV_OLD = `  const renderPrintContent = (printData: Invoice, ref?: React.Ref<HTMLDivElement>) => (
    <Box ref={ref} sx={{ p: 2, bgcolor: 'white', color: 'black', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>
              {/* Header – Dynamic Company Details */}
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
              <hr style={{ border: 'none', borderTop: '2px solid black', margin: '4px 0' }} />
              <Typography sx={{ textAlign: 'center', fontWeight: 800, fontSize: '13px', mb: 1, color: 'black' }}>TAX INVOICE</Typography>`;

const INV_NEW = `  const renderPrintContent = (printData: Invoice, ref?: React.Ref<HTMLDivElement>) => {
    const co = companies.length > 0 ? companies[0] : null;
    const coName = co?.Name || 'M/s. SRI MADESHWARA STONE CRUSHER';
    const coAddress = co?.Address || 'Sy No: 136/4A2, Kakalachinte Village, Mandikal Hobli, Chikkaballapur Taluk, Chikkaballapur - 562104';
    const coGST = co?.GSTNo || '29ABKFS9495G1Z9';
    const coState = co?.State || 'KARNATAKA';
    const coCode = co?.StateCode || '29';
    const coEmail = co?.Email || 'srimadeshwaragroup@gmail.com';
    const coPhone = co?.Phone || '';

    const totalQty = printData.items?.reduce((s, it) => s + it.quantity, 0) ?? 0;
    const totalDisc = printData.items?.reduce((s, it) => s + (it.amount * it.discountPercentage / 100), 0) ?? 0;

    const numToWords = (num: number): string => {
      const a = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven',
        'Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
      const b = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
      const n = Math.floor(num);
      if (n === 0) return 'Zero Rupees Only';
      const conv = (x: number): string => {
        if (x < 20) return a[x];
        if (x < 100) return b[Math.floor(x/10)] + (x%10 ? ' '+a[x%10] : '');
        if (x < 1000) return a[Math.floor(x/100)] + ' Hundred' + (x%100 ? ' '+conv(x%100) : '');
        if (x < 100000) return conv(Math.floor(x/1000)) + ' Thousand' + (x%1000 ? ' '+conv(x%1000) : '');
        if (x < 10000000) return conv(Math.floor(x/100000)) + ' Lakh' + (x%100000 ? ' '+conv(x%100000) : '');
        return conv(Math.floor(x/10000000)) + ' Crore' + (x%10000000 ? ' '+conv(x%10000000) : '');
      };
      const paise = Math.round((num - n) * 100);
      return 'INR ' + conv(n) + ' Rupees' + (paise > 0 ? ' and ' + conv(paise) + ' Paise' : '') + ' Only';
    };

    const cell = (label: string, value: string, opts: {bold?: boolean; right?: boolean; bg?: string; noBorderRight?: boolean; w?: string} = {}) => (
      <td style={{
        border: '1px solid #333', padding: '5px 7px', verticalAlign: 'top',
        textAlign: opts.right ? 'right' : 'left',
        background: opts.bg || 'white',
        width: opts.w,
        borderRight: opts.noBorderRight ? 'none' : '1px solid #333',
      }}>
        <div style={{ fontSize: '8px', color: '#666', marginBottom: '1px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
        <div style={{ fontWeight: opts.bold ? 700 : 500, fontSize: '11px', color: '#111' }}>{value}</div>
      </td>
    );

    return (
      <Box ref={ref} sx={{ p: '10mm', bgcolor: 'white', color: '#111', fontFamily: "'Arial', sans-serif", fontSize: '11px', minHeight: '297mm', boxSizing: 'border-box' }}>
        {/* ── HEADER ── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px' }}>
          <tbody>
            <tr>
              <td style={{ width: '70%', verticalAlign: 'top', paddingRight: '10px' }}>
                <div style={{ fontSize: '17px', fontWeight: 900, color: '#111', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.15 }}>{coName}</div>
                <div style={{ fontSize: '9px', color: '#444', marginTop: '3px', lineHeight: 1.5 }}>{coAddress}</div>
                <div style={{ fontSize: '9px', color: '#444' }}>
                  GSTIN: <strong>{coGST}</strong> &nbsp;|&nbsp; State: <strong>{coState} ({coCode})</strong>
                </div>
                {(coPhone || coEmail) && (
                  <div style={{ fontSize: '9px', color: '#444' }}>
                    {coPhone ? \`Ph: \${coPhone}\` : ''}{coPhone && coEmail ? '  |  ' : ''}
                    {coEmail ? \`Email: \${coEmail}\` : ''}
                  </div>
                )}
              </td>
              <td style={{ width: '30%', verticalAlign: 'middle', textAlign: 'right' }}>
                <div style={{ display: 'inline-block', border: '2px solid #111', padding: '4px 12px', borderRadius: '3px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '1px', color: '#111' }}>TAX INVOICE</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div style={{ borderBottom: '2px solid #111', marginBottom: '6px' }} />

        {/* ── INVOICE META + CONSIGNEE ── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #333', marginBottom: '0' }}>
          <tbody>
            <tr>
              {/* LEFT: Consignee */}
              <td style={{ width: '55%', border: '1px solid #333', padding: '7px', verticalAlign: 'top' }}>
                <div style={{ fontSize: '8px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: 600 }}>Consignee (Ship To)</div>
                <div style={{ fontWeight: 700, fontSize: '12px', color: '#111' }}>{printData.consigneeName || '—'}</div>
                <div style={{ fontSize: '10px', color: '#333', marginTop: '2px', lineHeight: 1.5 }}>{printData.consigneeAddress || ''}</div>
                {printData.consigneeGstin && <div style={{ fontSize: '10px', color: '#333' }}>GSTIN: <strong>{printData.consigneeGstin}</strong></div>}
                <div style={{ fontSize: '10px', color: '#333' }}>
                  State: {printData.consigneeState || '—'}{printData.consigneeStateCode ? \` (\${printData.consigneeStateCode})\` : ''}
                </div>
                {printData.consigneePhone && <div style={{ fontSize: '10px', color: '#333' }}>Ph: {printData.consigneePhone}</div>}
              </td>
              {/* RIGHT: Invoice details grid */}
              <td style={{ width: '45%', padding: 0, verticalAlign: 'top' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', height: '100%' }}>
                  <tbody>
                    <tr>
                      {cell('Invoice No.', printData.invoiceNumber || '—', { bold: true })}
                      {cell('Dated', printData.invoiceDate || '—', { bold: true })}
                    </tr>
                    <tr>
                      {cell('Delivery Note', printData.deliveryNote || '—')}
                      {cell('Payment Terms', printData.paymentTerms || '—')}
                    </tr>
                    <tr>
                      {cell('Buyer Order No.', printData.buyerOrderNumber || '—')}
                      {cell('Buyer Order Date', printData.buyerOrderDate || '—')}
                    </tr>
                    <tr>
                      {cell('Dispatched Through', printData.dispatchedThrough || '—')}
                      {cell('Destination', printData.destination || '—')}
                    </tr>
                    <tr>
                      {cell('Vehicle No.', printData.vehicleNumber || '—', { bold: true })}
                      {cell('Terms of Delivery', printData.termsOfDelivery || '—')}
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            {/* Buyer row */}
            <tr>
              <td colSpan={2} style={{ border: '1px solid #333', padding: '7px', verticalAlign: 'top' }}>
                <div style={{ fontSize: '8px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: 600 }}>Buyer (Bill To)</div>
                {printData.sameAsConsignee ? (
                  <div style={{ fontSize: '10px', color: '#666', fontStyle: 'italic' }}>Same as Consignee</div>
                ) : (
                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '12px', color: '#111' }}>{printData.buyerName || '—'}</div>
                      <div style={{ fontSize: '10px', color: '#333', marginTop: '2px', lineHeight: 1.5 }}>{printData.buyerAddress || ''}</div>
                    </div>
                    <div style={{ fontSize: '10px', color: '#333', marginTop: '2px' }}>
                      {printData.buyerGstin && <div>GSTIN: <strong>{printData.buyerGstin}</strong></div>}
                      <div>State: {printData.buyerState || '—'}{printData.buyerStateCode ? \` (\${printData.buyerStateCode})\` : ''}</div>
                      {printData.buyerPhone && <div>Ph: {printData.buyerPhone}</div>}
                    </div>
                  </div>
                )}
                {printData.urn && (
                  <span style={{ display: 'inline-block', background: '#1e40af', color: 'white', fontSize: '8px', fontWeight: 700, padding: '1px 6px', borderRadius: '3px', marginTop: '4px' }}>
                    URN REGISTERED
                  </span>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── ITEMS TABLE ── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #333', fontSize: '10px', marginTop: '-1px' }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={{ border: '1px solid #333', padding: '5px 4px', textAlign: 'center', width: '26px', fontSize: '9px' }}>#</th>
              <th style={{ border: '1px solid #333', padding: '5px 7px', textAlign: 'left', fontSize: '9px' }}>Description of Goods</th>
              <th style={{ border: '1px solid #333', padding: '5px 4px', textAlign: 'center', width: '58px', fontSize: '9px' }}>HSN/SAC</th>
              <th style={{ border: '1px solid #333', padding: '5px 7px', textAlign: 'right', width: '65px', fontSize: '9px' }}>Quantity</th>
              <th style={{ border: '1px solid #333', padding: '5px 7px', textAlign: 'center', width: '32px', fontSize: '9px' }}>Unit</th>
              <th style={{ border: '1px solid #333', padding: '5px 7px', textAlign: 'right', width: '70px', fontSize: '9px' }}>Rate (₹)</th>
              <th style={{ border: '1px solid #333', padding: '5px 7px', textAlign: 'right', width: '42px', fontSize: '9px' }}>Disc%</th>
              <th style={{ border: '1px solid #333', padding: '5px 7px', textAlign: 'right', width: '78px', fontSize: '9px' }}>Gross Amt (₹)</th>
              <th style={{ border: '1px solid #333', padding: '5px 7px', textAlign: 'right', width: '78px', fontSize: '9px' }}>Net Amt (₹)</th>
            </tr>
          </thead>
          <tbody>
            {printData.items && printData.items.map((it, idx) => {
              const discAmt = (it.amount * it.discountPercentage) / 100;
              const netAmt = it.amount - discAmt;
              return (
                <tr key={it.id} style={{ pageBreakInside: 'avoid' }}>
                  <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center', color: '#555' }}>{idx + 1}</td>
                  <td style={{ border: '1px solid #333', padding: '4px 7px', fontWeight: 600 }}>{it.productName}</td>
                  <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center', color: '#555' }}>{it.hsnCode}</td>
                  <td style={{ border: '1px solid #333', padding: '4px 7px', textAlign: 'right' }}>{it.quantity.toFixed(3)}</td>
                  <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center', color: '#555' }}>{it.unit}</td>
                  <td style={{ border: '1px solid #333', padding: '4px 7px', textAlign: 'right' }}>{it.rate.toFixed(2)}</td>
                  <td style={{ border: '1px solid #333', padding: '4px 7px', textAlign: 'right' }}>{it.discountPercentage > 0 ? \`\${it.discountPercentage}%\` : '—'}</td>
                  <td style={{ border: '1px solid #333', padding: '4px 7px', textAlign: 'right' }}>{it.amount.toFixed(2)}</td>
                  <td style={{ border: '1px solid #333', padding: '4px 7px', textAlign: 'right', fontWeight: 600 }}>{netAmt.toFixed(2)}</td>
                </tr>
              );
            })}
            {/* Totals row */}
            <tr style={{ background: '#f7f7f7', fontWeight: 700 }}>
              <td colSpan={3} style={{ border: '1px solid #333', padding: '5px 7px', textAlign: 'right', fontSize: '10px' }}>TOTAL</td>
              <td style={{ border: '1px solid #333', padding: '5px 7px', textAlign: 'right', fontSize: '10px' }}>{totalQty.toFixed(3)}</td>
              <td style={{ border: '1px solid #333' }} />
              <td style={{ border: '1px solid #333' }} />
              <td style={{ border: '1px solid #333' }} />
              <td style={{ border: '1px solid #333', padding: '5px 7px', textAlign: 'right', fontSize: '10px' }}>{printData.subTotal?.toFixed(2)}</td>
              <td style={{ border: '1px solid #333', padding: '5px 7px', textAlign: 'right', fontSize: '10px' }}>₹{printData.grandTotal?.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {/* ── AMOUNT IN WORDS ── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #333', marginTop: '-1px' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #333', padding: '5px 8px' }}>
                <span style={{ fontSize: '8px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Amount in Words: </span>
                <strong style={{ fontSize: '10px' }}>{numToWords(printData.grandTotal || 0)}</strong>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── TAX SUMMARY + TOTALS ── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #333', fontSize: '10px', marginTop: '-1px' }}>
          <tbody>
            <tr>
              {/* Left: Tax breakdown */}
              <td style={{ width: '55%', border: '1px solid #333', padding: '7px', verticalAlign: 'top' }}>
                <div style={{ fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px', color: '#444' }}>Tax Summary</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                  <thead>
                    <tr style={{ background: '#f0f0f0' }}>
                      <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'left', fontSize: '9px' }}>HSN/SAC</th>
                      <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right', fontSize: '9px' }}>Taxable Value</th>
                      <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right', fontSize: '9px' }}>CGST%</th>
                      <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right', fontSize: '9px' }}>SGST%</th>
                      <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right', fontSize: '9px' }}>IGST%</th>
                      <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right', fontSize: '9px' }}>Total Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printData.items && printData.items.map((it, idx) => {
                      const disc = (it.amount * it.discountPercentage) / 100;
                      const taxable = it.amount - disc;
                      const cgstAmt = taxable * (printData.cgstPer || 0) / 100;
                      const sgstAmt = taxable * (printData.sgstPer || 0) / 100;
                      const igstAmt = taxable * (printData.igstPer || 0) / 100;
                      return (
                        <tr key={idx}>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', fontSize: '9px' }}>{it.hsnCode}</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right', fontSize: '9px' }}>{taxable.toFixed(2)}</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right', fontSize: '9px' }}>{printData.cgstPer ? \`\${printData.cgstPer}% = \${cgstAmt.toFixed(2)}\` : '—'}</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right', fontSize: '9px' }}>{printData.sgstPer ? \`\${printData.sgstPer}% = \${sgstAmt.toFixed(2)}\` : '—'}</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right', fontSize: '9px' }}>{printData.igstPer ? \`\${printData.igstPer}% = \${igstAmt.toFixed(2)}\` : '—'}</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right', fontWeight: 600, fontSize: '9px' }}>{(cgstAmt + sgstAmt + igstAmt).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </td>
              {/* Right: Grand totals */}
              <td style={{ width: '45%', border: '1px solid #333', padding: '7px', verticalAlign: 'top' }}>
                <div style={{ fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px', color: '#444' }}>Invoice Summary</div>
                {[
                  ['Sub Total', \`₹\${printData.subTotal?.toFixed(2) ?? '0.00'}\`],
                  ...(printData.totalCgst > 0 ? [[\`CGST @ \${printData.cgstPer}%\`, \`₹\${printData.totalCgst?.toFixed(2)}\`]] : []),
                  ...(printData.totalSgst > 0 ? [[\`SGST @ \${printData.sgstPer}%\`, \`₹\${printData.totalSgst?.toFixed(2)}\`]] : []),
                  ...(printData.totalIgst > 0 ? [[\`IGST @ \${printData.igstPer}%\`, \`₹\${printData.totalIgst?.toFixed(2)}\`]] : []),
                  ...(totalDisc > 0 ? [['Total Discount', \`-₹\${totalDisc.toFixed(2)}\`]] : []),
                ].map(([lbl, val], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', paddingBottom: '3px', borderBottom: '1px dashed #ddd', fontSize: '10px' }}>
                    <span style={{ color: '#555' }}>{lbl}</span>
                    <span style={{ fontWeight: 500 }}>{val}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', padding: '6px 8px', background: '#111', color: 'white', borderRadius: '3px', fontWeight: 800, fontSize: '12px' }}>
                  <span>GRAND TOTAL</span>
                  <span>₹{printData.grandTotal?.toFixed(2) ?? '0.00'}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── DECLARATION + SIGNATORY ── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #333', fontSize: '10px', marginTop: '-1px' }}>
          <tbody>
            <tr>
              <td style={{ width: '60%', border: '1px solid #333', padding: '7px', verticalAlign: 'top' }}>
                <div style={{ fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px', color: '#444' }}>Declaration</div>
                <div style={{ fontSize: '9px', color: '#555', lineHeight: 1.6 }}>
                  We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
                </div>
                {printData.weightmentNo && (
                  <div style={{ marginTop: '6px', fontSize: '9px' }}>
                    <strong>Weightment No:</strong> {printData.weightmentNo}
                  </div>
                )}
              </td>
              <td style={{ width: '40%', border: '1px solid #333', padding: '7px', verticalAlign: 'bottom', textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: '#666', marginBottom: '38px' }}>For <strong>{coName}</strong></div>
                <div style={{ borderTop: '1px solid #333', paddingTop: '5px', fontWeight: 700, fontSize: '10px' }}>Authorised Signatory</div>
              </td>
            </tr>
          </tbody>
        </table>
        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '8px', color: '#888', borderTop: '1px solid #ddd', paddingTop: '4px' }}>
          This is a Computer Generated Invoice — {coName}
        </div>
      </Box>
    );
  };

  const _renderPrintContentUnused = (printData: Invoice, ref?: React.Ref<HTMLDivElement>) => (
    <Box ref={ref} sx={{ p: 2, bgcolor: 'white', color: 'black', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>
              {/* Header – Dynamic Company Details */}
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
              <hr style={{ border: 'none', borderTop: '2px solid black', margin: '4px 0' }} />
              <Typography sx={{ textAlign: 'center', fontWeight: 800, fontSize: '13px', mb: 1, color: 'black' }}>TAX INVOICE</Typography>`;

// ── Apply Invoice patch
patch('src/pages/Invoices/index.tsx', INV_OLD, INV_NEW);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DC  — replace the entire renderPrintContent body
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const DC_OLD = `  const renderPrintContent = (printData: DC, ref?: React.Ref<HTMLDivElement>) => (
    <Box ref={ref} sx={{ p: 2, bgcolor: 'white', color: 'black', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>
              {/* Header – Dynamic Company Details */}
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
              <hr style={{ border: 'none', borderTop: '2px solid black', margin: '4px 0' }} />
              <Typography sx={{ textAlign: 'center', fontWeight: 800, fontSize: '13px', mb: 1, color: 'black' }}>DELIVERY CHALLAN</Typography>`;

const DC_NEW = `  const renderPrintContent = (printData: DC, ref?: React.Ref<HTMLDivElement>) => {
    const co = companies.length > 0 ? companies[0] : null;
    const coName = co?.Name || 'M/s. SRI MADESHWARA STONE CRUSHER';
    const coAddress = co?.Address || 'Sy No: 136/4A2, Kakalachinte Village, Mandikal Hobli, Chikkaballapur Taluk, Chikkaballapur - 562104';
    const coGST = co?.GSTNo || '29ABKFS9495G1Z9';
    const coState = co?.State || 'KARNATAKA';
    const coCode = co?.StateCode || '29';
    const coEmail = co?.Email || 'srimadeshwaragroup@gmail.com';
    const coPhone = co?.Phone || '';

    const totalQtyDC = printData.JsonDCDetails?.reduce((s: number, it: DCItem) => s + (Number(it.Qty) || 0), 0) ?? 0;
    const totalAmtDC = printData.JsonDCDetails?.reduce((s: number, it: DCItem) => s + ((Number(it.Qty)||0)*(Number(it.RatePerUnit)||0)), 0) ?? 0;
    const totalDiscDC = printData.JsonDCDetails?.reduce((s: number, it: DCItem) => {
      const amt = (Number(it.Qty)||0)*(Number(it.RatePerUnit)||0);
      return s + (amt * (Number(it.Disc)||0) / 100);
    }, 0) ?? 0;

    const numToWords = (num: number): string => {
      const a = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven',
        'Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
      const b = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
      const n = Math.floor(num);
      if (n === 0) return 'Zero Rupees Only';
      const conv = (x: number): string => {
        if (x < 20) return a[x];
        if (x < 100) return b[Math.floor(x/10)] + (x%10 ? ' '+a[x%10] : '');
        if (x < 1000) return a[Math.floor(x/100)] + ' Hundred' + (x%100 ? ' '+conv(x%100) : '');
        if (x < 100000) return conv(Math.floor(x/1000)) + ' Thousand' + (x%1000 ? ' '+conv(x%1000) : '');
        if (x < 10000000) return conv(Math.floor(x/100000)) + ' Lakh' + (x%100000 ? ' '+conv(x%100000) : '');
        return conv(Math.floor(x/10000000)) + ' Crore' + (x%10000000 ? ' '+conv(x%10000000) : '');
      };
      const paise = Math.round((num - n) * 100);
      return 'INR ' + conv(n) + ' Rupees' + (paise > 0 ? ' and ' + conv(paise) + ' Paise' : '') + ' Only';
    };

    return (
      <Box ref={ref} sx={{ p: '10mm', bgcolor: 'white', color: '#111', fontFamily: "'Arial', sans-serif", fontSize: '11px', minHeight: '297mm', boxSizing: 'border-box' }}>
        {/* ── HEADER ── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px' }}>
          <tbody>
            <tr>
              <td style={{ width: '70%', verticalAlign: 'top', paddingRight: '10px' }}>
                <div style={{ fontSize: '17px', fontWeight: 900, color: '#111', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.15 }}>{coName}</div>
                <div style={{ fontSize: '9px', color: '#444', marginTop: '3px', lineHeight: 1.5 }}>{coAddress}</div>
                <div style={{ fontSize: '9px', color: '#444' }}>
                  GSTIN: <strong>{coGST}</strong> &nbsp;|&nbsp; State: <strong>{coState} ({coCode})</strong>
                </div>
                {(coPhone || coEmail) && (
                  <div style={{ fontSize: '9px', color: '#444' }}>
                    {coPhone ? \`Ph: \${coPhone}\` : ''}{coPhone && coEmail ? '  |  ' : ''}
                    {coEmail ? \`Email: \${coEmail}\` : ''}
                  </div>
                )}
              </td>
              <td style={{ width: '30%', verticalAlign: 'middle', textAlign: 'right' }}>
                <div style={{ display: 'inline-block', border: '2px solid #111', padding: '4px 12px', borderRadius: '3px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '1px', color: '#111' }}>DELIVERY CHALLAN</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div style={{ borderBottom: '2px solid #111', marginBottom: '6px' }} />

        {/* ── DC META ── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #333', marginBottom: '0' }}>
          <tbody>
            <tr>
              {/* LEFT: Company/Consignee info */}
              <td style={{ width: '55%', border: '1px solid #333', padding: '7px', verticalAlign: 'top' }}>
                <div style={{ fontSize: '8px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: 600 }}>Issued By</div>
                <div style={{ fontWeight: 700, fontSize: '12px', color: '#111' }}>{coName}</div>
                <div style={{ fontSize: '10px', color: '#333', marginTop: '2px', lineHeight: 1.5 }}>{coAddress}</div>
                <div style={{ fontSize: '10px', color: '#333' }}>GSTIN: <strong>{coGST}</strong></div>
                <div style={{ fontSize: '10px', color: '#333' }}>State: <strong>{coState} ({coCode})</strong></div>
                {coEmail && <div style={{ fontSize: '10px', color: '#333' }}>Email: {coEmail}</div>}
              </td>
              {/* RIGHT: DC details grid */}
              <td style={{ width: '45%', padding: 0, verticalAlign: 'top' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', height: '100%' }}>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #333', padding: '5px 7px', verticalAlign: 'top', width: '50%' }}>
                        <div style={{ fontSize: '8px', color: '#666', marginBottom: '1px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>DC No.</div>
                        <div style={{ fontWeight: 700, fontSize: '11px', color: '#111' }}>{printData.DCNo}</div>
                      </td>
                      <td style={{ border: '1px solid #333', padding: '5px 7px', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '8px', color: '#666', marginBottom: '1px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>DC Date</div>
                        <div style={{ fontWeight: 700, fontSize: '11px', color: '#111' }}>{printData.DCDate}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #333', padding: '5px 7px', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '8px', color: '#666', marginBottom: '1px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Vehicle No.</div>
                        <div style={{ fontWeight: 700, fontSize: '11px', color: '#111' }}>{printData.VehicleNo || '—'}</div>
                      </td>
                      <td style={{ border: '1px solid #333', padding: '5px 7px', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '8px', color: '#666', marginBottom: '1px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Tax Rate</div>
                        <div style={{ fontWeight: 600, fontSize: '11px', color: '#111' }}>
                          {((printData.CGST||0)+(printData.SGST||0)+(printData.IGST||0)) > 0
                            ? \`GST \${(printData.CGST||0)+(printData.SGST||0)+(printData.IGST||0)}%\`
                            : 'No Tax'}
                        </div>
                      </td>
                    </tr>
                    {((printData.CGST||0) > 0 || (printData.SGST||0) > 0) && (
                      <tr>
                        <td style={{ border: '1px solid #333', padding: '5px 7px', verticalAlign: 'top' }}>
                          <div style={{ fontSize: '8px', color: '#666', marginBottom: '1px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>CGST</div>
                          <div style={{ fontWeight: 600 }}>{printData.CGST||0}%</div>
                        </td>
                        <td style={{ border: '1px solid #333', padding: '5px 7px', verticalAlign: 'top' }}>
                          <div style={{ fontSize: '8px', color: '#666', marginBottom: '1px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>SGST</div>
                          <div style={{ fontWeight: 600 }}>{printData.SGST||0}%</div>
                        </td>
                      </tr>
                    )}
                    {(printData.IGST||0) > 0 && (
                      <tr>
                        <td colSpan={2} style={{ border: '1px solid #333', padding: '5px 7px', verticalAlign: 'top' }}>
                          <div style={{ fontSize: '8px', color: '#666', marginBottom: '1px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>IGST</div>
                          <div style={{ fontWeight: 600 }}>{printData.IGST||0}%</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── ITEMS TABLE ── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #333', fontSize: '10px', marginTop: '-1px' }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={{ border: '1px solid #333', padding: '5px 4px', textAlign: 'center', width: '26px', fontSize: '9px' }}>#</th>
              <th style={{ border: '1px solid #333', padding: '5px 7px', textAlign: 'left', fontSize: '9px' }}>Description of Goods</th>
              <th style={{ border: '1px solid #333', padding: '5px 4px', textAlign: 'center', width: '58px', fontSize: '9px' }}>HSN Code</th>
              <th style={{ border: '1px solid #333', padding: '5px 7px', textAlign: 'right', width: '65px', fontSize: '9px' }}>Quantity</th>
              <th style={{ border: '1px solid #333', padding: '5px 7px', textAlign: 'center', width: '32px', fontSize: '9px' }}>Unit</th>
              <th style={{ border: '1px solid #333', padding: '5px 7px', textAlign: 'right', width: '70px', fontSize: '9px' }}>Rate (₹)</th>
              <th style={{ border: '1px solid #333', padding: '5px 7px', textAlign: 'right', width: '42px', fontSize: '9px' }}>Disc%</th>
              <th style={{ border: '1px solid #333', padding: '5px 7px', textAlign: 'right', width: '78px', fontSize: '9px' }}>Gross Amt (₹)</th>
              <th style={{ border: '1px solid #333', padding: '5px 7px', textAlign: 'right', width: '78px', fontSize: '9px' }}>Net Amt (₹)</th>
            </tr>
          </thead>
          <tbody>
            {printData.JsonDCDetails && printData.JsonDCDetails.map((it: DCItem, idx: number) => {
              const grossAmt = (Number(it.Qty)||0) * (Number(it.RatePerUnit)||0);
              const discAmt = grossAmt * (Number(it.Disc)||0) / 100;
              const netAmt = grossAmt - discAmt;
              return (
                <tr key={it.productId} style={{ pageBreakInside: 'avoid' }}>
                  <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center', color: '#555' }}>{idx + 1}</td>
                  <td style={{ border: '1px solid #333', padding: '4px 7px', fontWeight: 600 }}>{it.productName}</td>
                  <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center', color: '#555' }}>{it.hsnCode}</td>
                  <td style={{ border: '1px solid #333', padding: '4px 7px', textAlign: 'right' }}>{(Number(it.Qty)||0).toFixed(3)}</td>
                  <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center', color: '#555' }}>{it.Unit}</td>
                  <td style={{ border: '1px solid #333', padding: '4px 7px', textAlign: 'right' }}>{(Number(it.RatePerUnit)||0).toFixed(2)}</td>
                  <td style={{ border: '1px solid #333', padding: '4px 7px', textAlign: 'right' }}>{Number(it.Disc) > 0 ? \`\${it.Disc}%\` : '—'}</td>
                  <td style={{ border: '1px solid #333', padding: '4px 7px', textAlign: 'right' }}>{grossAmt.toFixed(2)}</td>
                  <td style={{ border: '1px solid #333', padding: '4px 7px', textAlign: 'right', fontWeight: 600 }}>{netAmt.toFixed(2)}</td>
                </tr>
              );
            })}
            {/* Totals row */}
            <tr style={{ background: '#f7f7f7', fontWeight: 700 }}>
              <td colSpan={3} style={{ border: '1px solid #333', padding: '5px 7px', textAlign: 'right', fontSize: '10px' }}>TOTAL</td>
              <td style={{ border: '1px solid #333', padding: '5px 7px', textAlign: 'right', fontSize: '10px' }}>{totalQtyDC.toFixed(3)}</td>
              <td style={{ border: '1px solid #333' }} />
              <td style={{ border: '1px solid #333' }} />
              <td style={{ border: '1px solid #333' }} />
              <td style={{ border: '1px solid #333', padding: '5px 7px', textAlign: 'right', fontSize: '10px' }}>{totalAmtDC.toFixed(2)}</td>
              <td style={{ border: '1px solid #333', padding: '5px 7px', textAlign: 'right', fontSize: '10px' }}>₹{printData.TotalAmount?.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {/* ── AMOUNT IN WORDS ── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #333', marginTop: '-1px' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #333', padding: '5px 8px' }}>
                <span style={{ fontSize: '8px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Amount in Words: </span>
                <strong style={{ fontSize: '10px' }}>{numToWords(printData.TotalAmount || 0)}</strong>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── TAX SUMMARY + TOTALS ── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #333', fontSize: '10px', marginTop: '-1px' }}>
          <tbody>
            <tr>
              {/* Left: Tax breakdown */}
              <td style={{ width: '55%', border: '1px solid #333', padding: '7px', verticalAlign: 'top' }}>
                <div style={{ fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px', color: '#444' }}>Tax Summary</div>
                {((printData.CGST||0) > 0 || (printData.SGST||0) > 0 || (printData.IGST||0) > 0) ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                    <thead>
                      <tr style={{ background: '#f0f0f0' }}>
                        <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'left' }}>Description</th>
                        <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>Taxable Amt</th>
                        <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>Tax %</th>
                        <th style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>Tax Amt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(printData.CGST||0) > 0 && (
                        <tr>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>CGST</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{(totalAmtDC - totalDiscDC).toFixed(2)}</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{printData.CGST}%</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{((totalAmtDC - totalDiscDC) * (printData.CGST||0) / 100).toFixed(2)}</td>
                        </tr>
                      )}
                      {(printData.SGST||0) > 0 && (
                        <tr>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>SGST</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{(totalAmtDC - totalDiscDC).toFixed(2)}</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{printData.SGST}%</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{((totalAmtDC - totalDiscDC) * (printData.SGST||0) / 100).toFixed(2)}</td>
                        </tr>
                      )}
                      {(printData.IGST||0) > 0 && (
                        <tr>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px' }}>IGST</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{(totalAmtDC - totalDiscDC).toFixed(2)}</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{printData.IGST}%</td>
                          <td style={{ border: '1px solid #ccc', padding: '3px 6px', textAlign: 'right' }}>{((totalAmtDC - totalDiscDC) * (printData.IGST||0) / 100).toFixed(2)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ fontSize: '10px', color: '#666', fontStyle: 'italic' }}>No GST / Tax applicable on this challan.</div>
                )}
              </td>
              {/* Right: Totals */}
              <td style={{ width: '45%', border: '1px solid #333', padding: '7px', verticalAlign: 'top' }}>
                <div style={{ fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px', color: '#444' }}>Challan Summary</div>
                {[
                  ['Gross Amount', \`₹\${totalAmtDC.toFixed(2)}\`],
                  ...(totalDiscDC > 0 ? [['Total Discount', \`-₹\${totalDiscDC.toFixed(2)}\`]] : []),
                  ['Taxable Amount', \`₹\${(totalAmtDC - totalDiscDC).toFixed(2)}\`],
                  ...((printData.CGST||0) > 0 ? [[\`CGST @ \${printData.CGST}%\`, \`₹\${((totalAmtDC-totalDiscDC)*(printData.CGST||0)/100).toFixed(2)}\`]] : []),
                  ...((printData.SGST||0) > 0 ? [[\`SGST @ \${printData.SGST}%\`, \`₹\${((totalAmtDC-totalDiscDC)*(printData.SGST||0)/100).toFixed(2)}\`]] : []),
                  ...((printData.IGST||0) > 0 ? [[\`IGST @ \${printData.IGST}%\`, \`₹\${((totalAmtDC-totalDiscDC)*(printData.IGST||0)/100).toFixed(2)}\`]] : []),
                ].map(([lbl, val], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', paddingBottom: '3px', borderBottom: '1px dashed #ddd', fontSize: '10px' }}>
                    <span style={{ color: '#555' }}>{lbl}</span>
                    <span style={{ fontWeight: 500 }}>{val}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', padding: '6px 8px', background: '#111', color: 'white', borderRadius: '3px', fontWeight: 800, fontSize: '12px' }}>
                  <span>TOTAL AMOUNT</span>
                  <span>₹{printData.TotalAmount?.toFixed(2) ?? '0.00'}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── DECLARATION + SIGNATORY ── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #333', fontSize: '10px', marginTop: '-1px' }}>
          <tbody>
            <tr>
              <td style={{ width: '60%', border: '1px solid #333', padding: '7px', verticalAlign: 'top' }}>
                <div style={{ fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px', color: '#444' }}>Declaration</div>
                <div style={{ fontSize: '9px', color: '#555', lineHeight: 1.6 }}>
                  Certified that the particulars given above are true and correct. This Delivery Challan is not a tax invoice.
                </div>
              </td>
              <td style={{ width: '40%', border: '1px solid #333', padding: '7px', verticalAlign: 'bottom', textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: '#666', marginBottom: '38px' }}>For <strong>{coName}</strong></div>
                <div style={{ borderTop: '1px solid #333', paddingTop: '5px', fontWeight: 700, fontSize: '10px' }}>Authorised Signatory</div>
              </td>
            </tr>
          </tbody>
        </table>
        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '8px', color: '#888', borderTop: '1px solid #ddd', paddingTop: '4px' }}>
          This is a Computer Generated Delivery Challan — {coName}
        </div>
      </Box>
    );
  };

  const _renderPrintContentUnused = (printData: DC, ref?: React.Ref<HTMLDivElement>) => (
    <Box ref={ref} sx={{ p: 2, bgcolor: 'white', color: 'black', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>
              {/* Header – Dynamic Company Details */}
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
              <hr style={{ border: 'none', borderTop: '2px solid black', margin: '4px 0' }} />
              <Typography sx={{ textAlign: 'center', fontWeight: 800, fontSize: '13px', mb: 1, color: 'black' }}>DELIVERY CHALLAN</Typography>`;

patch('src/pages/DC/index.tsx', DC_OLD, DC_NEW);
