package com.solsur.afip;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.w3c.dom.*;
import javax.xml.parsers.*;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * WSFEv1 — Web Service de Facturación Electrónica de AFIP.
 *
 * Para Monotributistas emite Facturas C (tipo 11).
 * El flujo es:
 *   1. Obtener el último número de comprobante emitido (para saber cuál es el siguiente)
 *   2. Enviar la factura a AFIP
 *   3. AFIP devuelve el CAE (Código de Autorización Electrónico)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AfipWsfeService {

    private final AfipConfig config;
    private final AfipTokenService tokenService;

    // Factura C para Monotributistas
    private static final int TIPO_FACTURA_C = 11;
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");

    /**
     * Autoriza una factura en AFIP y devuelve el CAE.
     *
     * @param importeTotal  Monto total de la factura (sin IVA para monotributistas)
     * @param fechaEmision  Fecha de la factura (normalmente hoy)
     * @param concepto      1=Productos, 2=Servicios, 3=Ambos
     */
    public CaeResponse autorizarFactura(
            double importeTotal,
            LocalDate fechaEmision,
            int concepto) throws Exception {

        AfipToken token = tokenService.getToken();
        long ultimoNro = obtenerUltimoNroComprobante(token);
        long nroNuevo = ultimoNro + 1;

        log.info("Autorizando Factura C #{} — Importe: ${}", nroNuevo, importeTotal);

        String soapRequest = buildSolicitarCaeSoap(token, nroNuevo, importeTotal, fechaEmision, concepto);
        String response = callWsfe(soapRequest, "FECAESolicitar");

        return parseCaeResponse(response, nroNuevo);
    }

    /**
     * Obtiene el último número de comprobante emitido en AFIP.
     * Necesario para saber cuál es el próximo número a usar.
     */
    public long obtenerUltimoNroComprobante(AfipToken token) throws Exception {
        String soap =
            "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" " +
            "xmlns:ar=\"http://ar.gov.afip.dif.FEV1/\">" +
            "<soapenv:Header/><soapenv:Body>" +
            "<ar:FECompUltimoAutorizado>" +
            "<ar:Auth>" +
            "<ar:Token>" + token.getToken() + "</ar:Token>" +
            "<ar:Sign>" + token.getSign() + "</ar:Sign>" +
            "<ar:Cuit>" + config.getCuit() + "</ar:Cuit>" +
            "</ar:Auth>" +
            "<ar:PtoVta>" + config.getPuntoVenta() + "</ar:PtoVta>" +
            "<ar:CbteTipo>" + TIPO_FACTURA_C + "</ar:CbteTipo>" +
            "</ar:FECompUltimoAutorizado>" +
            "</soapenv:Body></soapenv:Envelope>";

        String response = callWsfe(soap, "FECompUltimoAutorizado");

        DocumentBuilder db = DocumentBuilderFactory.newInstance().newDocumentBuilder();
        Document doc = db.parse(new ByteArrayInputStream(response.getBytes(StandardCharsets.UTF_8)));
        String nro = getTagValue(doc, "CbteNro");
        long ultimo = nro != null ? Long.parseLong(nro.trim()) : 0;
        log.info("Último comprobante AFIP: #{}", ultimo);
        return ultimo;
    }

    private String buildSolicitarCaeSoap(
            AfipToken token,
            long nroComprobante,
            double importeTotal,
            LocalDate fecha,
            int concepto) {

        String fechaStr = fecha.format(DATE_FMT);
        String importeStr = String.format("%.2f", importeTotal).replace(",", ".");

        return
            "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" " +
            "xmlns:ar=\"http://ar.gov.afip.dif.FEV1/\">" +
            "<soapenv:Header/><soapenv:Body>" +
            "<ar:FECAESolicitar>" +
            "<ar:Auth>" +
            "<ar:Token>" + token.getToken() + "</ar:Token>" +
            "<ar:Sign>" + token.getSign() + "</ar:Sign>" +
            "<ar:Cuit>" + config.getCuit() + "</ar:Cuit>" +
            "</ar:Auth>" +
            "<ar:FeCAEReq>" +
            "<ar:FeCabReq>" +
            "<ar:CantReg>1</ar:CantReg>" +
            "<ar:PtoVta>" + config.getPuntoVenta() + "</ar:PtoVta>" +
            "<ar:CbteTipo>" + TIPO_FACTURA_C + "</ar:CbteTipo>" +
            "</ar:FeCabReq>" +
            "<ar:FeDetReq>" +
            "<ar:FECAEDetRequest>" +
            "<ar:Concepto>" + concepto + "</ar:Concepto>" +
            "<ar:DocTipo>99</ar:DocTipo>" +          // 99 = Consumidor Final
            "<ar:DocNro>0</ar:DocNro>" +
            "<ar:CbteDesde>" + nroComprobante + "</ar:CbteDesde>" +
            "<ar:CbteHasta>" + nroComprobante + "</ar:CbteHasta>" +
            "<ar:CbteFch>" + fechaStr + "</ar:CbteFch>" +
            "<ar:ImpTotal>" + importeStr + "</ar:ImpTotal>" +
            "<ar:ImpTotConc>0.00</ar:ImpTotConc>" +
            "<ar:ImpNeto>" + importeStr + "</ar:ImpNeto>" +
            "<ar:ImpOpEx>0.00</ar:ImpOpEx>" +
            "<ar:ImpIVA>0.00</ar:ImpIVA>" +          // Monotributistas no cobran IVA
            "<ar:ImpTrib>0.00</ar:ImpTrib>" +
            "<ar:MonId>PES</ar:MonId>" +              // Pesos argentinos
            "<ar:MonCotiz>1</ar:MonCotiz>" +
            "</ar:FECAEDetRequest>" +
            "</ar:FeDetReq>" +
            "</ar:FeCAEReq>" +
            "</ar:FECAESolicitar>" +
            "</soapenv:Body></soapenv:Envelope>";
    }

    private CaeResponse parseCaeResponse(String xml, long nroComprobante) throws Exception {
        DocumentBuilder db = DocumentBuilderFactory.newInstance().newDocumentBuilder();
        Document doc = db.parse(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));

        CaeResponse resp = new CaeResponse();
        resp.setNroComprobante(nroComprobante);
        resp.setResultado(getTagValue(doc, "Resultado"));
        resp.setCae(getTagValue(doc, "CAE"));

        String vto = getTagValue(doc, "CAEFchVto");
        if (vto != null && !vto.isBlank()) {
            resp.setCaeVencimiento(LocalDate.parse(vto.trim(), DATE_FMT));
        }

        // Capturar observaciones / errores de AFIP
        NodeList obs = doc.getElementsByTagName("Obs");
        if (obs.getLength() > 0) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < obs.getLength(); i++) {
                Element el = (Element) obs.item(i);
                String code = getChildText(el, "Code");
                String msg  = getChildText(el, "Msg");
                sb.append("[").append(code).append("] ").append(msg).append(" ");
            }
            resp.setObservaciones(sb.toString().trim());
            log.warn("Observaciones AFIP: {}", resp.getObservaciones());
        }

        if (!"A".equals(resp.getResultado())) {
            NodeList errs = doc.getElementsByTagName("Err");
            if (errs.getLength() > 0) {
                Element el = (Element) errs.item(0);
                String msg = getChildText(el, "Msg");
                throw new RuntimeException("AFIP rechazó la factura: " + msg);
            }
        }

        log.info("CAE obtenido: {} — Vence: {}", resp.getCae(), resp.getCaeVencimiento());
        return resp;
    }

    private String callWsfe(String soapBody, String action) throws Exception {
        URL url = new URL(config.getWsfeUrl());
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setDoOutput(true);
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");
        conn.setRequestProperty("SOAPAction", "http://ar.gov.afip.dif.FEV1/" + action);
        conn.setConnectTimeout(30000);
        conn.setReadTimeout(30000);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(soapBody.getBytes(StandardCharsets.UTF_8));
        }

        int code = conn.getResponseCode();
        InputStream is = code >= 400 ? conn.getErrorStream() : conn.getInputStream();
        String response = new String(is.readAllBytes(), StandardCharsets.UTF_8);

        if (code != 200) {
            throw new RuntimeException("Error WSFE HTTP " + code + ": " + response);
        }
        return response;
    }

    private String getTagValue(Document doc, String tag) {
        NodeList nodes = doc.getElementsByTagName(tag);
        return nodes.getLength() > 0 ? nodes.item(0).getTextContent() : null;
    }

    private String getChildText(Element parent, String tag) {
        NodeList nl = parent.getElementsByTagName(tag);
        return nl.getLength() > 0 ? nl.item(0).getTextContent() : "";
    }
}
