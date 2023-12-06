import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import styles from './ExcelUploader.module.css';

const ExcelUploader = () => {
  const [data, setData] = useState(null);
  const [mean, setMean] = useState(null);
  const [median, setMedian] = useState(null);
  const [mode, setMode] = useState(null);
  const chartRef = useRef(null);


  const [showStatistics, setShowStatistics] = useState(false);

  const toggleStatistics = () => {
    setShowStatistics(!showStatistics);
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];

    // Check if the file is of type Excel
    if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      const reader = new FileReader();

      reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Assuming the first sheet is the one you want to log
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Log the data to the console
        console.log(jsonData);

        // Process the data and create a bar graph
        setData(jsonData);

        // Destroy the previous chart instance before rendering a new one
        if (chartRef.current) {
          chartRef.current.destroy();
        }

        // Render the chart and calculate mean, median, and mode
        renderChart();
        calculateStatistics(jsonData);
      };

      reader.readAsArrayBuffer(file);
    } else {
      console.error('Invalid file type. Please upload an Excel file.');
    }
  }, []);

  const calculateStatistics = (jsonData) => {
    const marks = jsonData.map((entry) => entry.MARKS);

    // Calculate mean
    const meanValue = marks.reduce((acc, val) => acc + val, 0) / marks.length;
    setMean(meanValue.toFixed(2));

    // Calculate median
    const sortedMarks = marks.slice().sort((a, b) => a - b);
    const middle = Math.floor(sortedMarks.length / 2);
    const medianValue =
      sortedMarks.length % 2 === 0
        ? (sortedMarks[middle - 1] + sortedMarks[middle]) / 2
        : sortedMarks[middle];
    setMedian(medianValue);

    // Calculate mode
    const modeObj = {};
    marks.forEach((mark) => {
      modeObj[mark] = (modeObj[mark] || 0) + 1;
    });
    const modeValues = Object.entries(modeObj).filter(([_, count]) => count === Math.max(...Object.values(modeObj)));
    const modeResult = modeValues.map(([value]) => Number(value));
    setMode(modeResult.join(', '));
  };

  const renderChart = () => {
    const ctx = document.getElementById('bar-chart');
    if (ctx) {
      const chart = new Chart(ctx, {
        type: 'bar',
        data: prepareChartData(),
        options: {
          scales: {
            x: {
              title: {
                display: true,
                text: 'Marks Range',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Number of Students',
              },
              beginAtZero: true,
              stepSize: 10, // Set the interval between ticks
              max: 100, // Set the maximum value for the y-axis
            },
          },
        },
      });

      // Save the chart instance to the ref
      chartRef.current = chart;
    }
  };

  const prepareChartData = () => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Number of Students',
            backgroundColor: 'rgba(75,192,192,0.4)',
            borderColor: 'rgba(75,192,192,1)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(75,192,192,0.6)',
            hoverBorderColor: 'rgba(75,192,192,1)',
            data: [],
          },
        ],
      };
    }

    const marks = data.map((entry) => entry.MARKS);

    // Count the number of students in each range of 10
    const counts = Array.from({ length: 10 }, () => 0);

    marks.forEach((mark) => {
      const binIndex = Math.floor(mark / 10);
      counts[binIndex]++;
    });

    // Create labels for each range
    const labels = counts.map((_, index) => `${ index * 10} - ${(index + 1) * 10 - 1}`);

  return {
    labels,
    datasets: [
      {
        label: 'Number of Students',
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(75,192,192,0.6)',
        hoverBorderColor: 'rgba(75,192,192,1)',
        data: counts,
      },
    ],
  };
};

const { getRootProps, getInputProps } = useDropzone({
  onDrop,
  accept: '.xlsx',
});

return (
  <div className="excel-uploader-container">
    {!data ? (
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>Drag 'n' drop an Excel file here, or click to select one</p>
      </div>
    ) : null}

    {data && (
      <>
        <button onClick={toggleStatistics} className="togglebutton">
          {showStatistics ? 'Hide Statistics' : 'Show Statistics'}
        </button>

        {showStatistics && mean && median && mode && (
          <div className="statistics-container">
            <h2>Statistics</h2>
            <div className="statistics-item">Mean: {mean}</div>
            <div className="statistics-item">Median: {median}</div>
            <div className="statistics-item">Mode: {mode}</div>
          </div>
        )}
      </>
    )}

    {data && (
      <div className="chart-container">
        <h2>Graphical Analysis</h2>
        <Bar
          data={prepareChartData()}
          options={{
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Marks Range',
                },
              },
              y: {
                title: {
                  display: true,
                  text: 'Number of Students',
                },
                beginAtZero: true,
                stepSize: 10, // Set the interval between ticks
                max: 400, // Set the maximum value for the y-axis
              },
            },
          }}
        />
      </div>
    )}
  </div>
);
};
const dropzoneStyle = {
  border: '2px dashed #cccccc',
  borderRadius: '4px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
};

const statisticsStyle = {
  marginTop: '20px',
};

export default ExcelUploader;