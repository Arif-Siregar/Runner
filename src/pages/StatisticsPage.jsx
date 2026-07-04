import { useEffect, useState } from "react";
import {supabase} from "../supabaseClient";
import DrawHistogram from "../components/DrawHistogram";
import "./StatisticsPage.css";
import MultiDayHourlyGraph from "../components/MultiDayHourlyGraph";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import { useNavigate } from "react-router-dom";

export default function StatisticsPage(){
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const [singleDate, setSingleDate] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [showSingleDayResult, setShowSingleDayResult] = useState(false);
  const [showMultiDayResult, setShowMultiDayResult] = useState(false);
  const [postsNumber, setPostsNumber] = useState(null);
  const [meanMedian, setMeanMedian] = useState(null);
  const [durationHistogram, setDurationHistogram] = useState(null);
  const [postsPerHourPerDayName, setPostsPerHourPerDayName] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkUser(){
      const {data} = await supabase.auth.getUser();

      if(!data.user){
        navigate("/statisticsLogin")
      }
    }
    checkUser();
  }, [])
  
  function handleReset(){
    setShowSingleDayResult(false);
    setShowMultiDayResult(false);
    setPostsNumber(null);
    setMeanMedian(null);
    setDurationHistogram(null);
  }

  useEffect(() => {
    handleReset();
  }, [singleDate, startDate, endDate]);

  function singleDayResultSection(){
    return(postsNumber ?
      (<div>
        <h3>{startDate}</h3>
        <p> Number of requests: {postsNumber} </p>
        <br/>
        <h4>Time Taken Analysis</h4>
        <p> Average time taken: {Number(meanMedian.mean).toFixed(2)} </p>
        <p> Median time taken: {Number(meanMedian.median).toFixed(2)} </p>
        <DrawHistogram 
          data={durationHistogram || []} 
          XAxisData={"duration_range"}
          XAxisLabel={"Delivery Time (Minutes)"}
          YAxisData={"total_tasks"}
          YAxisLabel={"Requests"}
        />
      </div>) : 
      (<div>
        <p>No records found.</p>
      </div>)
    )
  }

  function multiDayResultSection(){
    if (!postsNumber){
      return (<div>
        <p>No records found.</p>
      </div>)
    }

    var daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    var heatMapData = []
    for (let i = 0; i < 7; i++){
      var tempAppendData = {}
      tempAppendData["id"] = daysOfWeek[i]
      tempAppendData["data"] = []
      var tempDayData = postsPerHourPerDayName.filter((d) => d.created_day === (i+1)%7)
      tempDayData.map((d) => tempAppendData["data"].push({"x":d.created_hour, "y":d.average_per_hour_day}))
      heatMapData.push(tempAppendData)
    }
    return(
      <div>
        <h4>Daily Request Graph</h4>
        <DrawHistogram 
          data={postsNumber || []} 
          XAxisData={"dates"}
          XAxisLabel={"Dates"}
          YAxisData={"total_requests"}
          YAxisLabel={"Requests"}
        />
        <br />
        <h4>Hourly Request for Each Day</h4>
        {/* <MultiDayHourlyGraph data={postsPerHourPerDayName || []}/> */}
        <div style={{ backgroundColor: "white", height: 500 }}>
          <ResponsiveHeatMap 
            data={heatMapData}
            margin={{ top: 60, right: 90, bottom: 60, left: 90 }}
            valueFormat=".0f"
            axisTop={{
              tickRotation: -45
            }}
            axisLeft={{
              tickSize: 5
            }} 
            colors={{
              type: "sequential",
              scheme: "reds"
            }}
          />
        </div>
      </div>
    )
  }

  async function handleSubmit(e){
    e.preventDefault();
    setLoading(true);

    if (singleDate){
      if (!startDate){
        return alert("Please provide a date.")
        setLoading(false);
      }
      const {data: postsPerDayData, error: postsPerDayError} = await supabase
        .rpc("get_posts_per_day", {
          start_date: startDate,
          end_date: startDate
        });
      setPostsNumber((postsPerDayData.length > 0) ? postsPerDayData[0].total_requests: null);

      if (postsPerDayData.length > 0){
        const {data: meanMedianData, error: meanMedianError} = await supabase
          .rpc("get_mean_median", {
            certain_date: startDate
          });
        setMeanMedian(meanMedianData[0]);

        const {data: durationHistogramData, error: durationHistogramError} = await supabase
          .rpc("get_duration_histogram", {
            certain_date: startDate
          });
        setDurationHistogram(durationHistogramData);
      }
      setShowSingleDayResult(true);
 
    } else {
      if (!startDate || !endDate){
        setLoading(false);
        return alert("Please provide both a start date and an end date.")
      }

      const {data: postsPerDayData, error: postsPerDayError} = await supabase
        .rpc("get_posts_per_day", {
          start_date: startDate,
          end_date: endDate
        });
      setPostsNumber((postsPerDayData.length > 0) ? postsPerDayData: null);

      if (postsPerDayData.length > 0){
        const {data: postsPerHourPerDayNameData, error: postsPerHourPerDayNameError} = await supabase
          .rpc("get_posts_per_hour_per_day_name", {
            start_date: startDate,
            end_date: endDate
          });
        setPostsPerHourPerDayName(postsPerHourPerDayNameData);
      }
      setShowMultiDayResult(true);

    }
    setLoading(false);

  }

  async function handleLogOut() {
    await supabase.auth.signOut();
    navigate("/statisticsLogin");
  }

  return (
    <div className="statisticspage-container">
      <button 
        className="logout-btn"
        onClick={handleLogOut}>
          Log Out
      </button>
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

        <button 
          type="submit" 
          className="submit-btn" 
          disabled={loading}>
            {loading ? "Loading..." : "Submit"}
        </button>

      </form>
      {showSingleDayResult && singleDayResultSection()}
      {showMultiDayResult && multiDayResultSection()}
    </div>
  )
}