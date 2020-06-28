A Node.js CLI tool based on Puppeteer for crawling overtime pay information from HR system ([Apollo XE](https://auth.mayohr.com/HRM/Account/Login?original_target=https%3A%2F%2Fhrm.mayohr.com%2Fta%2Fpersonal%2FFormApplyRecord%2Fovertimestatistics&lang=zh-tw))

<img src="https://github.com/dylan237/images_source/blob/master/1593360220897.jpg?raw=true" width="60%" height="auto"/>

> `Node.js` and `npm` are required

## Usage

1. Clone from the Github repository

   ```bash
   git clone https://github.com/dylan237/ot-crawler.git
   ```

2. Install dependencies

   ```bash
   npm install
   ```

   or

   ```bash
   yarn
   ```

3. Only one command

   ```bash
   npm run query
   ```

   or

   ```bash
   yarn query
   ```

4. Enter some necessary parameters in command line interface
   1. Your Apollo user name
   2. Your Apollo password
   3. Your monthly salary
   4. The month you want to query to
