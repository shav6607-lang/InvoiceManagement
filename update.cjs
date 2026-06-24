const fs = require('fs');

function extractBox(content, startString) {
    let startIndex = content.indexOf(startString);
    if (startIndex === -1) return null;
    let braceCount = 0;
    let i = startIndex;
    let started = false;
    while (i < content.length) {
        if (content.substr(i, 4) === '<Box') {
            braceCount++;
            started = true;
        } else if (content.substr(i, 6) === '</Box>') {
            braceCount--;
        }
        i++;
        if (started && braceCount === 0) {
            return content.substring(startIndex, i + 5);
        }
    }
    return null;
}

function processFile(filename, entityName, stateName) {
    let content = fs.readFileSync(filename, 'utf8');

    if (!content.includes('html2pdf.js')) {
        content = content.replace('import { useReactToPrint } from \'react-to-print\';', 'import { useReactToPrint } from \'react-to-print\';\nimport html2pdf from \'html2pdf.js\';');
    }

    const stateInsertion = `
  const [download${entityName}, setDownload${entityName}] = useState<${entityName} | null>(null);
  const downloadDialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (download${entityName} && downloadDialogRef.current) {
      const element = downloadDialogRef.current;
      const opt = {
        margin:       0.5,
        filename:     \`${entityName}_\${download${entityName}.${entityName === 'Invoice' ? 'invoiceNumber' : 'DCNo'} || download${entityName}.id}.pdf\`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      
      setTimeout(() => {
        html2pdf().set(opt).from(element).save().then(() => {
           setDownload${entityName}(null);
        });
      }, 500);
    }
  }, [download${entityName}]);
`;

    if (!content.includes(`const [download${entityName}`)) {
        content = content.replace(`const [${stateName}, set${stateName.charAt(0).toUpperCase() + stateName.slice(1)}] = useState<${entityName} | null>(null);`, `const [${stateName}, set${stateName.charAt(0).toUpperCase() + stateName.slice(1)}] = useState<${entityName} | null>(null);\n` + stateInsertion);
    }

    const startString = `<Box ref={printDialogRef} sx={{ p: 2, bgcolor: 'white', color: 'black', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>`;
    let boxContent = extractBox(content, startString);
    if (boxContent) {
        let functionContent = boxContent.replace(new RegExp(stateName, 'g'), 'printData');
        functionContent = functionContent.replace(/printDialogRef/g, 'ref');
        
        const renderFunc = `
  const renderPrintContent = (printData: ${entityName}, ref?: React.Ref<HTMLDivElement>) => (
    ${functionContent}
  );
`;
        if (!content.includes('const renderPrintContent')) {
            content = content.replace(/const handleDelete = \(\) => \{/, renderFunc + '\n  const handleDelete = () => {');
        }
        
        // 1. replace box with function call
        content = content.replace(boxContent, `renderPrintContent(${stateName}, printDialogRef)`);
        
        // 2. remove the surrounding curly braces and parenthesis
        const regex = new RegExp(`\\{${stateName}\\s*&&\\s*\\(\\s*renderPrintContent\\(${stateName}, printDialogRef\\)\\s*\\)\\}`);
        content = content.replace(regex, `{${stateName} && renderPrintContent(${stateName}, printDialogRef)}`);
        
        const hiddenBox = `
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        {download${entityName} && renderPrintContent(download${entityName}, downloadDialogRef)}
      </div>
    </Box>
  );
};`;
        content = content.replace(/<\/Box>\s*?\);\s*?\};\s*?export default/m, hiddenBox + '\n\nexport default');
    } else {
        console.error('Box not found in ' + filename);
    }

    if (entityName === 'Invoice') {
        content = content.replace(/onDownload=\{\(inv\) => \{[\s\S]*?URL\.revokeObjectURL\(url\);\s*\}\}/, `onDownload={(inv) => { setDownloadInvoice(inv); }}`);
    } else {
        content = content.replace(/onDownload=\{\(dc\) => \{[\s\S]*?URL\.revokeObjectURL\(url\);\s*\}\}/, `onDownload={(dc) => { setDownloadDC(dc); }}`);
    }

    fs.writeFileSync(filename, content);
    console.log(filename + ' updated successfully');
}

processFile('src/pages/Invoices/index.tsx', 'Invoice', 'viewInvoice');
processFile('src/pages/DC/index.tsx', 'DC', 'viewDC');
