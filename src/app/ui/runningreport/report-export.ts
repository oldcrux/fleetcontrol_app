import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

export async function generateVehicleExcel(reportData: any) {

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Report');

        if (reportData.length === 0) {
            // logError(`NotificationController:generateExcel: reportData Empty`);
            throw new Error('reportData is empty.');
        }
        // logDebug(`NotificationController:generateExcel: Data before generating XLS:`, reportData);
        // Extract columns from the first object in the array
        const columns = Object.keys(reportData[0]).map((key) => ({ header: formatHeader(key), key }));
        worksheet.columns = columns;
        worksheet.columns = [...columns, { header: 'Touched Location %', key: 'touchedLocation' }];

        worksheet.getRow(1).eachCell((cell: any) => {
            cell.font = { bold: true, size: 18 }; // Make header bold
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'a0a2a3' }, // Gold background color
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle' }; // Center alignment
        });

        worksheet.columns.forEach((column: any) => {
            if (column.header) {
                column.width = column.header.length + 2; // Add padding
            }
        });
        // Add rows from the array
        reportData.forEach((data: any) => {
            const assignedCount = data.assignedGeofenceLocationCount || 1; // Prevent divide-by-zero
            const actualCount = data.touchedLocationCount || 0;

            // Calculate touchedLocation percentage
            const touchedLocationPercentage = ((actualCount / assignedCount) * 100).toFixed(1);

            worksheet.addRow({
                ...data,
                touchedLocation: touchedLocationPercentage,
            });
        });

        worksheet.eachRow((row: any, rowNumber: any) => {
            if (rowNumber === 1) return; // Skip the header row
    
            const touchedLocationCell = row.getCell('touchedLocation');
            const touchedLocationValue = parseFloat(touchedLocationCell.value || '0');
    
            // Determine cell color based on touchedLocation percentage
            let fillColor = null;
            if (touchedLocationValue >= 90) fillColor = 'FF00FF00'; // Green
            else if (touchedLocationValue >= 80) fillColor = 'FF66CC66'; // Light Green
            else if (touchedLocationValue >= 60) fillColor = 'FFFFFF00'; // Yellow
            else if (touchedLocationValue >= 40) fillColor = 'FFFFA500'; // Orange
            else fillColor = 'FFFF0000'; // Red
    
            if (fillColor) {
                touchedLocationCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: fillColor },
                };
            }
        });

        // Save to a file or return a buffer
        const filePath = `report_vehicle.xlsx`;
        
        const buffer = await workbook.xlsx.writeBuffer();

        // Trigger the download
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filePath; // Set the filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Clean up the URL

}

function formatHeader(header: any) {
    // Convert camelCase to "Title Case" with spaces
    return header
        .replace(/([A-Z])/g, ' $1') // Insert space before uppercase letters
        .replace(/^./, (str: any) => str.toUpperCase()); // Capitalize the first letter
}

function downloadXLS(filename: string, fileContent: any) {
    // Create a Blob with the XLS content
    const blob = new Blob([fileContent], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  
    // Create a URL for the Blob
    const url = window.URL.createObjectURL(blob);
  
    // Create a temporary link element
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
  
    // Append the link to the DOM, trigger a click, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  
    // Revoke the Blob URL to free up resources
    window.URL.revokeObjectURL(url);
  }
  

  export async function generateVehicleExcelAndDownload(reportData: any){
    const xlsFilePath = await generateVehicleExcel(reportData);
  }