import DrawHistogram from "./DrawHistogram"

export default function MultiDayHourlyGraph({data}){
    var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    function dailyGraph(day){
        var dayData = data.filter((d) => d.created_day === day)
        return (
            <div>
                <h4>{daysOfWeek[day]}</h4>
                <DrawHistogram 
                data={dayData || []} 
                XAxisData={"created_hour"}
                XAxisLabel={"Hour"}
                YAxisData={"average_per_hour_day"}
                YAxisLabel={"Requests"}
                />
            </div>
        )
    }

    return (
        <div>
            {Array.from({length: 7}).map((_, i) => (
                dailyGraph(i)
            ))}
        </div>
    )
}