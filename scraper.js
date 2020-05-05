
const puppeteer = require('puppeteer');
const settings = require('./settings');
const axios = require('axios');

(async () => {
  const getFilms = async (month, day) => {
    const url = 'https://iffr.com/en/programme/2020/per-day?' +
    `date[value]=${month}/${day}/2020&hour=9`;

    const page = await browser.newPage();
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

    await page.close();

    return films;
  };

  const browser = await puppeteer.launch();

  const festivalDays =
    ['01/23', '01/24'];
  //, '01/25', '01/26', '01/27', '01/28', '01/29', '01/30', '01/31', '02/01'];

  const dailyUrls = festivalDays.map(fd => fd.split('/'));

  const iffr = [];

  iffr[0] = await getFilms(dailyUrls[0][0], dailyUrls[0][1]);
  iffr[1] = await getFilms(dailyUrls[1][0], dailyUrls[1][1]);
  // iffr[2] = await getFilms(dailyUrls[2][0], dailyUrls[2][1]);
  // iffr[3] = await getFilms(dailyUrls[3][0], dailyUrls[3][1]);
  // iffr[4] = await getFilms(dailyUrls[4][0], dailyUrls[4][1]);
  // iffr[5] = await getFilms(dailyUrls[5][0], dailyUrls[5][1]);
  // iffr[6] = await getFilms(dailyUrls[6][0], dailyUrls[6][1]);
  // iffr[7] = await getFilms(dailyUrls[7][0], dailyUrls[7][1]);
  // iffr[8] = await getFilms(dailyUrls[8][0], dailyUrls[8][1]);
  // iffr[9] = await getFilms(dailyUrls[9][0], dailyUrls[9][1]);

  const iffrData = iffr.flat();

  const samplePost = iffrData.slice(0, 4);

  const { baseUrl } = settings;

  axios.post(`${baseUrl}/scrape`, samplePost)
    .then(function (response) {
      console.log(response.data.message);
    })
    .catch(function (error) {
      console.log(error);
    });

  console.log(iffrData[13]);

  await browser.close();
})();
