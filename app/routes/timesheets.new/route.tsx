import { useState, useEffect } from "react";
import {
  useLoaderData,
  Form,
  redirect,
  Link,
  useActionData,
} from "react-router";
import { getDB } from "~/db/getDB";

export async function loader() {
  const db = await getDB();
  const employees = await db.all("SELECT id, full_name FROM employees");
  return { employees };
}

import type { ActionFunction } from "react-router";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const employee_id = formData.get("employee_id");
  const start_time = formData.get("start_time");
  const end_time = formData.get("end_time");
  const summary = formData.get("summary");
  const project = formData.get("project");

  if (new Date(start_time as string) >= new Date(end_time as string)) {
    return { error: "Start time must be before end time" };
  }

  if (!employee_id || !start_time || !end_time || !summary || !project) {
    return { error: "All fields are required" };
  }

  const db = await getDB();
  await db.run(
    "INSERT INTO timesheets (employee_id, start_time, end_time, summary, project) VALUES (?, ?, ?, ?, ?)",
    [employee_id, start_time, end_time, summary, project]
  );

  return redirect("/timesheets");
};

export default function NewTimesheetPage() {
  const { employees } = useLoaderData();
  const actionData = useActionData();
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  useEffect(() => {
    if (actionData?.error) {
      setError(actionData.error);
    } else {
      setError(null);
    }
  }, [actionData]);

  const formatDateTimeLocal = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);

    const startDate = new Date(newStartTime);
    if (isNaN(startDate.getTime())) return;

    const minEndDate = new Date(startDate);
    minEndDate.setHours(startDate.getHours() + 1);
    document
      .getElementById("end_time")
      ?.setAttribute("min", formatDateTimeLocal(minEndDate));

    if (endTime) {
      const endDate = new Date(endTime);
      if (startDate >= endDate) {
        setError("Start time must be before end time");
      } else {
        setError(null);
      }
    }
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    if (!newEndTime) return;

    const endDate = new Date(newEndTime);
    const startDate = new Date(startTime);

    if (isNaN(endDate.getTime()) || endDate <= startDate) {
      setError("End time must be after start time");
      return;
    }

    setEndTime(newEndTime);
    setError(null);
  };

  return (
    <div>
      <div className="nav-container">
        <Link to="/timesheets" className="links">
          Timesheets
        </Link>
        <Link to="/employees/" className="links">
          Employees
        </Link>
      </div>
      <div className="page-container">
        <h1>Create New Timesheet</h1>
        <Form method="post">
          <div>
            <label htmlFor="employee_id">Select Employee</label>
            <select
              name="employee_id"
              id="employee_id"
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                fontSize: "1rem",
                marginTop: "5px",
                marginBottom: "15px",
              }}
            >
              <option value="">Select Employee</option>
              {employees.map((employee: any) => (
                <option key={employee.id} value={employee.id}>
                  {employee.full_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="start_time">Start Time</label>
            <input
              type="datetime-local"
              name="start_time"
              id="start_time"
              value={startTime}
              onChange={handleStartTimeChange}
              required
              max={endTime}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                fontSize: "1rem",
                marginTop: "5px",
                marginBottom: "15px",
              }}
            />
          </div>
          <div>
            <label htmlFor="end_time">End Time</label>
            <input
              type="datetime-local"
              name="end_time"
              id="end_time"
              value={endTime}
              onChange={handleEndTimeChange}
              required
              min={startTime}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                fontSize: "1rem",
                marginTop: "5px",
                marginBottom: "15px",
              }}
            />
          </div>
          <div>
            <label htmlFor="summary">Summary</label>
            <textarea
              name="summary"
              id="summary"
              placeholder="Describe the work done"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                fontSize: "1rem",
                marginTop: "5px",
                marginBottom: "15px",
                height: "100px",
                resize: "vertical",
              }}
            ></textarea>
          </div>
          <div>
            <label htmlFor="project">Project</label>
            <input
              type="text"
              name="project"
              id="project"
              placeholder="Project name"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                fontSize: "1rem",
                marginTop: "5px",
                marginBottom: "15px",
              }}
            />
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
              style={{
                width: "180px",
                height: "55px",
                marginBottom: "40px",
              }}
            >
              Create Timesheet
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
