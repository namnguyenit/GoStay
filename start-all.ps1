param(
    [switch]$Install,
    [switch]$Restart,
    [switch]$SkipFrontend,
    [switch]$SkipSearch,
    [switch]$SkipMedia,
    [switch]$SkipHealthCheck
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogDir = Join-Path $Root ".codex-service-logs"
$InternalToken = "gostay-internal-secret-token-12345"

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

$Services = @(
    @{ Name = "Identity"; Path = "Identity"; Port = 8080; Type = "java"; Command = ".\mvnw.cmd '-Dmaven.test.skip=true' spring-boot:run"; HealthPath = "/actuator/health"; StartupWait = 30 },
    @{ Name = "CatalogandListing"; Path = "CatalogandListing"; Port = 8082; Type = "java"; Command = ".\mvnw.cmd '-Dmaven.test.skip=true' spring-boot:run"; HealthPath = "/actuator/health"; StartupWait = 25 },
    @{ Name = "BookingandInventory"; Path = "BookingandInventory"; Port = 8083; Type = "java"; Command = ".\mvnw.cmd '-Dmaven.test.skip=true' spring-boot:run"; HealthPath = "/actuator/health"; StartupWait = 25 },
    @{ Name = "CartandOrder"; Path = "CartandOrder"; Port = 8084; Type = "java"; Command = ".\mvnw.cmd '-Dmaven.test.skip=true' spring-boot:run"; HealthPath = "/actuator/health"; StartupWait = 20 },
    @{ Name = "PaymentandWallet"; Path = "PaymentandWallet"; Port = 8085; Type = "java"; Command = ".\mvnw.cmd '-Dmaven.test.skip=true' spring-boot:run"; HealthPath = "/actuator/health"; StartupWait = 20 },
    @{ Name = "APIGateway"; Path = "APIGateway"; Port = 5555; Type = "node"; Command = "npm start"; HealthPath = "/health"; StartupWait = 10 },
    @{ Name = "CloudinaryService"; Path = "cloudinary-service"; Port = 5001; Type = "node"; Command = "npm start"; Optional = $SkipMedia; HealthPath = "/health"; StartupWait = 10 },
    @{ Name = "SearchRecommendation"; Path = "search-and-recommendation"; Port = 8086; Type = "node"; Command = "npm run start:dev"; Optional = $SkipSearch; HealthPath = "/health"; StartupWait = 15 },
    @{ Name = "FrontEnd"; Path = "front_end"; Port = 3000; Type = "node"; Command = "npm run dev"; Optional = $SkipFrontend; HealthPath = ""; StartupWait = 15 }
)

function Stop-PortOwner {
    param([int]$Port)

    $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    foreach ($connection in $connections) {
        if ($connection.OwningProcess -and $connection.OwningProcess -gt 0) {
            Write-Host "Stopping process $($connection.OwningProcess) on port $Port"
            Stop-Process -Id $connection.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
}

function Test-PortOpen {
    param([int]$Port)
    return [bool](Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}

function Test-HealthEndpoint {
    param(
        [string]$Url,
        [int]$MaxRetries = 30,
        [int]$DelaySeconds = 2
    )

    for ($i = 1; $i -le $MaxRetries; $i++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 5 -ErrorAction Stop -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                $content = $response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
                $status = if ($content) { $content.status ?? $content.Status ?? "UP" } else { "UP" }
                if ($status -eq "UP" -or $status -eq "healthy" -or $status -eq "SERVING") {
                    Write-Host "  ✓ Health check passed: $Url"
                    return $true
                }
            }
        }
        catch {
            # Ignore errors, retry
        }
        if ($i -lt $MaxRetries) {
            Write-Host "  ... waiting for health check ($i/$MaxRetries): $Url"
            Start-Sleep -Seconds $DelaySeconds
        }
    }
    Write-Warning "  ✗ Health check failed after $MaxRetries attempts: $Url"
    return $false
}

function Start-ServiceWindow {
    param(
        [hashtable]$Service
    )

    $serviceDir = Join-Path $Root $Service.Path
    if (!(Test-Path $serviceDir)) {
        Write-Warning "Missing directory: $serviceDir"
        return
    }

    if ($Service.Optional) {
        Write-Host "Skipping $($Service.Name)"
        return
    }

    if ((Test-PortOpen -Port $Service.Port) -and !$Restart) {
        Write-Host "$($Service.Name) already appears to be running on port $($Service.Port). Use -Restart to restart it."
        return
    }

    $logPath = Join-Path $LogDir "$($Service.Name).log"
    $installCommand = ""
    if ($Install -and $Service.Type -eq "node") {
        $installCommand = "npm install"
    }

    $gatewayEnv = @"
`$env:GATEWAY_PORT = "5555"
`$env:IDENTITY_SERVICE_URL = "http://localhost:8080"
`$env:MEDIA_SERVICE_URL = "http://localhost:5001"
`$env:CATALOG_SERVICE_URL = "http://localhost:8082"
`$env:BOOKING_SERVICE_URL = "http://localhost:8083"
`$env:CART_SERVICE_URL = "http://localhost:8084"
`$env:PAYMENT_SERVICE_URL = "http://localhost:8085"
`$env:SEARCH_SERVICE_URL = "http://localhost:8086"
`$env:INTERNAL_SERVICE_TOKEN = "$InternalToken"
"@

    $searchEnv = @"
`$env:PORT = "8086"
`$env:NODE_ENV = "development"
`$env:REDIS_URL = "redis://localhost:6379"
`$env:INVENTORY_SERVICE_URL = "http://localhost:8083"
`$env:INTERNAL_SERVICE_TOKEN = "$InternalToken"
"@

    $mediaEnv = @"
`$env:MEDIA_PORT = "5001"
`$env:INTERNAL_SERVICE_TOKEN = "$InternalToken"
"@

    $javaEnv = @"
`$env:INTERNAL_SERVICE_TOKEN = "$InternalToken"
`$env:MEDIA_INTERNAL_SERVICE_TOKEN = "$InternalToken"
"@

    $envCommand = switch ($Service.Name) {
        "APIGateway" { $gatewayEnv }
        "SearchRecommendation" { $searchEnv }
        "CloudinaryService" { $mediaEnv }
        default { $javaEnv }
    }

    $script = @"
`$Host.UI.RawUI.WindowTitle = "GoStay - $($Service.Name)"
Set-Location -LiteralPath "$serviceDir"
$envCommand
Write-Host "Starting $($Service.Name) on port $($Service.Port)"
Write-Host "Log: $logPath"
$installCommand
$($Service.Command) 2>&1 | Tee-Object -FilePath "$logPath"
"@

    $proc = Start-Process powershell.exe -ArgumentList @(
        "-NoExit",
        "-ExecutionPolicy", "Bypass",
        "-Command", $script
    ) -WorkingDirectory $serviceDir -PassThru

    # Wait for health check if configured and not skipped
    if (-not $SkipHealthCheck -and $Service.HealthPath) {
        $healthUrl = "http://localhost:$($Service.Port)$($Service.HealthPath)"
        Write-Host "  Waiting for $($Service.Name) health check..."
        Start-Sleep -Seconds 3  # Initial wait before first check
        Test-HealthEndpoint -Url $healthUrl -MaxRetries $Service.StartupWait -DelaySeconds 2
    }

    return $proc
}

if ($Restart) {
    Write-Host "Restart requested. Stopping known GoStay ports..."
    foreach ($service in $Services) {
        if (!$service.Optional) {
            Stop-PortOwner -Port $service.Port
        }
    }

    Get-CimInstance Win32_Process |
        Where-Object {
            $_.Name -eq "powershell.exe" -and
            $_.CommandLine -like "*$Root*" -and
            $_.CommandLine -like "*.codex-service-logs*"
        } |
        ForEach-Object {
            Write-Host "Stopping launcher window process $($_.ProcessId)"
            Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
        }

    Start-Sleep -Seconds 2
}

Write-Host "Starting GoStay services from $Root"
Write-Host "Logs directory: $LogDir"

$startedServices = @()

foreach ($service in $Services) {
    $proc = Start-ServiceWindow -Service $service
    if ($proc) {
        $startedServices += @{ Name = $service.Name; Port = $service.Port; Process = $proc }
    }
    Start-Sleep -Milliseconds 700
}

Write-Host ""
Write-Host "=== GoStay Services Started ==="
foreach ($svc in $startedServices) {
    Write-Host "  [$($svc.Name)] http://localhost:$($svc.Port) (PID: $($svc.Process.Id))"
}

Write-Host ""
Write-Host "Check ports:"
Write-Host "  Get-NetTCPConnection -State Listen -LocalPort 8080,8082,8083,8084,8085,5555,5001,8086,3000"
Write-Host ""
Write-Host "Useful variants:"
Write-Host "  .\start-all.ps1 -Restart"
Write-Host "  .\start-all.ps1 -Install -Restart"
Write-Host "  .\start-all.ps1 -SkipSearch -SkipFrontend"
Write-Host "  .\start-all.ps1 -SkipHealthCheck  # Skip health endpoint verification"
