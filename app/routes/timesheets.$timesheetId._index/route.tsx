import { useState } from "react";
import {
  useLoaderData,
  useParams,
  Link,
  Form,
  redirect,
  useNavigate,
} from "react-router";
import { getDB } from "~/db/getDB";

export async function loader({ params }: any) {
  const { timesheetId } = params;
  const db = await getDB();
  const timesheet = await db.get(
    `SELECT timesheets.*, employees.full_name, employees.id AS employee_id, 
            strftime('%s', end_time) - strftime('%s', start_time) AS total_hours, 
            timesheets.summary, timesheets.project
     FROM timesheets 
     JOIN employees ON timesheets.employee_id = employees.id
     WHERE timesheets.id = ?`,
    [timesheetId]
  );

  if (!timesheet) {
    throw new Error("Timesheet not found");
  }

  return { timesheet };
}

export async function action({
  request,
  params,
}: {
  request: Request;
  params: { timesheetId: string };
}) {
  const formData = new URLSearchParams(await request.text());
  const start_time = formData.get("start_time");
  const end_time = formData.get("end_time");
  const summary = formData.get("summary");
  const project = formData.get("project");

  if (!start_time || !end_time) {
    return new Response("Start time and end time are required.", {
      status: 400,
    });
  }

  if (new Date(start_time) >= new Date(end_time)) {
    return new Response("Start time must be before end time.", {
      status: 400,
    });
  }

  const db = await getDB();
  await db.run(
    `UPDATE timesheets SET start_time = ?, end_time = ?, summary = ?, project = ? WHERE id = ?`,
    [start_time, end_time, summary, project, params.timesheetId]
  );

  return redirect("/timesheets");
}

export default function TimesheetPage() {
  const { timesheet } = useLoaderData();
  const { timesheetId } = useParams();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState(timesheet.start_time);
  const [endTime, setEndTime] = useState(timesheet.end_time);

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    const endTimeDate = new Date(endTime);
    const startTimeDate = new Date(newStartTime);

    setStartTime(newStartTime);

    if (startTimeDate >= endTimeDate) {
      setError("Start time must be before end time.");
    } else {
      setError(null);
    }
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    const startTimeDate = new Date(startTime);
    const endTimeDate = new Date(newEndTime);

    setEndTime(newEndTime);

    if (endTimeDate <= startTimeDate) {
      setError("End time must be after start time.");
    } else {
      setError(null);
    }
  };

  if (!timesheet) {
    return <div>Timesheet not found</div>;
  }

  return (
    <div>
      <div className="nav-container">
        <Link to="/timesheets" className="links">
          Timesheets
        </Link>
        <Link to="/timesheets/new" className="links">
          New Timesheet
        </Link>
        <Link to="/employees/" className="links">
          Employees
        </Link>
      </div>

      <div className="page-container">
        <h1>Edit Timesheet</h1>
        <div className="form-card-container">
          <div className="details-container">
            <Form method="post">
              <div>
                <label>
                  Employee:
                  <input
                    type="text"
                    name="employee_id"
                    value={timesheet.full_name}
                    readOnly
                  />
                </label>
              </div>
              <div>
                <label>
                  Start Time:
                  <input
                    type="datetime-local"
                    name="start_time"
                    value={startTime}
                    onChange={handleStartTimeChange}
                    max={endTime}
                  />
                </label>
              </div>
              <div>
                <label>
                  End Time:
                  <input
                    type="datetime-local"
                    name="end_time"
                    value={endTime}
                    onChange={handleEndTimeChange}
                    min={startTime}
                  />
                </label>
              </div>
              <div>
                <label htmlFor="summary">Summary:</label>
                <textarea
                  name="summary"
                  id="summary"
                  defaultValue={timesheet.summary || ""}
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "8px",
                    fontSize: "14px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    resize: "vertical",
                  }}
                />
              </div>
              <div>
                <label>
                  Project:
                  <input
                    type="text"
                    name="project"
                    defaultValue={timesheet.project || ""}
                    style={{
                      width: "100%",
                      padding: "8px",
                      fontSize: "14px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                    }}
                  />
                </label>
              </div>

              {error && <p style={{ color: "red" }}>{error}</p>}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <button
                  type="submit"
                  disabled={!!error}
                  style={{
                    width: "180px",
                    height: "55px",
                    marginBottom: "40px",
                  }}
                >
                  Update Timesheet
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
