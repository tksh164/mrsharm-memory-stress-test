# Quick deployment script for development environment
param(
    [string]$ResourceGroupName = "rg-memory-stress-tester-dev",
    [string]$SubscriptionId
)

if (-not $SubscriptionId) {
    Write-Host "Please provide your Azure subscription ID:" -ForegroundColor Yellow
    $SubscriptionId = Read-Host "Subscription ID"
}

Write-Host "🚀 Quick Deploy to Development Environment" -ForegroundColor Green

# Run the main deployment script
.\deploy.ps1 -Environment dev -ResourceGroupName $ResourceGroupName -SubscriptionId $SubscriptionId -Location "East US"
