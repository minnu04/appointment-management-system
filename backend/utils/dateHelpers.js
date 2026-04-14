const parseDateTime = (date, time) => {
  return new Date(`${date}T${time}:00`);
};

const isWithinNextDays = (dateTime, days) => {
  const now = new Date();
  const max = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return dateTime >= now && dateTime <= max;
};

const isWithinHours = (dateTime, hours) => {
  const now = new Date();
  const max = new Date(now.getTime() + hours * 60 * 60 * 1000);
  return dateTime >= now && dateTime <= max;
};

module.exports = { parseDateTime, isWithinNextDays, isWithinHours };