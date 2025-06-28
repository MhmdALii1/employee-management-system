import { Link, useLoaderData } from "react-router";
import { useState } from "react";
import { getDB } from "~/db/getDB";
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import { format } from "date-fns";

export async function loader() {
  const db = await getDB();
  const timesheetsAndEmployees = await db.all(
    `SELECT timesheets.*, employees.full_name, employees.id AS employee_id, 
            strftime('%s', end_time) - strftime('%s', start_time) AS total_hours
     FROM timesheets 
     JOIN employees ON timesheets.employee_id = employees.id`
  );

  return { timesheetsAndEmployees };
}

interface Timesheet {
  id: number;
  full_name: string;
  employee_id: number;
  start_time: string;
  end_time: string;
  summary: string;
  project: string;
  total_hours: number;
}

export default function TimesheetsPage() {
  const { timesheetsAndEmployees } = useLoaderData();
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [filteredTimesheets, setFilteredTimesheets] = useState<Timesheet[]>(
    timesheetsAndEmployees
  );
  const [activeView, setActiveView] = useState("table");

  const eventsService = useState(() => createEventsServicePlugin())[0];

  const calendar = useCalendarApp({
    views: [
      createViewDay(),
      createViewWeek(),
      createViewMonthGrid(),
      createViewMonthAgenda(),
    ],
    events: timesheetsAndEmployees.map((timesheet: any) => ({
      id: timesheet.id.toString(),
      title: timesheet.project,
      start: format(new Date(timesheet.start_time), "yyyy-MM-dd HH:mm"),
      end: format(new Date(timesheet.end_time), "yyyy-MM-dd HH:mm"),
    })),
    plugins: [eventsService],
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    setSearch(searchTerm);

    filterTimesheets(searchTerm, selectedEmployee);
  };

  const handleEmployeeFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const employeeId = event.target.value;
    setSelectedEmployee(employeeId);

    filterTimesheets(search, employeeId);
  };

  const filterTimesheets = (searchTerm: string, employeeId: string) => {
    const searchTermLower = searchTerm.toLowerCase();

    const filtered = timesheetsAndEmployees.filter((timesheet: Timesheet) => {
      const matchesFullNameOrProject =
        timesheet.full_name.toLowerCase().includes(searchTermLower) ||
        timesheet.project.toLowerCase().includes(searchTermLower);

      const matchesStartTime = timesheet.start_time
        .toLowerCase()
        .includes(searchTermLower);
      const matchesEndTime = timesheet.end_time
        .toLowerCase()
        .includes(searchTermLower);

      return (
        (matchesFullNameOrProject || matchesStartTime || matchesEndTime) &&
        (employeeId ? timesheet.employee_id === Number(employeeId) : true)
      );
    });

    setFilteredTimesheets(filtered);
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
  };

  return (
    <div>
      <div className="nav-container">
        <Link to="/timesheets/new" className="links">
          New Timesheet
        </Link>
        <Link to="/employees/" className="links">
          Employees
        </Link>
      </div>

      <div className="page-container">
        {activeView === "table" && (
          <div className="filters">
            <div className="search-bar-timesheet">
              <input
                type="text"
                placeholder="Search by employee name or project"
                value={search}
                onChange={handleSearchChange}
              />
            </div>
            <label htmlFor="employee-filter">Filter by Name</label>
            <select
              id="employee-filter"
              value={selectedEmployee}
              onChange={handleEmployeeFilterChange}
              className="employee-filter-select"
            >
              <option value="">All Employees</option>
              {timesheetsAndEmployees
                .map((timesheet: Timesheet) => timesheet.full_name)
                .filter(
                  (value: any, index: number, self: any) =>
                    self.indexOf(value) === index
                )
                .map((employeeName: string, index: number) => (
                  <option
                    key={index}
                    value={
                      timesheetsAndEmployees.find(
                        (t: any) => t.full_name === employeeName
                      )?.employee_id
                    }
                  >
                    {employeeName}
                  </option>
                ))}
            </select>
          </div>
        )}

        <div className="view-toggle-buttons">
          <button
            onClick={() => handleViewChange("table")}
            className={activeView === "table" ? "active" : ""}
          >
            Table View
          </button>
          <button
            onClick={() => handleViewChange("calendar")}
            className={activeView === "calendar" ? "active" : ""}
          >
            Calendar View
          </button>
        </div>

        {activeView === "table" ? (
          <div className="timesheet-table-container">
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Summary</th>
                  <th>Project</th>
                  <th>Total Hours</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTimesheets.map((timesheet: Timesheet) => (
                  <tr key={timesheet.id}>
                    <td>{timesheet.full_name}</td>
                    <td>{timesheet.start_time}</td>
                    <td>{timesheet.end_time}</td>
                    <td>{timesheet.summary || "N/A"}</td>
                    <td>{timesheet.project || "N/A"}</td>
                    <td>{(timesheet.total_hours / 3600).toFixed(2)} hrs</td>
                    <td>
                      <Link to={`/timesheets/${timesheet.id}`}>View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="calendar-view-container">
            <ScheduleXCalendar calendarApp={calendar} />
          </div>
        )}
      </div>
    </div>
  );
}
