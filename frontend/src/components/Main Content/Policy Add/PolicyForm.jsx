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
    issueDate: "",
    expiryDate: "",
    policyAmount: "",
    policyAttachment: [],
  });
  const [companies, setCompanies] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [clientRes, companyRes, mainCategoryRes, subCategoryRes] =
          await Promise.all([
            fetch("http://localhost:8000/api/clients"),
            fetch("http://localhost:8000/api/company"),
            fetch("http://localhost:8000/api/mainCategory"),
            fetch("http://localhost:8000/api/subCategory"),
          ]);

        if (
          !clientRes.ok ||
          !companyRes.ok ||
          !mainCategoryRes.ok ||
          !subCategoryRes.ok
        ) {
          throw new Error("Failed to fetch data");
        }

        setClients(await clientRes.json());
        setCompanies(await companyRes.json());
        setMainCategories(await mainCategoryRes.json());
        setSubCategories(await subCategoryRes.json());
      } catch (err) {
        setError(err.message);
      }
    };
    fetchOptions();
  }, []);

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
    if (!formData.issueDate) newErrors.issueDate = "Issue Date is required";
    if (!formData.expiryDate) newErrors.expiryDate = "Expiry Date is required";
    if (
      formData.issueDate &&
      formData.expiryDate &&
      formData.issueDate >= formData.expiryDate
    ) {
      newErrors.expiryDate = "Expiry Date should be later than Issue Date";
    }
    if (!formData.policyAmount)
      newErrors.policyAmount = "Policy Amount is required";
    if (formData.policyAttachment.length === 0)
      newErrors.policyAttachment = "At least one Policy Attachment is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectChange = (field, option) => {
    setFormData({ ...formData, [field]: option ? option.value : "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    const newFiles = [...files];
    setFormData({ ...formData, policyAttachment: newFiles }); // Store multiple files
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataWithFiles = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "policyAttachment" && value.length > 0) {
        // Append all files in the policyAttachment array
        value.forEach((file, index) => {
          formDataWithFiles.append("policyAttachment", file);
        });
      } else if (value) {
        formDataWithFiles.append(key, value);
      }
    });
    try {
      const response = await fetch("http://localhost:8000/api/policy", {
        method: "POST",
        body: formDataWithFiles,
      });

      if (response.ok) {
        navigate("/policy");
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
              <form onSubmit={handleSubmit} className="row g-3">
                {error && <p className="text-danger">Error: {error}</p>}

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
                    <small className="text-danger">{errors.policyNumber}</small>
                  )}
                </div>

                <div className="col-md-4">
                  <label
                    className="form-label"
                    style={{ fontSize: "13px", fontWeight: "bold" }}
                  >
                    Client Name
                  </label>
                  <Select
                    options={clients.map((client) => ({
                      value: client._id,
                      label: `${client.firstName} ${client.lastName}`,
                    }))}
                    onChange={(option) =>
                      handleSelectChange("clientName", option)
                    }
                    placeholder="Select a client"
                  />
                  {errors.clientName && (
                    <small className="text-danger">{errors.clientName}</small>
                  )}
                </div>

                <div className="col-md-4">
                  <label
                    className="form-label"
                    style={{ fontSize: "13px", fontWeight: "bold" }}
                  >
                    Company Name
                  </label>
                  <Select
                    options={companies.map((company) => ({
                      value: company._id,
                      label: company.companyName,
                    }))}
                    onChange={(option) =>
                      handleSelectChange("companyName", option)
                    }
                    placeholder="Select a company"
                  />
                  {errors.companyName && (
                    <small className="text-danger">{errors.companyName}</small>
                  )}
                </div>

                <div className="col-md-4">
                  <label
                    className="form-label"
                    style={{ fontSize: "13px", fontWeight: "bold" }}
                  >
                    Main Category
                  </label>
                  <Select
                    options={mainCategories.map((category) => ({
                      value: category._id,
                      label: category.mainCategoryName,
                    }))}
                    onChange={(option) =>
                      handleSelectChange("mainCategory", option)
                    }
                    placeholder="Select a main category"
                  />
                  {errors.mainCategory && (
                    <small className="text-danger">{errors.mainCategory}</small>
                  )}
                </div>

                <div className="col-md-4">
                  <label
                    className="form-label"
                    style={{ fontSize: "13px", fontWeight: "bold" }}
                  >
                    Sub Category
                  </label>
                  <Select
                    options={subCategories.map((sub) => ({
                      value: sub._id,
                      label: sub.subCategoryName,
                    }))}
                    onChange={(option) =>
                      handleSelectChange("subCategory", option)
                    }
                    placeholder="Select a sub category"
                  />
                  {errors.subCategory && (
                    <small className="text-danger">{errors.subCategory}</small>
                  )}
                </div>

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
                    <small className="text-danger">{errors.policyAmount}</small>
                  )}
                </div>

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
                    multiple
                  />
                  {errors.policyAttachment && (
                    <small className="text-danger">
                      {errors.policyAttachment}
                    </small>
                  )}
                </div>

                <div
                  className="col-md-2 position-relative d-flex justify-content-center align-items-center"
                  style={{ left: "826px" }}
                >
                  <button
                    type="submit"
                    className="btn w-100 btn-submit"
                    style={{ fontSize: "13px" }}
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
  );
}
