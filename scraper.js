const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const url = 'https://iffr.com/en/programme/2020/per-day?date[value]=01/25/2020&hour=9';
  await page.goto(url);

  const films = await page.evaluate(
    () => Array.from(document.querySelectorAll('li.block-type-film'))
      .filter(film => film.getAttribute('data-showtype') === 'film')
      .filter(film => {
        const filmTypes = ['feature', 'short-film', 'mid-length'];
        return filmTypes.includes(film.getAttribute('data-category'));
      })
      .map(film => {
        const locationInfo = film.querySelector('.location-text').innerText.split(' at ');
        const time = locationInfo[0].split(' - ');
        return {
          category: film.getAttribute('data-category'),
          title: film.querySelector('h2').innerText,
          director: film.querySelector('strong').innerText,
          day: '2020-01-25',
          startTime: time[0],
          endTime: time[1],
          location: locationInfo[1]
        };
      }
      )
  );

  console.log(films);

  await browser.close();
})();
