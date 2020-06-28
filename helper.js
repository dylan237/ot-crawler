const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");
const shell = require("shelljs");
const fs = require('fs');


// 判斷作業系統, 回傳對應的 chrome 路徑
function judgeOS() {
  const osvar = process.platform;
  if (osvar == 'darwin') {
    console.log('You are on a Mac OS');
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  } else if (osvar == 'win32' || osvar == 'win64') {
    console.log('You are on a Windows OS')
    return 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
  } else {
    throw new Error('Unknown OS')
  }
}

const hello = () => {
  console.log(
    chalk.green(
      figlet.textSync("OT crawler", {
        // font: "Ghost",
        horizontalLayout: "default",
        verticalLayout: "default"
      })
    )
  );
}

const askUserInfo = () => {
  const questions = [{
      name: "USERNAME",
      type: "input",
      message: "請輸入帳號 Enter your Apollo user name",
      default: 'dylan.liu@silkrode.com.tw',
      validate: (answers) => {
        try {
          if (!answers) {
            throw new Error
          }
          return true
        } catch (e) {
          return '請輸入帳號 Required option'
        }
      },
    },
    {
      name: "PASSWORD",
      type: "password",
      message: "請輸入密碼 Enter your Apollo password",
      validate: (answers) => {
        try {
          if (!answers) {
            throw new Error
          }
          return true
        } catch (e) {
          return '請輸入密碼 Required option'
        }
      },
    },
    {
      name: "SALARY",
      type: "password",
      message: "請輸入每月薪資 (Enter your monthly salary.)",
      validate: (answers) => {
        try {
          if (!answers) {
            throw new Error
          }
          return true
        } catch (e) {
          return '請輸入薪資 Required option'
        }
      },
    },
    {
      name: "QUERYMONTH",
      type: "input",
      message: "欲查詢的月份 Enter the month you'd like to query.",
      default: () => new Date().getMonth() + 1,
      validate: (answers) => {
        try {
          const ans = parseInt(answers, 10)
          if (typeof ans !== 'number' || !/\d/.test(ans)) {
            throw new Error()
          }
          if (ans < 1 || ans > 12) {
            throw new Error()
          }
          return true
        } catch (e) {
          return '請輸入 1-12 數字 Enter the number between 1 to 12'
        }
      },
    }
  ];
  return inquirer.prompt(questions);
};

// cli提示
const alert = (text, color = 'bgGreen') => {
  text = ` --- ${text} --- `
  console.log(chalk.white[color].bold(text));
};

module.exports = {
  judgeOS,
  hello,
  askUserInfo,
  alert
}