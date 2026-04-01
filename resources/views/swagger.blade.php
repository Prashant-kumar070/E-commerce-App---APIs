<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Documentation</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
    <style>
        html,
        body {
            margin: 0;
            padding: 0;
            background: #f5f7fb;
            font-family: "Segoe UI", sans-serif;
        }

        .topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 24px;
            background: linear-gradient(135deg, #111827, #1f2937);
            color: #fff;
        }

        .topbar h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 700;
        }

        .topbar a {
            color: #93c5fd;
            text-decoration: none;
            font-size: 14px;
        }

        #swagger-ui {
            max-width: 1280px;
            margin: 0 auto;
            padding: 24px;
        }
    </style>
</head>
<body>
    <div class="topbar">
        <h1>eCommerce API Documentation</h1>
        <a href="{{ $openApiUrl }}" target="_blank" rel="noopener noreferrer">Open raw OpenAPI spec</a>
    </div>

    <div id="swagger-ui"></div>

    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function () {
            window.ui = SwaggerUIBundle({
                url: @json($openApiUrl),
                dom_id: '#swagger-ui',
                deepLinking: true,
                docExpansion: 'list',
                filter: true,
                persistAuthorization: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset,
                ],
                layout: 'StandaloneLayout',
            });
        };
    </script>
</body>
</html>
