const fs = require('fs');

function enhancePDFLayout(filename) {
    let content = fs.readFileSync(filename, 'utf8');

    // 1. Enhance Header
    const oldHeader = `<Box sx={{ textAlign: 'center', mb: 1 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '18px', color: 'black' }}>STONE CRUSH COMPANY</Typography>
                <Typography sx={{ fontSize: '11px', color: 'black' }}>123 Industrial Area, Bangalore, Karnataka</Typography>
                <Typography sx={{ fontSize: '11px', color: 'black' }}>GSTIN: 29AAACS2300D1Z4 | State: Karnataka (29)</Typography>
              </Box>`;

    const newHeader = `<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, borderBottom: '2px solid black', pb: 1 }}>
                <Box sx={{ width: '100px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/logo.png" alt="Company Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </Box>
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: '22px', color: 'black', textTransform: 'uppercase', letterSpacing: '1px' }}>STONE CRUSH COMPANY</Typography>
                  <Typography sx={{ fontSize: '12px', color: 'black', mt: 0.5 }}>123 Industrial Area, Bangalore, Karnataka, 560001</Typography>
                  <Typography sx={{ fontSize: '12px', color: 'black' }}>Phone: +91 98765 43210 | Email: info@stonecrush.com | Web: www.stonecrush.com</Typography>
                  <Typography sx={{ fontSize: '12px', color: 'black', fontWeight: 700, mt: 0.5 }}>GSTIN: 29AAACS2300D1Z4 | State: Karnataka (29)</Typography>
                </Box>
                <Box sx={{ width: '100px' }} />
              </Box>`;

    content = content.replace(oldHeader, newHeader);
    
    // Remove the hr since we added borderBottom to the header Box
    content = content.replace(`<hr style={{ border: 'none', borderTop: '2px solid black', margin: '4px 0' }} />`, ``);

    // 2. Add pageBreakInside to table rows
    if (filename.includes('Invoices')) {
        content = content.replace(/<tr key=\{it\.id\}>/g, `<tr key={it.id} style={{ pageBreakInside: 'avoid' }}>`);
    } else {
        content = content.replace(/<tr key=\{it\.productId\}>/g, `<tr key={it.productId} style={{ pageBreakInside: 'avoid' }}>`);
    }

    // 3. Improve PDF config options
    const oldOpt = `const opt = {
        margin:       0.5,`;
    const newOpt = `const opt = {
        margin:       [0.5, 0.5, 0.5, 0.5],
        pagebreak:    { mode: ['css', 'legacy'] },`;
    content = content.replace(oldOpt, newOpt);

    fs.writeFileSync(filename, content);
    console.log(filename + ' UI enhanced successfully');
}

enhancePDFLayout('src/pages/Invoices/index.tsx');
enhancePDFLayout('src/pages/DC/index.tsx');
