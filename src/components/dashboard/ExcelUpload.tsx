import React, { useState } from 'react';
import { Upload, FileSpreadsheet, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { ShipmentData } from '@/types/dashboard';

interface ExcelUploadProps {
  onDataLoaded: (data: ShipmentData[]) => void;
  hasData: boolean;
  onClearData: () => void;
}

export const ExcelUpload: React.FC<ExcelUploadProps> = ({ onDataLoaded, hasData, onClearData }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const parseDate = (dateValue: any) => {
    if (!dateValue) return new Date().toISOString().split('T')[0];
    
    // Handle Excel date serial numbers
    if (typeof dateValue === 'number') {
      const excelDate = new Date((dateValue - 25569) * 86400 * 1000);
      return excelDate.toISOString().split('T')[0];
    }
    
    // Handle string dates in various formats
    const dateStr = String(dateValue).trim();
    
    // Try parsing common formats: M/D/YYYY, MM/DD/YYYY, YYYY-MM-DD, DD/MM/YYYY
    const formats = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // M/D/YYYY or MM/DD/YYYY
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // DD-MM-YYYY
    ];
    
    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        let year, month, day;
        
        if (format === formats[0]) { // M/D/YYYY
          [, month, day, year] = match;
        } else if (format === formats[1]) { // YYYY-MM-DD
          [, year, month, day] = match;
        } else { // DD-MM-YYYY
          [, day, month, year] = match;
        }
        
        const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toISOString().split('T')[0];
        }
      }
    }
    
    // Fallback: try native Date parsing
    const fallbackDate = new Date(dateStr);
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate.toISOString().split('T')[0];
    }
    
    // If all fails, return current date
    return new Date().toISOString().split('T')[0];
  };

  const processExcelFile = (file: File) => {
    setUploading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Map Excel columns to our data structure
        const mappedData: ShipmentData[] = jsonData.map((row: any, index) => ({
          id: `excel-${index}`,
          companyName: row['Company Name'] || row.companyName || '',
          packageCode: row['Package Code'] || row.packageCode || '',
          date: parseDate(row['Date'] || row.date),
          shipments: Number(row['# Shipments'] || row.shipments || 0),
          packageFare: Number(row['Package Fare'] || row.packageFare || 0),
          deliveredShipments: Number(row['# Delivered Shipments'] || row.delivered || 0),
          failedShipments: Number(row['# Failed Shipments'] || row.failed || 0),
          captain: row['Captain'] || row.captain || 'Unknown'
        })).filter(item => item.companyName && item.captain);

        if (mappedData.length > 0) {
          onDataLoaded(mappedData);
          toast({
            title: "Success",
            description: `Loaded ${mappedData.length} records from Excel file`,
            variant: "default",
          });
        } else {
          toast({
            title: "Error",
            description: "No valid data found in the Excel file. Please check column names.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error processing Excel file:', error);
        toast({
          title: "Error",
          description: "Failed to process Excel file. Please ensure it's a valid Excel format.",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        processExcelFile(file);
      } else {
        toast({
          title: "Error",
          description: "Please upload a valid Excel file (.xlsx or .xls)",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processExcelFile(file);
    }
  };

  const downloadTemplate = () => {
    // Create template data with headers and one sample row
    const templateData = [
      {
        'Company Name': 'Example Company',
        'Package Code': 'PKG001',
        'Date': '6/23/2025',
        '# Shipments': 10,
        'Package Fare': 50.00,
        '# Delivered Shipments': 8,
        '# Failed Shipments': 2,
        'Captain': 'Ahmed Hassan'
      }
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Shipment Data');
    
    // Generate buffer and create download
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'captain-dashboard-template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "Excel template has been downloaded successfully",
      variant: "default",
    });
  };

  if (hasData) {
    return (
      <Card className="p-4 mb-6 bg-success/5 border-success/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-5 w-5 text-success" />
            <div>
              <p className="font-medium text-success">Excel data loaded successfully</p>
              <p className="text-sm text-muted-foreground">Dashboard is displaying your uploaded data</p>
            </div>
          </div>
          <Button
            onClick={onClearData}
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4 mr-1" />
            Clear Data
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <div
        className={`p-8 border-2 border-dashed rounded-lg transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <Upload className={`mx-auto h-12 w-12 mb-4 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
          <h3 className="text-lg font-semibold mb-2">Upload Excel File</h3>
          <p className="text-muted-foreground mb-4">
            Drag and drop your Excel file here, or click to browse
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Expected columns: Company Name, Package Code, Date, # Shipments, Package Fare, # Delivered Shipments, # Failed Shipments, Captain
          </p>
          
          <div className="space-y-3">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileInput}
              disabled={uploading}
              className="hidden"
              id="excel-upload"
            />
            <Button 
              asChild 
              disabled={uploading}
              className="w-full max-w-xs mx-auto"
            >
              <label htmlFor="excel-upload" className="cursor-pointer">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                {uploading ? 'Processing...' : 'Choose Excel File'}
              </label>
            </Button>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>or</span>
            </div>
            
            <Button 
              onClick={downloadTemplate}
              variant="outline"
              className="w-full max-w-xs mx-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};