
export const getFirstDayOfTheWeek = (today: Date) => {
    let firstDay = new Date()
    firstDay.setDate(today.getDate() - today.getDay())
    console.log("first Day: " + firstDay)
    return firstDay
}