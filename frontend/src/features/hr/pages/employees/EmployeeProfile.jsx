import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import * as hr from '@/services/hr.service';
import { useParams } from 'react-router-dom';

export default function EmployeeProfile() {
  const { id } = useParams();
  const [emp, setEmp] = React.useState(null);
  const [tab, setTab] = React.useState('personal');

  React.useEffect(() => { if (id) hr.getEmployee(id).then(setEmp); }, [id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Employee Profile</h1>
          <p className="mt-1 text-sm text-gray-500">View personal, employment, documents and more for this employee.</p>
        </div>
      </div>
      <Card>
        <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-lg font-semibold text-white">
                {emp ? `${(emp.first_name || '')[0] || ''}${(emp.last_name || '')[0] || ''}`.toUpperCase() || '?' : '?'}
              </div>
              <div className="space-y-1">
                <div className="text-lg font-semibold leading-tight">
                  {emp ? `${emp.first_name} ${emp.last_name}` : 'Loading...'}
                </div>
                <div className="text-sm text-gray-500 flex flex-wrap gap-2 items-center">
                  <span>{emp?.employee_id}</span>
                  {emp?.department && <span className="text-gray-400">0</span>}
                  {emp?.department && <span>{emp.department}</span>}
                  {emp?.designation && <span className="text-gray-400">0</span>}
                  {emp?.designation && <span>{emp.designation}</span>}
                </div>
                {emp?.employment_status && (
                  <div className="inline-flex items-center rounded-full bg-green-50 px-3 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500" />
                    {emp.employment_status}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm border-t border-gray-100 pt-3 md:border-0 md:pt-0 dark:border-gray-800">
              {[
                {k:'personal', label:'Personal'},
                {k:'employment', label:'Employment'},
                {k:'qualifications', label:'Qualifications & Skills'},
                {k:'documents', label:'Documents'},
                {k:'financial', label:'Bank & Financial'},
                {k:'emergency', label:'Emergency & Medical'}
              ].map((t) => (
                <button
                  key={t.k}
                  onClick={() => setTab(t.k)}
                  className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors border-b-2 ${
                    tab === t.k
                      ? 'border-blue-600 text-blue-600 bg-blue-50/60 dark:bg-blue-900/20'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!emp ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : tab === 'personal' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><div className="text-gray-500">Name</div><div>{emp.first_name} {emp.last_name}</div></div>
              <div><div className="text-gray-500">Title</div><div>{emp.title || '-'}</div></div>
              <div><div className="text-gray-500">Employee ID</div><div>{emp.employee_id}</div></div>
              <div><div className="text-gray-500">DOB</div><div>{emp.date_of_birth || '-'}</div></div>
              <div><div className="text-gray-500">Gender</div><div>{emp.gender || '-'}</div></div>
              <div><div className="text-gray-500">Marital Status</div><div>{emp.marital_status || '-'}</div></div>
              <div><div className="text-gray-500">Blood Group</div><div>{emp.blood_group || '-'}</div></div>
              <div><div className="text-gray-500">Nationality</div><div>{emp.nationality || '-'}</div></div>
              <div><div className="text-gray-500">Personal Email</div><div>{emp.personal_email || '-'}</div></div>
              <div><div className="text-gray-500">Personal Phone</div><div>{emp.personal_phone || '-'}</div></div>
              <div><div className="text-gray-500">Alternate Phone</div><div>{emp.alternate_phone || '-'}</div></div>
              <div><div className="text-gray-500">Address</div><div>{[emp.address_line1, emp.address_line2, emp.city, emp.state, emp.postal_code, emp.country].filter(Boolean).join(', ') || '-'}</div></div>
              <div><div className="text-gray-500">National ID</div><div>{emp.national_id || '-'}</div></div>
              <div><div className="text-gray-500">Passport</div><div>{emp.passport_number || '-'}</div></div>
              <div><div className="text-gray-500">Driving License</div><div>{emp.driving_license || '-'}</div></div>
            </div>
          ) : tab === 'employment' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div><div className="text-gray-500">Department</div><div>{emp.department || '-'}</div></div>
              <div><div className="text-gray-500">Designation</div><div>{emp.designation || '-'}</div></div>
              <div><div className="text-gray-500">Reporting Manager</div><div>{emp.manager_first_name ? `${emp.manager_first_name} ${emp.manager_last_name}` : '-'}</div></div>
              <div><div className="text-gray-500">Employment Type</div><div>{emp.employment_type || '-'}</div></div>
              <div><div className="text-gray-500">Category</div><div>{emp.employee_category || '-'}</div></div>
              <div><div className="text-gray-500">Status</div><div>{emp.employment_status || '-'}</div></div>
              <div><div className="text-gray-500">Joining Date</div><div>{emp.joining_date || '-'}</div></div>
              <div><div className="text-gray-500">Confirmation Date</div><div>{emp.confirmation_date || '-'}</div></div>
              <div><div className="text-gray-500">Contract End</div><div>{emp.contract_end_date || '-'}</div></div>
              <div><div className="text-gray-500">Work Email</div><div>{emp.work_email || '-'}</div></div>
              <div><div className="text-gray-500">Work Phone</div><div>{emp.work_phone || '-'}</div></div>
              <div><div className="text-gray-500">Work Location</div><div>{emp.work_location || '-'}</div></div>
              <div><div className="text-gray-500">Desk Number</div><div>{emp.desk_number || '-'}</div></div>
              <div><div className="text-gray-500">Probation (months)</div><div>{emp.probation_period_months || '-'}</div></div>
              <div><div className="text-gray-500">Grade</div><div>{emp.grade || '-'}</div></div>
              <div><div className="text-gray-500">Level</div><div>{emp.level || '-'}</div></div>
              <div><div className="text-gray-500">Cost Center</div><div>{emp.cost_center || '-'}</div></div>
              <div className="md:col-span-2">
                <div className="font-medium mt-4 mb-2">Employment History</div>
                <div className="space-y-3">
                  {(emp.employment_history || []).map((h) => (
                    <div key={h.id} className="p-3 rounded border dark:border-gray-800">
                      <div className="font-medium">{h.company_name} — {h.position}</div>
                      <div className="text-xs text-gray-500">{h.start_date || '-'} → {h.end_date || '-'}</div>
                      {h.responsibilities && (<div className="text-sm mt-1">{h.responsibilities}</div>)}
                    </div>
                  ))}
                  {(!emp.employment_history || !emp.employment_history.length) && <div className="text-sm text-gray-500">No past records.</div>}
                </div>
              </div>
            </div>
          ) : tab === 'qualifications' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="font-medium mb-2">Educational Qualifications</div>
                <div className="space-y-2">
                  {(emp.qualifications || []).map((q) => (
                    <div key={q.id} className="p-3 rounded border dark:border-gray-800">
                      <div className="font-medium">{q.qualification_name}</div>
                      <div className="text-xs text-gray-500">{q.qualification_type} • {q.institution} • {q.year_of_passing || '-'}</div>
                    </div>
                  ))}
                  {(!emp.qualifications || !emp.qualifications.length) && <div className="text-sm text-gray-500">No qualifications added.</div>}
                </div>
              </div>
              <div>
                <div className="font-medium mb-2">Professional Skills</div>
                <div className="space-y-2">
                  {(emp.skills || []).map((s) => (
                    <div key={s.id} className="p-3 rounded border dark:border-gray-800">
                      <div className="font-medium">{s.skill_name}</div>
                      <div className="text-xs text-gray-500">{s.skill_type} • {s.proficiency_level || '-'} • {s.years_of_experience || 0} yrs</div>
                    </div>
                  ))}
                  {(!emp.skills || !emp.skills.length) && <div className="text-sm text-gray-500">No skills added.</div>}
                </div>
              </div>
            </div>
          ) : tab === 'documents' ? (
            <div className="space-y-2">
              {(emp.documents || []).map((d) => (
                <div key={d.id} className="p-3 rounded border dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{d.document_name}</div>
                    <div className="text-xs text-gray-500">{d.document_type} • {d.issue_date || '-'} → {d.expiry_date || '-'}</div>
                  </div>
                  <a className="text-blue-600 text-sm" href={d.file_url} target="_blank" rel="noreferrer">View</a>
                </div>
              ))}
              {(!emp.documents || !emp.documents.length) && <div className="text-sm text-gray-500">No documents uploaded.</div>}
            </div>
          ) : tab === 'financial' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div><div className="text-gray-500">Bank Name</div><div>{emp.bank_name || '-'}</div></div>
              <div><div className="text-gray-500">Account Number</div><div>{emp.bank_account_number || '-'}</div></div>
              <div><div className="text-gray-500">Account Type</div><div>{emp.bank_account_type || '-'}</div></div>
              <div><div className="text-gray-500">Branch</div><div>{emp.bank_branch || '-'}</div></div>
              <div><div className="text-gray-500">IFSC</div><div>{emp.bank_ifsc_code || '-'}</div></div>
              <div><div className="text-gray-500">MICR</div><div>{emp.bank_micr_code || '-'}</div></div>
              <div><div className="text-gray-500">PF Number</div><div>{emp.pf_number || '-'}</div></div>
              <div><div className="text-gray-500">UAN</div><div>{emp.uan_number || '-'}</div></div>
              <div><div className="text-gray-500">ESI</div><div>{emp.esi_number || '-'}</div></div>
              <div><div className="text-gray-500">PAN</div><div>{emp.pan_number || '-'}</div></div>
              <div><div className="text-gray-500">Payment Method</div><div>{emp.payment_method || '-'}</div></div>
              <div><div className="text-gray-500">Payment Frequency</div><div>{emp.payment_frequency || '-'}</div></div>
            </div>
          ) : tab === 'emergency' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="font-medium mb-2">Emergency Contacts</div>
                <div className="space-y-2">
                  {(emp.emergency_contacts || []).map((c) => (
                    <div key={c.id} className="p-3 rounded border dark:border-gray-800">
                      <div className="font-medium">{c.name} {c.is_primary ? '• Primary' : ''}</div>
                      <div className="text-xs text-gray-500">{c.relationship || '-'} • {c.phone} • {c.email || '-'}</div>
                      {c.address && <div className="text-sm mt-1">{c.address}</div>}
                    </div>
                  ))}
                  {(!emp.emergency_contacts || !emp.emergency_contacts.length) && <div className="text-sm text-gray-500">No emergency contacts.</div>}
                </div>
              </div>
              <div>
                <div className="font-medium mb-2">Medical Information</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div><div className="text-gray-500">Blood Group</div><div>{emp.blood_group || '-'}</div></div>
                  <div><div className="text-gray-500">Insurance Provider</div><div>{emp.health_insurance_provider || '-'}</div></div>
                  <div><div className="text-gray-500">Insurance Number</div><div>{emp.health_insurance_number || '-'}</div></div>
                  <div><div className="text-gray-500">Insurance Expiry</div><div>{emp.health_insurance_expiry || '-'}</div></div>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
