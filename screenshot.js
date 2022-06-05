const msg = "Hello ";
console.log(msg);

const puppeteer = require('zyte-smartproxy-puppeteer');
(async () => {
    const browser = await puppeteer.launch({
        spm_apikey: '6f27185b65554aafbc7a1dca8c2f8f21',
        ignoreHTTPSErrors: true,
        headless: false,
    });
    console.log('Before new page');
    const page = await browser.newPage();
    console.log('Opening page ...');
    try {
        await page.goto('https://www.walgreens.com/store/c/white-claw-hard-seltzer-variety/ID=300396057-product', {timeout: 250000});
    } catch(err) {
        console.log(err);
    }
    console.log('Taking a screenshot ...');
    await page.screenshot({path: 'screenshot1.png'});
    await browser.close();
})();