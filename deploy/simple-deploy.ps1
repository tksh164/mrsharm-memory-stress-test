# Simple deployment script
param(
    [string]$ResourceGroup = "rg-memory-tester",
    [string]$SubscriptionId
)

if (-not $SubscriptionId) {
    $SubscriptionId = Read-Host "Enter your Azure Subscription ID"
}

Write-Host "🚀 Deploying Memory Stress Tester to Azure..." -ForegroundColor Green

# Set subscription
az account set --subscription $SubscriptionId

# Create resource group
az group create --name $ResourceGroup --location "East US"

# Deploy infrastructure
$result = az deployment group create --resource-group $ResourceGroup --template-file "deploy/main.bicep" --query "properties.outputs" -o json | ConvertFrom-Json

# Build and deploy app
dotnet publish -c Release -o publish
Compress-Archive -Path publish/* -DestinationPath app.zip -Force

az webapp deployment source config-zip --resource-group $ResourceGroup --name $result.webAppName.value --src app.zip

# Cleanup
Remove-Item app.zip, publish -Recurse -Force

Write-Host "✅ Done! App URL: $($result.webAppUrl.value)" -ForegroundColor Green
