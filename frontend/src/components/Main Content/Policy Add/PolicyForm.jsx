import React, { useState, useEffect } from "react";
import "./PolicyForm.css";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

export default function PolicyForm() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    policyNumber: "",
    clientName: "",
    companyName: "",
    mainCategory: "",
    subCategory: "",
    subPolicy: "", // Add subPolicy field
    issueDate: "",
    expiryDate: "",
    policyAmount: "",
    policyAttachment: null,
  });
  const [companies, setCompanies] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subPolicies, setSubPolicies] = useState([]);

  // Fetch options from backend
  useEffect(() => {
    const fetchOptions = async () => {
      setError(null);
      try {
        // Fetch clients
        const clientRes = await fetch("http://localhost:8000/api/clients");
        // Fetch companies
        const companyRes = await fetch("http://localhost:8000/api/company");
        const mainCategoryRes = await fetch(
          "http://localhost:8000/api/mainCategory"
        );
        const subCategoryRes = await fetch(
          "http://localhost:8000/api/subCategory"
        );
        const subPolicyRes = await fetch(
          "http://localhost:8000/api/sub-policy"
        );

        if (
          !clientRes.ok ||
          !companyRes.ok ||
          !mainCategoryRes.ok ||
          !subCategoryRes.ok ||
          !subPolicyRes.ok
        ) {
          throw new Error("Failed to fetch data");
        }

        const clientsData = await clientRes.json();
        const companiesData = await companyRes.json();
        const mainCategoryData = await mainCategoryRes.json();
        const subCategoryData = await subCategoryRes.json();
        const subPolicyData = await subPolicyRes.json();

        setClients(clientsData);
        setCompanies(companiesData);
        setMainCategories(mainCategoryData);
        setSubCategories(subCategoryData);
        setSubPolicies(subPolicyData);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchOptions();
  }, []);

  // Dropdown options
  const clientOptions = clients.map((client) => ({
    value: client._id,
    label: `${client.firstName} ${client.lastName}`,
  }));

  const companyOptions = companies.map((company) => ({
    value: company._id,
    label: company.companyName,
  }));

  const mainCategoryOptions = mainCategories.map((category) => ({
    value: category._id,
    label: category.mainCategoryName,
  }));

  const subCategoryOptions = subCategories.map((sub) => ({
    value: sub._id,
    label: sub.subCategoryName,
  }));

  const subPolicyOptions = subPolicies.map((subPolicy) => ({
    value: subPolicy._id,
    label: subPolicy.companyName, // Use an appropriate label
  }));

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.policyNumber)
      newErrors.policyNumber = "Policy Number is required";
    if (!formData.clientName) newErrors.clientName = "Client Name is required";
    if (!formData.companyName)
      newErrors.companyName = "Company Name is required";
    if (!formData.mainCategory)
      newErrors.mainCategory = "Main Category is required";
    if (!formData.subCategory)
      newErrors.subCategory = "Sub Category is required";
    if (!formData.subPolicy) newErrors.subPolicy = "Sub Policy is required"; // Add validation for subPolicy
    if (!formData.issueDate) newErrors.issueDate = "Issue Date is required";
    if (!formData.expiryDate) newErrors.expiryDate = "Expiry Date is required";
    if (!formData.policyAmount)
      newErrors.policyAmount = "Policy Amount is required";
    if (!formData.policyAttachment)
      newErrors.policyAttachment = "Policy Attachment is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle dropdown changes
  const handleSelectChange = (field, option) => {
    setFormData({ ...formData, [field]: option ? option.value : "" });
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle file changes
  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Create FormData object to handle files
    const formDataWithFiles = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "policyAttachment" && value) {
        formDataWithFiles.append(key, value);
      } else {
        formDataWithFiles.append(key, value);
      }
    });

    try {
      const response = await fetch("http://localhost:8000/api/policy", {
        method: "POST",
        body: formDataWithFiles,
      });

      if (response.ok) {
        navigate("/policy"); // Redirect to the policy list page
      } else {
        alert("Failed to create policy. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form. Please check your network connection.");
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-xxl-6 col-lg-12">
          <div className="card">
            <div className="card-body">
              <div className="live-preview">
                <form onSubmit={handleSubmit} className="row g-3">
                  {error && <p className="text-danger">Error: {error}</p>}

                  {/* Policy Number */}
                  <div className="col-md-4">
                    <label
                      className="form-label"
                      style={{ fontSize: "13px", fontWeight: "bold" }}
                    >
                      Policy Number
                    </label>
                    <input
                      type="number"
                      name="policyNumber"
                      className="form-control"
                      value={formData.policyNumber}
                      onChange={handleInputChange}
                    />
                    {errors.policyNumber && (
                      <small className="text-danger">
                        {errors.policyNumber}
                      </small>
                    )}
                  </div>

                  {/* Client Name */}
                  <div className="col-md-4">
                    <label style={{ fontSize: "13px", fontWeight: "bold" }}>
                      Client Name
                    </label>
                    <Select
                      options={clientOptions}
                      onChange={(option) =>
                        handleSelectChange("clientName", option)
                      }
                      placeholder="Select a client"
                    />
                    {errors.clientName && (
                      <small className="text-danger">{errors.clientName}</small>
                    )}
                  </div>

                  {/* Company Name */}
                  <div className="col-md-4">
                    <label style={{ fontSize: "13px", fontWeight: "bold" }}>
                      Company Name
                    </label>
                    <Select
                      options={companyOptions}
                      onChange={(option) =>
                        handleSelectChange("companyName", option)
                      }
                      placeholder="Select a company"
                    />
                    {errors.companyName && (
                      <small className="text-danger">
                        {errors.companyName}
                      </small>
                    )}
                  </div>

                  {/* Main Category */}
                  <div className="col-md-4">
                    <label style={{ fontSize: "13px", fontWeight: "bold" }}>
                      Main Category
                    </label>
                    <Select
                      options={mainCategoryOptions}
                      onChange={(option) =>
                        handleSelectChange("mainCategory", option)
                      }
                      placeholder="Select a main category"
                    />
                    {errors.mainCategory && (
                      <small className="text-danger">
                        {errors.mainCategory}
                      </small>
                    )}
                  </div>

                  {/* Sub Category */}
                  <div className="col-md-4">
                    <label style={{ fontSize: "13px", fontWeight: "bold" }}>
                      Sub Category
                    </label>
                    <Select
                      options={subCategoryOptions}
                      onChange={(option) =>
                        handleSelectChange("subCategory", option)
                      }
                      placeholder="Select a sub category"
                    />
                    {errors.subCategory && (
                      <small className="text-danger">
                        {errors.subCategory}
                      </small>
                    )}
                  </div>

                  {/* Sub Policy */}
                  <div className="col-md-4">
                    <label style={{ fontSize: "13px", fontWeight: "bold" }}>
                      Sub Policy
                    </label>
                    <Select
                      options={subPolicyOptions}
                      onChange={(option) =>
                        handleSelectChange("subPolicy", option)
                      }
                      placeholder="Select a sub policy"
                    />
                    {errors.subPolicy && (
                      <small className="text-danger">{errors.subPolicy}</small>
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
                      value={formData.issueDate}
                      onChange={handleInputChange}
                    />
                    {errors.issueDate && (
                      <small className="text-danger">{errors.issueDate}</small>
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
                      <small className="text-danger">{errors.expiryDate}</small>
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
                      onChange={handleFileChange}
                    />
                    {errors.policyAttachment && (
                      <small className="text-danger">
                        {errors.policyAttachment}
                      </small>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div
                    className="col-md-2 position-relative d-flex justify-content-center align-items-center"
                    style={{ left: "50%" }}
                  >
                    <button
                      style={{ fontSize: "13px", fontWeight: "bold" }}
                      type="submit"
                      className="btn w-100 btn-submit"
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
    </div>
  );
}
