const puppeteer = require('puppeteer');

const getFilms = async (month, day) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const url = 'https://iffr.com/en/programme/2020/per-day?' +
    `date[value]=${month}/${day}/2020&hour=9`;
  await page.goto(url);

  const films = await page.evaluate((m, d) => {
    return Array.from(document.querySelectorAll('li.block-type-film'))
      .filter(film => film.getAttribute('data-showtype') === 'film')
      .filter(film => {
        const filmTypes = ['feature', 'short-film', 'mid-length'];
        return filmTypes.includes(film.getAttribute('data-category'));
      })
      .map(film => {
        const locationInfo = film.querySelector('.location-text').innerText.split(' at ');
        const time = locationInfo[0].split(' - ');
        const date = `2020-${m}-${d}`;
        return {
          category: film.getAttribute('data-category'),
          title: film.querySelector('h2').innerText,
          director: film.querySelector('strong').innerText,
          day: date,
          startTime: time[0],
          endTime: time[1],
          location: locationInfo[1]
        };
      });
  }, month, day);

  console.log(films[20]);

  await browser.close();
};

getFilms('01', '23');
