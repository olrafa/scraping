const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const url = 'https://iffr.com/en/programme/2020/per-day?date[value]=01/25/2020&hour=9'
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.screenshot({path: 'example.png'});

  const films = await page.evaluate(
      () => Array.from(document.querySelectorAll('li.block-type-film'))
        .filter(film => film.getAttribute('data-showtype') === 'film')
        .filter(film => film.getAttribute('data-category') === 'feature' || 
          film.getAttribute('data-category') === 'short-film' ||
          film.getAttribute('data-category') === 'mid-length')
        .map(film => {
          const filmDetails = film.innerText.split('\n')
          return { 
          category: film.getAttribute('data-category'), 
          title: filmDetails[0], 
          director: filmDetails[1], 
          timeAndPlace: filmDetails[2] 
        }
      }
      )
  );

  const innerText = await page.evaluate(
      () => document.querySelector('p').innerText);

  console.log(films);
  console.log(innerText);

  await browser.close();
})();