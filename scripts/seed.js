import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfigPath = path.join(__dirname, "../database.yaml");
const dbConfig = yaml.load(fs.readFileSync(dbConfigPath, "utf8"));

const { sqlite_path: sqlitePath } = dbConfig;

const db = new sqlite3.Database(sqlitePath);

const employees = [
  {
    full_name: "John Doe",
    email: "johndoe@example.com",
    phone_number: "123-456-7890",
    date_of_birth: "1990-01-15",
    department: "Engineering",
    job_title: "Software Engineer",
    salary: 75000,
    start_datee: "2023-06-01",
    end_datee: null,
    photo: null,
    documents_path: null,
  },
  {
    full_name: "Jane Smith",
    email: "janesmith@example.com",
    phone_number: "987-654-3210",
    date_of_birth: "1985-05-22",
    department: "HR",
    job_title: "HR Manager",
    salary: 65000,
    start_datee: "2022-03-15",
    end_datee: null,
    photo: null,
    documents_path: null,
  },
  {
    full_name: "Alice Johnson",
    email: "alicejohnson@example.com",
    phone_number: "456-789-0123",
    date_of_birth: "1992-09-10",
    department: "Marketing",
    job_title: "Marketing Manager",
    salary: 70000,
    start_datee: "2021-10-20",
    end_datee: null,
    photo: null,
    documents_path: null,
  },
  {
    full_name: "Bob Brown",
    email: "bobbrown@example.com",
    phone_number: "111-222-3333",
    date_of_birth: "1980-04-18",
    department: "Finance",
    job_title: "Accountant",
    salary: 72000,
    start_datee: "2019-07-01",
    end_datee: null,
    photo: null,
    documents_path: null,
  },
  {
    full_name: "Emily White",
    email: "emilywhite@example.com",
    phone_number: "222-333-4444",
    date_of_birth: "1995-06-25",
    department: "IT Support",
    job_title: "IT Technician",
    salary: 68000,
    start_datee: "2020-01-10",
    end_datee: null,
    photo: null,
    documents_path: null,
  },
  {
    full_name: "Daniel Green",
    email: "danielgreen@example.com",
    phone_number: "333-444-5555",
    date_of_birth: "1988-02-28",
    department: "Sales",
    job_title: "Sales Manager",
    salary: 77000,
    start_datee: "2018-09-15",
    end_datee: null,
    photo: null,
    documents_path: null,
  },
];

const timesheets = [
  {
    employee_id: 1,
    start_time: "2009-02-10 08:00:00",
    end_time: "2025-02-10 17:00:00",
    summary: "Worked on project X",
    project: "Project X",
  },
  {
    employee_id: 2,
    start_time: "2012-02-11 12:00:00",
    end_time: "2025-02-11 17:00:00",
    summary: "HR policy review",
    project: "HR Documentation",
  },
  {
    employee_id: 3,
    start_time: "2014-02-12 07:00:00",
    end_time: "2025-02-12 16:00:00",
    summary: "Marketing campaign planning",
    project: "New Product Launch",
  },
  {
    employee_id: 4,
    start_time: "2020-02-13 09:00:00",
    end_time: "2025-02-13 17:00:00",
    summary: "Prepared monthly financial report",
    project: "Financial Report",
  },
  {
    employee_id: 5,
    start_time: "2021-02-14 08:30:00",
    end_time: "2025-02-14 15:30:00",
    summary: "Performed IT system maintenance",
    project: "IT System Maintenance",
  },
  {
    employee_id: 6,
    start_time: "2022-02-15 10:00:00",
    end_time: "2025-02-15 18:00:00",
    summary: "Conducted client outreach",
    project: "Client Outreach",
  },
];

const insertData = (table, data) => {
  if (!data.length) return;

  const columns = Object.keys(data[0]).join(", ");
  const placeholders = Object.keys(data[0])
    .map(() => "?")
    .join(", ");

  const insertStmt = db.prepare(
    `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`
  );

  data.forEach((row) => {
    insertStmt.run(Object.values(row), (err) => {
      if (err) {
        console.error(`Error inserting into ${table}:`, err.message);
      }
    });
  });

  insertStmt.finalize();
};

db.serialize(() => {
  console.log("Seeding database...");
  db.run("DELETE FROM employees;");
  db.run("DELETE FROM timesheets;");
  insertData("employees", employees);
  insertData("timesheets", timesheets);
});

db.close((err) => {
  if (err) {
    console.error("Error closing database:", err.message);
  } else {
    console.log("Database seeded successfully.");
  }
});
