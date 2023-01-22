// These were randomly generated from https://laboratory.stellar.org/#account-creator
const TokenAdmin = 'GDT2NORMZF6S2T4PT4OBJJ43OPD3GPRNTJG3WVVFB356TUHWZQMU6C3U'
const TokenAdminSecretKey = 'SAKCFFFNCE7XAWYMYVRZQYKUK6KMUCDIINLWISJYTMYJLNR2QLCDLFVT'

// Contract IDs, set up by ./initialize.sh
const LiquidityPoolId = process.env.LIQUIDITY_POOL_ID ?? ''
const TokenId_1 = process.env.TOKEN_ID_1 ?? ''
const TokenId_2 = process.env.TOKEN_ID_2 ?? ''

const Constants = {
    LiquidityPoolId,
    TokenAdmin,
    TokenAdminSecretKey,
    TokenId_1,
    TokenId_2,
}

export { Constants }
