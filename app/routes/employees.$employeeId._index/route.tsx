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

const MIN_SALARY = 3000;
const MIN_AGE = 18;

const calculateAge = (dateOfBirth: string | null): number | null => {
  if (!dateOfBirth) return null;

  const birthDate = new Date(dateOfBirth);
  const ageDifMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export async function loader({ params }: { params: { employeeId: string } }) {
  const db = await getDB();
  const employee = await db.get(
    "SELECT * FROM employees WHERE id = ?;",
    params.employeeId
  );
  return { employee };
}

export async function action({
  request,
  params,
}: {
  request: Request;
  params: { employeeId: string };
}) {
  const formData = new URLSearchParams(await request.text());
  const full_name = formData.get("full_name");
  const email = formData.get("email");
  const phone_number = formData.get("phone_number");
  const department = formData.get("department");
  const job_title = formData.get("job_title");
  const salary = formData.get("salary");
  const start_datee = formData.get("start_datee");
  const end_datee = formData.get("end_datee");
  const documents_path = formData.get("documents_path");
  const date_of_birth = formData.get("date_of_birth");
  const photo = formData.get("photo");

  const formatted_date_of_birth =
    date_of_birth && typeof date_of_birth === "string"
      ? new Date(date_of_birth)
      : null;

  const age = formatted_date_of_birth ? calculateAge(date_of_birth) : null;
  if (age && age < MIN_AGE) {
    alert("Employee must be at least 18 years old");
    return new Response(null, {
      status: 400,
    });
  }

  if (salary && Number(salary) < MIN_SALARY) {
    alert(`Salary must be above ${MIN_SALARY}`);
    return new Response(null, { status: 400 });
  }

  const db = await getDB();
  await db.run(
    `UPDATE employees SET full_name = ?, email = ?, phone_number = ?, department = ?, job_title = ?, salary = ?, start_datee = ?, end_datee = ?, documents_path = ?, date_of_birth = ?, photo = ? WHERE id = ?`,
    [
      full_name,
      email,
      phone_number,
      department,
      job_title,
      salary,
      start_datee,
      end_datee,
      documents_path,
      date_of_birth,
      photo,
      params.employeeId,
    ]
  );

  return redirect("/employees");
}

export default function EmployeeIDPage() {
  const { employee } = useLoaderData();
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [salaryError, setSalaryError] = useState<string | null>(null);

  const handleDateOfBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateOfBirth = e.target.value;
    const age = calculateAge(dateOfBirth);
    if (age && age < MIN_AGE) {
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

  if (!employee) {
    return <div>Employee not found</div>;
  }

  return (
    <div>
      <div className="nav-container">
        <Link to="/employees" className="links">
          Employees
        </Link>
        <Link to="/employees/new" className="links">
          New Employee
        </Link>
        <Link to="/timesheets/" className="links">
          Timesheets
        </Link>
      </div>
      <div className="page-container">
        <h1>Employee ID: {employee.id}</h1>
        <div className="form-card-container">
          <div className="details-container">
            <Form method="post">
              <ul>
                <li>
                  <label>
                    Full Name:
                    <input
                      type="text"
                      name="full_name"
                      defaultValue={employee.full_name}
                    />
                  </label>
                </li>
                <li>
                  <label>
                    Email:
                    <input
                      type="email"
                      name="email"
                      defaultValue={employee.email}
                    />
                  </label>
                </li>
                <li>
                  <label>
                    Phone:
                    <input
                      type="tel"
                      name="phone_number"
                      defaultValue={employee.phone_number}
                    />
                  </label>
                </li>
                <li>
                  <label>
                    Department:
                    <input
                      type="text"
                      name="department"
                      defaultValue={employee.department}
                    />
                  </label>
                </li>
                <li>
                  <label>
                    Job Title:
                    <input
                      type="text"
                      name="job_title"
                      defaultValue={employee.job_title}
                    />
                  </label>
                </li>
                <li>
                  <label>
                    Salary:
                    <input
                      type="number"
                      name="salary"
                      defaultValue={employee.salary}
                      onChange={handleSalaryChange}
                    />
                  </label>
                  {salaryError && <p style={{ color: "red" }}>{salaryError}</p>}
                </li>
                <li>
                  <label>
                    Start Date:
                    <input
                      type="date"
                      name="start_datee"
                      defaultValue={employee.start_datee}
                    />
                  </label>
                </li>
                <li>
                  <label>
                    End Date:
                    <input
                      type="date"
                      name="end_datee"
                      defaultValue={employee.end_datee || ""}
                    />
                  </label>
                </li>
                <li>
                  <label>
                    Date of Birth:
                    <input
                      type="date"
                      name="date_of_birth"
                      defaultValue={employee.date_of_birth}
                      onChange={handleDateOfBirthChange}
                    />
                  </label>
                  {error && <p style={{ color: "red" }}>{error}</p>}
                </li>
                <li>
                  <label>
                    Photo:
                    <input type="file" name="photo" accept="image/*" />
                  </label>
                  {employee.photo && (
                    <div>
                      <img
                        src={employee.photo}
                        alt="Employee Photo"
                        style={{ width: "100px", height: "100px" }}
                      />
                    </div>
                  )}
                </li>
                <li>
                  <label>
                    Documents Path:
                    <input
                      type="text"
                      name="documents_path"
                      defaultValue={employee.documents_path}
                    />
                  </label>
                </li>
              </ul>
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
                  Update Employee
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
