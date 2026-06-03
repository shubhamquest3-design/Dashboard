import { useState } from 'react';
import { ApprovedWorkforce as ApprovedWorkforceRow, Employee, ExitEmployee } from '../../types/hr';
import SectionCard from '../ui/SectionCard';
import {
  Building2, CheckCircle2, CreditCard, Download, FileSpreadsheet, Plus,
  Sparkles, Target, TrendingDown, Trash2, Users
} from 'lucide-react';

interface Report {
  name: string;
  metrics: string[];
  filters: Record<string, string>;
  dateRange: 'monthly' | 'quarterly' | 'annual';
}

interface Props {
  employees: Employee[];
  exits: ExitEmployee[];
}

type QuickReportId = 'workforce' | 'attrition' | 'approved' | 'confirmation' | 'hdfc' | 'hiring';
type Bucket = 'SM' | 'ASM' | 'SSA' | 'SA' | 'OA';

interface WorkbookSection {
  title: string;
  headers: string[];
  rows: Array<Array<string | number>>;
}

interface WorkbookExport {
  title: string;
  filename: string;
  sections: WorkbookSection[];
}

const AVAILABLE_METRICS = [
  { id: 'total_employees', name: 'Total Employees', category: 'Headcount' },
  { id: 'active_employees', name: 'Active Employees', category: 'Headcount' },
  { id: 'retention_rate', name: 'Retention Rate (%)', category: 'Attrition' },
  { id: 'attrition_rate', name: 'Attrition Rate (%)', category: 'Attrition' },
  { id: 'new_hires_mtd', name: 'New Hires (MTD)', category: 'Hiring' },
  { id: 'confirmation_rate', name: 'Confirmation Rate (%)', category: 'Confirmation' },
  { id: 'hdfc_pending', name: 'HDFC Account Pending', category: 'Onboarding' },
  { id: 'avg_tenure', name: 'Average Tenure (Months)', category: 'Tenure' },
  { id: 'gender_diversity', name: 'Gender Diversity Score', category: 'Demographics' },
  { id: 'location_count', name: 'Unique Locations', category: 'Distribution' },
];

const QUICK_REPORTS: Array<{
  id: QuickReportId;
  name: string;
  description: string;
  accent: 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'cyan';
}> = [
  { id: 'workforce', name: 'Workforce Report', description: 'Headcount, stores, and designations.', accent: 'blue' },
  { id: 'attrition', name: 'Attrition Report', description: 'Exits, reasons, and trend analysis.', accent: 'rose' },
  { id: 'approved', name: 'Approved Workforce', description: 'Approved vs current by store and designation.', accent: 'amber' },
  { id: 'confirmation', name: 'Confirmation Report', description: 'Confirmed, pending, and overdue employees.', accent: 'emerald' },
  { id: 'hdfc', name: 'HDFC Report', description: 'Account completion and pending onboarding.', accent: 'cyan' },
  { id: 'hiring', name: 'Hiring Report', description: 'Hiring source and monthly intake.', accent: 'indigo' },
];

const APPROVED_STORAGE_KEY = 'approved_workforce_matrix_v1';
const BUCKETS: Bucket[] = ['SM', 'ASM', 'SSA', 'SA', 'OA'];

