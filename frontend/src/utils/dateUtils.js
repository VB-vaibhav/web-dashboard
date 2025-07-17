// src/utils/dateUtils.js
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';

dayjs.extend(isoWeek);
dayjs.extend(quarterOfYear);

export function getDateRangeForFilter(filter) {
  const today = dayjs();
  let start = null;
  let end = null;

  switch (filter) {
    case 'today':
      start = end = today;
      break;
    case 'yesterday':
      start = end = today.subtract(1, 'day');
      break;
    case 'this_week':
      start = today.startOf('week');
      end = today.endOf('week');
      break;
    case 'previous_week':
      start = today.subtract(1, 'week').startOf('week');
      end = today.subtract(1, 'week').endOf('week');
      break;
    case 'this_month':
      start = today.startOf('month');
      end = today.endOf('month');
      break;
    case 'previous_month':
      start = today.subtract(1, 'month').startOf('month');
      end = today.subtract(1, 'month').endOf('month');
      break;
    case 'this_quarter':
      start = today.startOf('quarter');
      end = today.endOf('quarter');
      break;
    case 'previous_quarter':
      start = today.subtract(1, 'quarter').startOf('quarter');
      end = today.subtract(1, 'quarter').endOf('quarter');
      break;
    case 'this_year':
      start = today.startOf('year');
      end = today.endOf('year');
      break;
    case 'previous_year':
      start = today.subtract(1, 'year').startOf('year');
      end = today.subtract(1, 'year').endOf('year');
      break;
    case 'last30':
      start = today.subtract(30, 'day');
      end = today;
      break;
    default:
      return { start: null, end: null };
  }

  return {
    start: start.format('YYYY-MM-DD'),
    end: end.format('YYYY-MM-DD'),
  };
}
