
export function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = d.getDay()                
  const diff = day === 0 ? -6 : 1 - day  
  d.setDate(d.getDate() + diff)
  return d
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)               
  d.setDate(d.getDate() + days)
  return d
}


export function formatWeekRange(weekStart: Date): string {
  const end = addDays(weekStart, 6)
  const sameMonth = weekStart.getMonth() === end.getMonth()
  const startText = weekStart.toLocaleDateString('en-GB',
    sameMonth ? { day: 'numeric' } : { day: 'numeric', month: 'long' })
  const endText = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  return `${startText} - ${endText}`
}

export function weekDays(weekStart: Date): Date[] {
    return Array.from({length: 7 }, (_,i) => 
            addDays(weekStart, i)
    )
}

export function toIsoDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
        
    }

