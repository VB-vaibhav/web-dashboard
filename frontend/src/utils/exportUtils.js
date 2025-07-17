export async function exportClientsAsCSV({ exportType, allData, selectedIds, filters, selectedColumns }) {
    let rows = [];

    if (exportType === 'all') {
        rows = allData;
    }
    //   } else if (exportType === 'filtered') {
    //     const { from, to } = filters;
    //     rows = allData.filter(row => {
    //       const date = new Date(row.start_date);
    //       return date >= new Date(from) && date <= new Date(to);
    //     });
    else if (exportType === 'filtered') {
        const { from, to, service } = filters;

        rows = allData.filter(row => {
            const matchesDate =
                from && to
                    ? !isNaN(new Date(row.start_date)) &&
                    new Date(row.start_date) >= new Date(from) &&
                    new Date(row.start_date) <= new Date(to)
                    : true;

            const matchesService =
                !service || service === 'all' || (row.service || '').toLowerCase() === service;

            return matchesDate && matchesService;
        });
    } if (exportType === 'filtered') {
        const { from, to, service } = filters;

        rows = allData.filter(row => {
            const rowDate = row.start_date ? new Date(row.start_date) : null;
            const rowDateStr = rowDate ? rowDate.toLocaleDateString('en-CA') : null;

            const matchesDate = rowDateStr &&
                rowDateStr >= from &&
                rowDateStr <= to;

            const matchesService =
                !service || service === 'all' || (row.service || '').toLowerCase() === service;

            // console.log(`🧪 Row: ${row.client_name}`);
            // console.log(`   ➤ Raw start_date:`, row.start_date);
            // console.log(`   ➤ Formatted rowDateStr:`, rowDateStr);
            // console.log(`   ➤ matchesDate: ${matchesDate}`);
            // console.log(`   ➤ Service: ${row.service}`);
            // console.log(`   ➤ matchesService: ${matchesService}`);

            return matchesDate && matchesService;
        });

        // console.log("🔍 Export Filter - From:", from);
        // console.log("🔍 Export Filter - To:", to);
        // console.log("📊 Total Data Available:", allData.length);
        // console.log("✅ Matching Filtered Rows:", rows.length);
    }


    else if (exportType === 'selected') {
        rows = allData.filter(row => selectedIds.includes(row.id));
    }

    // const filteredRows = rows.map(row =>
    //     selectedColumns.map(col => row[col] ?? '')
    // );
    function sanitizeDate(val) {
        if (!val) return '';
        if (val instanceof Date) return val.toISOString().split('T')[0];
        if (typeof val === 'string' && val.includes('T')) return val.split('T')[0];
        return val;
    }

    const filteredRows = rows.map(row =>
        selectedColumns.map(col => {
            const value = row[col] ?? '';
            if (col === 'start_date' || col === 'expiry_date') {
                return sanitizeDate(value);
            }
            return value;
        })
    );


    const csvHeader = selectedColumns.join(',');
    const csvRows = filteredRows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));

    return [csvHeader, ...csvRows].join('\n');
}
