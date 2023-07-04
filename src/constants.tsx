// These were randomly generated from https://laboratory.stellar.org/#account-creator
const TokenAdmin = 'GBCGW5F2KQ46Z3IXM4ZJJFJ7GMLIOZIV6TZ3AWUMEWANEAOH7JVBZAL7'
const TokenAdminSecretKey = 'SBBZV5JKBN2POAOEN26WQCSUUFYYWN375C7P5A53GYWE7YIK2PA74WU3'

// Contract IDs, set up by ./initialize.sh
const LiquidityPoolId = '' //process.env.LIQUIDITY_POOL_ID ?? ''
const TokenId_1 = ''//process.env.TOKEN_ID_1 ?? ''
const TokenId_2 = '' //process.env.TOKEN_ID_2 ?? ''

const Constants = {
    LiquidityPoolId,
    TokenAdmin,
    TokenAdminSecretKey,
    TokenId_1,
    TokenId_2,
}

export { Constants }
