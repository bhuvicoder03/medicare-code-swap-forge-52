
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileDown, Calendar, Filter, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ReportCard from "../reports/ReportCard";
import { ChartContainer, LineChart, BarChart, PieChart } from "@/components/ui/chart";

const SupportReports = () => {
  const [reportPeriod, setReportPeriod] = useState("month");
  const [isLoading, setIsLoading] = useState(false);
  
  // Sample data for charts
  const ticketsOverTimeData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Opened Tickets",
        data: [65, 72, 58, 81, 75, 67],
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1
      },
      {
        label: "Resolved Tickets",
        data: [52, 65, 50, 75, 68, 60],
        fill: false,
        borderColor: "rgb(255, 99, 132)",
        tension: 0.1
      }
    ]
  };
  
  const ticketsByCategoryData = {
    labels: ["Technical", "Billing", "Health Card", "Loan", "Onboarding", "KYC", "General"],
    datasets: [
      {
        label: "Number of Tickets",
        data: [120, 90, 110, 80, 70, 60, 50],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(201, 203, 207, 0.5)'
        ],
      }
    ]
  };
  
  const resolutionTimeData = {
    labels: ["Technical", "Billing", "Health Card", "Loan", "Onboarding", "KYC", "General"],
    datasets: [
      {
        label: "Average Resolution Time (hours)",
        data: [18, 12, 24, 36, 8, 14, 6],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      }
    ]
  };
  
  const satisfactionRateData = {
    labels: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
    datasets: [
      {
        label: "Customer Satisfaction",
        data: [45, 30, 15, 7, 3],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
      }
    ]
  };

  const handleRefreshData = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Support Reports & Analytics</h2>
          <p className="text-muted-foreground">
            Monitor support metrics, ticket trends, and team performance
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" className="mr-2">
            <Calendar className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="icon" className="mr-2">
            <Filter className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="performance">Agent Performance</TabsTrigger>
          <TabsTrigger value="satisfaction">Customer Satisfaction</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,382</div>
                <p className="text-xs text-muted-foreground">+6% from previous period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">86</div>
                <p className="text-xs text-muted-foreground">-4% from previous period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.8h</div>
                <p className="text-xs text-muted-foreground">-12% from previous period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.2%</div>
                <p className="text-xs text-muted-foreground">+1.5% from previous period</p>
              </CardContent>
            </Card>
          </div>

          <ReportCard
            title="Support Tickets Trend"
            description="Opened vs Resolved tickets over time"
            footer={
              <CardFooter className="flex justify-between">
                <div className="text-xs text-muted-foreground">
                  Last 6 months data
                </div>
                <Button variant="outline" size="sm">
                  <FileDown className="h-4 w-4 mr-2" /> Export
                </Button>
              </CardFooter>
            }
          >
            <LineChart data={ticketsOverTimeData} />
          </ReportCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ReportCard
              title="Tickets by Category"
              description="Distribution of tickets by support category"
            >
              <PieChart data={ticketsByCategoryData} />
            </ReportCard>

            <Card>
              <CardHeader>
                <CardTitle>Top Support Agents</CardTitle>
                <CardDescription>Highest performing support staff</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mt-2">
                  <div className="flex items-center">
                    <div className="w-9 h-9 rounded-full bg-blue-100 mr-3 flex items-center justify-center">
                      <span className="text-blue-700 font-medium">RK</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Rajiv Kumar</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Technical Support</span>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">98% Resolution</Badge>
                      </div>
                    </div>
                    <div className="text-xl font-bold">182</div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-9 h-9 rounded-full bg-purple-100 mr-3 flex items-center justify-center">
                      <span className="text-purple-700 font-medium">PM</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Priya Mehta</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Billing Support</span>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">95% Resolution</Badge>
                      </div>
                    </div>
                    <div className="text-xl font-bold">156</div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-9 h-9 rounded-full bg-amber-100 mr-3 flex items-center justify-center">
                      <span className="text-amber-700 font-medium">AG</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Anand Gupta</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>KYC Support</span>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">92% Resolution</Badge>
                      </div>
                    </div>
                    <div className="text-xl font-bold">134</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tickets">
          <ReportCard
            title="Resolution Time by Category"
            description="Average time taken to resolve tickets by category"
            className="h-[450px]"
          >
            <BarChart data={resolutionTimeData} />
          </ReportCard>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance Metrics</CardTitle>
                <CardDescription>Comparison of key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">First Response Time</p>
                      <span className="text-sm text-muted-foreground">Target: 1h</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs">
                      <span>0.85h (Average)</span>
                      <span className="text-green-500">15% better than target</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">Resolution Time</p>
                      <span className="text-sm text-muted-foreground">Target: 24h</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs">
                      <span>18.5h (Average)</span>
                      <span className="text-green-500">23% better than target</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">Tickets Resolved</p>
                      <span className="text-sm text-muted-foreground">Target: 95%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs">
                      <span>94% (Average)</span>
                      <span className="text-amber-500">1% below target</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">Customer Satisfaction</p>
                      <span className="text-sm text-muted-foreground">Target: 4.5/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs">
                      <span>4.4/5 (Average)</span>
                      <span className="text-amber-500">2% below target</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Support Team Workload</CardTitle>
                <CardDescription>Current ticket allocation and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Technical Team</p>
                      <p className="text-sm text-muted-foreground">6 agents active</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">32 tickets</p>
                      <div className="flex gap-2 mt-1 justify-end">
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">12 urgent</Badge>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">20 normal</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Billing & Payments</p>
                      <p className="text-sm text-muted-foreground">4 agents active</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">18 tickets</p>
                      <div className="flex gap-2 mt-1 justify-end">
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">5 urgent</Badge>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">13 normal</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">KYC & Onboarding</p>
                      <p className="text-sm text-muted-foreground">5 agents active</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">22 tickets</p>
                      <div className="flex gap-2 mt-1 justify-end">
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">7 urgent</Badge>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">15 normal</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">General Support</p>
                      <p className="text-sm text-muted-foreground">3 agents active</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">14 tickets</p>
                      <div className="flex gap-2 mt-1 justify-end">
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">2 urgent</Badge>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">12 normal</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="satisfaction">
          <ReportCard
            title="Customer Satisfaction Rating"
            description="Distribution of customer feedback ratings"
            className="h-[450px]"
          >
            <PieChart data={satisfactionRateData} />
          </ReportCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupportReports;