export default function ReportBuilder({ employees, exits }: Props) {
  const [savedReports, setSavedReports] = useState<Report[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [newReport, setNewReport] = useState<Report>({
    name: 'New Report',
    metrics: [],
    filters: {},
    dateRange: 'monthly',
  });

  const handleAddMetric = (metricId: string) => {
    if (!newReport.metrics.includes(metricId)) {
      setNewReport(report => ({ ...report, metrics: [...report.metrics, metricId] }));
    }
  };

  const handleRemoveMetric = (metricId: string) => {
    setNewReport(report => ({ ...report, metrics: report.metrics.filter(metric => metric !== metricId) }));
  };

  const handleSaveReport = () => {
    if (newReport.name.trim() && newReport.metrics.length > 0) {
      setSavedReports(prev => [...prev, newReport]);
      setNewReport({ name: 'New Report', metrics: [], filters: {}, dateRange: 'monthly' });
      setShowBuilder(false);
    }
  };

  const handleExportReport = (report: Report) => {
    const workbook = buildCustomReportWorkbook(report, employees, exits);
    downloadWorkbook(workbook);
  };

  const handleQuickExport = (reportId: QuickReportId) => {
    const workbook = buildQuickReportWorkbook(reportId, employees, exits);
    downloadWorkbook(workbook);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[#e5d8bf] bg-[#fffdf8] px-6 py-5 shadow-[0_10px_24px_rgba(62,44,23,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#9a8052]">Report Builder</p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-[#1f160d]">Excel reports linked to the dashboard</h2>
            <p className="mt-1 text-sm font-medium text-[#8a7553]">
              Download workforce, attrition, approved workforce, confirmation, HDFC, and hiring reports as Excel-readable workbooks.
            </p>
          </div>
          <button
            onClick={() => setShowBuilder(value => !value)}
            className="flex items-center gap-2 rounded-lg border border-[#c8a43d] bg-[#c8a43d] px-5 py-2.5 text-sm font-bold text-[#15110d] shadow-sm transition-all duration-200 hover:bg-[#b9932c]"
          >
            <Plus size={18} />
            New Report
          </button>
        </div>
      </div>

      <SectionCard
        title="Ready-made Excel Reports"
        subtitle="One-click downloads linked to the live dashboard data"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {QUICK_REPORTS.map(report => (
            <button
              key={report.id}
              onClick={() => handleQuickExport(report.id)}
              className="group flex h-full flex-col justify-between rounded-lg border border-[#e5d8bf] bg-[#fffdf8] p-4 text-left shadow-[0_8px_20px_rgba(62,44,23,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(62,44,23,0.12)]"
            >
              <div className="flex items-start gap-3">
                <QuickIcon id={report.id} />
                <div className="min-w-0">
                  <div className="text-base font-bold text-[#1f160d]">{report.name}</div>
                  <div className="mt-1 text-sm font-medium text-[#8a7553]">{report.description}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[#eee4d0] pt-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f7f1e7] px-2.5 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#6d5520]">
                  <Download size={12} />
                  XLS
                </span>
                <span className="text-xs font-bold text-[#9d8240] group-hover:text-[#1f160d]">Download</span>
              </div>
            </button>
          ))}
        </div>
      </SectionCard>

      {showBuilder && (
        <SectionCard title="Build Custom Report" subtitle="Select metrics and export the result as Excel">
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#4f3d24]">Report Name</label>
              <input
                type="text"
                value={newReport.name}
                onChange={event => setNewReport(report => ({ ...report, name: event.target.value }))}
                className="w-full rounded-lg border-2 border-[#e1d3b6] bg-[#fffdf8] px-4 py-2.5 font-medium text-[#4f3d24] focus:outline-none focus:border-[#c8a43d]"
                placeholder="e.g., Monthly HR Report"
              />
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-[#4f3d24]">Select Metrics</label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {AVAILABLE_METRICS.map(metric => (
                  <button
                    key={metric.id}
                    onClick={() => handleAddMetric(metric.id)}
                    className={`rounded-lg border-2 p-3 text-left transition-all ${
                      newReport.metrics.includes(metric.id)
                        ? 'border-[#c8a43d] bg-[#fbf3d5]'
                        : 'border-[#e1d3b6] bg-[#fffdf8] hover:border-[#c8a43d]'
                    }`}
                  >
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#9a8052]">{metric.category}</div>
                    <div className="mt-1 text-sm font-bold text-[#1f160d]">{metric.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {newReport.metrics.length > 0 && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#4f3d24]">Selected Metrics</label>
                <div className="flex flex-wrap gap-2">
                  {newReport.metrics.map(metricId => {
                    const metric = AVAILABLE_METRICS.find(item => item.id === metricId);
                    return (
                      <div key={metricId} className="flex items-center gap-2 rounded-lg border border-[#e1d3b6] bg-[#fffdf8] px-3 py-2">
                        <span className="text-sm font-semibold text-[#1f160d]">{metric?.name}</span>
                        <button
                          onClick={() => handleRemoveMetric(metricId)}
                          className="text-[#9b332a] hover:text-[#7d261f]"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#4f3d24]">Report Period</label>
              <select
                value={newReport.dateRange}
                onChange={event => setNewReport(report => ({ ...report, dateRange: event.target.value as Report['dateRange'] }))}
                className="w-full rounded-lg border-2 border-[#e1d3b6] bg-[#fffdf8] px-4 py-2.5 font-medium text-[#4f3d24] focus:outline-none focus:border-[#c8a43d]"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </div>

            <div className="flex gap-3 border-t border-[#eee4d0] pt-4">
              <button
                onClick={handleSaveReport}
                disabled={!newReport.name.trim() || newReport.metrics.length === 0}
                className="flex-1 rounded-lg bg-[#1f75a8] px-4 py-2.5 font-semibold text-white transition-all hover:bg-[#185e88] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Report Template
              </button>
              <button
                onClick={() => setShowBuilder(false)}
                className="flex-1 rounded-lg border border-[#e1d3b6] bg-white px-4 py-2.5 font-semibold text-[#4f3d24] transition-all hover:bg-[#fbf6eb]"
              >
                Cancel
              </button>
            </div>
          </div>
        </SectionCard>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#1f160d]">Saved Reports ({savedReports.length})</h3>
        {savedReports.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[#d9c8a8] bg-[#fffdf8] py-12 text-center">
            <FileSpreadsheet size={40} className="mx-auto mb-3 text-[#c0ae86]" />
            <p className="font-medium text-[#6f6253]">No reports yet. Create your first custom report.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {savedReports.map((report, index) => (
              <SectionCard key={`${report.name}-${index}`} title={report.name} subtitle={`${report.metrics.length} metrics`}>
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#9a8052]">Metrics</div>
                    <div className="flex flex-wrap gap-2">
                      {report.metrics.map(metricId => {
                        const metric = AVAILABLE_METRICS.find(item => item.id === metricId);
                        return (
                          <span key={metricId} className="rounded-lg bg-[#fbf3d5] px-2.5 py-1 text-xs font-semibold text-[#6d5520]">
                            {metric?.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex gap-2 border-t border-[#eee4d0] pt-3">
                    <button
                      onClick={() => handleExportReport(report)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#24945f] px-3 py-2 font-semibold text-white transition-all hover:bg-[#1f7d4e]"
                    >
                      <Download size={16} />
                      Export Excel
                    </button>
                    <button
                      onClick={() => setSavedReports(prev => prev.filter((_, savedIndex) => savedIndex !== index))}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#fef2f2] px-3 py-2 font-semibold text-[#b9342b] transition-all hover:bg-[#fde8e8]"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </SectionCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function buildCustomReportWorkbook(report: Report, employees: Employee[], exits: ExitEmployee[]): WorkbookExport {
  const summary: Array<[string, string | number]> = [];
  const totalEmployees = employees.length;
  const totalAttrition = exits.length;
  const totalEverEmployed = totalEmployees + totalAttrition;

  report.metrics.forEach(metricId => {
    switch (metricId) {
      case 'total_employees':
        summary.push(['Total Employees', totalEmployees]);
        break;
      case 'active_employees':
        summary.push(['Active Employees', employees.filter(employee => employee.status === 'Active').length]);
        break;
      case 'retention_rate':
        summary.push(['Retention Rate (%)', totalEverEmployed > 0 ? ((totalEmployees / totalEverEmployed) * 100).toFixed(2) : '0.00']);
        break;
      case 'attrition_rate':
        summary.push(['Attrition Rate (%)', totalEverEmployed > 0 ? ((totalAttrition / totalEverEmployed) * 100).toFixed(2) : '0.00']);
        break;
      case 'new_hires_mtd':
        summary.push(['New Hires (MTD)', getNewHiresMTD(employees)]);
        break;
      case 'confirmation_rate':
        summary.push(['Confirmation Rate (%)', totalEmployees > 0 ? ((employees.filter(employee => employee.confirmationStatus === 'Confirmed').length / totalEmployees) * 100).toFixed(2) : '0.00']);
        break;
      case 'hdfc_pending':
        summary.push(['HDFC Pending', employees.filter(employee => employee.hdfcAccount === 'No').length]);
        break;
      case 'avg_tenure':
        summary.push(['Average Tenure (Months)', getAverageTenure(employees).toFixed(1)]);
        break;
      case 'gender_diversity':
        summary.push(['Gender Diversity Score', getGenderDiversityScore(employees).toFixed(1)]);
        break;
      case 'location_count':
        summary.push(['Unique Locations', new Set(employees.map(employee => employee.location)).size]);
        break;
      default:
        break;
    }
  });

  return {
    title: report.name,
    filename: `${slugify(report.name)}.xls`,
    sections: [
      {
        title: 'Report Summary',
        headers: ['Metric', 'Value'],
        rows: summary,
      },
      {
        title: 'Report Settings',
        headers: ['Field', 'Value'],
        rows: [
          ['Generated', new Date().toLocaleString()],
          ['Period', report.dateRange],
          ['Selected Metrics', report.metrics.length],
        ],
      },
    ],
  };
}

function buildQuickReportWorkbook(reportId: QuickReportId, employees: Employee[], exits: ExitEmployee[]): WorkbookExport {
  switch (reportId) {
    case 'workforce':
      return buildWorkforceWorkbook(employees);
    case 'attrition':
      return buildAttritionWorkbook(employees, exits);
    case 'approved':
      return buildApprovedWorkforceWorkbook(employees);
    case 'confirmation':
      return buildConfirmationWorkbook(employees);
    case 'hdfc':
      return buildHdfcWorkbook(employees);
    case 'hiring':
      return buildHiringWorkbook(employees);
    default:
      return buildWorkforceWorkbook(employees);
  }
}

function buildWorkforceWorkbook(employees: Employee[]): WorkbookExport {
  const active = employees.filter(employee => employee.status === 'Active').length;
  const onLeave = employees.filter(employee => employee.status === 'On Leave').length;
  const inactive = employees.filter(employee => employee.status === 'Inactive').length;
  const storeSummary = buildStoreSummary(employees);
  const designationSummary = buildDesignationSummary(employees);
  const monthlyJoining = buildMonthlyJoining(employees);

  return {
    title: 'Workforce Report',
    filename: 'workforce-report.xls',
    sections: [
      {
        title: 'Workforce Summary',
        headers: ['Metric', 'Value'],
        rows: [
          ['Total Workforce', employees.length],
          ['Active Employees', active],
          ['On Leave', onLeave],
          ['Inactive Employees', inactive],
          ['Unique Stores', new Set(employees.map(employee => employee.store)).size],
          ['Unique Locations', new Set(employees.map(employee => employee.location)).size],
          ['Unique Designations', new Set(employees.map(employee => employee.designation)).size],
        ],
      },
      {
        title: 'Store-wise Headcount',
        headers: ['Store', 'Total', 'Active', 'On Leave', 'Inactive', 'Male', 'Female'],
        rows: storeSummary.map(row => [row.store, row.total, row.active, row.onLeave, row.inactive, row.male, row.female]),
      },
      {
        title: 'Designation-wise Headcount',
        headers: ['Designation', 'Total', 'Active'],
        rows: designationSummary.map(row => [row.name, row.total, row.active]),
      },
      {
        title: 'Monthly Joining Trend',
        headers: ['Month', 'New Joins'],
        rows: monthlyJoining.map(row => [row.month, row.count]),
      },
    ],
  };
}

function buildAttritionWorkbook(employees: Employee[], exits: ExitEmployee[]): WorkbookExport {
  const totalLeft = exits.length;
  const voluntary = exits.filter(exit => exit.exitType === 'Voluntary').length;
  const nonVoluntary = exits.filter(exit => exit.exitType === 'Non-Voluntary').length;
  const totalEverEmployed = employees.length + totalLeft;
  const attritionRate = totalEverEmployed > 0 ? ((totalLeft / totalEverEmployed) * 100).toFixed(2) : '0.00';
  const retentionRate = totalEverEmployed > 0 ? ((employees.length / totalEverEmployed) * 100).toFixed(2) : '0.00';

  return {
    title: 'Attrition Report',
    filename: 'attrition-report.xls',
    sections: [
      {
        title: 'Attrition Summary',
        headers: ['Metric', 'Value'],
        rows: [
          ['Total Exits', totalLeft],
          ['Voluntary Exits', voluntary],
          ['Non-Voluntary Exits', nonVoluntary],
          ['Attrition Rate (%)', attritionRate],
          ['Retention Rate (%)', retentionRate],
          ['Average Tenure at Exit (Months)', getAverageExitTenure(exits).toFixed(1)],
        ],
      },
      {
        title: 'Monthly Attrition Trend',
        headers: ['Month', 'Exits'],
        rows: buildMonthlyAttrition(exits).map(row => [row.month, row.exits]),
      },
      {
        title: 'Store-wise Attrition',
        headers: ['Store', 'Exits', 'Voluntary', 'Non-Voluntary'],
        rows: buildStoreAttrition(exits).map(row => [row.store, row.total, row.voluntary, row.nonVoluntary]),
      },
      {
        title: 'Exit Reasons',
        headers: ['Reason', 'Count'],
        rows: groupCount(exits, 'exitReason').map(row => [row.name, row.count]),
      },
      {
        title: 'Exit Register',
        headers: ['ID', 'Name', 'Store', 'Designation', 'DOL', 'Type', 'Reason', 'Tenure (Months)'],
        rows: exits.map(exit => [exit.id, exit.name, exit.store, exit.designation, exit.dol, exit.exitType, exit.exitReason, exit.tenureAtExit]),
      },
    ],
  };
}

function buildApprovedWorkforceWorkbook(employees: Employee[]): WorkbookExport {
  const approvedRows = loadApprovedRows();
  const approvedData = approvedRows.length > 0 ? approvedRows : buildApprovedRowsFromActual(employees);
  const matrix = buildApprovedMatrix(employees, approvedData);
  const storeSummary = summarizeApprovedByStore(matrix);
  const designationSummary = summarizeApprovedByDesignation(matrix);
  const staffed = storeSummary.filter(row => row.status === 'staffed').length;
  const under = storeSummary.filter(row => row.status === 'understaffed').length;
  const over = storeSummary.filter(row => row.status === 'overstaffed').length;

  return {
    title: 'Approved Workforce',
    filename: 'approved-workforce-report.xls',
    sections: [
      {
        title: 'Approved Workforce Summary',
        headers: ['Metric', 'Value'],
        rows: [
          ['Approved Total', matrix.reduce((sum, row) => sum + totalApproved(row), 0)],
          ['Current Total', matrix.reduce((sum, row) => sum + totalCurrent(row), 0)],
          ['Position GAP', formatGap(matrix.reduce((sum, row) => sum + (totalCurrent(row) - totalApproved(row)), 0))],
          ['100% Staffed Stores', staffed],
          ['Understaffed Stores', under],
          ['Overstaffed Stores', over],
        ],
      },
      {
        title: 'Store-wise Approved vs Current',
        headers: ['Store', 'Location', 'Approved SM', 'Approved ASM', 'Approved SSA', 'Approved SA', 'Approved OA', 'Approved Total', 'Current SM', 'Current ASM', 'Current SSA', 'Current SA', 'Current OA', 'Current Total', 'Position GAP', 'Status'],
        rows: matrix.map(row => [
          row.store,
          row.location,
          row.approved.SM,
          row.approved.ASM,
          row.approved.SSA,
          row.approved.SA,
          row.approved.OA,
          totalApproved(row),
          row.current.SM,
          row.current.ASM,
          row.current.SSA,
          row.current.SA,
          row.current.OA,
          totalCurrent(row),
          totalCurrent(row) - totalApproved(row),
          statusFromGap(totalCurrent(row) - totalApproved(row)),
        ]),
      },
      {
        title: 'Designation Gap Overview',
        headers: ['Designation', 'Approved', 'Current', 'Gap', 'Status'],
        rows: designationSummary.map(row => [row.name, row.approved, row.current, row.gap, row.status]),
      },
      {
        title: 'Store Gap Overview',
        headers: ['Store', 'Approved', 'Current', 'Gap', 'Status'],
        rows: storeSummary.map(row => [row.name, row.approved, row.current, row.gap, row.status]),
      },
    ],
  };
}

function buildConfirmationWorkbook(employees: Employee[]): WorkbookExport {
  const confirmed = employees.filter(employee => employee.confirmationStatus === 'Confirmed');
  const pending = employees.filter(employee => employee.confirmationStatus === 'Pending');
  const overdue = employees.filter(employee => employee.confirmationStatus === 'Overdue');
  const dueThisWeek = pending.filter(employee => {
    const diff = (new Date(employee.confirmationDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  return {
    title: 'Confirmation Report',
    filename: 'confirmation-report.xls',
    sections: [
      {
        title: 'Confirmation Summary',
        headers: ['Metric', 'Value'],
        rows: [
          ['Confirmed', confirmed.length],
          ['Pending', pending.length],
          ['Overdue', overdue.length],
          ['Due This Week', dueThisWeek.length],
          ['Due This Month', pending.filter(employee => isSameMonth(new Date(employee.confirmationDueDate), new Date())).length],
        ],
      },
      {
        title: 'Store-wise Pending & Overdue',
        headers: ['Store', 'Pending', 'Overdue', 'Total Action Required'],
        rows: buildConfirmationStoreSummary(employees).map(row => [row.store, row.pending, row.overdue, row.pending + row.overdue]),
      },
      {
        title: 'Overdue Confirmations',
        headers: ['ID', 'Name', 'Store', 'DOJ', 'Due Date', 'HRBP', 'Manager'],
        rows: overdue.map(employee => [employee.id, employee.name, employee.store, employee.doj, employee.confirmationDueDate, employee.hrbpName, employee.reportingManager]),
      },
      {
        title: 'Upcoming Confirmations',
        headers: ['ID', 'Name', 'Store', 'DOJ', 'Due Date', 'HRBP', 'Manager'],
        rows: pending.map(employee => [employee.id, employee.name, employee.store, employee.doj, employee.confirmationDueDate, employee.hrbpName, employee.reportingManager]),
      },
    ],
  };
}

function buildHdfcWorkbook(employees: Employee[]): WorkbookExport {
  const completed = employees.filter(employee => employee.hdfcAccount === 'Yes');
  const pending = employees.filter(employee => employee.hdfcAccount === 'No');
  const completionPct = employees.length > 0 ? ((completed.length / employees.length) * 100).toFixed(2) : '0.00';

  return {
    title: 'HDFC Report',
    filename: 'hdfc-report.xls',
    sections: [
      {
        title: 'HDFC Summary',
        headers: ['Metric', 'Value'],
        rows: [
          ['Accounts Completed', completed.length],
          ['Accounts Pending', pending.length],
          ['Completion Rate (%)', completionPct],
          ['Stores Affected', buildHdfcStoreSummary(employees).filter(row => row.pending > 0).length],
        ],
      },
      {
        title: 'Store-wise HDFC Status',
        headers: ['Store', 'Completed', 'Pending', 'Total', 'Completion %'],
        rows: buildHdfcStoreSummary(employees).map(row => [row.store, row.completed, row.pending, row.total, row.total > 0 ? ((row.completed / row.total) * 100).toFixed(1) : '0.0']),
      },
      {
        title: 'Pending Employees',
        headers: ['ID', 'Name', 'Store', 'Location', 'Designation', 'DOJ', 'HRBP'],
        rows: pending.map(employee => [employee.id, employee.name, employee.store, employee.location, employee.designation, employee.doj, employee.hrbpName]),
      },
    ],
  };
}

function buildHiringWorkbook(employees: Employee[]): WorkbookExport {
  const sourceSummary = groupCount(employees, 'hiringSource');
  const monthlyJoining = buildMonthlyJoining(employees);
  const currentMonthCount = getNewHiresMTD(employees);
  const hiringCycle = buildHiringCycle(employees, exits);
  const avgOpenDays = hiringCycle.length > 0 ? Math.round(hiringCycle.reduce((sum, row) => sum + row.daysOpen, 0) / hiringCycle.length) : 0;

  return {
    title: 'Hiring Report',
    filename: 'hiring-report.xls',
    sections: [
      {
        title: 'Hiring Summary',
        headers: ['Metric', 'Value'],
        rows: [
          ['Total Employees', employees.length],
          ['New Hires (MTD)', currentMonthCount],
          ['Unique Hiring Sources', sourceSummary.length],
          ['Unique Stores', new Set(employees.map(employee => employee.store)).size],
        ],
      },
      {
        title: 'Hiring Source Breakdown',
        headers: ['Hiring Source', 'Count', 'Share %'],
        rows: sourceSummary.map(row => [row.name, row.count, employees.length > 0 ? ((row.count / employees.length) * 100).toFixed(1) : '0.0']),
      },
      {
        title: 'Monthly Hiring Trend',
        headers: ['Month', 'New Joins'],
        rows: monthlyJoining.map(row => [row.month, row.count]),
      },
      {
        title: 'Position Open / Close Days',
        headers: ['Employee Name', 'Store', 'Designation', 'Open Date', 'Close Date', 'Status', 'Days Open'],
        rows: hiringCycle.map(row => [row.name, row.store, row.designation, row.openDate, row.closeDate, row.status, row.daysOpen]),
      },
      {
        title: 'Hiring Cycle Summary',
        headers: ['Metric', 'Value'],
        rows: [
          ['Average Open Days', avgOpenDays],
          ['Open Positions', hiringCycle.filter(row => row.status === 'Open').length],
          ['Closed Positions', hiringCycle.filter(row => row.status === 'Closed').length],
        ],
      },
    ],
  };
}

function buildApprovedRowsFromActual(employees: Employee[]): ApprovedWorkforceRow[] {
  const map = new Map<string, ApprovedWorkforceRow>();
  employees
    .filter(employee => employee.status === 'Active')
    .forEach(employee => {
      const key = keyFor(employee.store, employee.location);
      const row = map.get(key) ?? {
        id: key,
        store: employee.store,
        location: employee.location,
        approvedSM: 0,
        approvedASM: 0,
        approvedSSA: 0,
        approvedSA: 0,
        approvedOA: 0,
      };
      const bucket = classifyBucket(employee.designation);
      switch (bucket) {
        case 'SM':
          row.approvedSM += 1;
          break;
        case 'ASM':
          row.approvedASM += 1;
          break;
        case 'SSA':
          row.approvedSSA += 1;
          break;
        case 'SA':
          row.approvedSA += 1;
          break;
        case 'OA':
          row.approvedOA += 1;
          break;
      }
      map.set(key, row);
    });
  return Array.from(map.values());
}

function buildApprovedMatrix(employees: Employee[], approvedRows: ApprovedWorkforceRow[]) {
  const map = new Map<string, {
    store: string;
    location: string;
    approved: Record<Bucket, number>;
    current: Record<Bucket, number>;
  }>();

  approvedRows.forEach(row => {
    const key = keyFor(row.store, row.location || '');
    map.set(key, {
      store: row.store,
      location: row.location || '',
      approved: {
        SM: row.approvedSM,
        ASM: row.approvedASM,
        SSA: row.approvedSSA,
        SA: row.approvedSA,
        OA: row.approvedOA,
      },
      current: buildCurrentByBucket(employees, row.store, row.location || ''),
    });
  });

  if (map.size === 0) {
    buildApprovedRowsFromActual(employees).forEach(row => {
      const key = keyFor(row.store, row.location || '');
      map.set(key, {
        store: row.store,
        location: row.location || '',
        approved: {
          SM: row.approvedSM,
          ASM: row.approvedASM,
          SSA: row.approvedSSA,
          SA: row.approvedSA,
          OA: row.approvedOA,
        },
        current: buildCurrentByBucket(employees, row.store, row.location || ''),
      });
    });
  }

  return Array.from(map.values()).sort((a, b) => a.store.localeCompare(b.store));
}

function buildCurrentByBucket(employees: Employee[], store: string, location: string) {
  const buckets: Record<Bucket, number> = { SM: 0, ASM: 0, SSA: 0, SA: 0, OA: 0 };
  employees
    .filter(employee => employee.status === 'Active' && employee.store === store && (!location || employee.location === location))
    .forEach(employee => {
      buckets[classifyBucket(employee.designation)] += 1;
    });
  return buckets;
}

function summarizeApprovedByStore(rows: Array<{ store: string; location: string; approved: Record<Bucket, number>; current: Record<Bucket, number> }>) {
  return rows.map(row => {
    const approved = totalApproved(row);
    const current = totalCurrent(row);
    const gap = current - approved;
    return {
      name: row.store,
      approved,
      current,
      gap,
      status: statusFromGap(gap),
    };
  });
}

function summarizeApprovedByDesignation(rows: Array<{ approved: Record<Bucket, number>; current: Record<Bucket, number> }>) {
  return BUCKETS.map(bucket => {
    const approved = rows.reduce((sum, row) => sum + row.approved[bucket], 0);
    const current = rows.reduce((sum, row) => sum + row.current[bucket], 0);
    const gap = current - approved;
    return {
      name: bucket,
      approved,
      current,
      gap,
      status: statusFromGap(gap),
    };
  });
}

function loadApprovedRows(): ApprovedWorkforceRow[] {
  try {
    const raw = window.localStorage.getItem(APPROVED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ApprovedWorkforceRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildStoreSummary(employees: Employee[]) {
  const map: Record<string, { store: string; total: number; active: number; onLeave: number; inactive: number; male: number; female: number }> = {};
  employees.forEach(employee => {
    if (!map[employee.store]) {
      map[employee.store] = { store: employee.store, total: 0, active: 0, onLeave: 0, inactive: 0, male: 0, female: 0 };
    }
    map[employee.store].total++;
    if (employee.status === 'Active') map[employee.store].active++;
    if (employee.status === 'On Leave') map[employee.store].onLeave++;
    if (employee.status === 'Inactive') map[employee.store].inactive++;
    if (employee.gender === 'Male') map[employee.store].male++;
    if (employee.gender === 'Female') map[employee.store].female++;
  });
  return Object.values(map).sort((a, b) => b.total - a.total);
}

function buildDesignationSummary(employees: Employee[]) {
  const map: Record<string, { name: string; total: number; active: number }> = {};
  employees.forEach(employee => {
    if (!map[employee.designation]) {
      map[employee.designation] = { name: employee.designation, total: 0, active: 0 };
    }
    map[employee.designation].total++;
    if (employee.status === 'Active') map[employee.designation].active++;
  });
  return Object.values(map).sort((a, b) => b.total - a.total);
}

function buildMonthlyJoining(employees: Employee[]) {
  const months: Record<string, { month: string; count: number }> = {};
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months[key] = { month: d.toLocaleString('default', { month: 'short', year: '2-digit' }), count: 0 };
  }
  employees.forEach(employee => {
    const key = employee.doj.substring(0, 7);
    if (months[key]) months[key].count++;
  });
  return Object.values(months);
}

function buildMonthlyAttrition(exits: ExitEmployee[]) {
  const months: Record<string, { month: string; exits: number }> = {};
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months[key] = { month: d.toLocaleString('default', { month: 'short', year: '2-digit' }), exits: 0 };
  }
  exits.forEach(exit => {
    const key = exit.dol.substring(0, 7);
    if (months[key]) months[key].exits++;
  });
  return Object.values(months);
}

function buildStoreAttrition(exits: ExitEmployee[]) {
  const map: Record<string, { store: string; total: number; voluntary: number; nonVoluntary: number }> = {};
  exits.forEach(exit => {
    if (!map[exit.store]) {
      map[exit.store] = { store: exit.store, total: 0, voluntary: 0, nonVoluntary: 0 };
    }
    map[exit.store].total++;
    if (exit.exitType === 'Voluntary') map[exit.store].voluntary++;
    else map[exit.store].nonVoluntary++;
  });
  return Object.values(map).sort((a, b) => b.total - a.total);
}

function buildConfirmationStoreSummary(employees: Employee[]) {
  const map: Record<string, { store: string; pending: number; overdue: number }> = {};
  employees.forEach(employee => {
    if (!map[employee.store]) {
      map[employee.store] = { store: employee.store, pending: 0, overdue: 0 };
    }
    if (employee.confirmationStatus === 'Pending') map[employee.store].pending++;
    if (employee.confirmationStatus === 'Overdue') map[employee.store].overdue++;
  });
  return Object.values(map).sort((a, b) => (b.pending + b.overdue) - (a.pending + a.overdue));
}

function buildHdfcStoreSummary(employees: Employee[]) {
  const map: Record<string, { store: string; completed: number; pending: number; total: number }> = {};
  employees.forEach(employee => {
    if (!map[employee.store]) {
      map[employee.store] = { store: employee.store, completed: 0, pending: 0, total: 0 };
    }
    map[employee.store].total++;
    if (employee.hdfcAccount === 'Yes') map[employee.store].completed++;
    else map[employee.store].pending++;
  });
  return Object.values(map).sort((a, b) => b.pending - a.pending);
}

function buildHiringCycle(employees: Employee[], exits: ExitEmployee[]) {
  const exitMap = new Map(exits.map(exit => [exit.id, exit]));
  const today = new Date();
  return employees.map(employee => {
    const exit = exitMap.get(employee.id);
    const closeDate = exit?.dol || '';
    const endDate = closeDate ? new Date(closeDate) : today;
    return {
      name: employee.name,
      store: employee.store,
      designation: employee.designation,
      openDate: employee.doj,
      closeDate: closeDate || 'Open',
      status: closeDate ? 'Closed' : 'Open',
      daysOpen: Math.max(0, Math.round((endDate.getTime() - new Date(employee.doj).getTime()) / (1000 * 60 * 60 * 24))),
    };
  }).sort((a, b) => b.daysOpen - a.daysOpen);
}

function groupCount<T extends Record<string, unknown>>(arr: T[], key: keyof T) {
  const map: Record<string, number> = {};
  arr.forEach(row => {
    const value = String(row[key]);
    map[value] = (map[value] || 0) + 1;
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}

function getAverageExitTenure(exits: ExitEmployee[]) {
  if (exits.length === 0) return 0;
  return exits.reduce((sum, exit) => sum + exit.tenureAtExit, 0) / exits.length;
}

function getAverageTenure(employees: Employee[]) {
  if (employees.length === 0) return 0;
  const totalMonths = employees.reduce((sum, employee) => sum + parseFloat(employee.tenure.match(/\d+/)?.[0] || '0'), 0);
  return totalMonths / employees.length;
}

function getGenderDiversityScore(employees: Employee[]) {
  const males = employees.filter(employee => employee.gender === 'Male').length;
  const females = employees.filter(employee => employee.gender === 'Female').length;
  return employees.length > 0 ? Math.min((Math.abs(males - females) / employees.length) * 100, 100) : 0;
}

function getNewHiresMTD(employees: Employee[]) {
  const today = new Date();
  return employees.filter(employee => {
    const doj = new Date(employee.doj);
    return doj.getMonth() === today.getMonth() && doj.getFullYear() === today.getFullYear();
  }).length;
}

function totalApproved(row: { approved: Record<Bucket, number> }) {
  return BUCKETS.reduce((sum, bucket) => sum + row.approved[bucket], 0);
}

function totalCurrent(row: { current: Record<Bucket, number> }) {
  return BUCKETS.reduce((sum, bucket) => sum + row.current[bucket], 0);
}

function classifyBucket(designation: string): Bucket {
  const value = designation.trim().toLowerCase();
  if (value.includes('store manager') || value === 'sm') return 'SM';
  if (value.includes('assistant manager') || value === 'asm') return 'ASM';
  if (value.includes('security') || value.includes('merchand') || value.includes('visual') || value.includes('hr executive')) return 'SSA';
  if (value.includes('cashier') || value === 'sa' || value.includes('sales associate')) return 'SA';
  return 'OA';
}

function statusFromGap(gap: number) {
  if (gap === 0) return 'staffed' as const;
  if (gap < 0) return 'understaffed' as const;
  return 'overstaffed' as const;
}

function formatGap(value: number) {
  if (value > 0) return `+${value}`;
  return String(value);
}

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'report';
}

function keyFor(store: string, location: string) {
  return `${store.trim().toLowerCase()}__${location.trim().toLowerCase()}`;
}

function isSameMonth(a: Date, b: Date) {
  return a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

function buildWorkbookHtml(title: string, sections: WorkbookSection[]) {
  const renderedSections = sections.map(section => `
    <div class="section">
      <h2>${escapeHtml(section.title)}</h2>
      <table>
        <thead>
          <tr>${section.headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${
            section.rows.length > 0
              ? section.rows.map(row => `<tr>${row.map(cell => `<td>${escapeHtml(String(cell))}</td>`).join('')}</tr>`).join('')
              : `<tr><td colspan="${Math.max(section.headers.length, 1)}">No data</td></tr>`
          }
        </tbody>
      </table>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #1f160d; }
    h1 { margin: 0 0 6px; font-size: 22px; }
    .meta { margin-bottom: 16px; color: #6f6253; font-size: 12px; }
    .section { margin-top: 18px; }
    .section h2 { margin: 0 0 8px; font-size: 15px; color: #4f3d24; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #d9c8a8; padding: 8px 10px; font-size: 12px; text-align: left; }
    th { background: #f7f1e7; font-weight: 700; }
    td { background: #fffdf8; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <div class="meta">Generated ${escapeHtml(new Date().toLocaleString())}</div>
  ${renderedSections}
</body>
</html>`;
}

function downloadWorkbook(workbook: WorkbookExport) {
  const html = buildWorkbookHtml(workbook.title, workbook.sections);
  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = workbook.filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function QuickIcon({ id }: { id: QuickReportId }) {
  const base = 'w-10 h-10 rounded-lg flex items-center justify-center shrink-0';
  switch (id) {
    case 'workforce':
      return <div className={`${base} bg-blue-50 text-blue-700`}><Users size={18} /></div>;
    case 'attrition':
      return <div className={`${base} bg-rose-50 text-rose-700`}><TrendingDown size={18} /></div>;
    case 'approved':
      return <div className={`${base} bg-amber-50 text-amber-700`}><Building2 size={18} /></div>;
    case 'confirmation':
      return <div className={`${base} bg-emerald-50 text-emerald-700`}><CheckCircle2 size={18} /></div>;
    case 'hdfc':
      return <div className={`${base} bg-cyan-50 text-cyan-700`}><CreditCard size={18} /></div>;
    case 'hiring':
      return <div className={`${base} bg-indigo-50 text-indigo-700`}><Target size={18} /></div>;
    default:
      return <div className={`${base} bg-slate-50 text-slate-700`}><Sparkles size={18} /></div>;
  }
}
