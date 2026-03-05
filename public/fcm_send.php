<?php
// fcm_send.php - VERSIÓN STANDALONE (SIN COMPOSER)

class GoogleTokenGenerator {
    private static function base64UrlEncode($data) {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    public static function getAccessToken($jsonKeyFilePath) {
        if (!file_exists($jsonKeyFilePath)) {
            return false;
        }
        $credentials = json_decode(file_get_contents($jsonKeyFilePath), true);
        if (!$credentials || !isset($credentials['private_key']) || !isset($credentials['client_email'])) return false;

        $header = json_encode(['alg' => 'RS256', 'typ' => 'JWT']);
        $now = time();
        $payload = json_encode([
            'iss' => $credentials['client_email'],
            'sub' => $credentials['client_email'],
            'aud' => 'https://oauth2.googleapis.com/token',
            'iat' => $now,
            'exp' => $now + 3600,
            'scope' => 'https://www.googleapis.com/auth/firebase.messaging'
        ]);

        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload);
        $signatureInput = $base64UrlHeader . "." . $base64UrlPayload;

        $privateKey = $credentials['private_key'];
        if (!openssl_sign($signatureInput, $signature, $privateKey, OPENSSL_ALGO_SHA256)) return false;
        $jwt = $signatureInput . "." . self::base64UrlEncode($signature);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://oauth2.googleapis.com/token');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $jwt
        ]));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        $response = curl_exec($ch);
        curl_close($ch);

        $data = json_decode($response, true);
        return isset($data['access_token']) ? $data['access_token'] : false;
    }
}

function enviarNotificacionCliente($tokenDestino, $titulo, $cuerpo, $datosExtra = []) {
    // -------------------------------------------------------------------------
    // 1. CONFIGURACIÓN: RUTA DEL JSON
    // Asegúrate de que este nombre sea EXACTO al archivo que subiste a Hostinger
    // -------------------------------------------------------------------------
    $rutaArchivoJson = __DIR__ . '/pruewba-74dc3-firebase-adminsdk-fbsvc-fbe758bfb7.json';
    
    // Tu Project ID (sacado de tu archivo JSON)
    $projectId = "pruewba-74dc3"; 

    // Validar archivo
    if (!file_exists($rutaArchivoJson)) {
        return ["exito" => false, "mensaje" => "Error: No se encuentra el archivo JSON en: $rutaArchivoJson"];
    }

    // 2. Obtener Token
    $accessToken = GoogleTokenGenerator::getAccessToken($rutaArchivoJson);
    if (!$accessToken) {
        return ["exito" => false, "mensaje" => "Error: No se pudo generar el Token de Google (Revisa OpenSSL o el JSON)"];
    }

    // 3. Construir Mensaje
    $mensaje = [
        'message' => [
            'token' => $tokenDestino,
            'notification' => [
                'title' => $titulo,
                'body'  => $cuerpo
            ],
            'android' => [
                'notification' => [
                    'sound' => 'default',
                    'click_action' => 'FLUTTER_NOTIFICATION_CLICK'
                ]
            ],
            // Convertimos los datos extra a strings para evitar errores
            'data' => array_map('strval', $datosExtra) 
        ]
    ];

    // 4. Enviar a Firebase
    $url = "https://fcm.googleapis.com/v1/projects/$projectId/messages:send";
    $headers = [
        'Authorization: Bearer ' . $accessToken,
        'Content-Type: application/json'
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($mensaje));

    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if ($result === false) {
        $errorCurl = curl_error($ch);
        curl_close($ch);
        return ["exito" => false, "mensaje" => "Error de conexión cURL: $errorCurl"];
    }
    
    curl_close($ch);

    if ($httpCode == 200) {
        return ["exito" => true, "respuesta" => $result];
    } else {
        return ["exito" => false, "mensaje" => "Error FCM ($httpCode): $result"];
    }
}
?>