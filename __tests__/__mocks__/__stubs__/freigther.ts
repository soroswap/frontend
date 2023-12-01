const freighterConnectResponse = {
    "appName": "Soroswap",
    "chains": [
        {
            "id": "sandbox",
            "network": "sandbox",
            "name": "Sandbox",
            "networkPassphrase": "Local Sandbox Stellar Network ; September 2022",
            "networkUrl": "http://localhost:8000",
            "sorobanRpcUrl": "http://localhost:8000/soroban/rpc"
        },
        {
            "id": "standalone",
            "network": "standalone",
            "name": "Standalone",
            "networkPassphrase": "Standalone Network ; February 2017",
            "networkUrl": "http://localhost:8000",
            "sorobanRpcUrl": "http://localhost:8000/soroban/rpc"
        },
        {
            "id": "futurenet",
            "network": "futurenet",
            "name": "Futurenet",
            "networkPassphrase": "Test SDF Future Network ; October 2022",
            "networkUrl": "https://horizon-futurenet.stellar.org",
            "sorobanRpcUrl": "https://rpc-futurenet.stellar.org/"
        },
        {
            "id": "testnet",
            "network": "testnet",
            "name": "Testnet",
            "networkPassphrase": "Test SDF Network ; September 2015",
            "networkUrl": "https://horizon-testnet.stellar.org",
            "sorobanRpcUrl": "https://rpc-testnet.stellar.org/"
        }
    ],
    "connectors": [
        {
            "id": "freighter",
            "name": "Freighter",
            "iconBackground": "#fff",
            "installed": true,
            "downloadUrls": {
                "browserExtension": "https://chrome.google.com/webstore/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk?hl=en"
            }
        }
    ],
    "server": {
        "serverURL": {
            "_string": "",
            "_parts": {
                "protocol": "https",
                "username": null,
                "password": null,
                "hostname": "rpc-testnet.stellar.org",
                "urn": null,
                "port": null,
                "path": "/",
                "query": null,
                "fragment": null,
                "preventInvalidHostname": false,
                "duplicateQueryParameters": false,
                "escapeQuerySpace": true
            },
            "_deferred_build": true
        }
    },
    "autoconnect": false,
    "activeConnector": {
        "id": "freighter",
        "name": "Freighter",
        "iconBackground": "#fff",
        "installed": true,
        "downloadUrls": {
            "browserExtension": "https://chrome.google.com/webstore/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk?hl=en"
        }
    },
    "activeChain": {
        "id": "testnet",
        "network": "testnet",
        "name": "Testnet",
        "networkPassphrase": "Test SDF Network ; September 2015",
        "networkUrl": "https://horizon-testnet.stellar.org",
        "sorobanRpcUrl": "https://rpc-testnet.stellar.org/"
    }
}