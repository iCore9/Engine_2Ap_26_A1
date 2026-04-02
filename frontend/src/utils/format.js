// Indian number formatting utilities

export const formatINR = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '₹0';
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(2)} L`;
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(1)} K`;
  return `${sign}₹${abs.toLocaleString('en-IN')}`;
};

export const formatINRFull = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatINRCompact = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '₹0';
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(1)}Cr`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(0)}K`;
  return `${sign}₹${abs}`;
};

export const calculateFinance = (settings, programType) => {
  const {
    total_seats = 60, conversion_rate = 100,
    year1_fee = 240550, year2_fee = 229550, year3_fee = 229550, year4_fee = 229550,
    scholarship_pct = 0, university_share = 60, robokoshal_share = 40,
    partner_share = 0, growth_rate = 10, opex_items = [],
  } = settings;

  const duration = programType === 'btech' ? 4 : 2;
  const effectiveStudents = Math.round(total_seats * (conversion_rate / 100));
  const scholarshipFactor = 1 - scholarship_pct / 100;
  const fees = [year1_fee, year2_fee, year3_fee, year4_fee].slice(0, duration);
  const annualOpexTotal = opex_items.reduce((s, i) => s + (Number(i.amount) || 0), 0);

  const yearlyData = [];
  for (let y = 1; y <= duration; y++) {
    let yearGross = 0;
    // Compounding batches: each year has more batches running
    for (let batch = 1; batch <= y; batch++) {
      const yearOfStudy = y - batch + 1;
      if (yearOfStudy >= 1 && yearOfStudy <= duration) {
        const fee = fees[yearOfStudy - 1] * scholarshipFactor;
        const batchGrowth = Math.pow(1 + growth_rate / 100, batch - 1);
        yearGross += effectiveStudents * batchGrowth * fee;
      }
    }
    const univRev = yearGross * (university_share / 100);
    const roboRev = yearGross * (robokoshal_share / 100);
    const partnerRev = yearGross * ((partner_share || 0) / 100);
    const ebitda = roboRev - annualOpexTotal;
    yearlyData.push({
      year: `Year ${y}`, grossRevenue: yearGross,
      universityRevenue: univRev, robokoshalRevenue: roboRev,
      partnerRevenue: partnerRev, annualOpex: annualOpexTotal, ebitda,
    });
  }

  const totals = yearlyData.reduce((a, y) => ({
    totalGross: a.totalGross + y.grossRevenue,
    totalRobo: a.totalRobo + y.robokoshalRevenue,
    totalUniv: a.totalUniv + y.universityRevenue,
    totalPartner: a.totalPartner + y.partnerRevenue,
    totalEbitda: a.totalEbitda + y.ebitda,
  }), { totalGross: 0, totalRobo: 0, totalUniv: 0, totalPartner: 0, totalEbitda: 0 });

  const revenuePerStudentRobo = effectiveStudents > 0
    ? fees[0] * scholarshipFactor * (robokoshal_share / 100) : 0;
  const breakEvenStudents = revenuePerStudentRobo > 0
    ? Math.ceil(annualOpexTotal / revenuePerStudentRobo) : 0;

  return { effectiveStudents, yearlyData, ...totals, breakEvenStudents, annualOpexTotal };
};
