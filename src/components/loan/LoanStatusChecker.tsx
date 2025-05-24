import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, FileText, User, Calendar, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { LoanApplication } from '@/services/loanService';

const LoanStatusChecker = () => {
  const { toast } = useToast();
  const [patientId, setPatientId] = useState('');
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchLoans = async () => {
    if (!patientId.trim()) {
      toast({
        variant: "destructive",
        title: "Patient ID Required",
        description: "Please enter a valid Patient ID"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/loans/patient/${patientId}`);
      setLoans(response);
      setSearched(true);
      
      if (response.length === 0) {
        toast({
          title: "No Loans Found",
          description: "No loan applications found for this Patient ID"
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Search Failed",
        description: error.message || "Failed to search loans"
      });
      setLoans([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'disbursed':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-gray-100 text-gray-800';
      case 'additional_documents_needed':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-6 w-6 text-blue-600" />
            Check Loan Status
          </CardTitle>
          <CardDescription>
            Enter Patient ID to view loan applications and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="patientId">Patient ID</Label>
                <Input
                  id="patientId"
                  placeholder="Enter Patient ID (e.g., P12345 or MongoDB ObjectId)"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={searchLoans} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                  Search
                </Button>
              </div>
            </div>

            {searched && (
              <div className="space-y-4">
                {loans.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Found {loans.length} loan application{loans.length > 1 ? 's' : ''}
                    </h3>
                    <div className="grid gap-4">
                      {loans.map((loan) => (
                        <Card key={loan._id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-gray-500" />
                                  <span className="font-mono text-sm font-medium">
                                    {loan.applicationNumber}
                                  </span>
                                  <Badge className={getStatusColor(loan.status)}>
                                    {loan.status.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                  <Badge variant="outline">
                                    {loan.applicantType?.toUpperCase() || 'PATIENT'}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="text-gray-500">Loan Amount</p>
                                    <p className="font-semibold">{formatCurrency(loan.loanDetails.amount)}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Purpose</p>
                                    <p className="font-semibold">{loan.loanDetails.purpose}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Tenure</p>
                                    <p className="font-semibold">{loan.loanDetails.tenure} months</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Applied Date</p>
                                    <p className="font-semibold">
                                      {loan.applicationDate ? new Date(loan.applicationDate).toLocaleDateString() : 'N/A'}
                                    </p>
                                  </div>
                                </div>

                                {loan.status === 'approved' && loan.approvalDetails && (
                                  <div className="bg-green-50 p-3 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                      <CreditCard className="h-4 w-4 text-green-600" />
                                      <span className="text-sm font-medium text-green-800">Approved Terms</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                                      <div>
                                        <span className="text-green-600">Amount:</span> {formatCurrency(loan.approvalDetails.approvedAmount || 0)}
                                      </div>
                                      <div>
                                        <span className="text-green-600">Interest:</span> {loan.approvalDetails.interestRate}%
                                      </div>
                                      <div>
                                        <span className="text-green-600">EMI:</span> {formatCurrency(loan.approvalDetails.emi || 0)}
                                      </div>
                                      <div>
                                        <span className="text-green-600">Approved:</span> {loan.approvalDetails.approvalDate ? new Date(loan.approvalDetails.approvalDate).toLocaleDateString() : 'N/A'}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {loan.status === 'rejected' && loan.rejectionDetails && (
                                  <div className="bg-red-50 p-3 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-sm font-medium text-red-800">Rejection Reason</span>
                                    </div>
                                    <p className="text-sm text-red-700">{loan.rejectionDetails.reason}</p>
                                  </div>
                                )}

                                {loan.emiDetails && loan.status === 'disbursed' && (
                                  <div className="bg-blue-50 p-3 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Calendar className="h-4 w-4 text-blue-600" />
                                      <span className="text-sm font-medium text-blue-800">EMI Details</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                                      <div>
                                        <span className="text-blue-600">Monthly EMI:</span> {formatCurrency(loan.emiDetails.emiAmount || 0)}
                                      </div>
                                      <div>
                                        <span className="text-blue-600">Paid EMIs:</span> {loan.emiDetails.paidEmis}/{loan.emiDetails.totalEmis}
                                      </div>
                                      <div>
                                        <span className="text-blue-600">Next Due:</span> {loan.emiDetails.nextEmiDate ? new Date(loan.emiDetails.nextEmiDate).toLocaleDateString() : 'N/A'}
                                      </div>
                                      <div>
                                        <span className="text-blue-600">Balance:</span> {formatCurrency(loan.emiDetails.remainingBalance || 0)}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No loan applications found</h3>
                    <p className="text-gray-500">
                      No loan applications were found for the provided Patient ID.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoanStatusChecker;
