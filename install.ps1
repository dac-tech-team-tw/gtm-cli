<#
.SYNOPSIS
    GTM CLI installer for Windows.
.DESCRIPTION
    Downloads the latest gtm-windows-x64.exe release, installs it as gtm.exe
    into a per-user directory, and adds that directory to the user PATH.
.EXAMPLE
    irm https://raw.githubusercontent.com/dac-tech-team-tw/gtm-cli/main/install.ps1 | iex
#>

$ErrorActionPreference = "Stop"

$Repo = "dac-tech-team-tw/gtm-cli"
$BinaryName = "gtm-windows-x64.exe"
$InstallDir = Join-Path $env:LOCALAPPDATA "Programs\gtm"
$InstallPath = Join-Path $InstallDir "gtm.exe"

function Write-Info  { param($m) Write-Host "> $m" -ForegroundColor Blue }
function Write-Ok    { param($m) Write-Host "OK $m" -ForegroundColor Green }
function Write-Warn  { param($m) Write-Host "!  $m" -ForegroundColor Yellow }
function Write-Err   { param($m) Write-Host "x  $m" -ForegroundColor Red; exit 1 }

function Show-Banner {
    Write-Host @"

  ██████╗ ████████╗███╗   ███╗     ██████╗██╗     ██╗
 ██╔════╝ ╚══██╔══╝████╗ ████║    ██╔════╝██║     ██║
 ██║  ███╗   ██║   ██╔████╔██║    ██║     ██║     ██║
 ██║   ██║   ██║   ██║╚██╔╝██║    ██║     ██║     ██║
 ╚██████╔╝   ██║   ██║ ╚═╝ ██║    ╚██████╗███████╗██║
  ╚═════╝    ╚═╝   ╚═╝     ╚═╝     ╚═════╝╚══════╝╚═╝

"@ -ForegroundColor Blue
}

function Get-LatestVersion {
    try {
        $release = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/latest" -Headers @{ "User-Agent" = "gtm-cli-installer" }
        return $release.tag_name
    } catch {
        return $null
    }
}

function Main {
    Show-Banner
    Write-Info "Installing GTM CLI..."

    # Only x64 Windows binaries are published.
    if (-not [Environment]::Is64BitOperatingSystem) {
        Write-Err "Only 64-bit (x64) Windows is supported."
    }

    $Version = Get-LatestVersion
    if (-not $Version) {
        Write-Err "Could not determine the latest version. Check https://github.com/$Repo/releases"
    }
    Write-Info "Latest version: $Version"

    $DownloadUrl = "https://github.com/$Repo/releases/download/$Version/$BinaryName"

    if (-not (Test-Path $InstallDir)) {
        New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    }

    $TmpPath = "$InstallPath.tmp"
    Write-Info "Downloading $BinaryName..."
    try {
        Invoke-WebRequest -Uri $DownloadUrl -OutFile $TmpPath -UseBasicParsing
    } catch {
        if (Test-Path $TmpPath) { Remove-Item $TmpPath -Force }
        Write-Err "Download failed. The release asset for Windows might not be available yet."
    }

    Move-Item -Path $TmpPath -Destination $InstallPath -Force
    Write-Ok "Installed to: $InstallPath"

    # Add install dir to the user PATH if it is not already there.
    $UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
    $paths = @()
    if ($UserPath) { $paths = $UserPath.Split(";") }
    if ($paths -notcontains $InstallDir) {
        $NewPath = if ($UserPath) { "$UserPath;$InstallDir" } else { $InstallDir }
        [Environment]::SetEnvironmentVariable("Path", $NewPath, "User")
        # Make gtm available in the current session too.
        $env:Path = "$env:Path;$InstallDir"
        Write-Ok "Added $InstallDir to your user PATH."
        Write-Warn "Open a new terminal for the PATH change to take effect everywhere."
    }

    Write-Host ""
    Write-Ok "GTM CLI installed successfully!"
    Write-Host ""
    Write-Host "Get started:"
    Write-Host "  gtm auth login     # Authenticate with Google"
    Write-Host "  gtm accounts list  # List your GTM accounts"
    Write-Host "  gtm --help         # See all commands"
    Write-Host ""
}

Main
