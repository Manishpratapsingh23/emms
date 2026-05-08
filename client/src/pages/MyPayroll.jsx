import { useState, useEffect } from 'react';
import { payrollService } from '../services/payrollService';
import toast from 'react-hot-toast';
import { FiDownload } from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MyPayroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayrolls = async () => {
    try {
      const data = await payrollService.getMyPayrolls();
      setPayrolls(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch payrolls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const handleDownloadPDF = (payroll) => {
    try {
      const doc = new jsPDF();
      const monthYear = new Date(`${payroll.year}-${payroll.month}-01`).toLocaleString('default', { month: 'long', year: 'numeric' });
      
      // Add Title and Branding
      doc.setFontSize(22);
      doc.setTextColor(79, 70, 229); // Primary indigo
      doc.text('WorkWise AI', 105, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setTextColor(50, 50, 50);
      doc.text('Salary Slip', 105, 30, { align: 'center' });
      
      // Employee Info
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(`Employee Name: ${payroll.employee?.name || 'N/A'}`, 14, 45);
      doc.text(`Email: ${payroll.employee?.email || 'N/A'}`, 14, 52);
      doc.text(`Designation: ${payroll.employee?.designation || 'N/A'}`, 14, 59);
      
      doc.text(`Salary Month: ${monthYear}`, 120, 45);
      doc.text(`Payment Status: ${payroll.paymentStatus.toUpperCase()}`, 120, 52);
      if (payroll.paymentDate) {
        doc.text(`Payment Date: ${new Date(payroll.paymentDate).toLocaleDateString()}`, 120, 59);
      }
      
      // Add Table
      const tableData = [
        ['Basic Salary', `$${payroll.basicSalary.toLocaleString()}`],
        ['Bonus', `+$${payroll.bonus.toLocaleString()}`],
        ['Deductions', `-$${payroll.deductions.toLocaleString()}`],
      ];

      autoTable(doc, {
        startY: 70,
        head: [['Description', 'Amount']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }, // Indigo
        foot: [['Net Payable', `$${payroll.netSalary.toLocaleString()}`]],
        footStyles: { fillColor: [20, 184, 166] }, // Teal
        margin: { top: 10 }
      });

      // Footer
      const finalY = doc.lastAutoTable?.finalY || 150;
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('This is a computer-generated document. No signature is required.', 105, finalY + 20, { align: 'center' });

      doc.save(`Salary_Slip_${monthYear.replace(' ', '_')}.pdf`);
      toast.success('PDF Downloaded');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate PDF');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Payroll</h1>
        <p className="text-gray-600">View and download your salary slips</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Month/Year</th>
                <th>Basic Salary</th>
                <th>Bonus</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map((payroll) => (
                <tr key={payroll._id}>
                  <td className="font-medium text-gray-800">
                    {new Date(`${payroll.year}-${payroll.month}-01`).toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </td>
                  <td>${payroll.basicSalary.toLocaleString()}</td>
                  <td>${payroll.bonus.toLocaleString()}</td>
                  <td>${payroll.deductions.toLocaleString()}</td>
                  <td className="font-bold text-green-600">${payroll.netSalary.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${payroll.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'} capitalize`}>
                      {payroll.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleDownloadPDF(payroll)}
                      className="flex items-center gap-2 text-[var(--color-primary)] hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      <FiDownload size={16} /> Download
                    </button>
                  </td>
                </tr>
              ))}
              {payrolls.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No payroll records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyPayroll;
