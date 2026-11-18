$port = 3000
$prefix = "http://localhost:$port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Output "Multi-page HTTP Server listening on $prefix"
} catch {
    Write-Error "Failed to start listener on $prefix : $_"
    exit 1
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($rawPath)) {
            $rawPath = "dashboard.html"
        }

        # Resolve file path
        $targetFile = Join-Path $PSScriptRoot $rawPath
        if (-not (Test-Path $targetFile)) {
            if (Test-Path "$targetFile.html") {
                $targetFile = "$targetFile.html"
            } elseif (Test-Path (Join-Path $PSScriptRoot "dashboard.html")) {
                $targetFile = Join-Path $PSScriptRoot "dashboard.html"
            }
        }

        if (Test-Path $targetFile -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($targetFile).ToLower()
            $ctype = $mimeTypes[$ext]
            if (-not $ctype) { $ctype = "application/octet-stream" }

            $bytes = [System.IO.File]::ReadAllBytes($targetFile)
            $response.ContentType = $ctype
            $response.ContentLength64 = $bytes.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("<h1>404 Page Not Found</h1>")
            $response.ContentType = "text/html; charset=utf-8"
            $response.StatusCode = 404
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.Close()
    } catch {
        # ignore client disconnects
    }
}
