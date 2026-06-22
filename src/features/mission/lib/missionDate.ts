// 날짜 유틸 정의

export function getKstDateKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function getKstDayRange(date = new Date()) {
  const dateKey = getKstDateKey(date);
  const start = new Date(`${dateKey}T00:00:00+09:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return {
    dateKey,
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}
