import { SyntheticEvent } from 'react';
import { kebabCase } from 'lodash';
import { t } from '@superset-ui/core';
import { addWarningToast } from 'src/components/MessageToasts/actions';
import { jsPDF } from 'jspdf';

const generateFileStem = (description: string, date = new Date()) =>
  `${kebabCase(description)}-${date.toISOString().replace(/[: ]/g, '-')}`;

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

    const doc = new jsPDF();

    salesData.forEach(data => {
      doc.addPage();
      doc.setFontSize(12);
      doc.text('gk-software', 10, 10);

      doc.setFontSize(10);
      doc.text(`Year: ${data.year}`, 10, 20);

      // Table headers
      doc.text('Month', 10, 30);
      doc.text('Category A', 50, 30);
      doc.text('Category B', 100, 30);
      doc.text('Category C', 150, 30);

      let yOffset = 40;
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
      months.forEach((month, index) => {
        doc.text(month, 10, yOffset);
        doc.text(`$${data.categoryA[index]}`, 50, yOffset);
        doc.text(`$${data.categoryB[index]}`, 100, yOffset);
        doc.text(`$${data.categoryC[index]}`, 150, yOffset);
        yOffset += 10;
      });
    });

    doc.save(`${generateFileStem(description)}.pdf`);
  };
}
