import { useState } from 'react';
import { Employee, ExitEmployee } from '../../types/hr';
import SectionCard from '../ui/SectionCard';
import { Download, FileText, Filter, Plus, Trash2 } from 'lucide-react';

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

const FILTER_OPTIONS = ['Store', 'Location', 'Designation', 'Department', 'Status'];

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
      setNewReport(r => ({ ...r, metrics: [...r.metrics, metricId] }));
    }
  };

  const handleRemoveMetric = (metricId: string) => {
    setNewReport(r => ({ ...r, metrics: r.metrics.filter(m => m !== metricId) }));
  };

  const handleSaveReport = () => {
    if (newReport.name && newReport.metrics.length > 0) {
      setSavedReports([...savedReports, newReport]);
      setNewReport({ name: 'New Report', metrics: [], filters: {}, dateRange: 'monthly' });
      setShowBuilder(false);
    }
  };

  const handleExportReport = (report: Report) => {
    const reportData = generateReportData(report, employees, exits);
    const csvContent = convertToCSV(reportData, report);
    downloadCSV(csvContent, `${report.name}.csv`);
  };

  const handleDeleteReport = (index: number) => {
    setSavedReports(savedReports.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Custom Report Builder</h2>
          <p className="text-sm text-gray-600 mt-1">Create and export customized HR reports</p>
        </div>
        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Plus size={18} />
          New Report
        </button>
      </div>

      {showBuilder && (
        <SectionCard title="Build Custom Report">
          <div className="space-y-6">
            {/* Report Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Report Name</label>
              <input
                type="text"
                value={newReport.name}
                onChange={e => setNewReport(r => ({ ...r, name: e.target.value }))}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                placeholder="e.g., Monthly HR Report"
              />
            </div>

            {/* Metrics Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Select Metrics</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AVAILABLE_METRICS.map(metric => (
                  <button
                    key={metric.id}
                    onClick={() => handleAddMetric(metric.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      newReport.metrics.includes(metric.id)
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-gray-600 uppercase">{metric.category}</div>
                    <div className="text-sm font-semibold text-gray-800 mt-1">{metric.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Metrics */}
            {newReport.metrics.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Selected Metrics</label>
                <div className="flex flex-wrap gap-2">
                  {newReport.metrics.map(metricId => {
                    const metric = AVAILABLE_METRICS.find(m => m.id === metricId);
                    return (
                      <div key={metricId} className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <span className="text-sm font-medium text-blue-900">{metric?.name}</span>
                        <button
                          onClick={() => handleRemoveMetric(metricId)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Date Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Report Period</label>
              <select
                value={newReport.dateRange}
                onChange={e => setNewReport(r => ({ ...r, dateRange: e.target.value as any }))}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleSaveReport}
                disabled={!newReport.name || newReport.metrics.length === 0}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Save Report Template
              </button>
              <button
                onClick={() => setShowBuilder(false)}
                className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Saved Reports */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Saved Reports ({savedReports.length})</h3>
        {savedReports.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
            <FileText size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">No reports yet. Create your first custom report!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {savedReports.map((report, idx) => (
              <SectionCard key={idx} title={report.name} subtitle={`${report.metrics.length} metrics`}>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-bold text-gray-600 uppercase mb-2">Metrics</div>
                    <div className="flex flex-wrap gap-2">
                      {report.metrics.map(metricId => {
                        const metric = AVAILABLE_METRICS.find(m => m.id === metricId);
                        return (
                          <span key={metricId} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg">
                            {metric?.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-200 flex gap-2">
                    <button
                      onClick={() => handleExportReport(report)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all"
                    >
                      <Download size={16} />
                      Export
                    </button>
                    <button
                      onClick={() => handleDeleteReport(idx)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 font-semibold rounded-lg transition-all"
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

function generateReportData(report: Report, employees: Employee[], exits: ExitEmployee[]) {
  const data: Record<string, any> = {
    reportName: report.name,
    generatedDate: new Date().toISOString(),
    metrics: {},
  };

  const totalEmployees = employees.length;
  const totalAttrition = exits.length;
  const totalEverEmployed = totalEmployees + totalAttrition;

  report.metrics.forEach(metricId => {
    switch (metricId) {
      case 'total_employees':
        data.metrics['Total Employees'] = totalEmployees;
        break;
      case 'active_employees':
        data.metrics['Active Employees'] = employees.filter(e => e.status === 'Active').length;
        break;
      case 'retention_rate':
        data.metrics['Retention Rate (%)'] = totalEverEmployed > 0 ? ((totalEmployees / totalEverEmployed) * 100).toFixed(2) : 0;
        break;
      case 'attrition_rate':
        data.metrics['Attrition Rate (%)'] = totalEverEmployed > 0 ? ((totalAttrition / totalEverEmployed) * 100).toFixed(2) : 0;
        break;
      case 'new_hires_mtd':
        const today = new Date();
        data.metrics['New Hires (MTD)'] = employees.filter(e => {
          const d = new Date(e.doj);
          return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        }).length;
        break;
      case 'confirmation_rate':
        data.metrics['Confirmation Rate (%)'] = totalEmployees > 0 ? ((employees.filter(e => e.confirmationStatus === 'Confirmed').length / totalEmployees) * 100).toFixed(2) : 0;
        break;
      case 'hdfc_pending':
        data.metrics['HDFC Pending'] = employees.filter(e => e.hdfcAccount === 'No').length;
        break;
      case 'avg_tenure':
        const avgMonths = totalEmployees > 0 ? employees.reduce((sum, e) => sum + parseFloat(e.tenure.match(/\d+/)?.[0] || '0'), 0) / totalEmployees : 0;
        data.metrics['Average Tenure'] = avgMonths.toFixed(1);
        break;
      case 'gender_diversity':
        const males = employees.filter(e => e.gender === 'Male').length;
        const females = employees.filter(e => e.gender === 'Female').length;
        const score = totalEmployees > 0 ? Math.min((Math.abs(males - females) / totalEmployees) * 100, 100) : 0;
        data.metrics['Gender Diversity Score'] = score.toFixed(1);
        break;
      case 'location_count':
        data.metrics['Unique Locations'] = new Set(employees.map(e => e.location)).size;
        break;
    }
  });

  return data;
}

function convertToCSV(reportData: Record<string, any>, report: Report): string {
  const lines: string[] = [];
  lines.push(`Report: ${reportData.reportName}`);
  lines.push(`Generated: ${new Date(reportData.generatedDate).toLocaleString()}`);
  lines.push('');
  lines.push('Metric,Value');
  Object.entries(reportData.metrics).forEach(([key, value]) => {
    lines.push(`"${key}","${value}"`);
  });
  return lines.join('\n');
}

function downloadCSV(content: string, filename: string) {
  const element = document.createElement('a');
  element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(content)}`);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
