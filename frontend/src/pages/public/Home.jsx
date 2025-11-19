import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function Home() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/announcements')
      .then(({ data }) => setAnnouncements(data.announcements || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-semibold">
              SM
            </div>
            <div>
              <div className="font-semibold text-gray-900">SmartSchool</div>
              <div className="text-xs text-gray-500">School Management System</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-700">
            <a href="#features" className="hover:text-blue-600">Features</a>
            <a href="#announcements" className="hover:text-blue-600">Announcements</a>
            <a href="#contact" className="hover:text-blue-600">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 hidden sm:inline-block"
            >
              Login
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Go to Portal
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50">
          <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
                A modern operating system for your school.
              </h1>
              <p className="text-gray-600 text-sm md:text-base mb-6">
                Centralize student data, attendance, exams, HR and finance into a secure, easy-to-use web portal.
              </p>
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700"
                >
                  Login to Admin Portal
                </Link>
                <a href="#features" className="text-sm font-medium text-blue-700 hover:text-blue-900">
                  Explore features
                </a>
              </div>
              <dl className="grid grid-cols-3 gap-4 text-xs md:text-sm text-gray-700">
                <div>
                  <dt className="font-semibold text-gray-900">Real-time data</dt>
                  <dd>Live attendance & performance dashboards.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Multi-campus</dt>
                  <dd>Manage multiple branches from one system.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Secure</dt>
                  <dd>Role-based access and audit logs.</dd>
                </div>
              </dl>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Key highlights</h2>
              <ul className="space-y-3 text-sm text-gray-700">
                <li>Student information, attendance & exams in one place.</li>
                <li>HR, leaves and payroll for all staff.</li>
                <li>Announcements, notifications and parent portal.</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="features" className="py-12 md:py-16 border-b bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Key modules</h2>
            <p className="text-gray-600 text-sm md:text-base mb-8">All departments stay connected inside one system.</p>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <h3 className="font-semibold mb-1">Student Information</h3>
                <p className="text-gray-600">Profiles, enrollment, attendance and fees.</p>
              </div>
              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <h3 className="font-semibold mb-1">Academic Planning</h3>
                <p className="text-gray-600">Timetables, exams, grading and analytics.</p>
              </div>
              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <h3 className="font-semibold mb-1">Operations & HR</h3>
                <p className="text-gray-600">Staff, leaves, payroll and permissions.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="announcements" className="py-12 md:py-16 bg-slate-50 border-b">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Latest announcements</h2>
                <p className="text-sm text-gray-600">Important notices from the school.</p>
              </div>
              <Link to="/login" className="hidden md:inline-flex text-sm text-blue-700 hover:text-blue-900">
                Manage announcements
              </Link>
            </div>
            {loading ? (
              <div className="text-sm text-gray-600">Loading...</div>
            ) : announcements.length ? (
              <ul className="grid md:grid-cols-3 gap-4">
                {announcements.slice(0, 3).map((a) => (
                  <li key={a.id} className="border rounded-xl bg-white p-4 shadow-sm text-sm">
                    <div className="font-semibold text-gray-900 mb-1">{a.title}</div>
                    <div className="text-xs text-gray-500 mb-2">{a.category} • {a.priority}</div>
                    <p className="text-gray-700 line-clamp-3">{a.content}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-600">No announcements available.</div>
            )}
          </div>
        </section>

        <section className="py-10 md:py-14 bg-white border-b">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-6 text-center text-sm">
            <div>
              <div className="text-2xl font-bold text-blue-600 mb-1">40+</div>
              <div className="text-gray-600">Modules</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 mb-1">10k+</div>
              <div className="text-gray-600">Students managed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 mb-1">98%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 mb-1">24/7</div>
              <div className="text-gray-600">Cloud access</div>
            </div>
          </div>
        </section>

        <section id="contact" className="py-12 md:py-16 bg-slate-900">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 text-slate-100 text-sm">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Get in touch</h2>
              <p className="text-slate-300 mb-6">
                Need a demo or support? Our team will help you set up branches, roles and permissions.
              </p>
              <p className="mb-1"><span className="font-semibold">Email:</span> support@smartschool.local</p>
              <p className="mb-1"><span className="font-semibold">Phone:</span> +000 000 0000</p>
              <p><span className="font-semibold">Address:</span> Central Campus, Education City</p>
            </div>
            <div className="bg-slate-800 rounded-2xl p-6 space-y-3">
              <p className="text-xs text-slate-300">Demo form – wire this up to your backend if needed.</p>
              <input
                type="text"
                placeholder="Your name"
                className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 text-sm"
              />
              <input
                type="email"
                placeholder="Email address"
                className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 text-sm"
              />
              <textarea
                rows={3}
                placeholder="How can we help?"
                className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 text-sm"
              />
              <button className="inline-flex items-center justify-center rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600">
                Send message
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-slate-950 text-slate-300 text-xs">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <div>© {new Date().getFullYear()} SmartSchool. All rights reserved.</div>
          <div className="flex gap-4">
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

