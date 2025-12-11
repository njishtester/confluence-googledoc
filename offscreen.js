import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

chrome.runtime.onMessage.addListener(async (request) => {
  if (request.action === 'printToPdf') {
    document.body.innerHTML = request.htmlContent;

    const canvas = await html2canvas(document.body);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    const pdfData = pdf.output('datauristring');

    chrome.runtime.sendMessage({
      action: 'pdfReady',
      pdfData: pdfData,
      title: request.title
    });
  }
});
