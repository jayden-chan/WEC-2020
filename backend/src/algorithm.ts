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

const LAST_TWENTY_ONE_DAYS = 9;
const LAST_TWENTY_EIGHT_DAYS = 2;

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
    fourWeekRule(lastMonth.slice(LAST_TWENTY_EIGHT_DAYS)) ||
    threeWeekRule(lastMonth.slice(LAST_TWENTY_ONE_DAYS))
  ) {
    return true;
  }
  return false;
}

function fourWeekRule(days: MarketDay[]): boolean {//fourWeekRule
  if (days[20].open > days[0].open * 1.2) {
    if (days[27].open < days[20].open * 1.05) {
      return true;
    }
  }
  return false;
}

function threeWeekRule(days: MarketDay[]): boolean {//threeWeekRule
  if (days[13].close <= 0.93 * days[0].close) {
    if (days[20].close <= days[0].close * 0.97) {
      return true;
    }
  }
  return false;
}

function shouldBuy(lastMonth: MarketDay[]): boolean {
  return lastMonth[29].open > lastMonth[0].open * 1.15;
}

export function processStocks(
  companyStocks: MarketStocks,
  ownedStocks: StockTransaction,
  budget: number
): StockTransaction {
  let shouldBuyStock: ShouldBuyStock = {
    costco: undefined,
    macys: undefined,
    loblaws: undefined,
    tesla: undefined
  };
  let finalPurchase: StockTransaction = {
    costco: 0,
    macys: 0,
    loblaws: 0,
    tesla: 0
  };
  // Set which stocks to sell and buy
  Object.entries(companyStocks).forEach(([company, monthStocks]) => {
    const sell = shouldSell(monthStocks);
    const buy = shouldBuy(monthStocks);
    if (buy && !sell) {
      shouldBuyStock[company] = true;
    } else if (sell && !buy) {
      console.log("selling");
      shouldBuyStock[company] = false;
    }
  });

  // Sell stocks and add sales to budget
  Object.entries(shouldBuyStock).forEach(([company, shouldBuy]) => {
    if (shouldBuy === false) {
      finalPurchase[company] = -ownedStocks[company];
      budget += ownedStocks[company] * companyStocks[company][29].open;
    }
  });
  // Set the number of companies to buy stock from
  const numOfCompaniesToBuy: number = Object.values(shouldBuyStock).filter(
    (v: boolean) => v
  ).length;

  const perStockBudget = Math.floor(budget / numOfCompaniesToBuy);
  // Record the amount of each stock to buy
  Object.entries(shouldBuyStock).forEach(([company, shouldBuy]) => {
    let moneySpent = 0;
    const costOfStockToday = companyStocks[company][29].open;
    while (moneySpent + costOfStockToday < perStockBudget) {
      if (shouldBuy) {
        finalPurchase[company] += 1;
        moneySpent += costOfStockToday;
      } else if (shouldBuy === undefined) {
        finalPurchase[company] = 0;
        return;
      } else {
        return;
      }
    }
  });

  return finalPurchase;
}
