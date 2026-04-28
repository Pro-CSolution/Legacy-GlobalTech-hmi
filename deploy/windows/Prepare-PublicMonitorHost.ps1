[CmdletBinding()]
param(
    [string]$SiteHost = 'monitor.globaltechconview.com',
    [string]$MonitorBuildSource = '',
    [string]$InstallRoot = 'C:\ProgramData\GlobalTech',
    [string]$CaddyExePath = 'C:\Program Files\Caddy\caddy.exe',
    [string]$BackendOrigin = '127.0.0.1:8000',
    [string]$OriginCertPath = 'C:\ProgramData\GlobalTech\Caddy\certs\origin-monitor.crt',
    [string]$OriginKeyPath = 'C:\ProgramData\GlobalTech\Caddy\certs\origin-monitor.key',
    [string]$ServiceName = 'GlobalTechMonitorProxy',
    [switch]$InstallCaddyService,
    [switch]$StartCaddyService,
    [switch]$SkipFirewallRule
)

$ErrorActionPreference = 'Stop'

function Write-Step {
    param([string]$Message)
    Write-Host "[monitor-host] $Message" -ForegroundColor Cyan
}

function Ensure-Directory {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Assert-FileExists {
    param(
        [string]$Path,
        [string]$Label
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        throw "$Label not found at '$Path'."
    }
}

function Convert-ToCaddyPath {
    param([string]$Path)
    return ($Path -replace '\\', '/')
}

function Set-FirewallRule {
    param(
        [string]$Name,
        [int]$Port
    )

    $existing = Get-NetFirewallRule -DisplayName $Name -ErrorAction SilentlyContinue
    if ($null -ne $existing) {
        Write-Step "Firewall rule already exists: $Name"
        return
    }

    New-NetFirewallRule `
        -DisplayName $Name `
        -Direction Inbound `
        -Action Allow `
        -Protocol TCP `
        -LocalPort $Port | Out-Null

    Write-Step "Created firewall rule '$Name' for TCP/$Port"
}

function Get-ServiceExists {
    param([string]$Name)
    return $null -ne (Get-Service -Name $Name -ErrorAction SilentlyContinue)
}

function Get-ServiceBinaryPath {
    param([string]$Name)

    $service = Get-CimInstance -ClassName Win32_Service -Filter "Name='$Name'" -ErrorAction SilentlyContinue
    if ($null -eq $service) {
        return $null
    }

    return $service.PathName
}

function Install-OrUpdateCaddyService {
    param(
        [string]$Name,
        [string]$ExePath,
        [string]$ConfigPath
    )

    if (-not (Test-Path -LiteralPath $ExePath)) {
        throw "Caddy executable not found at '$ExePath'."
    }

    $binaryPath = "`"$ExePath`" run --environ --config `"$ConfigPath`""

    if (Get-ServiceExists -Name $Name) {
        $currentBinaryPath = Get-ServiceBinaryPath -Name $Name
        if ($currentBinaryPath -eq $binaryPath) {
            Write-Step "Windows service '$Name' already uses the expected Caddy command"
        }
        else {
            Write-Step "Updating existing Windows service '$Name'"
            & sc.exe config $Name 'start= auto' "binPath= $binaryPath" | Out-Null
            if ($LASTEXITCODE -ne 0) {
                throw "Failed to update Windows service '$Name'."
            }
        }
    }
    else {
        Write-Step "Creating Windows service '$Name'"
        New-Service `
            -Name $Name `
            -BinaryPathName $binaryPath `
            -DisplayName 'GlobalTech Monitor Proxy' `
            -Description 'Caddy reverse proxy for the GlobalTech public monitor' `
            -StartupType Automatic | Out-Null
    }

    Start-Sleep -Milliseconds 500

    if (-not (Get-ServiceExists -Name $Name)) {
        throw "Windows service '$Name' was not created successfully."
    }
}

function Restart-ServiceSafe {
    param([string]$Name)

    if (-not (Get-ServiceExists -Name $Name)) {
        throw "Windows service '$Name' is not installed."
    }

    $service = Get-Service -Name $Name
    if ($service.Status -eq 'Running') {
        Write-Step "Restarting Windows service '$Name'"
        Restart-Service -Name $Name -Force
    }
    else {
        Write-Step "Starting Windows service '$Name'"
        Start-Service -Name $Name
    }
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$templatePath = Join-Path $scriptRoot 'monitor.Caddyfile.template'

if (-not (Test-Path -LiteralPath $templatePath)) {
    throw "Caddyfile template not found at '$templatePath'."
}

$caddyRoot = Join-Path $InstallRoot 'Caddy'
$certRoot = Join-Path $caddyRoot 'certs'
$caddyConfigPath = Join-Path $caddyRoot 'Caddyfile'
$monitorRoot = Join-Path $InstallRoot 'Monitor'
$webRoot = Join-Path $monitorRoot 'dist-monitor'
$logsRoot = Join-Path $InstallRoot 'logs'

Ensure-Directory -Path $InstallRoot
Ensure-Directory -Path $caddyRoot
Ensure-Directory -Path $certRoot
Ensure-Directory -Path $monitorRoot
Ensure-Directory -Path $logsRoot

if ($MonitorBuildSource) {
    if (-not (Test-Path -LiteralPath $MonitorBuildSource)) {
        throw "Monitor build source not found at '$MonitorBuildSource'."
    }

    Write-Step "Copying monitor build from '$MonitorBuildSource' to '$webRoot'"
    if (Test-Path -LiteralPath $webRoot) {
        Remove-Item -LiteralPath $webRoot -Recurse -Force
    }
    New-Item -ItemType Directory -Path $webRoot -Force | Out-Null
    Copy-Item -Path (Join-Path $MonitorBuildSource '*') -Destination $webRoot -Recurse -Force
}
else {
    Write-Step "No monitor build source supplied. Existing '$webRoot' contents were left unchanged."
}

$template = Get-Content -LiteralPath $templatePath -Raw
$config = $template.
    Replace('__SITE_HOST__', $SiteHost).
    Replace('__TLS_CERT_PATH__', (Convert-ToCaddyPath -Path $OriginCertPath)).
    Replace('__TLS_KEY_PATH__', (Convert-ToCaddyPath -Path $OriginKeyPath)).
    Replace('__BACKEND_ORIGIN__', $BackendOrigin).
    Replace('__WEB_ROOT__', (Convert-ToCaddyPath -Path $webRoot))

Set-Content -LiteralPath $caddyConfigPath -Value $config -Encoding UTF8
Write-Step "Wrote Caddy config to '$caddyConfigPath'"

if (-not $SkipFirewallRule) {
    Set-FirewallRule -Name 'GlobalTech Public Monitor HTTPS' -Port 443
}

if ($InstallCaddyService) {
    Install-OrUpdateCaddyService -Name $ServiceName -ExePath $CaddyExePath -ConfigPath $caddyConfigPath
}

if ($StartCaddyService) {
    Assert-FileExists -Path $OriginCertPath -Label 'Origin certificate'
    Assert-FileExists -Path $OriginKeyPath -Label 'Origin private key'
    Restart-ServiceSafe -Name $ServiceName
}

Write-Step 'Windows monitor host preparation complete.'
Write-Host ''
Write-Host 'Next checks:' -ForegroundColor Yellow
Write-Host "1. Place the Cloudflare Origin CA certificate at '$OriginCertPath'"
Write-Host "2. Place the matching private key at '$OriginKeyPath'"
Write-Host "3. Make sure the GlobalTech backend service is listening on '$BackendOrigin'"
Write-Host "4. If needed, re-run this script with -InstallCaddyService -StartCaddyService"
