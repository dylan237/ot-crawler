const puppeteer = require('puppeteer');
const Table = require('cli-table3');
const NP = require('number-precision');
const cliProgress = require('cli-progress');
const helper = require('./helper.js');
const apolloUrl = 'https://auth.mayohr.com/HRM/Account/Login?original_target=https%3A%2F%2Fhrm.mayohr.com%2Fta%2Fpersonal%2FFormApplyRecord%2Fovertimestatistics&lang=zh-tw';
const overtimeStatisticsUrl = 'https://hrm.mayohr.com/ta/personal/FormApplyRecord/overtimestatistics';

(async () => {
  try {

    helper.hello()

    const {
      USERNAME,
      PASSWORD,
      SALARY,
      QUERYMONTH
    } = await helper.askUserInfo() // 使用者互動介面

    const browser = await puppeteer.launch({
      executablePath: helper.judgeOS(),
      headless: false,
      devtools: true,
      ignoreHTTPSErrors: true,
    });

    // create new progress bar
    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

    bar.start(100, 0);

    const page = await browser.newPage();
    await page.goto(apolloUrl);
    await page.waitForSelector('.main-container')
    await page.waitForSelector('input[name="userName"]')

    await (await page.$('input[name="userName"]')).press('Enter')
    await page.type('input[name="userName"]', USERNAME, {
      delay: 0
    })
    await page.keyboard.press('Tab');
    await page.type('input[name="password"]', PASSWORD, {
      delay: 0
    })
    await page.waitForSelector('button[type="submit"]', {
      visible: true,
    })
    await (await page.$('button[type="submit"]')).press('Enter')
    bar.update(40);
    await page.waitFor(5000)

    bar.update(50);

    // 進入加班查詢頁
    await page.goto(overtimeStatisticsUrl);
    // await page.waitFor(3000)

    // 選擇月份
    const currMonth = new Date().getMonth() + 1
    if (parseInt(QUERYMONTH, 10) !== currMonth) {
      await page.waitForSelector('[data-reactid=".0.0.1.2.0.1.1.2:$/=10.0.0.1.0.0.0.3.0.1.4"')
      // await page.waitFor(2000)
      await page.click('[data-reactid=".0.0.1.2.0.1.1.2:$/=10.0.0.1.0.0.0.3.0.1.4"')
      // await page.waitFor(2000)
      await page.waitForSelector('.Select-option')
      await page.click(`[data-reactid=".0.0.1.2.0.1.1.2:$/=10.0.0.1.0.0.0.3.0.2.0.$option-${QUERYMONTH - 1}-${QUERYMONTH}"`)
      await page.waitFor(1000)
      await page.waitForSelector('[data-reactid=".0.0.1.2.0.1.1.2:$/=10.0.0.1.0.0.0.a.0"]')
      await page.click('[data-reactid=".0.0.1.2.0.1.1.2:$/=10.0.0.1.0.0.0.a.0"]')
      await page.waitFor(2000)
    }
    bar.update(70);

    // 查無資料處理
    let isNoData = await page.evaluate(el => {
      const noDataSign = document.querySelector(el)
      return noDataSign
    }, 'td[colspan="9"]')
    if (isNoData) {
      helper.alert(`當月份無資料`, 'bgRed')
      browser.close()
    }

    // 爬取資料
    await page.waitForSelector('.ta-scrollbar_wrapper')
    await page.waitForSelector('tbody[data-reactid]')
    await page.waitFor(2000)

    let data = await page.evaluate(({
      el,
      SALARY
    }) => {
      class TableData {
        constructor(salary) {
          this.monthlyOtInfo = document.querySelector(el).childNodes // 當月的所有加班日 (多個tr的NodeList)
          this.perHourSalary = (salary / 30 / 8).toFixed(2) // 計算時薪
          this.otData = [] // 爬蟲抓取的每日加班資料
          // 批次撈取資料
          Array.prototype.forEach.call(this.monthlyOtInfo, (tr, idx) => {
            const dailyInfo = tr.childNodes
            this.otData.push({}) // 有幾天就新增幾個物件
            Array.prototype.forEach.call(dailyInfo, td => {
              // 日期
              if (td.getAttribute('data-reactid') == `.0.0.1.2.0.1.1.2:$/=10.0.0.1.0.1.1.$view.0.0.0:${idx}.0`) {
                this.otData[idx].data = td.textContent
              }
              // 加班時數
              if (td.getAttribute('data-reactid') == `.0.0.1.2.0.1.1.2:$/=10.0.0.1.0.1.1.$view.0.0.0:${idx}.6`) {
                this.otData[idx].overHours = Number(td.textContent)
              }
              // 實際支付時數
              if (td.getAttribute('data-reactid') == `.0.0.1.2.0.1.1.2:$/=10.0.0.1.0.1.1.$view.0.0.0:${idx}.7`) {
                this.otData[idx].actualPayHours = Number(td.textContent)
              }
            })
          })
        }
      }
      return new TableData(SALARY)
    }, {
      el: 'tbody[data-reactid]',
      SALARY
    });

    let {
      otData,
      perHourSalary
    } = data

    // 計算各加班日的加班費
    otData = otData.map(dailyInfo => {
      dailyInfo.otSalary = NP.times(dailyInfo.actualPayHours, perHourSalary)
      return dailyInfo
    })

    // 終端機輸出每日加班資料表格
    const table = new Table({
      head: ['日期', '加班時數', '實際支付時數', '當日加班費'],
      colWidths: [20, 10, 15, 20]
    });
    otData.forEach(day => {
      day = Object.values(day)
      table.push(day);
    })
    console.log(table.toString());

    // 計算加班費總金額
    const monthlyTotal = otData.reduce((prev, item) => NP.plus(prev, item.otSalary), 0)
    helper.alert(`當月加班薪資: ${monthlyTotal} 元`)

    // bar.increment();
    bar.update(100);
    bar.stop();

    // await page.screenshot({
    //   path: 'screenshot/example.png'
    // });
    // await browser.close();

  } catch (e) {
    helper.alert(`發生錯誤 >_<`, 'bgRed')
    await browser.close();
  }
})();