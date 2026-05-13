import { useState } from "react"
import "./StatisticsPage.css"
export default function StatisticsPage(){
    const [singleDate, setSingleDate] = useState(false);
    const [startDate, setStartDate] =  useState("");
    const [endDate, setEndDate] = useState("");
    const [averageNumber, setAverageNumber] = useState(null);

    async function handleSubmit(e){
        e.preventDefault();

        if (singleDate){
            if (!startDate){
                return alert("Please provide a date.")
            }
            setStartDate("");
        } else {
            if (!startDate || !endDate){
                return alert("Please provide both a start date and an end date.")
            }
            setStartDate("");
            setEndDate("");
        }

    }

    return (
        <div className="statisticspage-container">
            <h2>Statistics</h2>
            <form onSubmit={handleSubmit} className="form">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={singleDate}
                        onChange={(e) => setSingleDate(e.target.checked)}
                    />
                    Single Day Data
                </label>

                <label className="form-label">{singleDate? "Date" : "Start Date"}</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-input"
                />

                <br /> <br />

                {!singleDate && 
                <>
                    <label className="form-label">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="form-input"
                    />
                    
                    <br /> <br />
                </>
                }

                <button type="submit" className="submit-btn">Submit</button>

            </form>
            
        </div>
    )
}