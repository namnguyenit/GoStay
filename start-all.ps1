param(
    [switch]$Install,
    [switch]$Restart,
    [switch]$SkipFrontend,
    [switch]$SkipSearch,
    [switch]$SkipMedia
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogDir = Join-Path $Root ".codex-service-logs"
$InternalToken = "gostay-internal-secret-token-12345"

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

$Services = @(
    @{ Name = "Identity"; Path = "Identity"; Port = 8080; Type = "java"; Command = ".\mvnw.cmd '-Dmaven.test.skip=true' spring-boot:run" },
    @{ Name = "CatalogandListing"; Path = "CatalogandListing"; Port = 8082; Type = "java"; Command = ".\mvnw.cmd '-Dmaven.test.skip=true' spring-boot:run" },
    @{ Name = "BookingandInventory"; Path = "BookingandInventory"; Port = 8083; Type = "java"; Command = ".\mvnw.cmd '-Dmaven.test.skip=true' spring-boot:run" },
    @{ Name = "CartandOrder"; Path = "CartandOrder"; Port = 8084; Type = "java"; Command = ".\mvnw.cmd '-Dmaven.test.skip=true' spring-boot:run" },
    @{ Name = "PaymentandWallet"; Path = "PaymentandWallet"; Port = 8085; Type = "java"; Command = ".\mvnw.cmd '-Dmaven.test.skip=true' spring-boot:run" },
    @{ Name = "APIGateway"; Path = "APIGateway"; Port = 5555; Type = "node"; Command = "npm start" },
    @{ Name = "CloudinaryService"; Path = "cloudinary-service"; Port = 5001; Type = "node"; Command = "npm start"; Optional = $SkipMedia },
    @{ Name = "SearchRecommendation"; Path = "search-and-recommendation"; Port = 8086; Type = "node"; Command = "npm run start:dev"; Optional = $SkipSearch },
    @{ Name = "FrontEnd"; Path = "front_end"; Port = 3000; Type = "node"; Command = "npm run dev"; Optional = $SkipFrontend }
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

    Start-Process powershell.exe -ArgumentList @(
        "-NoExit",
        "-ExecutionPolicy", "Bypass",
        "-Command", $script
    ) -WorkingDirectory $serviceDir
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

foreach ($service in $Services) {
    Start-ServiceWindow -Service $service
    Start-Sleep -Milliseconds 700
}

Write-Host ""
Write-Host "Startup commands sent. Wait for Spring Boot/Nest/Next to finish booting."
Write-Host "Check ports:"
Write-Host "  Get-NetTCPConnection -State Listen -LocalPort 8080,8082,8083,8084,8085,5555,5001,8086,3000"
Write-Host ""
Write-Host "Useful variants:"
Write-Host "  .\start-all.ps1 -Restart"
Write-Host "  .\start-all.ps1 -Install -Restart"
Write-Host "  .\start-all.ps1 -SkipSearch -SkipFrontend"
