import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import * as masters from '@/services/hr.masters.service';
import * as hr from '@/services/hr.service';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api.js';
import * as lookups from '@/services/hr.lookups.service.js';

export default function EmployeeForm() {
  const navigate = useNavigate();
  const [step, setStep] = React.useState(1);
  const [saving, setSaving] = React.useState(false);
  const [departments, setDepartments] = React.useState([]);
  const [designations, setDesignations] = React.useState([]);
  const [managers, setManagers] = React.useState([]);
  const [opts, setOpts] = React.useState({ titles: [], genders: [], marital_status: [], blood_groups: [], nationalities: [], emp_types: [], emp_categories: [], emp_statuses: [], bank_account_types: [], payment_methods: [], payment_frequencies: [], relationships: [], qualification_types: [], skill_proficiency: [], document_types: [], grade_bands: [] });
  const [shifts, setShifts] = React.useState([]);
  const [shiftId, setShiftId] = React.useState('');
  const steps = [
    { id: 1, key: 'personal', label: 'Personal' },
    { id: 2, key: 'employment', label: 'Employment' },
    { id: 3, key: 'bank', label: 'Bank & Statutory' },
    { id: 4, key: 'emergency', label: 'Emergency' },
    { id: 5, key: 'qualifications', label: 'Qualifications & Skills' },
    { id: 6, key: 'documents', label: 'Documents' }
  ];
  const [form, setForm] = React.useState({
    branch_id: '',
    title: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    marital_status: '',
    blood_group: '',
    nationality: '',
    personal_email: '',
    personal_phone: '',
    alternate_phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    national_id: '',
    passport_number: '',
    driving_license: '',
    photo_url: '',

    employee_id: '',
    department_id: '',
    designation_id: '',
    reporting_manager_id: '',
    employment_type: 'full_time',
    employee_category: '',
    joining_date: '',
    confirmation_date: '',
    contract_end_date: '',
    work_email: '',
    work_phone: '',
    work_location: '',
    desk_number: '',
    employment_status: 'active',
    probation_period_months: '',
    grade: '',
    level: '',
    cost_center: '',
    notes: '',

    bank_name: '',
    bank_account_number: '',
    bank_account_type: '',
    bank_branch: '',
    bank_ifsc_code: '',
    bank_micr_code: '',
    pf_number: '',
    uan_number: '',
    esi_number: '',
    pan_number: '',
    tax_deduction_section: '',
    declared_investments: '',
    payment_method: '',
    payment_frequency: '',

    grade_band: '',

    health_insurance_provider: '',
    health_insurance_number: '',
    health_insurance_expiry: ''
  });
  const [emergencyContacts, setEmergencyContacts] = React.useState([{ name: '', relationship: '', phone: '', email: '', address: '', is_primary: true }]);
  const [qualifications, setQualifications] = React.useState([]);
  const [skills, setSkills] = React.useState([]);
  const [documents, setDocuments] = React.useState([]);
  const [errors, setErrors] = React.useState({});
  const fieldLabels = {
    first_name: 'First Name',
    last_name: 'Last Name',
    personal_email: 'Personal Email',
    personal_phone: 'Personal Phone',
    address_line1: 'Address Line 1',
    city: 'City',
    state: 'State',
    postal_code: 'Postal Code',
    country: 'Country',
    employee_id: 'Employee ID',
    joining_date: 'Joining Date'
  };

  React.useEffect(() => {
    masters.listDepartments().then(setDepartments);
    masters.listDesignations().then(setDesignations);
    hr.listEmployees().then(setManagers);
    masters.listShifts().then(setShifts);
    Promise.all([
      lookups.list('title'),
      lookups.list('gender'),
      lookups.list('marital_status'),
      lookups.list('blood_group'),
      lookups.list('nationality'),
      lookups.list('employment_type'),
      lookups.list('employee_category'),
      lookups.list('employment_status'),
      lookups.list('bank_account_type'),
      lookups.list('payment_method'),
      lookups.list('payment_frequency'),
      lookups.list('relationship'),
      lookups.list('qualification_type'),
      lookups.list('skill_proficiency'),
      lookups.list('document_type'),
      lookups.list('grade_band')
    ]).then(([t,g,ms,bg,n,et,ec,es,bat,pm,pf,rel,qt,sp,dt,gb]) => {
      setOpts({
        titles: t, genders: g, marital_status: ms, blood_groups: bg, nationalities: n, emp_types: et, emp_categories: ec, emp_statuses: es,
        bank_account_types: bat, payment_methods: pm, payment_frequencies: pf, relationships: rel, qualification_types: qt, skill_proficiency: sp, document_types: dt,
        grade_bands: gb
      });
    });
  }, []);

  const required = ['employee_id','first_name','last_name','joining_date','personal_email','personal_phone','address_line1','city','state','postal_code','country'];
  const validate = () => required.every((k) => String(form[k] || '').trim().length);
  const stepRequired = {
    1: ['first_name','last_name','personal_email','personal_phone','address_line1','city','state','postal_code','country'],
    2: ['employee_id','joining_date'],
    3: [],
    4: [],
    5: [],
    6: []
  };
  const validateFields = (fields) => {
    const next = { ...errors };
    for (const k of fields) {
      const v = String(form[k] || '').trim();
      if (!v) {
        next[k] = `${fieldLabels[k] || k} is required`;
      } else {
        delete next[k];
        if (k === 'personal_email' && !/^\S+@\S+\.\S+$/.test(v)) next[k] = 'Enter a valid email';
        if (k === 'personal_phone' && v.replace(/\D/g,'').length < 7) next[k] = 'Enter a valid phone number';
        if (k === 'postal_code' && v.length < 4) next[k] = 'Enter a valid postal code';
      }
    }
    setErrors(next);
    return next;
  };
  const goNext = () => {
    const errs = validateFields(stepRequired[step] || []);
    const hasErr = Object.keys(errs).some((k) => (stepRequired[step] || []).includes(k));
    if (!hasErr) setStep((s)=>Math.min(6, s+1));
  };
  const goBack = () => setStep((s)=>Math.max(1, s-1));

  const onSubmit = async (asDraft = false) => {
    if (!asDraft) {
      const errs = validateFields(required);
      if (Object.keys(errs).length) return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (asDraft) payload.employment_status = 'draft';
      const res = await hr.createEmployee(payload);
      const id = res.id;
      if (shiftId) {
        try {
          await api.post(`/hr/employee-shifts`, { employee_id: id, shift_id: shiftId, effective_date: payload.joining_date || new Date().toISOString().slice(0,10) });
        } catch (e) {
          // non-blocking
        }
      }
      for (const c of emergencyContacts.filter(c=>c.name && c.phone)) {
        await api.post(`/hr/employees/${id}/emergency-contacts`, c);
      }
      for (const q of qualifications.filter(q=>q.qualification_type && q.qualification_name)) {
        await api.post(`/hr/employees/${id}/qualifications`, q);
      }
      for (const s of skills.filter(s=>s.skill_name)) {
        await api.post(`/hr/employees/${id}/skills`, s);
      }
      for (const d of documents.filter(d=>d.document_type && d.document_name && d.file_url)) {
        await api.post(`/hr/employees/${id}/documents`, d);
      }
      navigate(`/admin/hr/employees/${id}`);
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">New Employee</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="h-8 px-3" onClick={() => onSubmit(true)} disabled={saving}>Save as Draft</Button>
          <Button className="h-8 px-3" onClick={() => onSubmit(false)} disabled={saving}>Save</Button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs overflow-x-auto">
        {steps.map((s) => (
          <button key={s.id} onClick={() => setStep(s.id)} className={`px-3 py-1 rounded border ${step===s.id? 'bg-blue-600 text-white border-blue-600':'bg-gray-100 dark:bg-gray-800 border-transparent'}`}>{s.label}</button>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader><div className="font-semibold">Personal Information</div></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Select label="Title" value={form.title} onChange={e=>setForm(f=>({...f, title:e.target.value}))} options={[{label:'Select',value:''}, ...opts.titles.map(o=>({label:o.name,value:o.code}))]} />
              <Input label="First Name *" value={form.first_name} onChange={e=>setForm(f=>({...f, first_name:e.target.value}))} onBlur={()=>validateFields(['first_name'])} />
              {errors.first_name && <div className="text-xs text-red-600 -mt-2">{errors.first_name}</div>}
              <Input label="Last Name *" value={form.last_name} onChange={e=>setForm(f=>({...f, last_name:e.target.value}))} onBlur={()=>validateFields(['last_name'])} />
              {errors.last_name && <div className="text-xs text-red-600 -mt-2">{errors.last_name}</div>}
              <Input label="Date of Birth" type="date" value={form.date_of_birth} onChange={e=>setForm(f=>({...f, date_of_birth:e.target.value}))} />
              <Select label="Gender" value={form.gender} onChange={e=>setForm(f=>({...f, gender:e.target.value}))} options={[{label:'Select',value:''}, ...opts.genders.map(o=>({label:o.name,value:o.code}))]} />
              <Select label="Marital Status" value={form.marital_status} onChange={e=>setForm(f=>({...f, marital_status:e.target.value}))} options={[{label:'Select',value:''}, ...opts.marital_status.map(o=>({label:o.name,value:o.code}))]} />
              <Select label="Blood Group" value={form.blood_group} onChange={e=>setForm(f=>({...f, blood_group:e.target.value}))} options={[{label:'Select',value:''}, ...opts.blood_groups.map(o=>({label:o.name,value:o.code}))]} />
              <Select label="Nationality" value={form.nationality} onChange={e=>setForm(f=>({...f, nationality:e.target.value}))} options={[{label:'Select',value:''}, ...opts.nationalities.map(o=>({label:o.name,value:o.code}))]} />
              <Input label="Photo URL" value={form.photo_url} onChange={e=>setForm(f=>({...f, photo_url:e.target.value}))} />
              <Input label="Personal Email *" type="email" value={form.personal_email} onChange={e=>setForm(f=>({...f, personal_email:e.target.value}))} onBlur={()=>validateFields(['personal_email'])} />
              {errors.personal_email && <div className="text-xs text-red-600 -mt-2 md:col-span-2">{errors.personal_email}</div>}
              <Input label="Personal Phone *" value={form.personal_phone} onChange={e=>setForm(f=>({...f, personal_phone:e.target.value}))} onBlur={()=>validateFields(['personal_phone'])} />
              {errors.personal_phone && <div className="text-xs text-red-600 -mt-2 md:col-span-2">{errors.personal_phone}</div>}
              <Input label="Alternate Phone" value={form.alternate_phone} onChange={e=>setForm(f=>({...f, alternate_phone:e.target.value}))} />
              <Input label="Address Line 1 *" value={form.address_line1} onChange={e=>setForm(f=>({...f, address_line1:e.target.value}))} onBlur={()=>validateFields(['address_line1'])} />
              {errors.address_line1 && <div className="text-xs text-red-600 -mt-2 md:col-span-2">{errors.address_line1}</div>}
              <Input label="Address Line 2" value={form.address_line2} onChange={e=>setForm(f=>({...f, address_line2:e.target.value}))} />
              <Input label="City *" value={form.city} onChange={e=>setForm(f=>({...f, city:e.target.value}))} onBlur={()=>validateFields(['city'])} />
              {errors.city && <div className="text-xs text-red-600 -mt-2">{errors.city}</div>}
              <Input label="State *" value={form.state} onChange={e=>setForm(f=>({...f, state:e.target.value}))} onBlur={()=>validateFields(['state'])} />
              {errors.state && <div className="text-xs text-red-600 -mt-2">{errors.state}</div>}
              <Input label="Postal Code *" value={form.postal_code} onChange={e=>setForm(f=>({...f, postal_code:e.target.value}))} onBlur={()=>validateFields(['postal_code'])} />
              {errors.postal_code && <div className="text-xs text-red-600 -mt-2">{errors.postal_code}</div>}
              <Input label="Country *" value={form.country} onChange={e=>setForm(f=>({...f, country:e.target.value}))} onBlur={()=>validateFields(['country'])} />
              {errors.country && <div className="text-xs text-red-600 -mt-2">{errors.country}</div>}
              <Input label="National ID" value={form.national_id} onChange={e=>setForm(f=>({...f, national_id:e.target.value}))} />
              <Input label="Passport Number" value={form.passport_number} onChange={e=>setForm(f=>({...f, passport_number:e.target.value}))} />
              <Input label="Driving License" value={form.driving_license} onChange={e=>setForm(f=>({...f, driving_license:e.target.value}))} />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader><div className="font-semibold">Employment Details</div></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input label="Employee ID *" value={form.employee_id} onChange={e=>setForm(f=>({...f, employee_id:e.target.value}))} onBlur={()=>validateFields(['employee_id'])} />
              {errors.employee_id && <div className="text-xs text-red-600 -mt-2">{errors.employee_id}</div>}
              <Select label="Department" value={form.department_id} onChange={e=>setForm(f=>({...f, department_id:e.target.value}))} options={[{ label: 'Select', value: '' }, ...departments.map(d=>({ label: d.name, value: d.id }))]} />
              <Select label="Designation" value={form.designation_id} onChange={e=>setForm(f=>({...f, designation_id:e.target.value}))} options={[{ label: 'Select', value: '' }, ...designations.map(d=>({ label: d.title, value: d.id }))]} />
              <Select label="Reporting Manager" value={form.reporting_manager_id} onChange={e=>setForm(f=>({...f, reporting_manager_id:e.target.value}))} options={[{ label: 'None', value: '' }, ...managers.map(m=>({ label:`${m.employee_id} - ${m.first_name} ${m.last_name}`, value:m.id }))]} />
              <Select label="Employment Type" value={form.employment_type} onChange={e=>setForm(f=>({...f, employment_type:e.target.value}))} options={[{label:'Select',value:''}, ...opts.emp_types.map(o=>({label:o.name,value:o.code}))]} />
              <Select label="Shift" value={shiftId} onChange={e=>setShiftId(e.target.value)} options={[{label:'Select',value:''}, ...shifts.map(s=>({label:s.name, value:s.id}))]} />
              <Select label="Employee Category" value={form.employee_category} onChange={e=>setForm(f=>({...f, employee_category:e.target.value}))} options={[{label:'Select',value:''}, ...opts.emp_categories.map(o=>({label:o.name,value:o.code}))]} />
              <Input label="Joining Date *" type="date" value={form.joining_date} onChange={e=>setForm(f=>({...f, joining_date:e.target.value}))} onBlur={()=>validateFields(['joining_date'])} />
              {errors.joining_date && <div className="text-xs text-red-600 -mt-2">{errors.joining_date}</div>}
              <Input label="Confirmation Date" type="date" value={form.confirmation_date} onChange={e=>setForm(f=>({...f, confirmation_date:e.target.value}))} />
              <Input label="Contract End Date" type="date" value={form.contract_end_date} onChange={e=>setForm(f=>({...f, contract_end_date:e.target.value}))} />
              <Input label="Work Email" type="email" value={form.work_email} onChange={e=>setForm(f=>({...f, work_email:e.target.value}))} />
              <Input label="Work Phone" value={form.work_phone} onChange={e=>setForm(f=>({...f, work_phone:e.target.value}))} />
              <Input label="Work Location" value={form.work_location} onChange={e=>setForm(f=>({...f, work_location:e.target.value}))} />
              <Input label="Desk Number" value={form.desk_number} onChange={e=>setForm(f=>({...f, desk_number:e.target.value}))} />
              <Select label="Status" value={form.employment_status} onChange={e=>setForm(f=>({...f, employment_status:e.target.value}))} options={[{label:'Select',value:''}, ...opts.emp_statuses.map(o=>({label:o.name,value:o.code}))]} />
              <Input label="Probation Period (months)" type="number" value={form.probation_period_months} onChange={e=>setForm(f=>({...f, probation_period_months:e.target.value}))} />
              <Input label="Grade" value={form.grade} onChange={e=>setForm(f=>({...f, grade:e.target.value}))} />
              <Select label="Grade Band" value={form.grade_band} onChange={e=>setForm(f=>({...f, grade_band:e.target.value}))} options={[{label:'Select',value:''}, ...opts.grade_bands.map(o=>({label:o.name,value:o.code}))]} />
              <Input label="Level" value={form.level} onChange={e=>setForm(f=>({...f, level:e.target.value}))} />
              <Input label="Cost Center" value={form.cost_center} onChange={e=>setForm(f=>({...f, cost_center:e.target.value}))} />
              <Input label="Notes" value={form.notes} onChange={e=>setForm(f=>({...f, notes:e.target.value}))} />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader><div className="font-semibold">Bank Information</div></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input label="Bank Name" value={form.bank_name} onChange={e=>setForm(f=>({...f, bank_name:e.target.value}))} />
              <Input label="Account Number" value={form.bank_account_number} onChange={e=>setForm(f=>({...f, bank_account_number:e.target.value}))} />
              <Select label="Account Type" value={form.bank_account_type} onChange={e=>setForm(f=>({...f, bank_account_type:e.target.value}))} options={[{label:'Select',value:''}, ...opts.bank_account_types.map(o=>({label:o.name,value:o.code}))]} />
              <Input label="Branch" value={form.bank_branch} onChange={e=>setForm(f=>({...f, bank_branch:e.target.value}))} />
              <Input label="IFSC Code" value={form.bank_ifsc_code} onChange={e=>setForm(f=>({...f, bank_ifsc_code:e.target.value}))} />
              <Input label="MICR Code" value={form.bank_micr_code} onChange={e=>setForm(f=>({...f, bank_micr_code:e.target.value}))} />
              <Input label="PF Number" value={form.pf_number} onChange={e=>setForm(f=>({...f, pf_number:e.target.value}))} />
              <Input label="UAN Number" value={form.uan_number} onChange={e=>setForm(f=>({...f, uan_number:e.target.value}))} />
              <Input label="ESI Number" value={form.esi_number} onChange={e=>setForm(f=>({...f, esi_number:e.target.value}))} />
              <Input label="PAN Number" value={form.pan_number} onChange={e=>setForm(f=>({...f, pan_number:e.target.value}))} />
              <Input label="Tax Deduction Section" value={form.tax_deduction_section} onChange={e=>setForm(f=>({...f, tax_deduction_section:e.target.value}))} />
              <Input label="Declared Investments" value={form.declared_investments} onChange={e=>setForm(f=>({...f, declared_investments:e.target.value}))} />
              <Select label="Payment Method" value={form.payment_method} onChange={e=>setForm(f=>({...f, payment_method:e.target.value}))} options={[{label:'Select',value:''}, ...opts.payment_methods.map(o=>({label:o.name,value:o.code}))]} />
              <Select label="Payment Frequency" value={form.payment_frequency} onChange={e=>setForm(f=>({...f, payment_frequency:e.target.value}))} options={[{label:'Select',value:''}, ...opts.payment_frequencies.map(o=>({label:o.name,value:o.code}))]} />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader><div className="font-semibold">Emergency Contacts</div></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {emergencyContacts.map((c, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-2">
                  <Input label="Name" value={c.name} onChange={e=>setEmergencyContacts(arr=>{ const n=[...arr]; n[idx]={...n[idx], name:e.target.value}; return n; })} />
                  <Select label="Relationship" value={c.relationship} onChange={e=>setEmergencyContacts(arr=>{ const n=[...arr]; n[idx]={...n[idx], relationship:e.target.value}; return n; })} options={[{label:'Select',value:''}, ...opts.relationships.map(o=>({label:o.name,value:o.code}))]} />
                  <Input label="Phone" value={c.phone} onChange={e=>setEmergencyContacts(arr=>{ const n=[...arr]; n[idx]={...n[idx], phone:e.target.value}; return n; })} />
                  <Input label="Email" value={c.email} onChange={e=>setEmergencyContacts(arr=>{ const n=[...arr]; n[idx]={...n[idx], email:e.target.value}; return n; })} />
                  <Input label="Address" value={c.address} onChange={e=>setEmergencyContacts(arr=>{ const n=[...arr]; n[idx]={...n[idx], address:e.target.value}; return n; })} />
                  <Select label="Primary" value={c.is_primary ? 'yes':'no'} onChange={e=>setEmergencyContacts(arr=>{ const n=[...arr]; n[idx]={...n[idx], is_primary:e.target.value==='yes'}; return n; })} options={[{label:'No', value:'no'},{label:'Yes', value:'yes'}]} />
                </div>
              ))}
              <div className="flex justify-end">
                <Button variant="secondary" onClick={()=>setEmergencyContacts(arr=>[...arr, { name:'', relationship:'', phone:'', email:'', address:'', is_primary:false }])}>Add Contact</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 5 && (
        <Card>
          <CardHeader><div className="font-semibold">Qualifications & Skills</div></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="font-medium mb-2">Qualifications</div>
                {qualifications.map((q, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
                    <Select label="Type" value={q.qualification_type || ''} onChange={e=>setQualifications(arr=>{ const n=[...arr]; n[idx]={...n[idx], qualification_type:e.target.value}; return n; })} options={[{label:'Select',value:''}, ...opts.qualification_types.map(o=>({label:o.name,value:o.code}))]} />
                    <Input label="Name" value={q.qualification_name || ''} onChange={e=>setQualifications(arr=>{ const n=[...arr]; n[idx]={...n[idx], qualification_name:e.target.value}; return n; })} />
                    <Input label="Institution" value={q.institution || ''} onChange={e=>setQualifications(arr=>{ const n=[...arr]; n[idx]={...n[idx], institution:e.target.value}; return n; })} />
                    <Input label="Year" type="number" value={q.year_of_passing || ''} onChange={e=>setQualifications(arr=>{ const n=[...arr]; n[idx]={...n[idx], year_of_passing:e.target.value}; return n; })} />
                    <Input label="Percentage" type="number" value={q.percentage || ''} onChange={e=>setQualifications(arr=>{ const n=[...arr]; n[idx]={...n[idx], percentage:e.target.value}; return n; })} />
                  </div>
                ))}
                <div className="flex justify-end"><Button variant="secondary" onClick={()=>setQualifications(arr=>[...arr, {}])}>Add Qualification</Button></div>
              </div>
              <div>
                <div className="font-medium mb-2">Skills</div>
                {skills.map((s, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
                    <Input label="Category" value={s.skill_type || ''} onChange={e=>setSkills(arr=>{ const n=[...arr]; n[idx]={...n[idx], skill_type:e.target.value}; return n; })} />
                    <Input label="Skill" value={s.skill_name || ''} onChange={e=>setSkills(arr=>{ const n=[...arr]; n[idx]={...n[idx], skill_name:e.target.value}; return n; })} />
                    <Select label="Proficiency" value={s.proficiency_level || ''} onChange={e=>setSkills(arr=>{ const n=[...arr]; n[idx]={...n[idx], proficiency_level:e.target.value}; return n; })} options={[{label:'Select',value:''}, ...opts.skill_proficiency.map(o=>({label:o.name,value:o.code}))]} />
                    <Input label="Years Exp" type="number" value={s.years_of_experience || ''} onChange={e=>setSkills(arr=>{ const n=[...arr]; n[idx]={...n[idx], years_of_experience:e.target.value}; return n; })} />
                    <Input label="Last Used" type="date" value={s.last_used || ''} onChange={e=>setSkills(arr=>{ const n=[...arr]; n[idx]={...n[idx], last_used:e.target.value}; return n; })} />
                  </div>
                ))}
                <div className="flex justify-end"><Button variant="secondary" onClick={()=>setSkills(arr=>[...arr, {}])}>Add Skill</Button></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 6 && (
        <Card>
          <CardHeader><div className="font-semibold">Documents Upload</div></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {documents.map((d, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <Select label="Type" value={d.document_type || ''} onChange={e=>setDocuments(arr=>{ const n=[...arr]; n[idx]={...n[idx], document_type:e.target.value}; return n; })} options={[{label:'Select',value:''}, ...opts.document_types.map(o=>({label:o.name,value:o.code}))]} />
                  <Input label="Name" value={d.document_name || ''} onChange={e=>setDocuments(arr=>{ const n=[...arr]; n[idx]={...n[idx], document_name:e.target.value}; return n; })} />
                  <Input label="File URL" value={d.file_url || ''} onChange={e=>setDocuments(arr=>{ const n=[...arr]; n[idx]={...n[idx], file_url:e.target.value}; return n; })} />
                  <Input label="Issue Date" type="date" value={d.issue_date || ''} onChange={e=>setDocuments(arr=>{ const n=[...arr]; n[idx]={...n[idx], issue_date:e.target.value}; return n; })} />
                  <Input label="Expiry Date" type="date" value={d.expiry_date || ''} onChange={e=>setDocuments(arr=>{ const n=[...arr]; n[idx]={...n[idx], expiry_date:e.target.value}; return n; })} />
                </div>
              ))}
              <div className="flex justify-end"><Button variant="secondary" onClick={()=>setDocuments(arr=>[...arr, {}])}>Add Document</Button></div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <Button variant="secondary" className="h-8 px-3" onClick={goBack}>Back</Button>
        <Button className="h-8 px-3" onClick={goNext}>Next</Button>
      </div>
    </div>
  );
}
