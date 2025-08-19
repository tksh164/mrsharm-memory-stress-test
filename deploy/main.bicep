param appName string = 'memory-stress-tester'

var uniqueSuffix = substring(uniqueString(resourceGroup().id), 0, 6)
var planName = '${appName}-${uniqueSuffix}'
var webAppName = '${appName}-${uniqueSuffix}'

resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: planName
  location: resourceGroup().location
  sku: {
    name: 'B1'
  }
}

resource webApp 'Microsoft.Web/sites@2023-01-01' = {
  name: webAppName
  location: resourceGroup().location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      netFrameworkVersion: 'v8.0'
    }
  }
}

output webAppName string = webApp.name
output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
