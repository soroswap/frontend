export {}
const walletUrl = 'chrome-extension://bcacfldlkkdogcmkkibnjlakofdplcbk/index.html#/unlock-account'
const walletPassword = 'Password'
const appUrl = 'http://localhost:3000/swap'
describe('Soroswap flow', () => {
    it('Should open the browser correctly and navigate to the app', async () => {
        await browser.url(appUrl)
        await expect(browser).toHaveUrl(appUrl)
        await browser.switchWindow('Freighter')
        await browser.closeWindow()
        await browser.switchWindow('Soroswap')
    })
    it('Should connect to the freighter wallet properly', async () => {
        await $("//*[@id='__next']/main/main/div[3]/div[2]/button/div").click() //Click on connect wallet button
        await $('/html/body/div[3]/div[3]/div/div[1]/div[3]').click()          //Click on the Freighter wallet button
        await browser.pause(1500)
        await browser.switchWindow('Freighter')
        await $('#password-input').setValue(walletPassword)
        await $('button=Log In').click()
        await $('button=Share').click()
        await browser.switchWindow('Soroswap')
    })
    it('Should mint the tokens', async () => {
        await $('aria/Balance').click()
        await $('aria/Mint test tokens').click()
        await $('div=Minted').waitForExist({ timeout: 120000 })
    })
    it('Should add liquidity for the wallet', async () => {
        await $('aria/Liquidity').click()
        await $('button=+ Add Liquidity').click()
        await $("//*[@id=\"add-liquidity-input-tokena\"]/div/div/button/span[1]/div/span").click() //Select the first "Select a token" input
        await $('aria/Dogstar').click()
        await browser.pause(1500)
        await $("//div[@class='css-10uqy76']//span[@class='token-symbol-container css-wz6nvd'][normalize-space()='Select a token']").click() //Select the second "Select a token" input
        await $('aria/EURoCoin').click()
        await $("//div[@class='css-ri2dy']//input[@placeholder='0']").setValue("5000")  //Set the first number input value to 5000
        await $("//*[@id=\"add-liquidity-input-tokenb\"]/div/div[1]/input").setValue("5000") //Set the second number input
        await $('button=Supply').click()
        await $('button=Add liquidity').click()
        await browser.pause(1500)
        await browser.switchWindow('Freighter')
        await $('button=Approve').click()
        await browser.switchWindow('Soroswap')
        await browser.pause(3000)
        await $('button=Close').click()
    })
    it('Should swap the liquid tokens', async () => {
        await $('aria/Swap').click()
        await $("//button[@class='MuiButtonBase-root open-currency-select-button css-1c88s3t-MuiButtonBase-root']").click() //Select the first token input
        await $('aria/Dogstar').click()
        await $("//button[@class='MuiButtonBase-root open-currency-select-button css-8xqvhl-MuiButtonBase-root']").click() //Select the second token input
        await $('aria/EURoCoin').click()
        await $("//div[@id='swap-input']//input[@placeholder='0']").setValue(500)   //Set the first input value to 500
        await $('button=Swap').click()
        await $('aria/Confirm swap').click()
        await browser.pause(1500)
        await browser.switchWindow('Freighter')
        await $('button=Approve').click()
        await browser.pause(1500)
        await browser.switchWindow('Soroswap')
        await $('div=Swapped').waitForExist({ timeout: 5000 })
    })
})