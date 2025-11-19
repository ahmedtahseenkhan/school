import React from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const fullName = user ? `${user.first_name} ${user.last_name}` : 'Administrator';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, {fullName}</p>
        </div>
        <button
          onClick={logout}
          className="self-start inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-slate-800"
        >
          Logout
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Monthly Fee Collection</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">₹ 2,45,000</p>
          <p className="mt-1 text-xs text-emerald-600">▲ 8.2% vs last month</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Outstanding Dues</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">₹ 75,120</p>
          <p className="mt-1 text-xs text-rose-600">▼ 2.1% vs last month</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Students Present Today</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">1,986</p>
          <p className="mt-1 text-xs text-emerald-600">94.2% attendance</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Staff Present Today</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">112</p>
          <p className="mt-1 text-xs text-amber-600">3 on leave</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-xl border bg-white p-4 md:p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Fee Collection and Expenses</h2>
                <p className="text-xs text-gray-500">Current academic year overview</p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-blue-700">
                  <span className="h-2 w-2 rounded-full bg-blue-500" /> Fee Collection
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Expenses
                </span>
              </div>
            </div>
            <div className="mt-6 flex h-40 items-end gap-3">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, idx) => (
                <div key={m} className="flex flex-1 flex-col items-center gap-2 text-[10px] text-gray-500">
                  <div className="flex w-full flex-1 items-end gap-1 rounded-md bg-slate-50 px-1 pb-1">
                    <div
                      className="w-1.5 flex-1 rounded-full bg-blue-500"
                      style={{ height: `${40 + idx * 8}%` }}
                    />
                    <div
                      className="w-1.5 flex-1 rounded-full bg-emerald-400"
                      style={{ height: `${25 + idx * 5}%` }}
                    />
                  </div>
                  <span>{m}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Income – June 2024</h3>
                  <p className="text-xs text-gray-500">Fee, donations and other sources</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700">
                  +5.3% vs May
                </span>
              </div>
              <div className="mx-auto mt-2 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 text-xs font-semibold text-white">
                ₹ 3.2L
              </div>
              <div className="mt-4 space-y-2 text-xs text-gray-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Fee</span>
                  <span>72%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-500" /> Donation</span>
                  <span>18%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-400" /> Others</span>
                  <span>10%</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Expenses – June 2024</h3>
                  <p className="text-xs text-gray-500">Salaries, utilities and maintenance</p>
                </div>
                <span className="rounded-full bg-rose-50 px-2 py-1 text-[10px] font-medium text-rose-700">
                  -1.8% vs May
                </span>
              </div>
              <div className="mx-auto mt-2 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-orange-400 text-xs font-semibold text-white">
                ₹ 1.9L
              </div>
              <div className="mt-4 space-y-2 text-xs text-gray-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-500" /> Salaries</span>
                  <span>64%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500" /> Utilities</span>
                  <span>21%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-sky-500" /> Others</span>
                  <span>15%</span>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border bg-white p-4 shadow-sm text-xs">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Student Attendance</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1"><span>Present</span><span className="font-medium text-emerald-700">92%</span></div>
                  <div className="h-1.5 rounded-full bg-slate-100"><div className="h-1.5 w-[92%] rounded-full bg-emerald-500" /></div>
                </div>
                <div>
                  <div className="flex justify-between mb-1"><span>Late</span><span>3%</span></div>
                  <div className="h-1.5 rounded-full bg-slate-100"><div className="h-1.5 w-[12%] rounded-full bg-amber-400" /></div>
                </div>
                <div>
                  <div className="flex justify-between mb-1"><span>Absent</span><span>5%</span></div>
                  <div className="h-1.5 rounded-full bg-slate-100"><div className="h-1.5 w-[18%] rounded-full bg-rose-500" /></div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-4 shadow-sm text-xs">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Library Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between"><span>Books Issued</span><span className="font-medium text-gray-900">2,136</span></div>
                <div className="flex justify-between"><span>Overdue</span><span className="text-rose-600">56</span></div>
                <div className="flex justify-between"><span>New Additions</span><span>120 this month</span></div>
                <div className="flex justify-between"><span>Active Members</span><span>860</span></div>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-4 shadow-sm text-xs">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Fees Overview</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1"><span>Paid</span><span>85%</span></div>
                  <div className="h-1.5 rounded-full bg-slate-100"><div className="h-1.5 w-[85%] rounded-full bg-blue-500" /></div>
                </div>
                <div>
                  <div className="flex justify-between mb-1"><span>Partial</span><span>10%</span></div>
                  <div className="h-1.5 rounded-full bg-slate-100"><div className="h-1.5 w-[30%] rounded-full bg-amber-400" /></div>
                </div>
                <div>
                  <div className="flex justify-between mb-1"><span>Unpaid</span><span>5%</span></div>
                  <div className="h-1.5 rounded-full bg-slate-100"><div className="h-1.5 w-[18%] rounded-full bg-rose-500" /></div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-4 shadow-sm text-xs">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Enquiry Overview</h3>
              <div className="space-y-2">
                <div className="flex justify-between"><span>New</span><span>120</span></div>
                <div className="flex justify-between"><span>In Progress</span><span>45</span></div>
                <div className="flex justify-between"><span>Converted</span><span className="text-emerald-600">38</span></div>
                <div className="flex justify-between"><span>Lost</span><span className="text-rose-500">12</span></div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-white p-4 md:p-5 shadow-sm text-xs md:text-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Academic Schedule</h3>
                <p className="text-xs text-gray-500">June 2024</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <button className="rounded-md border bg-white px-2 py-1">◀</button>
                <button className="rounded-md border bg-white px-2 py-1">▶</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-[10px] md:text-[11px] text-gray-500 mb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <div key={d} className="text-center font-medium">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-[10px] md:text-[11px]">
              {Array.from({ length: 35 }).map((_, i) => {
                const day = i + 1;
                const isSummerBreak = day >= 3 && day <= 21;
                return (
                  <div
                    key={day}
                    className={`h-12 rounded-md border bg-slate-50 p-1 ${isSummerBreak ? 'bg-pink-50 border-pink-200' : ''}`}
                  >
                    <div className="text-right text-[10px] text-gray-500">{day <= 30 ? day : ''}</div>
                    {isSummerBreak && day <= 30 ? (
                      <div className="mt-1 rounded-full bg-pink-200 px-1 text-[9px] text-pink-900">Summer Break</div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border bg-white p-4 shadow-sm text-xs md:text-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Notice Board</h3>
            <ul className="space-y-2">
              <li className="border-l-2 border-blue-500 pl-3">
                <p className="font-medium text-gray-800">Result for Class XII announced</p>
                <p className="text-[11px] text-gray-500">View detailed report in Examination module.</p>
              </li>
              <li className="border-l-2 border-emerald-500 pl-3">
                <p className="font-medium text-gray-800">New academic session planning</p>
                <p className="text-[11px] text-gray-500">Submit class requirements by this Friday.</p>
              </li>
              <li className="border-l-2 border-amber-500 pl-3">
                <p className="font-medium text-gray-800">Transport route verification</p>
                <p className="text-[11px] text-gray-500">Update pick-up points for 2024–25.</p>
              </li>
            </ul>
          </section>

          <section className="rounded-xl border bg-white p-4 shadow-sm text-xs md:text-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Upcoming Events</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 flex-col items-center justify-center rounded-md bg-blue-50 text-[10px] font-semibold text-blue-700">
                  <span>Jun</span>
                  <span>24</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-900">Webinar on Career Trends</p>
                  <p className="text-[11px] text-gray-500">For senior secondary students.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-10 w-10 flex-col items-center justify-center rounded-md bg-emerald-50 text-[10px] font-semibold text-emerald-700">
                  <span>Jun</span>
                  <span>29</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-900">Parent–Teacher Meeting</p>
                  <p className="text-[11px] text-gray-500">Classes VI – X, Block A.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-white p-4 shadow-sm text-xs md:text-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Faculty on Leave</h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between">
                <span className="font-medium text-gray-800">Saurabh Sharma</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-gray-600">Maths</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-medium text-gray-800">Anita Verma</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-gray-600">Physics</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-medium text-gray-800">Rahul Mehta</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-gray-600">Accounts</span>
              </li>
            </ul>
          </section>

          <section className="rounded-xl border bg-white p-4 shadow-sm text-xs md:text-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Faculty Details</h3>
            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-gray-500">Teachers</dt>
                <dd className="text-base font-semibold text-gray-900">80</dd>
              </div>
              <div>
                <dt className="text-gray-500">Accountants</dt>
                <dd className="text-base font-semibold text-gray-900">5</dd>
              </div>
              <div>
                <dt className="text-gray-500">Librarians</dt>
                <dd className="text-base font-semibold text-gray-900">2</dd>
              </div>
              <div>
                <dt className="text-gray-500">Receptionists</dt>
                <dd className="text-base font-semibold text-gray-900">4</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
