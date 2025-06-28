import { useLoaderData, Link, useSearchParams } from "react-router";
import { useState } from "react";
import { getDB } from "~/db/getDB";

const sortEmployees = (employees: any[], sortBy: string, sortOrder: string) => {
  return employees.sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return sortOrder === "asc" ? -1 : 1;
    if (a[sortBy] > b[sortBy]) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
};

const paginateEmployees = (
  employees: any[],
  page: number,
  pageSize: number
) => {
  const startIndex = (page - 1) * pageSize;
  return employees.slice(startIndex, startIndex + pageSize);
};

export async function loader({ request }: any) {
  const db = await getDB();
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "full_name";
  const sortOrder = searchParams.get("sortOrder") || "asc";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 4;

  let employees = await db.all(
    "SELECT id, full_name, email, phone_number, department, job_title, salary FROM employees"
  );

  if (search) {
    employees = employees.filter(
      (employee) =>
        employee.full_name.toLowerCase().includes(search.toLowerCase()) ||
        employee.email.toLowerCase().includes(search.toLowerCase()) ||
        employee.phone_number.toLowerCase().includes(search.toLowerCase()) ||
        employee.department.toLowerCase().includes(search.toLowerCase()) ||
        employee.job_title.toLowerCase().includes(search.toLowerCase())
    );
  }

  employees = sortEmployees(employees, sortBy, sortOrder);

  const paginatedEmployees = paginateEmployees(employees, page, pageSize);

  return {
    employees: paginatedEmployees,
    totalEmployees: employees.length,
    page,
    pageSize,
  };
}

export default function EmployeesPage() {
  const { employees, totalEmployees, page, pageSize } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "full_name"
  );
  const [sortOrder, setSortOrder] = useState(
    searchParams.get("sortOrder") || "asc"
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    setSearch(searchTerm);
    setSearchParams({ search: searchTerm, page: "1" });

    setSearchParams({ search: searchTerm, page: "1" });
  };

  const handleSortChange = (field: string) => {
    const newSortOrder =
      sortBy === field && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(field);
    setSortOrder(newSortOrder);
    setSearchParams({
      search,
      sortBy: field,
      sortOrder: newSortOrder,
      page: "1",
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ search, sortBy, sortOrder, page: newPage.toString() });
  };

  const totalPages = Math.ceil(totalEmployees / pageSize);

  return (
    <div>
      <div className="nav-container">
        <Link to="/employees/new" className="links">
          New Employee
        </Link>
        <Link to="/timesheets" className="links">
          Timesheets
        </Link>
      </div>
      <div className="page-container">
        <h1>Employee List</h1>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name, email, phone, department, job title"
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <div className="table-container">
          <table className="employee-table">
            <thead>
              <tr>
                <th onClick={() => handleSortChange("full_name")}>
                  Full Name{" "}
                  {sortBy === "full_name"
                    ? sortOrder === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </th>
                <th onClick={() => handleSortChange("email")}>
                  Email{" "}
                  {sortBy === "email" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </th>
                <th onClick={() => handleSortChange("phone_number")}>
                  Phone{" "}
                  {sortBy === "phone_number"
                    ? sortOrder === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </th>
                <th onClick={() => handleSortChange("department")}>
                  Department{" "}
                  {sortBy === "department"
                    ? sortOrder === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </th>
                <th onClick={() => handleSortChange("job_title")}>
                  Job Title{" "}
                  {sortBy === "job_title"
                    ? sortOrder === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee: any) => (
                <tr key={employee.id}>
                  <td>{employee.full_name}</td>
                  <td>{employee.email}</td>
                  <td>{employee.phone_number}</td>
                  <td>{employee.department}</td>
                  <td>{employee.job_title}</td>
                  <td>
                    <Link
                      to={`/employees/${employee.id}`}
                      className="view-link"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="pagination-button"
          >
            Prev
          </button>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
        <span style={{ display: "block", textAlign: "center", width: "100%" }}>
          Page {page} of {totalPages}
        </span>
      </div>
    </div>
  );
}
