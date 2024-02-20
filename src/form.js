import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './form.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import DataTable from 'react-data-table-component';
import { StyleSheetManager } from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const Form = () => {

    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [form, setForm] = useState({ name: '', email: '', dob: '', mob: '' });
    const [editingId, setEditingId] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        setErrors({ ...errors, [name]: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        try {
            if (editingId !== null) {
                confirmAlert({
                    title: 'Confirm to update',
                    message: 'Are you sure you want to update this item?',
                    buttons: [
                        {
                            label: 'Yes',
                            onClick: async () => {
                                await axios.put(`https://65a4e05752f07a8b4a3dd9b7.mockapi.io/crudd/${editingId}`, form);
                                fetchData();
                                setForm({ name: '', email: '', dob: '', mob: '' });
                                setEditingId(null);
                                toast.success('Form updated successfully!', {
                                    position: "top-center",
                                    autoClose: 3000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                });
                            }
                        },
                        {
                            label: 'No',
                            onClick: () => { }
                        }
                    ]
                });
            } else {
                await axios.post('https://65a4e05752f07a8b4a3dd9b7.mockapi.io/crudd', form);
                fetchData();
                setForm({ name: '', email: '', dob: '', mob: '' });
                toast.success('Form submitted successfully!', {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!form.name.trim()) {
            errors.name = 'Name is required';
        } else if (form.name.length < 2 || form.name.length > 30) {
            errors.name = 'Name must be between 2 and 30 characters';
        }
        if (!form.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
            errors.email = 'Email is invalid';
        }
        if (!form.dob.trim()) {
            errors.dob = 'DOB is required';
        }
        if (!form.mob.trim()) {
            errors.mob = 'Mobile is required';
        } else if (!/^[0-9]{10}$/.test(form.mob)) {
            errors.mob = 'Mobile number should be 10 digits';
        }
        return errors;
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://65a4e05752f07a8b4a3dd9b7.mockapi.io/crudd");
            const result = response.data;
            setData(result);
            setFilteredData(result);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const delData = async (id) => {
        confirmAlert({
            title: 'Confirm to delete',
            message: 'Are you sure you want to delete this item?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: async () => {
                        try {
                            await axios.delete(`https://65a4e05752f07a8b4a3dd9b7.mockapi.io/crudd/${id}`);
                            fetchData();
                            toast.success('Item deleted successfully!', {
                                position: "top-center",
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                            });
                        } catch (error) {
                            console.log(error);
                        }
                    }
                },
                {
                    label: 'No',
                    onClick: () => { }
                }
            ]
        });
    };
    const editData = async (id) => {
        try {
            const response = await axios.get(`https://65a4e05752f07a8b4a3dd9b7.mockapi.io/crudd/${id}`);
            const item = response.data;
            const formattedDate = formatDate(item.dob);
            const yyyy_mm_dd_date = item.dob.split("/").reverse().join("-");
            setForm({ ...item, dob: yyyy_mm_dd_date });
            setEditingId(id);
        } catch (error) {
            console.log(error);
        }
    };


    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date');
            }
            return date.toLocaleDateString('en-GB');
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    };


    useEffect(() => {
        fetchData();
    }, []);

    const handleSearch = (searchValue) => {
        const filteredData = data.filter(item => {
            return Object.values(item).some(value =>
                value.toString().toLowerCase().includes(searchValue.toLowerCase())
            );
        });
        setFilteredData(filteredData);
    };

    //datatable
    const customStyles = {
        headRow: {
            style: {
                backgroundColor: '#f0f0f0',
            },
        },
        headCells: {
            style: {
                fontSize: '15px',
                fontWeight: 'bold',
                color: '#333',
            },
        },
        rows: {
            style: {
                fontSize: '16px',
            },
        },
    };

    const column = [
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
            style: {
                fontSize: '15px',
            },
        },
        {
            name: 'Email',
            selector: row => row.email,
            style: {
                fontSize: '15px',
            },
        },
        {
            name: 'DOB',
            selector: row => formatDate(row.dob),
            sortable: true,
            style: {
                fontSize: '15px',
            },
        },
        {
            name: 'Mobile',
            selector: row => row.mob,
            style: {
                fontSize: '15px',
            },
        },
        {
            name: 'Actions',
            cell: row => (
                <div>
                    <button className='btn' onClick={() => editData(row.id)}>
                        <FontAwesomeIcon icon={faEdit} style={{ color: 'blue' }} />
                    </button>

                    <button className='btn' onClick={() => delData(row.id)}>
                        <FontAwesomeIcon icon={faTrashAlt} style={{ color: 'red' }} />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        }
    ];

    return (
        <>
            <ToastContainer />
            <form onSubmit={handleSubmit} className='mt-5' style={{ padding: "10px 15%" }}>
                <div className='text-center'>
                    <h1>PhoneBook</h1>
                </div>
                <div className="form-group">
                    <label htmlFor="name" className='text-start fw-bold'>Name</label>
                    <input
                        type='text'
                        value={form.name}
                        id='name'
                        name='name'
                        onChange={handleChange}
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        placeholder='Enter your name'
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
                <div className="form-group">
                    <label htmlFor="email" className='text-start fw-bold'>Email</label>
                    <input
                        type='email'
                        value={form.email}
                        id='email'
                        name='email'
                        onChange={handleChange}
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        placeholder='Enter your email'
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>
                <div className="form-group">
                    <label htmlFor="dob" className='text-start fw-bold'>DOB</label>
                    <input
                        type='date'
                        value={form.dob}
                        id='dob'
                        name='dob'
                        onChange={handleChange}
                        className={`form-control ${errors.dob ? 'is-invalid' : ''}`}
                    />
                    {errors.dob && <div className="invalid-feedback">{errors.dob}</div>}
                </div>
                <div className="form-group">
                    <label htmlFor="mob" className='text-start fw-bold'>Mobile</label>
                    <input
                        type='tel'
                        value={form.mob}
                        id='mob'
                        name='mob'
                        onChange={handleChange}
                        className={`form-control ${errors.mob ? 'is-invalid' : ''}`}
                        placeholder='Enter your mobile number'
                    />
                    {errors.mob && <div className="invalid-feedback">{errors.mob}</div>}
                </div>
                <button type='submit' className='btn btn-dark'>{editingId !== null ? 'Update' : 'Submit'}</button>
            </form>


            <div style={{ padding: "20px 5%", backgroundColor: 'gray' }}>
                <StyleSheetManager shouldForwardProp={(prop) => prop !== 'align'}>
                    <DataTable
                        columns={column}
                        data={filteredData}
                        pagination
                        subHeader
                        paginationPerPage={5}
                        paginationRowsPerPageOptions={[5, 10, 15]}
                        subHeaderComponent={
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <input type="text" placeholder="Search" style={{ marginRight: '10px' }} onChange={(e) => handleSearch(e.target.value)} />
                            </div>
                        }
                        customStyles={customStyles}
                        progressPending={loading}
                        progressComponent={<h4>Loading...</h4>}
                    />
                </StyleSheetManager>
            </div>
        </>
    );
};

export default Form;
