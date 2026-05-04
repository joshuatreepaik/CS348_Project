# Medical Appointment Management System

A full-stack web application that helps a medical clinic manage its patients, doctors, and appointments — and turn that data into useful insights for the people running the clinic.

Built as a CS348 (Database Systems) project to put database design, query performance, and full-stack engineering into practice on a real-world scenario.

## What it does

Clinics juggle a lot: who's coming in, which doctor they're seeing, who cancelled, and how the practice is actually performing week to week. This app gives them one place to handle all of that.

- **Manage appointments end-to-end.** Schedule a new appointment, update an existing one, or cancel it in a click. Past appointments are automatically marked as completed so the schedule stays clean.
- **Keep a single source of truth for patients and doctors.** Add and edit patient and doctor records, including each doctor's specialization.
- **See the bigger picture.** A reporting dashboard surfaces how many appointments were completed vs. cancelled, the clinic's overall completion and cancellation rates, the busiest doctor, and the day with the most appointments — filterable by doctor and date range.

## Why I built it

I wanted a project that wasn't just a CRUD demo. Appointment scheduling is a great fit for a database course because the interesting parts aren't the forms — they're the relationships between patients, doctors, and time, and the questions you can answer once that data is structured well.

The goal was to design something a real clinic could actually use, then make it fast and reliable as the data grows.

## What I focused on

- **Thoughtful data modeling.** Patients, doctors, and appointments are modeled with proper relationships so the data stays consistent even as records change.
- **Reporting that scales.** The stats dashboard runs aggregate queries (counts, rates, "most frequent" lookups) that would slow down quickly without the right indexes. I added indexes on the columns the dashboard filters and groups by, so reports stay snappy as the appointment table grows.
- **A clean user experience.** Recruiters and end users shouldn't have to read documentation to use it. The UI splits into two clear pages — *Manage* for day-to-day work and *Reports* for insights — with a simple landing page tying it together.
- **Production-ready deployment.** The whole app (API + frontend) ships as a single deployable service so a clinic could actually host it without juggling infrastructure.

## Built with

- **Frontend:** React 19, React Router, Axios
- **Backend:** Django 4.2, Django REST Framework
- **Database:** SQLite, with custom indexes and raw SQL for reporting queries
- **Deployment:** Render (single service serving the API and the built React app), WhiteNoise, Gunicorn

## What I learned

- How small schema and indexing decisions show up immediately in query speed once you start asking real questions of the data.
- How to design REST endpoints that are simple on the frontend but still let the backend do the heavy lifting (e.g., auto-completing past appointments on read, exposing one report endpoint that powers the whole dashboard).
- How to ship a React + Django app as a single deployable unit — including the build pipeline, static-file handling, and routing fallback so deep links work in production.

