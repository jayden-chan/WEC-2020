type StockTransaction = {
  tesla: number;
  costco: number;
  loblaws: number;
  macys: number;
};

type MarketStocks = {
  tesla: MarketDay[];
  costco: MarketDay[];
  loblaws: MarketDay[];
  macys: MarketDay[];
};

const LAST_SEVEN_DAYS = 23;
const LAST_FIVE_DAYS = 25;

type MarketDay = {
  close: number;
  open: number;
  high: number;
  low: number;
};

type ShouldBuyStock = {
  tesla: boolean;
  costco: boolean;
  loblaws: boolean;
  macys: boolean;
};

function shouldSell(lastMonth: MarketDay[]): boolean {
  if (
    fiveDayrule(lastMonth.slice(LAST_FIVE_DAYS)) ||
    sevenDayRule(lastMonth.slice(LAST_SEVEN_DAYS))
  ) {
    return true;
  }
  return false;
}

function fiveDayrule(days: MarketDay[]): boolean {
  if ((days[2].open > days[0].open * 1, 2)) {
    if (days[4].open < days[2].open * 1.05) {
      return true;
    }
  }
  return false;
}

function sevenDayRule(days: MarketDay[]): boolean {
  if (days[1].open <= 0.85 * days[0].open) {
    if (days[6].open <= days[0].open * 0.925) {
      return true;
    }
  }
  return false;
}

function shouldBuy(lastMonth: MarketDay[]): boolean {
  const average = lastMonth.reduce(
    (acc: number, cur: MarketDay) => (acc += cur.close / lastMonth.length),
    0
  );
  return average > lastMonth[0].open * 1.15;
}

export function processStocks(
  companyStocks: MarketStocks,
  ownedStocks: ShouldBuyStock,
  budget: number
): StockTransaction {
  let shouldBuyStock: ShouldBuyStock;
  let finalPurchase: StockTransaction;
  Object.entries(companyStocks).forEach(([company, monthStocks]) => {
    if (shouldSell(monthStocks)) {
      shouldBuyStock[company] = false;
    } else if (shouldBuy(monthStocks)) {
      shouldBuyStock[company] = true;
    }
  });
  const numOfStockToBuy: number = Object.values(shouldBuyStock).filter(
    (v: boolean) => v
  ).length;
  Object.entries(shouldBuyStock).forEach(([company, shouldBuy]) => {
    if (shouldBuy) {
      finalPurchase[company] = Math.floor(budget / numOfStockToBuy);
    }
  });

  return finalPurchase;
}
