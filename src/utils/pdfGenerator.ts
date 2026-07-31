import html2pdf from "html2pdf.js";

/**
 * Utility to export an HTML element directly to a downloadable PDF file
 * Supports html2pdf.js with automatic fallback to browser print dialog
 */
export async function exportElementToPDF(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found for PDF export.`);
    return false;
  }

  try {
    const pdfFunc = (html2pdf as any)?.default || html2pdf || (window as any).html2pdf;

    if (pdfFunc && typeof pdfFunc === "function") {
      const opt = {
        margin: [6, 6, 6, 6],
        filename: filename.endsWith(".pdf") ? filename : `${filename}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      };
      await pdfFunc().set(opt).from(element).save();
      return true;
    } else {
      window.print();
      return true;
    }
  } catch (error) {
    console.warn("Falling back to browser window.print():", error);
    window.print();
    return false;
  }
}
