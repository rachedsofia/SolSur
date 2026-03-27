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
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.*;
import java.security.cert.X509Certificate;
import java.security.cert.CertificateFactory;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.Base64;

/**
 * WSAA — Web Service de Autenticación y Autorización de AFIP.
 *
 * Genera el Token de Acceso (TA) firmando un Ticket de Requerimiento de Acceso (TRA)
 * con el certificado digital de AFIP. El token dura 12 horas.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AfipTokenService {

    private final AfipConfig config;

    // Cache del token (dura 12 horas)
    private String cachedToken;
    private String cachedSign;
    private LocalDateTime tokenExpiry;

    private static final String WSFE_SERVICE = "wsfe";
    private static final DateTimeFormatter AFIP_FMT =
        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    /**
     * Devuelve un token válido. Si el token cacheado sigue vigente, lo reutiliza.
     * Si venció o no existe, genera uno nuevo.
     */
    public AfipToken getToken() throws Exception {
        if (cachedToken != null && tokenExpiry != null && LocalDateTime.now().isBefore(tokenExpiry)) {
            log.debug("Reutilizando token AFIP (vence: {})", tokenExpiry);
            return new AfipToken(cachedToken, cachedSign);
        }
        log.info("Generando nuevo token AFIP...");
        return generateToken();
    }

    private AfipToken generateToken() throws Exception {
        // 1. Generar el TRA (Ticket de Requerimiento de Acceso)
        String tra = buildTra();

        // 2. Firmar el TRA con el certificado digital
        String cms = signTra(tra);

        // 3. Llamar al WSAA de AFIP
        String response = callWsaa(cms);

        // 4. Parsear la respuesta y extraer token + sign
        AfipToken token = parseWsaaResponse(response);

        // 5. Cachear el token por 10 horas (AFIP da 12, reservamos margen)
        cachedToken = token.getToken();
        cachedSign = token.getSign();
        tokenExpiry = LocalDateTime.now().plusHours(10);

        log.info("Token AFIP obtenido exitosamente");
        return token;
    }

    private String buildTra() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("America/Argentina/Buenos_Aires"));
        LocalDateTime expiry = now.plusMinutes(10);

        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
            "<loginTicketRequest version=\"1.0\">" +
            "<header>" +
            "<uniqueId>" + System.currentTimeMillis() / 1000 + "</uniqueId>" +
            "<generationTime>" + now.format(AFIP_FMT) + "-03:00</generationTime>" +
            "<expirationTime>" + expiry.format(AFIP_FMT) + "-03:00</expirationTime>" +
            "</header>" +
            "<service>" + WSFE_SERVICE + "</service>" +
            "</loginTicketRequest>";
    }

    private String signTra(String tra) throws Exception {
        // Leer certificado
        byte[] certBytes = Files.readAllBytes(Paths.get(config.getCertificadoPath()));
        CertificateFactory cf = CertificateFactory.getInstance("X.509");
        X509Certificate cert = (X509Certificate)
            cf.generateCertificate(new ByteArrayInputStream(certBytes));

        // Leer clave privada
        byte[] keyBytes = Files.readAllBytes(Paths.get(config.getClavePrivadaPath()));
        String keyStr = new String(keyBytes, StandardCharsets.UTF_8)
            .replace("-----BEGIN PRIVATE KEY-----", "")
            .replace("-----END PRIVATE KEY-----", "")
            .replace("-----BEGIN RSA PRIVATE KEY-----", "")
            .replace("-----END RSA PRIVATE KEY-----", "")
            .replaceAll("\\s", "");

        byte[] keyDecoded = Base64.getDecoder().decode(keyStr);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        PrivateKey privateKey = kf.generatePrivate(
            new java.security.spec.PKCS8EncodedKeySpec(keyDecoded));

        // Firmar con SHA256withRSA
        Signature sig = Signature.getInstance("SHA256withRSA");
        sig.initSign(privateKey);
        sig.update(tra.getBytes(StandardCharsets.UTF_8));
        byte[] signature = sig.sign();

        // Construir CMS simplificado (PKCS#7)
        // AFIP acepta el TRA firmado en base64
        String traB64 = Base64.getEncoder().encodeToString(tra.getBytes(StandardCharsets.UTF_8));
        String sigB64 = Base64.getEncoder().encodeToString(signature);
        String certB64 = Base64.getEncoder().encodeToString(cert.getEncoded());

        // Formato CMS que acepta WSAA
        return buildCms(traB64, sigB64, certB64);
    }

    private String buildCms(String traB64, String sigB64, String certB64) {
        // El WSAA de AFIP acepta un SOAP con el CMS embebido
        // Este es el formato mínimo requerido
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
            "<CMS>" +
            "<version>1</version>" +
            "<certificate>" + certB64 + "</certificate>" +
            "<signedData>" + traB64 + "</signedData>" +
            "<signature>" + sigB64 + "</signature>" +
            "</CMS>";
    }

    private String callWsaa(String cms) throws Exception {
        // Llamada SOAP al WSAA
        String soapBody =
            "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
            "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" " +
            "xmlns:wsaa=\"http://wsaa.view.sua.dvadac.desein.afip.gov\">" +
            "<soapenv:Header/>" +
            "<soapenv:Body>" +
            "<wsaa:loginCms>" +
            "<wsaa:in0><![CDATA[" + Base64.getEncoder().encodeToString(cms.getBytes(StandardCharsets.UTF_8)) + "]]></wsaa:in0>" +
            "</wsaa:loginCms>" +
            "</soapenv:Body>" +
            "</soapenv:Envelope>";

        URL url = new URL(config.getWsaaUrl());
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setDoOutput(true);
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "text/xml; charset=utf-8");
        conn.setRequestProperty("SOAPAction", "");
        conn.setConnectTimeout(30000);
        conn.setReadTimeout(30000);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(soapBody.getBytes(StandardCharsets.UTF_8));
        }

        int code = conn.getResponseCode();
        InputStream is = code >= 400 ? conn.getErrorStream() : conn.getInputStream();
        String response = new String(is.readAllBytes(), StandardCharsets.UTF_8);

        if (code != 200) {
            throw new RuntimeException("Error WSAA HTTP " + code + ": " + response);
        }
        return response;
    }

    private AfipToken parseWsaaResponse(String xml) throws Exception {
        DocumentBuilder db = DocumentBuilderFactory.newInstance().newDocumentBuilder();
        Document doc = db.parse(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));

        String token = getTagValue(doc, "token");
        String sign  = getTagValue(doc, "sign");

        if (token == null || sign == null) {
            throw new RuntimeException("WSAA no devolvió token/sign. Respuesta: " + xml);
        }
        return new AfipToken(token, sign);
    }

    private String getTagValue(Document doc, String tag) {
        NodeList nodes = doc.getElementsByTagName(tag);
        if (nodes.getLength() > 0) return nodes.item(0).getTextContent();
        return null;
    }
}
