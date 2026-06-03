import { useState } from 'react';
import { SheetConfig } from '../../types/hr';
import { saveSheetConfig } from '../../lib/googleSheets';
import { Save, RefreshCw, ExternalLink, CheckCircle, Info, Table } from 'lucide-react';

interface Props {
  config: SheetConfig | null;
  onConfigSave: (config: SheetConfig) => void;
  isLiveMode: boolean;
}

export default function SettingsPanel({ config, onConfigSave, isLiveMode }: Props) {
  const [form, setForm] = useState<SheetConfig>({
    spreadsheetId: config?.spreadsheetId ?? '',
    apiKey: config?.apiKey ?? '',
    employeeSheetName: config?.employeeSheetName ?? 'Employees',
    exitSheetName: config?.exitSheetName ?? 'Exit',
<<<<<<< HEAD
    approvedWorkforceSheetName: config?.approvedWorkforceSheetName ?? 'Approved Workforce',
    openPositionsSheetName: config?.openPositionsSheetName ?? 'Open Positions',
=======
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveSheetConfig(form);
    onConfigSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Status Banner */}
      <div className={`rounded-xl p-4 border flex items-start gap-3 ${isLiveMode
        ? 'bg-emerald-50 border-emerald-200'
        : 'bg-amber-50 border-amber-200'}`}>
        <Info size={18} className={`mt-0.5 shrink-0 ${isLiveMode ? 'text-emerald-600' : 'text-amber-600'}`} />
        <div className={`text-sm ${isLiveMode ? 'text-emerald-800' : 'text-amber-800'}`}>
          {isLiveMode
            ? <><span className="font-bold">Connected to Google Sheets.</span> Dashboard is syncing live data. Auto-refresh every 60 seconds.</>
            : <><span className="font-bold">Running in Demo Mode.</span> Configure your Google Sheets connection below to sync real HR data.</>}
        </div>
      </div>

      {/* Google Sheets Config */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Table size={18} className="text-blue-600" />
          <h3 className="text-base font-bold text-gray-900">Google Sheets Connection</h3>
        </div>

        <div className="space-y-4">
          <FormField label="Spreadsheet ID" hint="Found in the Google Sheets URL: docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit">
            <input
              type="text"
              value={form.spreadsheetId}
              onChange={e => setForm(f => ({ ...f, spreadsheetId: e.target.value }))}
              placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 font-mono"
            />
          </FormField>

          <FormField label="Google Sheets API Key" hint="Create at console.cloud.google.com → APIs → Google Sheets API → Credentials">
            <input
              type="password"
              value={form.apiKey}
              onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 font-mono"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Employee Sheet Name" hint="Tab name in your spreadsheet">
              <input
                type="text"
                value={form.employeeSheetName}
                onChange={e => setForm(f => ({ ...f, employeeSheetName: e.target.value }))}
                placeholder="Employees"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
              />
            </FormField>
            <FormField label="Exit Sheet Name" hint="Tab name for exit records">
              <input
                type="text"
                value={form.exitSheetName}
                onChange={e => setForm(f => ({ ...f, exitSheetName: e.target.value }))}
                placeholder="Exit"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
              />
            </FormField>
<<<<<<< HEAD
            <FormField label="Approved Workforce Sheet Name" hint="Tab name for store-wise workforce plan">
              <input
                type="text"
                value={form.approvedWorkforceSheetName}
                onChange={e => setForm(f => ({ ...f, approvedWorkforceSheetName: e.target.value }))}
                placeholder="Approved Workforce"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
              />
            </FormField>
            <FormField label="Open Positions Sheet Name" hint="Tab name for hiring pipeline / open roles">
              <input
                type="text"
                value={form.openPositionsSheetName}
                onChange={e => setForm(f => ({ ...f, openPositionsSheetName: e.target.value }))}
                placeholder="Open Positions"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
              />
            </FormField>
=======
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {saved ? <CheckCircle size={16} /> : <Save size={16} />}
            {saved ? 'Saved! Refreshing...' : 'Save & Connect'}
          </button>
        </div>
      </div>

      {/* Google Sheet Structure Guide */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <RefreshCw size={16} className="text-blue-600" />
          Required Google Sheet Structure
        </h3>

        <div className="space-y-5">
          <SheetStructure
            title="Sheet 1: Employees"
            columns={['Employee ID', 'Employee Name', 'Gender', 'DOJ', 'Designation', 'Department', 'Store Name', 'Location', 'Employment Status', 'Tenure', 'Reporting Manager', 'Hiring Source', 'HDFC Account', 'HRBP Name', 'Confirmation Status', 'Age']}
          />
          <SheetStructure
            title="Sheet 2: Exit"
            columns={['Employee ID', 'Employee Name', 'DOJ', 'DOL', 'Exit Reason', 'Voluntary / Non-Voluntary', 'Store', 'Location', 'Designation', 'Tenure at Exit']}
          />
<<<<<<< HEAD
          <SheetStructure
            title="Sheet 3: Approved Workforce"
            columns={['Store', 'Location', 'Approved SM', 'Approved ASM', 'Approved SSA', 'Approved SA', 'Approved OA']}
          />
          <SheetStructure
            title="Sheet 4: Open Positions"
            columns={['ID', 'Store', 'Position', 'Open Date', 'Close Date', 'Status', 'Owner']}
          />
=======
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
        </div>
      </div>

      {/* Formula Logic */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">Google Sheet Formula Guide</h3>
        <div className="space-y-3">
          <FormulaItem
            label="Confirmation Due Date"
            formula='=DOJ_CELL+60'
            note="Add 60 days to DOJ to get confirmation date"
          />
          <FormulaItem
            label="Tenure (Months)"
            formula='=DATEDIF(DOJ_CELL,TODAY(),"M")'
            note="Current tenure in months"
          />
          <FormulaItem
            label="Tenure Bucket"
            formula='=IFS(C2<3,"0-3 Months",C2<6,"3-6 Months",C2<12,"6-12 Months",C2<24,"1-2 Years",TRUE,"2+ Years")'
            note="Where C2 = tenure in months"
          />
          <FormulaItem
            label="Attrition Rate"
            formula='=COUNTIF(Exit!A:A,"*")/(COUNTA(Employees!A:A)+COUNTIF(Exit!A:A,"*"))'
            note="Cross-sheet attrition rate formula"
          />
          <FormulaItem
            label="Confirmation Status"
            formula='=IF(F2="Confirmed","Confirmed",IF(TODAY()>E2,"Overdue","Pending"))'
            note="Where E2 = Confirmation Due Date, F2 = manual Confirmed flag"
          />
        </div>
      </div>

      {/* Setup Guide */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-5">
        <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
          <ExternalLink size={14} />
          Quick Setup Guide
        </h3>
        <ol className="space-y-2 text-sm text-blue-800">
<<<<<<< HEAD
          <li className="flex gap-2"><span className="font-bold w-5 shrink-0">1.</span> Create a Google Sheet with 4 tabs: "Employees", "Exit", "Approved Workforce", and "Open Positions"</li>
=======
          <li className="flex gap-2"><span className="font-bold w-5 shrink-0">1.</span> Create a Google Sheet with 2 tabs: "Employees" and "Exit"</li>
>>>>>>> 29d75573b4d1e324fafe9c6309ac7d5d06fe8dbc
          <li className="flex gap-2"><span className="font-bold w-5 shrink-0">2.</span> Add column headers exactly as shown above (Row 1)</li>
          <li className="flex gap-2"><span className="font-bold w-5 shrink-0">3.</span> Go to Google Cloud Console → Enable Google Sheets API → Create API Key</li>
          <li className="flex gap-2"><span className="font-bold w-5 shrink-0">4.</span> Set the sheet to "Anyone with link can view"</li>
          <li className="flex gap-2"><span className="font-bold w-5 shrink-0">5.</span> Paste Spreadsheet ID and API Key above → Save & Connect</li>
          <li className="flex gap-2"><span className="font-bold w-5 shrink-0">6.</span> Dashboard will auto-sync every 60 seconds</li>
        </ol>
      </div>
    </div>
  );
}

function FormField({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      {children}
      <p className="text-xs text-gray-400 mt-1">{hint}</p>
    </div>
  );
}

function SheetStructure({ title, columns }: { title: string; columns: string[] }) {
  return (
    <div>
      <div className="text-sm font-semibold text-gray-700 mb-2">{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {columns.map((col, i) => (
          <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded font-mono border border-blue-100">
            {col}
          </span>
        ))}
      </div>
    </div>
  );
}

function FormulaItem({ label, formula, note }: { label: string; formula: string; note: string }) {
  return (
    <div className="border border-gray-100 rounded-lg p-3">
      <div className="text-xs font-bold text-gray-700 mb-1">{label}</div>
      <code className="text-xs bg-gray-50 text-blue-700 px-2 py-1 rounded font-mono block break-all">{formula}</code>
      <div className="text-xs text-gray-500 mt-1">{note}</div>
    </div>
  );
}
