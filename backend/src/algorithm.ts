type stockTransaction = {
  tesla: number;
  costco: number;
  loblaws: number;
  macys: number;
};

type allStocks = {
  tesla: marketDay[];
  costco: marketDay[];
  loblaws: marketDay[];
  macys: marketDay[];
};

const LAST_SEVEN_DAYS = 23;
const LAST_FIVE_DAYS = 25;

type marketDay = {
  close: number;
  open: number;
  high: number;
  low: number;
};

function shouldSell(lastMonth: marketDay[]): boolean {
  if (
    fiveDayrule(lastMonth.slice(LAST_FIVE_DAYS)) ||
    sevenDayRule(lastMonth.slice(LAST_SEVEN_DAYS))
  ) {
    return true;
  }
  return false;
}

function fiveDayrule(days: marketDay[]): boolean {
  if ((days[2].open > days[0].open * 1, 2)) {
    if (days[4].open < days[2].open * 1.05) {
      return true;
    }
  }
  return false;
}

function sevenDayRule(days: marketDay[]): boolean {
  if (days[1].open <= 0.85 * days[0].open) {
    if (days[6].open <= days[0].open * 0.925) {
      return true;
    }
  }
  return false;
}

function shouldBuy(lastMonth: marketDay[]): boolean {
  const average = lastMonth.reduce(
    (acc: number, cur: marketDay) => (acc += cur.close / lastMonth.length),
    0
  );
  return average > lastMonth[0].open * 1.15;
}

export function processStocks(companyStocks: allStocks): stockTransaction[] {
  Object.entries(companyStocks).forEach(([k, v]) => {});
  return;
}
