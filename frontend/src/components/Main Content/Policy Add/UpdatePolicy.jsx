import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import "./UpdatePolicy.css";
import Select from "react-select";
import * as bootstrap from "bootstrap";

export default function UpdatePolicy() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [errors, setErrors] = useState({});
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    clientName: "",
    companyName: [],
    mainCategory: "",
    subCategory: "",
    entryDates: [new Date()],
    issueDates: [""],
    expiryDates: [""],
    policyAmounts: [""],
    policyAttachments: [],
  });
  const [policy, setPolicy] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isOpenPolicyAttachment, setIsOpenPolicyAttachment] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchOptions();
  }, [selectedPolicy]);

  const fetchOptions = async () => {
    try {
      const policyRes = await fetch(`http://localhost:8000/api/policy/${id}`);
      if (!policyRes.ok) {
        throw new Error("Failed to fetch policy");
      }
      const policyData = await policyRes.json();
      setPolicy(policyData);
      setFormData({
        clientName: policyData.clientName?._id || "",
        companyName: policyData.companyName?._id || "",
        mainCategory: policyData.mainCategory?._id || "",
        subCategory: policyData.subCategory?._id || "",
        issueDate: policyData.issueDate || "",
        expiryDate: policyData.expiryDate || "",
        policyAmount: policyData.policyAmount || "",
        policyAttachment: policyData.policyAttachment || null,
      });

      // Fetch clients, categories, etc.
      const clientsRes = await fetch("http://localhost:8000/api/clients");
      const clientsData = await clientsRes.json();
      setClients(clientsData);

      const companiesRes = await fetch("http://localhost:8000/api/company");
      const companiesData = await companiesRes.json();
      setCompanies(companiesData);

      const maincategoriesRes = await fetch(
        "http://localhost:8000/api/mainCategory"
      );
      const maincategoriesData = await maincategoriesRes.json();
      setMainCategories(maincategoriesData);
      console.log("maincategoriesData", maincategoriesData);

      const subcategoriesRes = await fetch(
        "http://localhost:8000/api/subCategory"
      );
      const subcategoriesData = await subcategoriesRes.json();
      setSubCategories(subcategoriesData);
    } catch (err) {
      setError(err.message);
    }
  };

  // Options for dropdowns
  const clientOptions = (clients || []).map((client) => ({
    value: client._id,
    label: `${client.firstName} ${client.lastName || ""}`.trim(),
  }));

  //company
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

  console.log("updatedCompanyOptions", updatedCompanyOptions);

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

  console.log("updatedMainCategoryOptions", updatedMainCategoryOptions);

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

  console.log("updatedSubCategoryOptions", updatedSubCategoryOptions);

  const handleSelectChange = (field, option) => {
    setFormData({
      ...formData,
      [field]: option ? option.value : null,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleArrayChange = (field, index, value) => {
    setFormData((prevData) => {
      const updatedArray = [...prevData[field]];
      updatedArray[index] = value;
      return { ...prevData, [field]: updatedArray };
    });
  };

  const addNewField = (field) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: [...prevData[field], ""],
    }));
  };

  const handleFileChange = (index, file) => {
    setFormData((prevData) => {
      const updatedFiles = [...prevData.policyAttachments];
      updatedFiles[index] = file;
      return { ...prevData, policyAttachments: updatedFiles };
    });
  };

  //form 1 handle submit
  const handleSubmitFormOne = async (e) => {
    e.preventDefault();

    // Simple client-side validation
    if (
      !formData.clientName ||
      !formData.mainCategory ||
      !formData.subCategory
    ) {
      setErrors({
        clientName: "Client Name is required",
        mainCategory: "Main Category is required",
        subCategory: "Sub Category is required",
      });
      return;
    }

    const payload = {
      clientName: formData.clientName,
      mainCategory: formData.mainCategory,
      subCategory: formData.subCategory,
    };

    try {
      const response = await fetch(`http://localhost:8000/api/policy/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (response.status === 200) {
        showSuccessToast("Record updated successfully!");
        navigate("/policy");
      } else {
        showSuccessToast("Error updating record");
      }
    } catch (error) {
      console.error("Error updating policy data:", error);
      showSuccessToast("Error updating policy");
    }
  };

  // form 2 handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create FormData object
    const formDataPayload = new FormData();

    // Append form data fields
    formData.clientName &&
      formDataPayload.append("clientName", formData.clientName);
    formData.companyName.forEach((company) =>
      formDataPayload.append("companyName", company)
    );
    formData.entryDates.forEach((date) =>
      formDataPayload.append("entryDates", date)
    );
    formData.issueDates.forEach((date) =>
      formDataPayload.append("issueDates", date)
    );
    formData.expiryDates.forEach((date) =>
      formDataPayload.append("expiryDates", date)
    );
    formData.policyAmounts.forEach((amount) =>
      formDataPayload.append("policyAmounts", amount)
    );
    formData.policyAttachments.forEach((file) =>
      formDataPayload.append("policyAttachments", file)
    );

    try {
      const response = selectedPolicy
        ? await fetch(
            `http://localhost:8000/api/policy/${selectedPolicy._id}`,
            {
              method: "PUT",
              body: formDataPayload,
            }
          )
        : await fetch("http://localhost:8000/api/policy", {
            method: "POST",
            body: formDataPayload,
          });

      if (response.ok) {
        const updatedPolicy = await response.json();
        if (selectedPolicy) {
          setPolicy(updatedPolicy);
        } else {
          setPolicy((prevPolicies) => [...prevPolicies, updatedPolicy]);
        }
        showSuccessToast("Record updated successfully!");
        setSelectedPolicy(null);
        setIsOpenPolicyAttachment(false);
        setFormData({
          issueDate: [""],
          expiryDate: [""],
          companyName: [""],
          policyAmount: [""],
          policyAttachment: [],
        });
      } else {
        console.error("Failed to save policy:", response.statusText);
      }
    } catch (error) {
      console.error("Error saving policy:", error);
    }
  };

  const handleEdit = (policyData) => {
    setSelectedPolicy(policyData);

    setFormData({
      companyName: policyData.companyName,
      issueDate: policyData.issueDate,
      expiryDate: policyData.expiryDate,
      policyAmount: policyData.policyAmount,
      policyAttachment: policyData.policyAttachment,
    });
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

  // Handle deleting a company
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
          `http://localhost:8000/api/policy/${policyToDelete._id}`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
          setPolicy((prevPolicies) =>
            prevPolicies.filter((policy) => policy._id !== policyToDelete._id)
          );
          modal.hide();
          showSuccessToast("Policy deleted successfully!");
        } else {
          const errorData = await response.json();
          showSuccessToast(`Failed to delete policy: ${errorData.message}`);
        }
      } catch (error) {
        console.error("Error deleting policy:", error);
        showSuccessToast("An error occurred while deleting the policy.");
      }
    };

    const cancelDeletion = () => {
      modal.hide();
    };

    deleteButton.addEventListener("click", confirmDeletion);
    closeButton.addEventListener("click", cancelDeletion);
  };

  // Initialize tooltips for table rows
  useEffect(() => {
    const tooltipTriggerList = Array.from(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new bootstrap.Tooltip(tooltipTriggerEl);
    });

    return () => {
      tooltipTriggerList.forEach((tooltipTriggerEl) => {
        const tooltipInstance = bootstrap.Tooltip.getInstance(tooltipTriggerEl);
        if (tooltipInstance) {
          tooltipInstance.dispose();
        }
      });
    };
  }, [policy]);

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
                            placeholder="Select a client"
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
                              placeholder="Select a main category"
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
                            value={formData.issueDate}
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
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                          />
                          {errors.expiryDate && (
                            <small className="text-danger">
                              {errors.expiryDate}
                            </small>
                          )}
                        </div>
                        {/* Company Name */}
                        <div className="col-md-4">
                          <label
                            style={{ fontSize: "13px", fontWeight: "bold" }}
                          >
                            Company Name
                          </label>
                          {updatedCompanyOptions.length > 0 && (
                            <Select
                              options={updatedCompanyOptions}
                              onChange={(option) =>
                                handleSelectChange("companyName", option)
                              }
                              value={updatedCompanyOptions.find(
                                (option) =>
                                  option.value === formData.companyName
                              )}
                              placeholder="Select a main category"
                            />
                          )}
                          {errors.companyName && (
                            <small className="text-danger">
                              {errors.companyName}
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
                                Array.isArray(formData.policyAttachment)
                                  ? formData.policyAttachment.length > 0
                                    ? formData.policyAttachment
                                        .map((attachment) =>
                                          typeof attachment === "string"
                                            ? attachment
                                                .split("/")
                                                .pop()
                                                .replace(/-\d+/, "")
                                            : attachment
                                        )
                                        .join(", ")
                                    : "No Policy Attachment Available"
                                  : formData.policyAttachment &&
                                    typeof formData.policyAttachment ===
                                      "string"
                                  ? formData.policyAttachment
                                      .split("/")
                                      .pop()
                                      .replace(/-\d+/, "")
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
                          {/* Expiry Date */}
                          <th
                            className="companyName_sort"
                            style={{
                              fontSize: ".8rem",
                              fontWeight: "bold",
                            }}
                          >
                            Company Name
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
                        {/* {policy.length > 0 ? (
                          policy.map((policy, index) => ( */}
                        <tr>
                          {/* Serial Number */}
                          <td
                            className="serial number"
                            data-sort="serial number"
                            style={{ fontSize: ".8rem" }}
                          >
                            {index + 1}
                          </td>
                          {/* Issue Date */}
                          <td
                            className="issue_date"
                            style={{ fontSize: ".8rem" }}
                          >
                            {policy.issueDate}
                          </td>

                          {/* Expiry Date */}
                          <td
                            className="expiry_date"
                            style={{ fontSize: ".8rem" }}
                          >
                            {policy.expiryDate}
                          </td>
                          {/* company name */}
                          <td
                            className="company_name"
                            style={{ fontSize: ".8rem" }}
                          >
                            {policy.companyName
                              ? policy.companyName.companyName
                              : ""}
                          </td>
                          {/* policy amount */}
                          <td
                            className="policy_amount"
                            style={{ fontSize: ".8rem" }}
                          >
                            &nbsp; &nbsp; &nbsp; {policy.policyAmount}
                          </td>
                          {/* Policy Attachment Link */}
                          <td
                            data-column-id="other documents"
                            style={{ textAlign: "center" }}
                          >
                            {policy.policyAttachment ? (
                              <a
                                href={`http://localhost:8000${policy.policyAttachment}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "none" }}
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title={policy.policyAttachment}
                                data-bs-title={policy.policyAttachment}
                              >
                                <i
                                  className="ri-pushpin-fill"
                                  style={{
                                    color: "#405189",
                                    cursor: "pointer",
                                    fontSize: "15px",
                                  }}
                                ></i>
                              </a>
                            ) : (
                              <span style={{ color: "red" }}>
                                No attachment available
                              </span>
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
                                {/* {console.log("Client ID:", policy.id)} */}
                                <Link
                                  to={`/policy-update-form/${policy._id}`}
                                  onClick={() => handleEdit(policy)}
                                  style={{ textDecoration: "none" }}
                                >
                                  <i className="ri-edit-2-line"></i>
                                </Link>
                              </div>
                              {/* Delete Button */}
                              <div className="remove">
                                <Link
                                  onClick={() => handleDelete(policy)}
                                  style={{ textDecoration: "none" }}
                                >
                                  <i className="ri-delete-bin-2-line"></i>
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                        {/* ))
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
                        )} */}
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
