export const parseDateRange = (query = {}) => {
  const start = query.startDate ? new Date(query.startDate) : null;
  const end = query.endDate ? new Date(query.endDate) : null;

  const isValidStart = start instanceof Date && !Number.isNaN(start?.getTime?.());
  const isValidEnd = end instanceof Date && !Number.isNaN(end?.getTime?.());

  if (!isValidStart && !isValidEnd) {
    return null;
  }

  const createdAt = {};
  if (isValidStart) {
    createdAt.$gte = start;
  }
  if (isValidEnd) {
    createdAt.$lte = end;
  }

  return { createdAt };
};

export const toCsv = (rows = []) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return 'no_data\n';
  }

  const headers = Object.keys(rows[0]);
  const escaped = (value) => {
    const normalized = value === undefined || value === null ? '' : String(value);
    if (/[",\n]/.test(normalized)) {
      return `"${normalized.replace(/"/g, '""')}"`;
    }
    return normalized;
  };

  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((header) => escaped(row[header])).join(','));
  }
  return `${lines.join('\n')}\n`;
};

const pdfEscape = (text) => String(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

export const toSimplePdf = (title, lines = []) => {
  const yStart = 780;
  const step = 16;
  const contentLines = [
    'BT',
    '/F1 14 Tf',
    `50 ${yStart} Td`,
    `(${pdfEscape(title)}) Tj`,
    '/F1 10 Tf'
  ];

  lines.slice(0, 42).forEach((line, index) => {
    const y = yStart - 26 - index * step;
    contentLines.push(`1 0 0 1 50 ${y} Tm`);
    contentLines.push(`(${pdfEscape(line)}) Tj`);
  });

  contentLines.push('ET');
  const stream = contentLines.join('\n');

  const objects = [];
  objects.push('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj');
  objects.push('2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj');
  objects.push('3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj');
  objects.push(`4 0 obj << /Length ${Buffer.byteLength(stream, 'utf8')} >> stream\n${stream}\nendstream endobj`);
  objects.push('5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj');

  let output = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((obj) => {
    offsets.push(Buffer.byteLength(output, 'utf8'));
    output += `${obj}\n`;
  });

  const xrefOffset = Buffer.byteLength(output, 'utf8');
  output += `xref\n0 ${objects.length + 1}\n`;
  output += '0000000000 65535 f \n';

  for (let i = 1; i < offsets.length; i += 1) {
    output += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  output += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  output += `startxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(output, 'utf8');
};
