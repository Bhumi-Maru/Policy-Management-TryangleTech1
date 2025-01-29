import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as bootstrap from "bootstrap";

export default function UserCreationForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Handle input field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Form validation before submitting
  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First Name is required";
    if (!formData.lastName) newErrors.lastName = "Last Name is required";
    if (!formData.phoneNumber)
      newErrors.phoneNumber = "Phone Number is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await fetch("http://localhost:8000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        showSuccessToast("User Inserted Successfully!");
        navigate("/user-creation");
      } else {
        const errorData = await response.json();
        if (
          errorData.message &&
          errorData.message ===
            "Email already exists. Please use a different email."
        ) {
          setErrors({ email: errorData.message });
        } else {
          setErrors("Failed to create user. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors("Error submitting form. Please check your network connection.");
    }
  };

  const userCreationCheckBoxTableData = [
    { option: "Client" },
    { option: "Company" },
    { option: "Main Category" },
    { option: "Sub Category" },
    { option: "Policy" },
    { option: "User" },
    { option: "Agent" },
  ];

  // Display a success toast message
  const showSuccessToast = (message) => {
    const toastHTML = `
          <div className="toast fade show position-fixed top-0 end-0 m-3" role="alert" style="z-index: 1055; background-color: white">
            <div className="toast-header">
              <img src="assets/images/logo-sm.png" className="rounded me-2" alt="..." height="20" />
              <strong className="me-auto">Velzon</strong>
              <small>Just now</small>
              <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div className="toast-body">${message}</div>
          </div>
        `;

    let toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "toast-container";
      toastContainer.style.position = "fixed";
      toastContainer.style.top = "1rem";
      toastContainer.style.right = "1rem";
      toastContainer.style.zIndex = 1055;
      document.body.appendChild(toastContainer);
    }

    const toastElement = document.createElement("div");
    toastElement.innerHTML = toastHTML;
    toastContainer.appendChild(toastElement);
    const toastInstance = new bootstrap.Toast(
      toastElement.querySelector(".toast")
    );
    toastInstance.show();
    setTimeout(() => {
      toastInstance.hide();
      toastElement.remove();
    }, 3000);
  };

  return (
    <div className="container-fluid">
      {/* user form */}
      <div className="row">
        <div className="col-xxl-6 col-lg-12">
          <div className="card">
            <div className="card-body">
              <div className="live-preview">
                <form onSubmit={handleSubmit} className="row g-3">
                  {/* First Name */}
                  <div className="col-md-4">
                    <label
                      htmlFor="inputfirstname4"
                      className="form-label"
                      style={{ fontSize: "13px", fontWeight: "bold" }}
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="form-control"
                      id="inputfirstname4"
                      placeholder="First Name"
                      required
                    />
                    {errors.firstName && (
                      <span
                        className="text-danger"
                        style={{ fontSize: "13px" }}
                      >
                        {errors.firstName}
                      </span>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="col-md-4">
                    <label
                      htmlFor="inputlastname4"
                      className="form-label"
                      style={{ fontSize: "13px", fontWeight: "bold" }}
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="form-control"
                      id="inputlastname4"
                      placeholder="Last Name"
                      required
                    />
                    {errors.lastName && (
                      <span
                        className="text-danger"
                        style={{ fontSize: "13px" }}
                      >
                        {errors.lastName}
                      </span>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="col-md-4">
                    <label
                      htmlFor="phonenumberInput"
                      className="form-label"
                      style={{ fontSize: "13px", fontWeight: "bold" }}
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="(+91) 12345 67890"
                      id="phonenumberInput"
                      required
                    />
                    {errors.phoneNumber && (
                      <span
                        className="text-danger"
                        style={{ fontSize: "13px" }}
                      >
                        {errors.phoneNumber}
                      </span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="col-md-6">
                    <label
                      htmlFor="inputEmail4"
                      className="form-label"
                      style={{ fontSize: "13px", fontWeight: "bold" }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-control"
                      id="inputEmail4"
                      placeholder="Email"
                      required
                    />
                    {errors.email && (
                      <span
                        className="text-danger"
                        style={{ fontSize: "13px" }}
                      >
                        {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Password */}
                  <div className="col-md-6">
                    <label
                      htmlFor="passwordInput"
                      className="form-label"
                      style={{ fontSize: "13px", fontWeight: "bold" }}
                    >
                      Password
                    </label>
                    <input
                      type="text"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="password"
                      id="passwordInput"
                      required
                    />
                    {errors.password && (
                      <span
                        className="text-danger"
                        style={{ fontSize: "13px" }}
                      >
                        {errors.password}
                      </span>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="col-md-12 position-relative">
                    <button
                      type="submit"
                      className="btn btn-submit"
                      style={{
                        fontSize: "13px",
                        width: "167px",
                        float: "inline-end",
                      }}
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* user table */}
      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <div className="listjs-table" id="customerList">
                <div className="table-responsive table-card mt-3 mb-1">
                  <table
                    className="table align-middle table-nowrap"
                    id="customerTable"
                  >
                    <thead className="table-light">
                      <tr>
                        <th
                          scope="col"
                          style={{ width: "50px", fontSize: "13px" }}
                        >
                          <div className="main-form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="checkAll"
                              value="option"
                            />
                          </div>
                        </th>
                        <th
                          style={{ fontSize: "13px", fontWeight: "bold" }}
                        ></th>
                        <th style={{ fontSize: "13px", fontWeight: "bold" }}>
                          View
                        </th>
                        <th style={{ fontSize: "13px", fontWeight: "bold" }}>
                          Add
                        </th>
                        <th style={{ fontSize: "13px", fontWeight: "bold" }}>
                          Update
                        </th>
                        <th style={{ fontSize: "13px", fontWeight: "bold" }}>
                          Delete
                        </th>
                      </tr>
                    </thead>
                    <tbody className="list form-check-all">
                      {userCreationCheckBoxTableData.map((data, index) => {
                        return (
                          <>
                            <tr>
                              <th
                                scope="row"
                                style={{ width: "50px", fontSize: "13px" }}
                              >
                                <div className="main-form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="chk_child"
                                    value="option1"
                                  />
                                </div>
                              </th>
                              <td className="id" style={{ display: "none" }}>
                                <a className="fw-medium link-primary">
                                  #VZ2101
                                </a>
                              </td>

                              <td
                                className="customer_name"
                                style={{ fontSize: "13px" }}
                              >
                                {data.option}
                              </td>
                              <td className="view" style={{ fontSize: "13px" }}>
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="chk_child"
                                    value="option1"
                                  />
                                </div>
                              </td>
                              <td className="add" style={{ fontSize: "13px" }}>
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="chk_child"
                                    value="option1"
                                  />
                                </div>
                              </td>
                              <td
                                className="update"
                                style={{ fontSize: "13px" }}
                              >
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="chk_child"
                                    value="option1"
                                  />
                                </div>
                              </td>
                              <td
                                className="delete"
                                style={{ fontSize: "13px" }}
                              >
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="chk_child"
                                    value="option1"
                                  />
                                </div>
                              </td>
                            </tr>
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
