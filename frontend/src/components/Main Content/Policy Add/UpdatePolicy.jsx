import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import "./UpdatePolicy.css";
import Select from "react-select";
import * as bootstrap from "bootstrap";

export default function UpdatePolicy() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    policyId: id,
    clientName: "",
    companyName: "",
    mainCategory: "",
    subCategory: "",
    issueDate: "",
    expiryDate: "",
    policyAmount: "",
    policyAttachment: null,
  });
  const [policy, setPolicy] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState();
  const [isOpenPolicyAttachment, setIsOpenPolicyAttachment] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          policyRes,
          clientsRes,
          companiesRes,
          maincategoriesRes,
          subcategoriesRes,
        ] = await Promise.all([
          fetch(`http://localhost:8000/api/policy/${id}`),
          fetch("http://localhost:8000/api/clients"),
          fetch("http://localhost:8000/api/company"),
          fetch("http://localhost:8000/api/mainCategory"),
          fetch("http://localhost:8000/api/subCategory"),
        ]);
        const [
          policyData,
          clientsData,
          companiesData,
          maincategoriesData,
          subcategoriesData,
        ] = await Promise.all([
          policyRes.json(),
          clientsRes.json(),
          companiesRes.json(),
          maincategoriesRes.json(),
          subcategoriesRes.json(),
        ]);

        setPolicy(policyData);
        setFormData({
          policyId: policyData._id || "",
          clientName: policyData.clientName?._id || "",
          companyName: policyData.companyName?._id || "",
          mainCategory: policyData.mainCategory?._id || "",
          subCategory: policyData.subCategory?._id || "",
          issueDate: policyData.issueDate || "",
          expiryDate: policyData.expiryDate || "",
          policyAmount: policyData.policyAmount || "",
          policyAttachment: policyData.policyAttachment || null,
        });
        console.log("Fetched Policy Data: ", formData);
        setClients(clientsData);
        setCompanies(companiesData);
        setMainCategories(maincategoriesData);
        setSubCategories(subcategoriesData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, []); // Added id as a dependency

  // Options for dropdowns
  const clientOptions = clients.map((client) => ({
    value: client._id,
    label: `${client.firstName} ${client.lastName || ""}`.trim(),
  }));

  const companyOptions = (companies || []).map((company) => ({
    value: company._id,
    label: company.companyName,
  }));

  const updatedCompanyOptions = companyOptions.map((option) => {
    const category = companies.find(
      (category) => category._id === option.value
    );
    return category ? { ...option, label: category.companyName } : option;
  });

  // console.log("updatedCompanyOptions", updatedCompanyOptions);

  // main category
  const mainCategoryOptions = (mainCategories || []).map((category) => ({
    value: category._id,
    label: category.mainCategory,
  }));

  const updatedMainCategoryOptions = mainCategoryOptions.map((option) => {
    const category = mainCategories.find(
      (category) => category._id === option.value
    );
    return category ? { ...option, label: category.mainCategoryName } : option;
  });

  // console.log("updatedMainCategoryOptions", updatedMainCategoryOptions);

  // sub category

  const subCategoryOptions = (subCategories || []).map((category) => ({
    value: category._id,
    label: category.subCategory,
  }));

  const updatedSubCategoryOptions = subCategoryOptions.map((option) => {
    const category = subCategories.find(
      (category) => category._id === option.value
    );
    return category ? { ...option, label: category.subCategoryName } : option;
  });

  // console.log("updatedSubCategoryOptions", updatedSubCategoryOptions);

  const handleSelectChange = (field, option) => {
    setFormData({ ...formData, [field]: option ? option.value : null });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.files[0], // Only set the first file
    });
  };

  //form 1 handle submit

  const handleSubmitFormOne = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8000/api/policy/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: formData.clientName,
          mainCategory: formData.mainCategory,
          subCategory: formData.subCategory,
        }),
      });

      if (response.ok) {
        showSuccessToast("Record updated successfully!", "success");
        navigate("/policy");
      }
    } catch (err) {
      console.error("Error updating client data:", err);
    }
  };

  // const policyId = id; // This is your policy ID
  // console.log("Policy ID:", formData.policyId); // Log the policy ID

  // Form 2: Handle submit for sub-policy data
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form Data on Submit: ", formData); // Debug the formData

    if (!formData.policyId) {
      console.log("Policy ID is missing", formData.policyId);
      return; // Exit the function if the policyId is missing
    }

    try {
      const formDataPayload = new FormData();
      formDataPayload.append("policyId", formData.policyId);
      formDataPayload.append("companyName", formData.companyName);
      formDataPayload.append(
        "issueDate",
        new Date(formData.issueDate).toISOString()
      );
      formDataPayload.append(
        "expiryDate",
        new Date(formData.expiryDate).toISOString()
      );
      formDataPayload.append("policyAmount", formData.policyAmount);

      // Append file if exists
      if (formData.policyAttachment) {
        formDataPayload.append("policyAttachment", formData.policyAttachment);
      }

      const apiUrl = selectedPolicy
        ? `http://localhost:8000/api/policy/${formData.policyId}/sub-policy/${selectedPolicy._id}`
        : `http://localhost:8000/api/policy/${formData.policyId}/sub-policy`;
      const method = selectedPolicy ? "PUT" : "POST";

      const response = await fetch(apiUrl, {
        method: method,
        body: formDataPayload,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("API response:", data);

        const updatedSubPolicy = data.subPolicy || data;
        if (selectedPolicy) {
          // Update the existing sub-policy in state
          setPolicy((prevPolicy) => ({
            ...prevPolicy,
            subPolicy: prevPolicy.subPolicy.map((sub) =>
              sub._id === selectedPolicy._id ? updatedSubPolicy : sub
            ),
          }));
        } else {
          // Add the new sub-policy to state
          setPolicy((prevPolicy) => ({
            ...prevPolicy,
            subPolicy: [...prevPolicy.subPolicy, updatedSubPolicy],
          }));
        }

        // Reset form fields after submission
        setFormData({
          policyId: "",
          companyName: "",
          issueDate: "",
          expiryDate: "",
          policyAmount: "",
          policyAttachment: null,
        });
        setIsOpenPolicyAttachment(false);

        showSuccessToast(
          selectedPolicy
            ? "Sub-policy updated successfully!"
            : "Sub-policy added successfully!"
        );
      } else {
        const errorData = await response.json();
        showErrorToast(`Failed to save sub-policy. ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error occurred while saving sub-policy:", error);
      showErrorToast("Error occurred while saving sub-policy");
    }
  };

  const showErrorToast = (message) => {
    const toastHTML = `
      <div class="toast fade show position-fixed top-0 end-0 m-3" role="alert" style="z-index: 1055; background-color: white">
        <div class="toast-header">
          <img src="assets/images/logo-sm.png" class="rounded me-2" alt="..." height="20" />
          <strong class="me-auto">Velzon</strong>
          <small>Just now</small>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">${message}</div>
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

  const handleEdit = (policyData) => {
    setSelectedPolicy(policyData);
    console.log("policy Data is ", policyData);
    setFormData({
      policyId: policyData.policyId,
      companyName: policyData.companyName,
      issueDate: policyData.issueDate,
      expiryDate: policyData.expiryDate,
      policyAmount: policyData.policyAmount,
      policyAttachment: policyData.policyAttachment,
    });
  };

  const handleDelete = (policyToDelete) => {
    const modal = new bootstrap.Modal(
      document.getElementById("deleteRecordModal")
    );
    modal.show();

    const deleteButton = document.getElementById("delete-record");
    const closeButton = document.getElementById("btn-close");

    const confirmDeletion = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/sub-policy/${policyToDelete._id}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          // Remove the deleted sub-policy from the state
          setPolicy((prevPolicy) => ({
            ...prevPolicy,
            subPolicy: prevPolicy.subPolicy.filter(
              (sub) => sub._id !== policyToDelete._id
            ),
          }));

          modal.hide();
          showSuccessToast("Sub-policy deleted successfully!");
        } else {
          const errorData = await response.json();
          showErrorToast(`Failed to delete sub-policy: ${errorData.message}`);
        }
      } catch (error) {
        console.error("Error deleting sub-policy:", error);
        showErrorToast("An error occurred while deleting the sub-policy.");
      }
    };

    const cancelDeletion = () => {
      modal.hide();
    };

    deleteButton.addEventListener("click", confirmDeletion);
    closeButton.addEventListener("click", cancelDeletion);
  };

  // Display a success toast message
  const showSuccessToast = (message) => {
    const toastHTML = `
        <div class="toast fade show position-fixed top-0 end-0 m-3" role="alert" style="z-index: 1055; background-color: white">
          <div class="toast-header">
            <img src="assets/images/logo-sm.png" class="rounded me-2" alt="..." height="20" />
            <strong class="me-auto">Velzon</strong>
            <small>Just now</small>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
          <div class="toast-body">${message}</div>
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

  // Helper function to get company name by ID
  const getCompanyNameById = (companyId) => {
    if (!companyId) {
      console.log("Company ID is missing or invalid");
      return "Unknown Company"; // Return a default value if the companyId is invalid
    }

    // console.log("Searching for companyId:", companyId);
    const companyObj = companies.find((comp) => comp._id === companyId);

    if (!companyObj) {
      console.log("Company not found for ID:", companyId);
      return "Unknown Company"; // Return a default if no company is found
    }

    // console.log("Found company:", companyObj);
    return companyObj.companyName; // Return the company name
  };

  // Initialize tooltips for table rows
  useEffect(() => {
    const tooltipTriggerList = Array.from(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );

    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      // Ensure the element has a valid title
      const title = tooltipTriggerEl.getAttribute("title");
      if (title) {
        new bootstrap.Tooltip(tooltipTriggerEl);
      }
    });

    return () => {
      tooltipTriggerList.forEach((tooltipTriggerEl) => {
        const tooltipInstance = bootstrap.Tooltip.getInstance(tooltipTriggerEl);
        if (tooltipInstance) {
          tooltipInstance.dispose();
        }
      });
    };
  }, [policy.subPolicy]);

  return (
    <>
      {/* form 1 */}
      <div className="container-fluid">
        <div className="row">
          <div className="col-xxl-6 col-lg-12">
            <div className="card">
              <div className="card-body">
                <div className="live-preview">
                  <form onSubmit={handleSubmitFormOne} className="row g-3">
                    {error ? (
                      <p className="text-danger">Error: {error}</p>
                    ) : (
                      <>
                        {/* Client Name */}
                        <div className="col-md-3">
                          <label
                            style={{ fontSize: "13px", fontWeight: "bold" }}
                          >
                            Client Name
                          </label>
                          <Select
                            options={clientOptions}
                            onChange={(option) =>
                              handleSelectChange("clientName", option)
                            }
                            value={clientOptions.find(
                              (option) => option.value === formData.clientName
                            )}
                            placeholder="Select a client Name"
                          />
                          {errors.clientName && (
                            <small className="text-danger">
                              {errors.clientName}
                            </small>
                          )}
                        </div>

                        {/* Main Category */}
                        <div className="col-md-3">
                          <label
                            style={{ fontSize: "13px", fontWeight: "bold" }}
                          >
                            Main Category
                          </label>
                          {updatedMainCategoryOptions.length > 0 && (
                            <Select
                              options={updatedMainCategoryOptions}
                              onChange={(option) =>
                                handleSelectChange("mainCategory", option)
                              }
                              value={updatedMainCategoryOptions.find(
                                (option) =>
                                  option.value === formData.mainCategory
                              )}
                              placeholder="Select a main category"
                            />
                          )}

                          {errors.mainCategory && (
                            <small className="text-danger">
                              {errors.mainCategory}
                            </small>
                          )}
                        </div>

                        {/* Sub Category */}
                        <div className="col-md-3">
                          <label
                            style={{ fontSize: "13px", fontWeight: "bold" }}
                          >
                            Sub Category
                          </label>
                          {updatedSubCategoryOptions.length > 0 && (
                            <Select
                              options={updatedSubCategoryOptions}
                              onChange={(option) =>
                                handleSelectChange("subCategory", option)
                              }
                              value={updatedSubCategoryOptions.find(
                                (option) =>
                                  option.value === formData.subCategory
                              )}
                              placeholder="Select a sub category"
                            />
                          )}

                          {errors.subCategory && (
                            <small className="text-danger">
                              {errors.subCategory}
                            </small>
                          )}
                        </div>

                        {/* Submit Button */}
                        <div
                          className="col-md-2 position-relative"
                          style={{ top: "32px", left: "82px" }}
                        >
                          <button
                            type="submit"
                            className="btn w-100 btn-submit"
                            style={{ fontSize: "13px", fontWeight: "normal" }}
                          >
                            Update
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* form 2 */}
      <div className="container-fluid">
        <div className="row">
          <div className="col-xxl-6 col-lg-12">
            <div className="card">
              <div className="card-body">
                <div className="live-preview">
                  <form onSubmit={handleSubmit} className="row g-3">
                    {error ? (
                      <p className="text-danger">Error: {error}</p>
                    ) : (
                      <>
                        <input
                          type="text"
                          name="policyId"
                          value={formData.policyId || ""}
                          onChange={handleInputChange}
                        />

                        {/* Company Name */}
                        <div className="col-md-4">
                          <label
                            style={{ fontSize: "13px", fontWeight: "bold" }}
                          >
                            Company Name
                          </label>
                          <Select
                            options={companyOptions}
                            onChange={(option) =>
                              handleSelectChange("companyName", option)
                            }
                            value={companyOptions.find(
                              (option) => option.value === formData.companyName
                            )}
                            placeholder="Select a company"
                          />
                          {errors.companyName && (
                            <small className="text-danger">
                              {errors.companyName}
                            </small>
                          )}
                        </div>
                        {/* Issue Date */}
                        <div className="col-md-4">
                          <label
                            className="form-label"
                            style={{ fontSize: "13px", fontWeight: "bold" }}
                          >
                            Issue Date
                          </label>
                          <input
                            type="date"
                            name="issueDate"
                            className="form-control"
                            value={
                              formData.issueDate
                                ? formData.issueDate.split("T")[0]
                                : ""
                            }
                            onChange={handleInputChange}
                          />
                          {errors.issueDate && (
                            <small className="text-danger">
                              {errors.issueDate}
                            </small>
                          )}
                        </div>

                        {/* Expiry Date */}
                        <div className="col-md-4">
                          <label
                            className="form-label"
                            style={{ fontSize: "13px", fontWeight: "bold" }}
                          >
                            Expiry Date
                          </label>
                          <input
                            type="date"
                            name="expiryDate"
                            className="form-control"
                            value={
                              formData.expiryDate
                                ? formData.expiryDate.split("T")[0]
                                : ""
                            }
                            onChange={handleInputChange}
                          />
                          {console.log("formdata expiry", formData.expiryDate)}
                          {errors.expiryDate && (
                            <small className="text-danger">
                              {errors.expiryDate}
                            </small>
                          )}
                        </div>

                        {/* Policy Amount */}
                        <div className="col-md-4">
                          <label
                            className="form-label"
                            style={{ fontSize: "13px", fontWeight: "bold" }}
                          >
                            Policy Amount
                          </label>
                          <input
                            type="number"
                            name="policyAmount"
                            className="form-control"
                            value={formData.policyAmount}
                            onChange={handleInputChange}
                          />
                          {errors.policyAmount && (
                            <small className="text-danger">
                              {errors.policyAmount}
                            </small>
                          )}
                        </div>

                        {/* Policy Attachment */}
                        <div className="col-md-4">
                          <label
                            className="form-label"
                            style={{ fontSize: "13px", fontWeight: "bold" }}
                          >
                            Policy Attachment
                          </label>
                          <input
                            type="file"
                            name="policyAttachment"
                            className="form-control"
                            onClick={() =>
                              setIsOpenPolicyAttachment(!isOpenPolicyAttachment)
                            }
                            onChange={handleFileChange}
                          />
                          {errors.policyAttachment && (
                            <small className="text-danger">
                              {errors.policyAttachment}
                            </small>
                          )}
                          {isOpenPolicyAttachment && (
                            <div
                              className="mt-2 alert alert-dismissible text-white alert-label-icon fade show"
                              role="alert"
                              style={{ color: "black", fontSize: "13px" }}
                            >
                              <i
                                className="ri-information-line label-icon"
                                style={{ color: "black" }}
                              ></i>
                              <span
                                style={{
                                  position: "relative",
                                  fontSize: "13px",
                                  left: "48px",
                                  color: "black",
                                }}
                              >
                                {formData.policyAttachment &&
                                typeof formData.policyAttachment === "object"
                                  ? formData.policyAttachment.name
                                  : "No Policy Attachment Available"}
                              </span>
                              <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="alert"
                                aria-label="Close"
                                onClick={() => setIsOpenPolicyAttachment(false)}
                              ></button>
                            </div>
                          )}
                        </div>

                        {/* Submit Button */}
                        <div
                          className="col-md-2 position-relative"
                          style={{
                            top: isOpenPolicyAttachment ? "-13px" : "15px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "5px",
                            left: "165px",
                          }}
                        >
                          <button
                            type="submit"
                            className="btn btn-success add-btn w-100"
                            style={{ fontSize: "13px" }}
                          >
                            {!selectedPolicy && (
                              <i className="ri-add-line align-bottom me-1"></i>
                            )}
                            {selectedPolicy ? "Update" : "Add"}
                            {/* Update */}
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                </div>
              </div>
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
                            className="srno_sort"
                            data-sort="serial number"
                            style={{
                              fontSize: ".8rem",
                              fontWeight: "bold",
                            }}
                          >
                            SR No.
                          </th>
                          {/* company name */}
                          <th
                            className="companyName_sort"
                            data-sort="companyName"
                            style={{
                              fontSize: ".8rem",
                              fontWeight: "bold",
                            }}
                          >
                            Company Name
                          </th>
                          {/* Issue Date */}
                          <th
                            className="issueDate_sort"
                            data-sort="address"
                            style={{
                              fontSize: ".8rem",
                              fontWeight: "bold",
                            }}
                          >
                            Issue Date
                          </th>
                          {/* Expiry Date */}
                          <th
                            className="expiryDate_sort"
                            data-sort="address"
                            style={{
                              fontSize: ".8rem",
                              fontWeight: "bold",
                            }}
                          >
                            Expiry Date
                          </th>
                          {/* policyAmount */}
                          <th
                            className="policyAmount_sort"
                            data-sort="policyAmount"
                            style={{
                              fontSize: ".8rem",
                              fontWeight: "bold",
                            }}
                          >
                            Policy Amount
                          </th>
                          {/* Policy Attachment */}
                          <th
                            className="policyAttachment_sort"
                            data-sort="doc"
                            style={{
                              fontSize: ".8rem",
                              fontWeight: "bold",
                              textAlign: "center",
                            }}
                          >
                            Policy Attachment
                          </th>
                          <th
                            className="action_sort"
                            data-sort="action"
                            style={{
                              textAlign: "-webkit-center",
                              fontSize: ".8rem",
                              fontWeight: "bold",
                            }}
                          >
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="list form-check-all">
                        {policy?.subPolicy?.length > 0 ? (
                          policy?.subPolicy?.map((policyItem, index) => (
                            <tr key={index}>
                              {/* Serial Number */}
                              <td
                                className="serial number"
                                style={{ fontSize: ".8rem" }}
                              >
                                {index + 1}
                              </td>
                              {/* Company Name */}
                              <td
                                className="issue_date"
                                style={{ fontSize: ".8rem" }}
                              >
                                {getCompanyNameById(policyItem.companyName)}
                              </td>
                              {/* Issue Date */}
                              <td
                                className="issue_date"
                                style={{ fontSize: ".8rem" }}
                              >
                                {policyItem.issueDate.split("T")[0]}
                              </td>
                              {/* Expiry Date */}
                              <td
                                className="expiry_date"
                                style={{ fontSize: ".8rem" }}
                              >
                                {policyItem.expiryDate.split("T")[0]}
                              </td>
                              {/* Policy Amount */}
                              <td
                                className="policy_amount"
                                style={{ fontSize: ".8rem" }}
                              >
                                &nbsp; &nbsp; &nbsp;
                                {policyItem.policyAmount}
                              </td>
                              {/* Policy Attachment Link */}
                              <td className="text-center">
                                {policyItem.policyAttachment &&
                                policyItem.policyAttachment.length > 0 ? (
                                  <a
                                    href={`http://localhost:8000${policyItem.policyAttachment[0]}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <i
                                      className="ri-pushpin-fill"
                                      style={{
                                        color: "rgb(64, 81, 137)",
                                        cursor: "pointer",
                                        fontSize: "15px",
                                      }}
                                    ></i>
                                  </a>
                                ) : (
                                  "No Attachment Available"
                                )}
                              </td>
                              {/* Edit and Delete Actions */}
                              <td>
                                <div
                                  className="d-flex gap-2 justify-content-center"
                                  style={{ textAlign: "-webkit-center" }}
                                >
                                  {/* Edit Button */}
                                  <div className="edit">
                                    <Link
                                      to={`/policy-update-form/${policyItem._id}`}
                                      onClick={() => handleEdit(policyItem)}
                                      style={{ textDecoration: "none" }}
                                    >
                                      <i className="ri-edit-2-line"></i>
                                    </Link>
                                  </div>
                                  {/* Delete Button */}
                                  <div className="remove">
                                    <Link
                                      onClick={() => handleDelete(policyItem)}
                                      style={{ textDecoration: "none" }}
                                    >
                                      <i className="ri-delete-bin-2-line"></i>
                                    </Link>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7">
                              <div className="noresult">
                                <div className="text-center">
                                  <lord-icon
                                    src="https://cdn.lordicon.com/msoeawqm.json"
                                    trigger="loop"
                                    colors="primary:#121331,secondary:#08a88a"
                                    style={{
                                      width: "75px",
                                      height: "75px",
                                    }}
                                  ></lord-icon>
                                  <h5
                                    className="mt-2"
                                    style={{
                                      fontSize: "16.25px",
                                      color: "#495957",
                                    }}
                                  >
                                    Sorry! No Result Found
                                  </h5>
                                  <p
                                    className="text-muted mb-0"
                                    style={{
                                      fontSize: "13px",
                                      color: "#878A99",
                                    }}
                                  >
                                    We've searched more than 150+ Orders. We did
                                    not find any orders for your search.
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <div
        className="modal fade zoomIn"
        id="deleteRecordModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header" style={{ borderBottom: "none" }}>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                id="btn-close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="mt-2 text-center">
                <lord-icon
                  src="https://cdn.lordicon.com/gsqxdxog.json"
                  trigger="loop"
                  colors="primary:#f7b84b,secondary:#f06548"
                  style={{ width: "100px", height: "100px" }}
                ></lord-icon>
                <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
                  <h4>Are you Sure?</h4>
                  <p className="text-muted mx-4 mb-0">
                    Are you sure you want to remove this record?
                  </p>
                </div>
              </div>
              <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
                <button
                  type="button"
                  className="btn w-sm btn-light close-btn"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn w-sm btn-danger remove"
                  id="delete-record"
                >
                  Yes, Delete It!
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
