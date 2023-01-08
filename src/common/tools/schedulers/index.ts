export const strToMilisecond = (timeFormat: string): number => {
  // time format must DD:HH:MM:SS
  const splitTimeFormat = timeFormat.split(':');

  const d = Number(splitTimeFormat[0]);
  const h = Number(splitTimeFormat[1]);
  const m = Number(splitTimeFormat[2]);
  const s = Number(splitTimeFormat[3]);

  const dayToMilisecond = d * 24 * 60 * 60 * 1000;
  const hourToMilisecond = h * 60 * 60 * 1000;
  const minuteToMilisecond = m * 60 * 1000;
  const secondToMilisecond = s * 1000;

  const result =
    dayToMilisecond +
    hourToMilisecond +
    minuteToMilisecond +
    secondToMilisecond;

  return result;
};
