import React from 'react';
import './table.css';
import Logo from './Assets/logo.png';

import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

//default column properties of AG-Grid
const defaultProperties = {
    sortable: true, filter: true, editable: true,
}

export default function Table2() {
    const [fileData, setFileData] = React.useState([]);
    const [gridApi, setGridApi] = React.useState();

    const onDrop = React.useCallback(acceptedFiles => {
        if (acceptedFiles.length && fileData.length === 0) {
            parseFile(acceptedFiles[0]);
        }
    }, []);

    const gridOptions = {
        onGridReady: params => {
            params.api.applyTransaction({ add: fileData })
            setGridApi(params.api);
        }
    };

    //function to parse the csv file
    const parseFile = file => {
        Papa.parse(file, {
            header: true,
            complete: results => {
                if (fileData.length === 0) {
                    defineColumnHeaders(results);
                    checkDataType(results);
                }
                setFileData(results.data);
                gridOptions.api.setRowData(results.data);
            },
        });
    };

    //function to set Column Headers
    function defineColumnHeaders(results) {
        const columnHeaders = gridOptions.api.getColumnDefs();
        Object.keys(results.data[0]).forEach(item => {
            columnHeaders.push({
                field: item,
                cellClass: (params) => params.value === "" ? "null" : 'default',
            })
        })
        return gridOptions.api.setColumnDefs(columnHeaders);
    }

    //function to check the data type of the column data
    function checkDataType(results) {
        let firstObject = {};
        const valuesArray = [];
        const keysArray = Object.keys(results.data[0]);
        Object.values(results.data[0]).forEach(item => {
            valuesArray.push(item);
        })
        keysArray.forEach((item, index) => {
            firstObject[item] = typeof valuesArray[index];
        })
        return results.data.unshift(firstObject);
    }


    const {
        getRootProps,
        getInputProps,
        isDragAccept,
        isDragReject,
    } = useDropzone({
        onDrop,
        accept: ".csv, text/csv, application/vnd.ms-excel, application/csv, text/x-csv, application/x-csv, text/comma-separated-values, text/x-comma-separated-values",
    });

    // set background colour on every row, this is probably bad, should be using CSS classes
    const rowStyle = {
        background: 'var(--white)',
        fontSize: '16px',
        fontFamily: 'var(--roboto)',
    };

    // set background colour on even rows again, this looks bad, should be using CSS classes
    const getRowStyle = params => {
        if (params.node.rowIndex % 2 !== 0) {
            return {
                background: '#eee',
                color: 'var(--black)',
            };
        }
    };

    const onFilterTextChange = (e) => {
        gridApi.setQuickFilter(e.target.value)
    }

    return (
        <div className="global-container">
            <div className="logo-wrapper">
                <img src={Logo} className="logo" />
                <p className="app-name">Doperator</p>
            </div>

            <p className="intro-line">
                The simplest tool to carry out clean-up operations on your <span id="first">CSV Data</span>
            </p>

            <div
                {...getRootProps({
                    className: `dropzone
          ${isDragAccept && 'dropzoneAccept'}
          ${isDragReject && 'dropzoneReject'}`,
                })}
            >
                <input {...getInputProps()} />
                <div className="input-box-content-wrapper">
                    <div className="animated">
                        <i className="fas fa-file-upload"></i>
                    </div>
                    <p className="input-box-content">
                        {window.innerWidth > 997 ? "Drop the files here or click here to select a file..." : "Click here to select a file..."}
                    </p>
                </div>
            </div>

            {fileData.length === 0 &&
                <p className="no-file-uploaded">No file Uploaded</p>
            }
            {fileData.length !== 0 &&
                <input 
                type="text" 
                onChange={onFilterTextChange} 
                placeholder="Search..." 
                className="input"
                />
            }
            <div className="ag-theme-alpine">
                <AgGridReact
                    gridOptions={gridOptions}
                    defaultColDef={defaultProperties}
                    rowStyle={rowStyle}
                    getRowStyle={getRowStyle}
                />
            </div>

            <p className="powered">Powered by <span>Conbi</span></p>
        </div>
    )
}