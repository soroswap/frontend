import { getTransferServerUrl } from "../SEP-1";

export async function checkInfo(homeDomain : string) {
    let transferServerSep24 = await getTransferServerUrl(homeDomain)

    let res = await fetch(`${transferServerSep24}/info`)
    let json = await res.json()

    if (!res.ok) {
        console.error(res.status, {
            message: json.error,
        })
    } else {
        return json
    }
}

export async function initInteractiveDepositFlow({
    authToken,
    homeDomain, 
    urlFields = {} 
}:{
    authToken: string,
    homeDomain: string, 
    urlFields?: object
}) {
    let transferServerSep24 = await getTransferServerUrl(homeDomain)
    console.log(JSON.stringify(urlFields))
    let res = await fetch(`${transferServerSep24}/transactions/deposit/interactive`, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(urlFields),
    })
    let json = await res.json()

    if (!res.ok) {
        console.error(res.status, {
            message: json.error,
        })
    } else {
        return json
    }
}

export async function queryTransfers24({ 
    authToken, 
    assetCode, 
    homeDomain 
} : {
    authToken: string,
    assetCode: string,
    homeDomain: string
}) {
    let transferServerSep24 = await getTransferServerUrl(homeDomain)

    let res = await fetch(
        `${transferServerSep24}/transactions?${new URLSearchParams({
            asset_code: assetCode,
        })}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        }
    )
    let json = await res.json()

    if (!res.ok) {
        console.error(res.status, {
            message: json.error,
        })
    } else {
        return json
    }
}