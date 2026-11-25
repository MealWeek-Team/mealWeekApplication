import { startOfWeek, formatWeekRange, weekDays, toIsoDate } from '../utils/week'
import { Fragment, useState } from 'react'

const SLOTS = ['breakfast', 'lunch', 'dinner'] as const
const SLOT_LABELS = {breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner'}

export default function PlanerPage() {
     const [weekStart] = useState(() => startOfWeek(new Date()))
     const days = weekDays(weekStart)

     return(
      <>
          <div className="page-header">
               <div>
                    <h1>Week plan</h1>
                    <p className="muted">{formatWeekRange(weekStart)}</p>
               </div>
          </div>

          <div className="card planner-grid">
               <div/>

               {days.map((day) => (
                    <div
                         key ={toIsoDate(day)}
                         className = "planner-day"
                    >
                         {day.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })}
                    
                     </div>
               ))}
         
            {SLOTS.map((slot) => (
          <Fragment key={slot}>
            <div className="planner-slot-label">{SLOT_LABELS[slot]}</div>
            {days.map((day) => (
              <button
                key={toIsoDate(day)}
                type="button"
                className="planner-cell"
                aria-label={`Add ${slot} on ${day.toDateString()}`}
              >
                + Add
              </button>
            ))}
          </Fragment>
        ))}
      </div>


      </>
     )
}