-- This file contains the SQL schema, it drops all tables and recreates them

DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS timesheets;

-- Create employees table
CREATE TABLE employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NULL,
    email TEXT NOT NULL UNIQUE,
    phone_number TEXT NOT NULL,
    date_of_birth DATE NULL,
    department TEXT NOT NULL,
    job_title TEXT NOT NULL,
    salary INTEGER NOT NULL,
    start_datee DATE NOT NULL,
    end_datee DATE NULL,
    photo TEXT NULL,
    documents_path TEXT NULL
);

-- Create timesheets table
CREATE TABLE timesheets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    employee_id INTEGER NOT NULL,
    summary TEXT NULL,
    project TEXT NULL,
    total_hours INTEGER GENERATED ALWAYS AS (strftime('%s', end_time) - strftime('%s', start_time)) VIRTUAL,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    UNIQUE (employee_id, start_time, end_time) 
);
