// returns all dates between start and end dates
const rangeDays = (start, end) => {
  const days = [];
  for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
    days.push(new Date(dt));
  }
  return days;
};

module.exports = {
  rangeDays
};
