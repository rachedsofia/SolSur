package com.solsur.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.solsur.dto.InvoiceResponseDTO;
import com.solsur.dto.SaleResponseDTO;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final SaleService saleService;
    private final InvoiceService invoiceService;
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // ─── VENTAS EXCEL ────────────────────────────────────────────────────────

    public byte[] exportSalesExcel(LocalDate start, LocalDate end) throws IOException {
        List<SaleResponseDTO> sales = saleService.findByRange(start, end);
        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Ventas");
            int[] widths = {3200, 5800, 8000, 2400, 4200, 4200, 5200, 4000};
            for (int i = 0; i < widths.length; i++) sheet.setColumnWidth(i, widths[i]);

            CellStyle hStyle = headerStyle(wb);
            CellStyle curStyle = currencyStyle(wb);
            CellStyle dateStyle = dateStyle(wb);

            // Title
            Row t = sheet.createRow(0);
            Cell tc = t.createCell(0);
            tc.setCellValue("SOLSUR — Reporte de Ventas: " + start.format(FMT) + " al " + end.format(FMT));
            tc.setCellStyle(hStyle);

            // Headers
            String[] headers = {"Fecha", "Cliente", "Producto", "Cant.", "Precio Unit.", "Total", "Forma de Pago", "Estado"};
            Row hr = sheet.createRow(2);
            for (int i = 0; i < headers.length; i++) {
                Cell c = hr.createCell(i); c.setCellValue(headers[i]); c.setCellStyle(hStyle);
            }

            int rowNum = 3;
            BigDecimal grandTotal = BigDecimal.ZERO;
            for (SaleResponseDTO s : sales) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(s.getDate() != null ? s.getDate().format(FMT) : "");
                row.createCell(1).setCellValue(nvl(s.getClient()));
                row.createCell(2).setCellValue(nvl(s.getProductName()));
                row.createCell(3).setCellValue(s.getQuantity() != null ? s.getQuantity() : 0);
                setMoney(row.createCell(4), s.getUnitPrice(), curStyle);
                setMoney(row.createCell(5), s.getTotalAmount(), curStyle);
                row.createCell(6).setCellValue(nvl(s.getPaymentMethod()));
                row.createCell(7).setCellValue(nvl(s.getInvoiceStatus()));
                if (s.getTotalAmount() != null) grandTotal = grandTotal.add(s.getTotalAmount());
            }

            Row totRow = sheet.createRow(rowNum + 1);
            totRow.createCell(4).setCellValue("TOTAL VENTAS:");
            setMoney(totRow.createCell(5), grandTotal, curStyle);

            return toBytes(wb);
        }
    }

    // ─── VENTAS PDF ──────────────────────────────────────────────────────────

    public byte[] exportSalesPdf(LocalDate start, LocalDate end) throws Exception {
        List<SaleResponseDTO> sales = saleService.findByRange(start, end);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4.rotate(), 36, 36, 50, 36);
        PdfWriter.getInstance(doc, out);
        doc.open();

        addPdfTitle(doc, "SOLSUR — Reporte de Ventas", start.format(FMT) + " al " + end.format(FMT));

        PdfPTable table = new PdfPTable(8);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{2f, 3f, 4f, 1.4f, 2.8f, 2.8f, 2.8f, 2.2f});
        pdfHeader(table, new String[]{"Fecha", "Cliente", "Producto", "Cant.", "Precio Unit.", "Total", "Pago", "Estado"});

        BigDecimal grand = BigDecimal.ZERO;
        int i = 0;
        for (SaleResponseDTO s : sales) {
            BaseColor bg = i++ % 2 == 0 ? BaseColor.WHITE : new BaseColor(248, 248, 248);
            pdfCell(table, s.getDate() != null ? s.getDate().format(FMT) : "-", bg);
            pdfCell(table, nvl(s.getClient()), bg);
            pdfCell(table, nvl(s.getProductName()), bg);
            pdfCell(table, String.valueOf(s.getQuantity() != null ? s.getQuantity() : 0), bg);
            pdfCell(table, money(s.getUnitPrice()), bg);
            pdfCell(table, money(s.getTotalAmount()), bg);
            pdfCell(table, nvl(s.getPaymentMethod()), bg);
            pdfCell(table, nvl(s.getInvoiceStatus()), bg);
            if (s.getTotalAmount() != null) grand = grand.add(s.getTotalAmount());
        }
        doc.add(table);
        pdfTotal(doc, "Total Ventas: " + money(grand));
        doc.close();
        return out.toByteArray();
    }

    // ─── FACTURAS EXCEL ──────────────────────────────────────────────────────

    public byte[] exportInvoicesExcel() throws IOException {
        List<InvoiceResponseDTO> invoices = invoiceService.findAll();
        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Facturas");
            int[] widths = {3500, 3000, 3000, 7000, 3500, 4500, 4500, 4500, 5000, 3500};
            for (int i = 0; i < widths.length; i++) sheet.setColumnWidth(i, widths[i]);

            CellStyle hStyle = headerStyle(wb);
            CellStyle curStyle = currencyStyle(wb);

            Row t = sheet.createRow(0);
            Cell tc = t.createCell(0);
            tc.setCellValue("SOLSUR — Libro de Facturas");
            tc.setCellStyle(hStyle);

            String[] headers = {"Tipo", "Pto. Venta", "Número", "Razón Social", "CUIT", "Monto Neto", "IVA", "Total", "Fecha Emisión", "Estado"};
            Row hr = sheet.createRow(2);
            for (int i = 0; i < headers.length; i++) {
                Cell c = hr.createCell(i); c.setCellValue(headers[i]); c.setCellStyle(hStyle);
            }

            int rowNum = 3;
            BigDecimal grandTotal = BigDecimal.ZERO;
            for (InvoiceResponseDTO inv : invoices) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(nvl(inv.getInvoiceType()));
                row.createCell(1).setCellValue(nvl(inv.getPuntoVenta()));
                row.createCell(2).setCellValue(nvl(inv.getNumero()));
                row.createCell(3).setCellValue(nvl(inv.getRazonSocial()));
                row.createCell(4).setCellValue(nvl(inv.getCuit()));
                setMoney(row.createCell(5), inv.getMontoNeto(), curStyle);
                setMoney(row.createCell(6), inv.getMontoIva(), curStyle);
                setMoney(row.createCell(7), inv.getTotal(), curStyle);
                row.createCell(8).setCellValue(inv.getFechaEmision() != null ? inv.getFechaEmision().format(FMT) : "");
                row.createCell(9).setCellValue(nvl(inv.getStatus()));
                if (inv.getTotal() != null) grandTotal = grandTotal.add(inv.getTotal());
            }

            Row totRow = sheet.createRow(rowNum + 1);
            totRow.createCell(6).setCellValue("TOTAL:");
            setMoney(totRow.createCell(7), grandTotal, curStyle);

            return toBytes(wb);
        }
    }

    // ─── FACTURAS PDF ────────────────────────────────────────────────────────

    public byte[] exportInvoicesPdf() throws Exception {
        List<InvoiceResponseDTO> invoices = invoiceService.findAll();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4.rotate(), 36, 36, 50, 36);
        PdfWriter.getInstance(doc, out);
        doc.open();

        addPdfTitle(doc, "SOLSUR — Libro de Facturas", "Generado el " + LocalDate.now().format(FMT));

        PdfPTable table = new PdfPTable(8);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1.8f, 1.5f, 1.8f, 3.5f, 2.5f, 2.5f, 2.5f, 2f});
        pdfHeader(table, new String[]{"Tipo", "Pto.Vta.", "Número", "Razón Social", "Neto", "IVA", "Total", "Estado"});

        BigDecimal grand = BigDecimal.ZERO;
        int i = 0;
        for (InvoiceResponseDTO inv : invoices) {
            BaseColor bg = i++ % 2 == 0 ? BaseColor.WHITE : new BaseColor(248, 248, 248);
            pdfCell(table, nvl(inv.getInvoiceType()), bg);
            pdfCell(table, nvl(inv.getPuntoVenta()), bg);
            pdfCell(table, nvl(inv.getNumero()), bg);
            pdfCell(table, nvl(inv.getRazonSocial()), bg);
            pdfCell(table, money(inv.getMontoNeto()), bg);
            pdfCell(table, money(inv.getMontoIva()), bg);
            pdfCell(table, money(inv.getTotal()), bg);
            pdfCell(table, nvl(inv.getStatus()), bg);
            if (inv.getTotal() != null) grand = grand.add(inv.getTotal());
        }
        doc.add(table);
        pdfTotal(doc, "Total Facturado: " + money(grand));
        doc.close();
        return out.toByteArray();
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────

    private CellStyle headerStyle(XSSFWorkbook wb) {
        CellStyle s = wb.createCellStyle();
        Font f = wb.createFont();
        f.setBold(true); f.setColor(IndexedColors.WHITE.getIndex());
        s.setFont(f);
        s.setFillForegroundColor(IndexedColors.BLACK.getIndex());
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(HorizontalAlignment.LEFT);
        return s;
    }

    private CellStyle currencyStyle(XSSFWorkbook wb) {
        CellStyle s = wb.createCellStyle();
        s.setDataFormat(wb.createDataFormat().getFormat("$#,##0.00"));
        return s;
    }

    private CellStyle dateStyle(XSSFWorkbook wb) {
        CellStyle s = wb.createCellStyle();
        s.setDataFormat(wb.createDataFormat().getFormat("dd/mm/yyyy"));
        return s;
    }

    private void setMoney(Cell cell, BigDecimal val, CellStyle style) {
        cell.setCellValue(val != null ? val.doubleValue() : 0);
        cell.setCellStyle(style);
    }

    private byte[] toBytes(XSSFWorkbook wb) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        wb.write(out); return out.toByteArray();
    }

    private void addPdfTitle(Document doc, String title, String subtitle) throws DocumentException {
        BaseFont bfb = null, bf = null;
        try {
            bfb = BaseFont.createFont(BaseFont.HELVETICA_BOLD, BaseFont.CP1252, false);
            bf  = BaseFont.createFont(BaseFont.HELVETICA,      BaseFont.CP1252, false);
        } catch (IOException e) { throw new DocumentException(e); }

        com.itextpdf.text.Font fTitle = new com.itextpdf.text.Font(bfb, 18);
        com.itextpdf.text.Font fSub   = new com.itextpdf.text.Font(bf,  10, com.itextpdf.text.Font.NORMAL, new BaseColor(120,120,120));

        Paragraph p1 = new Paragraph(title, fTitle); p1.setSpacingAfter(4); doc.add(p1);
        Paragraph p2 = new Paragraph(subtitle, fSub); p2.setSpacingAfter(18); doc.add(p2);
    }

    private void pdfHeader(PdfPTable table, String[] headers) throws DocumentException {
        BaseFont bfb = null;
        try { bfb = BaseFont.createFont(BaseFont.HELVETICA_BOLD, BaseFont.CP1252, false); }
        catch (IOException e) { throw new DocumentException(e); }
        com.itextpdf.text.Font fHead = new com.itextpdf.text.Font(bfb, 9, com.itextpdf.text.Font.NORMAL, BaseColor.WHITE);
        for (String h : headers) {
            PdfPCell c = new PdfPCell(new Phrase(h, fHead));
            c.setBackgroundColor(BaseColor.BLACK); c.setPadding(8); c.setBorder(Rectangle.NO_BORDER);
            table.addCell(c);
        }
    }

    private void pdfCell(PdfPTable table, String text, BaseColor bg) throws DocumentException {
        BaseFont bf = null;
        try { bf = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1252, false); }
        catch (IOException e) { throw new DocumentException(e); }
        com.itextpdf.text.Font fCell = new com.itextpdf.text.Font(bf, 8);
        PdfPCell c = new PdfPCell(new Phrase(text != null ? text : "-", fCell));
        c.setBackgroundColor(bg); c.setPadding(6);
        c.setBorderColor(new BaseColor(220,220,220)); c.setBorderWidth(0.5f);
        table.addCell(c);
    }

    private void pdfTotal(Document doc, String text) throws DocumentException {
        BaseFont bfb = null;
        try { bfb = BaseFont.createFont(BaseFont.HELVETICA_BOLD, BaseFont.CP1252, false); }
        catch (IOException e) { throw new DocumentException(e); }
        com.itextpdf.text.Font fTotal = new com.itextpdf.text.Font(bfb, 12);
        Paragraph p = new Paragraph("\n" + text, fTotal);
        p.setAlignment(Element.ALIGN_RIGHT); doc.add(p);
    }

    private String money(BigDecimal val) {
        if (val == null) return "$0";
        return "$" + String.format("%,.0f", val);
    }

    private String nvl(String s) { return s != null ? s : "-"; }
}
