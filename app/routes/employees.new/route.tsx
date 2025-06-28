import { useState } from "react";
import { Form, Link, redirect, type ActionFunction } from "react-router";
import { getDB } from "~/db/getDB";

const MIN_SALARY = 3000;
const MIN_AGE = 18;

const calculateAge = (dateOfBirth: string) => {
  const birthDate = new Date(dateOfBirth);
  const ageDifMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const full_name = formData.get("full_name");
  const email = formData.get("email");
  const phone_number = formData.get("phone_number");
  const date_of_birth = formData.get("date_of_birth");

  const formatted_date_of_birth =
    date_of_birth && typeof date_of_birth === "string"
      ? new Date(date_of_birth)
      : null;

  const age = formatted_date_of_birth
    ? calculateAge(date_of_birth as string)
    : null;

  if (age && age < MIN_AGE) {
    return new Response("Employee must be at least 18 years old", {
      status: 400,
    });
  }

  const department = formData.get("department");
  const job_title = formData.get("job_title");
  const salary = formData.get("salary");
  const start_datee = formData.get("start_datee");
  const end_datee = formData.get("end_datee") || null;
  const photo = formData.get("photo") || null;
  const documents_path = formData.get("documents_path") || null;

  if (salary && Number(salary) < MIN_SALARY) {
    return new Response(`Salary must be above ${MIN_SALARY}`, { status: 400 });
  }

  if (!documents_path) {
    return new Response("ID document is required", { status: 400 });
  }

  const db = await getDB();

  await db.run(
    `INSERT INTO employees (full_name, email, phone_number, date_of_birth, department, job_title, salary, start_datee, end_datee, photo, documents_path) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      full_name,
      email,
      phone_number,
      formatted_date_of_birth,
      department,
      job_title,
      salary,
      start_datee,
      end_datee,
      photo,
      documents_path,
    ]
  );

  return redirect("/employees");
};

export default function EmployeePage() {
  const [error, setError] = useState<string | null>(null);
  const [salaryError, setSalaryError] = useState<string | null>(null);

  const handleDateOfBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateOfBirth = e.target.value;
    const age = calculateAge(dateOfBirth);
    if (age < MIN_AGE) {
      setError("Employee must be at least 18 years old.");
    } else {
      setError(null);
    }
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const salary = Number(e.target.value);
    if (salary < MIN_SALARY) {
      setSalaryError(`Salary must be above ${MIN_SALARY}`);
    } else {
      setSalaryError(null);
    }
  };

  return (
    <div>
      <div className="nav-container">
        <Link to="/employees" className="links">
          Employees
        </Link>
        <Link to="/timesheets" className="links">
          Timesheets
        </Link>
      </div>

      <div className="page-container">
        <h1>Create New Employee</h1>
        <div className="form-card-container">
          <div className="details-container">
            <Form method="post">
              <div>
                <label htmlFor="full_name">Full Name</label>
                <input type="text" name="full_name" id="full_name" required />
              </div>
              <div>
                <label htmlFor="email">Email</label>
                <input type="email" name="email" id="email" required />
              </div>
              <div>
                <label htmlFor="phone_number">Phone Number</label>
                <input
                  type="tel"
                  name="phone_number"
                  id="phone_number"
                  required
                />
              </div>
              <div>
                <label htmlFor="date_of_birth">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  id="date_of_birth"
                  required
                  onChange={handleDateOfBirthChange}
                />
                {error && <p style={{ color: "red" }}>{error}</p>}
              </div>
              <div>
                <label htmlFor="department">Department</label>
                <input type="text" name="department" id="department" required />
              </div>
              <div>
                <label htmlFor="job_title">Job Title</label>
                <input type="text" name="job_title" id="job_title" required />
              </div>
              <div>
                <label htmlFor="salary">Salary</label>
                <input
                  type="number"
                  name="salary"
                  id="salary"
                  required
                  onChange={handleSalaryChange}
                />
                {salaryError && <p style={{ color: "red" }}>{salaryError}</p>}
              </div>
              <div>
                <label htmlFor="start_datee">Start Date</label>
                <input
                  type="date"
                  name="start_datee"
                  id="start_datee"
                  required
                />
              </div>
              <div>
                <label htmlFor="end_datee">End Date (Optional)</label>
                <input type="date" name="end_datee" id="end_datee" />
              </div>
              <div>
                <label htmlFor="photo">Upload Photo</label>
                <input type="file" name="photo" id="photo" />
              </div>
              <div>
                <label>
                  Documents Path
                  <input type="text" name="documents_path" />
                </label>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <button
                  type="submit"
                  disabled={!!error || !!salaryError}
                  style={{
                    width: "180px",
                    height: "55px",
                    marginBottom: "40px",
                  }}
                >
                  Create Employee
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
