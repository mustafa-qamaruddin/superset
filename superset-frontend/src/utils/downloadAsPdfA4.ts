import { SyntheticEvent } from 'react';
import { kebabCase } from 'lodash';
import { t } from '@superset-ui/core';
import { addWarningToast } from 'src/components/MessageToasts/actions';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const generateFileStem = (description: string, date = new Date()) =>
  `${kebabCase(description)}-${date.toISOString().replace(/[: ]/g, '-')}`;

interface ReportData {
  headers: string[];
  rows: any[][];
  title: string;
}

const PAGE_WIDTH = 297; // A4 Landscape
const PAGE_HEIGHT = 210;
const MARGIN = 10;
const ROWS_PER_PAGE = 12;

export default function downloadAsPdfA4(
  selector: string,
  description: string,
  isExactSelector = false,
) {
  return (event: SyntheticEvent) => {
    const elementToPrint = isExactSelector
      ? document.querySelector(selector)
      : event.currentTarget.closest(selector);

    if (!elementToPrint) {
      addWarningToast(t('PDF download failed, please refresh and try again.'));
      return;
    }

    const salesData = [];
    for (let year = 1990; year <= 2025; year += 1) {
      salesData.push({
        year,
        categoryA: Array(12)
          .fill(0)
          .map(() => (Math.random() * 1000).toFixed(2)),
        categoryB: Array(12)
          .fill(0)
          .map(() => (Math.random() * 1000).toFixed(2)),
        categoryC: Array(12)
          .fill(0)
          .map(() => (Math.random() * 1000).toFixed(2)),
      });
    }

    // Prepare report data
    const reportData: ReportData = {
      title: 'GK-Software SE - Custom Sales Report',
      headers: ['Year', 'Month', 'Category A', 'Category B', 'Category C'],
      rows: salesData.flatMap(data => {
        const { year } = data;
        const months = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
        return months.map((month, index) => [
          year.toString(),
          month,
          `$${data.categoryA[index]}`,
          `$${data.categoryB[index]}`,
          `$${data.categoryC[index]}`,
        ]);
      }),
    };

    const { headers, rows, title } = reportData;
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    let pageNumber = 1;
    const totalPages = Math.ceil(rows.length / ROWS_PER_PAGE);

    const addPageHeader = () => {
      doc.setFontSize(14);
      doc.text(title, MARGIN, MARGIN + 5);
    };

    const addPageFooter = () => {
      doc.setFontSize(10);
      const footerText = `Page ${pageNumber} of ${totalPages}`;
      const x = PAGE_WIDTH - MARGIN - doc.getTextWidth(footerText);
      const y = PAGE_HEIGHT - MARGIN;
      doc.text(footerText, x, y);
    };

    const generateTablePage = (startIndex: number) => {
      addPageHeader();

      const end = Math.min(startIndex + ROWS_PER_PAGE, rows.length);
      const currentRows = rows.slice(startIndex, end);

      (doc as any).autoTable({
        head: [headers],
        body: currentRows,
        startY: MARGIN * 3,
        margin: { left: MARGIN, right: MARGIN },
        didDrawPage: () => {
          addPageFooter();
          pageNumber += 1;
          if (pageNumber <= totalPages) {
            doc.addPage();
            generateTablePage(end);
          }
        },
        showHead: 'everyPage',
      });
      addPageFooter();
    };
    generateTablePage(0);
    doc.save(`${generateFileStem(description)}.pdf`);
  };
}
