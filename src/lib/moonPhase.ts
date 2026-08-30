export interface MoonPhase {
  illumination: number // 0 to 1
  phaseName: string
}

export function getMoonPhase(date: Date = new Date()): MoonPhase {
  const synodicMonth = 29.53058867
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14, 0)
  const diffDays = (date.getTime() - knownNewMoon) / 86400000
  let phase = (diffDays % synodicMonth) / synodicMonth
  if (phase < 0) phase += 1

  const illumination = (1 - Math.cos(2 * Math.PI * phase)) / 2

  let phaseName: string
  if (phase < 0.03 || phase > 0.97) phaseName = 'New Moon'
  else if (phase < 0.22) phaseName = 'Waxing Crescent'
  else if (phase < 0.28) phaseName = 'First Quarter'
  else if (phase < 0.47) phaseName = 'Waxing Gibbous'
  else if (phase < 0.53) phaseName = 'Full Moon'
  else if (phase < 0.72) phaseName = 'Waning Gibbous'
  else if (phase < 0.78) phaseName = 'Last Quarter'
  else phaseName = 'Waning Crescent'

  return { illumination, phaseName }
}
