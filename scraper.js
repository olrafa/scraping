const axios = require('axios');
const puppeteer = require('puppeteer');

const constants = require('./constants');
const settings = require('./settings');
const utils = require('./utils');

const festivalDates = utils.rangeDays(constants.START_DATE, constants.END_DATE).map(date => {
  const dayMonth = date.getDate();
  const month = date.getMonth() + 1;
  return {
    day: dayMonth < 10 ? `0${dayMonth}` : dayMonth.toString(),
    month: month < 10 ? `0${month}` : month.toString()
  };
});

(async () => {
  const getFilms = async (month, day, year = constants.FESTIVAL_YEAR) => {
    // filtered by films with type[]=1 and short-films with type[]=2
    const url = `https://iffr.com/en/programme/${year}/per-day?` +
    `date[value]=${month}/${day}/${year}&hour=9&type[]=1&type[]=2`;
    const page = await browser.newPage();
    await page.goto(url);
    const films = await page.evaluate((m, d, y) => {
      const filmTypes = ['feature', 'short-film', 'mid-length'];
      const date = `${y}-${m}-${d}`;
      return Array.from(document.querySelectorAll('li.block-type-film'))
        .filter(film => {
          return filmTypes.includes(film.getAttribute('data-category'));
        })
        .map(film => {
          // .'location-text' looks like this: '09:00 - 10:41 at Cinerama 3'
          const [startEndTime, location] = film.querySelector('.location-text').innerText.split(' at ');
          const [time] = startEndTime.split(' - ');
          const category = film.getAttribute('data-category');
          const title = film.querySelector('h2').innerText;
          const director = film.querySelector('strong').innerText;

          return {
            category,
            title,
            director,
            day: date,
            time,
            location
          };
        });
    }, month, day, year);

    await page.close();

    return films;
  };

  const browser = await puppeteer.launch();

  const iffr = [];

  /*
    // TODO: write a Promise.all() to do this:
    const getAllData = async () => {
      return Promise.all(festivalDates.map(date => getFilms(date.month, date.day)));
    }

  */

  iffr[0] = await getFilms(festivalDates[0].month, festivalDates[0].day);
  // iffr[1] = await getFilms(festivalDates[1].month, festivalDates[1].day);

  const iffrData = iffr.flat();

  const { baseUrl } = settings;

  axios.post(`${baseUrl}/scrape`, iffrData)
    .then(function (response) {
      console.log(response.data.message);
    })
    .catch(function (error) {
      console.log(error);
    });

  await browser.close();
})();
