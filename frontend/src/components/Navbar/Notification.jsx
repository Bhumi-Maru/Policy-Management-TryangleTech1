import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as bootstrap from "bootstrap";

export default function Notification({ handleMenuClick }) {
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [policy, setPolicy] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState("all");
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [selectedClientEmail, setSelectedClientEmail] = useState("");
  const [emailModalVisible, setEmailModalVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const policyRes = await fetch("http://localhost:8000/api/policy");
        const policyData = await policyRes.json();
        setPolicy(policyData);
      } catch (error) {
        console.error("Error fetching policy Dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  console.log("policy 111", policy);

  // Calculate remaining days
  const calculateDaysLeft = (expiryDate) => {
    if (!expiryDate) return "No date provided";
    const expiry = new Date(expiryDate);
    const today = new Date();
    const timeDiff = expiry - today;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysLeft >= 0 ? daysLeft : "Expired";
  };

  // Filter clients based on search query
  const filteredData = policy.filter((item) => {
    const query = searchQuery.toLowerCase();
    const clientName = `${item.clientName?.firstName || ""} ${
      item.clientName?.lastName || ""
    }`.toLowerCase();

    // Filter by search query
    const searchMatch =
      item.policyNumber?.toLowerCase().includes(query) ||
      clientName.includes(query) ||
      item.expiryDate?.toLowerCase().includes(query);

    // Filter by days remaining
    const expiryDate =
      item.subPolicy && item.subPolicy.length > 0
        ? item.subPolicy[0].expiryDate
        : null;
    const daysLeft = expiryDate ? calculateDaysLeft(expiryDate) : "N/A";

    let filterMatch = true;

    // Apply filter based on selected filter option
    if (filterOption === "today" && daysLeft !== 0) {
      filterMatch = false;
    } else if (filterOption === "tomorrow" && daysLeft !== 1) {
      filterMatch = false;
    } else if (filterOption === "10" && (daysLeft < 0 || daysLeft > 10)) {
      filterMatch = false;
    } else if (filterOption === "25" && (daysLeft < 0 || daysLeft > 25)) {
      filterMatch = false;
    } else if (filterOption === "50" && (daysLeft < 0 || daysLeft > 50)) {
      filterMatch = false;
    } else if (filterOption === "100" && (daysLeft < 0 || daysLeft > 100)) {
      filterMatch = false;
    }

    return searchMatch && filterMatch;
  });

  // Initialize tooltips for table rows
  useEffect(() => {
    const tooltipTriggerList = Array.from(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Cleanup function to destroy tooltips when component unmounts or re-renders
    return () => {
      tooltipTriggerList.forEach((tooltipTriggerEl) => {
        const tooltipInstance = bootstrap.Tooltip.getInstance(tooltipTriggerEl);
        if (tooltipInstance) {
          tooltipInstance.dispose();
        }
      });
    };
  }, [policy]);

  const handleView = (policy) => {
    setSelectedPolicy(policy);
    const modal = new bootstrap.Modal(document.getElementById("showModal"));
    modal.show();
  };

  const handleSendEmailClick = (policy) => {
    setSelectedPolicy(policy);

    // Find the client based on the policy's clientName.clientId
    const client = clients.find(
      (client) => client._id === policy.clientName._id
    );

    // Check if client exists and if their email is available
    if (client) {
      // Check if the client has an email
      if (client.email) {
        setSelectedClientEmail(client.email);
      } else {
        setSelectedClientEmail("No email found");
        alert("Client email is missing.");
      }
    } else {
      setSelectedClientEmail("Client not found");
      alert("Client not found.");
    }

    // Show the email modal
    setEmailModalVisible(true);
  };

  const handleSendEmail = async () => {
    if (!selectedClientEmail) {
      alert("Client email is missing.");
      return;
    }

    const subject = "Insurance Policy from Tryangle Tech";
    const body = `
     
    
    Dear ${selectedPolicy?.clientName?.firstName} ${
      selectedPolicy?.clientName?.lastName
    },  
    
    I hope this message finds you well.  
    
    We are writing to remind you that your policy (Policy Number: ${
      selectedPolicy?.policyNumber
    }) is approaching its expiry date on ${
      selectedPolicy?.subPolicy[0]?.expiryDate.split("T")[0]
    }.  
    
    To ensure uninterrupted coverage and continued peace of mind, we kindly encourage you to review your policy and consider renewing it at your earliest convenience.  
    
    If you have any questions or require assistance, our team is here to help. Please don't hesitate to reach out.  
    
    Warm regards,  
    Insurance Company
    `;

    try {
      const response = await fetch("http://localhost:8000/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: selectedClientEmail,
          subject: subject,
          body: body,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Email sent successfully!");
        setEmailModalVisible(false);
      } else {
        alert("Failed to send email.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  // Function to fetch company name from API using companyId
  const getCompanyNameById = async (companyId) => {
    try {
      // Fetch company details from the API
      const response = await fetch(
        `http://localhost:8000/api/company?id=${companyId}`
      );
      const data = await response.json();

      console.log("data", data); // Log the response to inspect it

      // Check if data was returned and contains a matching company ID
      const matchingCompany = data.find((company) => company._id === companyId); // Find the company by matching _id

      if (matchingCompany) {
        return matchingCompany.companyName; // Return the company name if found
      } else {
        return "No Company Name Found"; // If no company name was found
      }
    } catch (error) {
      console.error("Error fetching company data:", error);
      return "Error fetching company data"; // If the API call fails
    }
  };

  // Assuming selectedPolicy is correctly set
  const companyId = selectedPolicy?.subPolicy[0]?.companyName; // Fetch companyId, which should match one of the company IDs in the response
  console.log("companyId", companyId); // Log the companyId

  const fetchCompanyName = async () => {
    setLoading(true); // Set loading to true when starting the fetch
    const name = await getCompanyNameById(companyId); // Await the result
    setCompanyName(name); // Set the company name in state
    setLoading(false); // Set loading to false after the fetch is complete
  };

  useEffect(() => {
    if (companyId) {
      fetchCompanyName(); // Call the async function to fetch and log the company name
    }
  }, [companyId]); // Only call fetchCompanyName when companyId changes

  return (
    <>
      <div className="container-fluid">
        <div className="row">
          <div className="col">
            <div className="h-100">
              <div className="row">
                <div className="col-lg-12">
                  <div className="card" style={{ border: "none" }}>
                    <div className="card-body">
                      <div className="listjs-table" id="customerList">
                        <div className="row g-4 mb-3 d-flex flex-row-reverse">
                          <div
                            className="col-sm"
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            <div
                              style={{
                                width: "40%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-start",
                              }}
                            >
                              <div className="search-box ms-2">
                                <input
                                  type="text"
                                  className="form-control search"
                                  placeholder="Search..."
                                  value={searchQuery}
                                  onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                  }
                                />
                                <i className="ri-search-line search-icon"></i>
                              </div>
                            </div>
                            <div
                              className="dataTables_length"
                              id="alternative-pagination_length"
                            >
                              <label
                                style={{
                                  display: "flex",
                                  gap: "10px",
                                  fontSize: "13px",
                                  alignItems: "center",
                                }}
                              >
                                <select
                                  name="alternative-pagination_length"
                                  aria-controls="alternative-pagination"
                                  className="form-select form-control"
                                  value={filterOption}
                                  onChange={(e) =>
                                    setFilterOption(e.target.value)
                                  }
                                >
                                  <option value="all">All</option>
                                  <option value="today">Today</option>
                                  <option value="tomorrow">Tomorrow</option>
                                  <option value="10">Next 10 Days</option>
                                  <option value="25">Next 25 Days</option>
                                  <option value="50">Next 50 Days</option>
                                  <option value="100">Next 100 Days</option>
                                </select>
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="table-responsive table-card mt-3 mb-1">
                          <table
                            className="table align-middle table-nowrap"
                            id="customerTable"
                          >
                            <thead className="table-light">
                              <tr>
                                <th
                                  style={{
                                    fontSize: ".8rem",
                                    fontWeight: "bold",
                                  }}
                                >
                                  SR No.
                                </th>
                                <th
                                  style={{
                                    fontSize: ".8rem",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Policy No.
                                </th>
                                <th
                                  style={{
                                    fontSize: ".8rem",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Client Name
                                </th>
                                <th
                                  style={{
                                    fontSize: ".8rem",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Expiry Date
                                </th>
                                <th
                                  style={{
                                    fontSize: ".8rem",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Remaining Days
                                </th>
                                <th
                                  style={{
                                    fontSize: ".8rem",
                                    fontWeight: "bold",
                                    textAlign: "center",
                                  }}
                                >
                                  Policy Attachment
                                </th>
                                <th
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
                              {filteredData.length > 0 ? (
                                filteredData
                                  .slice(0, 10)
                                  .map((policy, index) => {
                                    const firstExpiryDate =
                                      policy.subPolicy &&
                                      policy.subPolicy.length > 0
                                        ? policy.subPolicy[0].expiryDate
                                        : null;
                                    const remainingDays = firstExpiryDate
                                      ? calculateDaysLeft(firstExpiryDate)
                                      : "N/A";
                                    return (
                                      <tr key={index}>
                                        <td
                                          className="serial number"
                                          style={{ fontSize: ".8rem" }}
                                        >
                                          {index + 1}
                                        </td>
                                        <td
                                          className="policy number"
                                          style={{ fontSize: ".8rem" }}
                                        >
                                          {policy.policyNumber}
                                        </td>
                                        <td
                                          className="client_name"
                                          style={{ fontSize: ".8rem" }}
                                        >
                                          {`${
                                            policy.clientName?.firstName || ""
                                          } ${
                                            policy.clientName?.lastName || ""
                                          }`}
                                        </td>
                                        <td
                                          className="expiry_date"
                                          style={{ fontSize: ".8rem" }}
                                        >
                                          {firstExpiryDate
                                            ? firstExpiryDate.split("T")[0]
                                            : "N/A"}
                                        </td>
                                        <td
                                          className="remaining_days"
                                          style={{ fontSize: ".8rem" }}
                                        >
                                          {remainingDays}
                                        </td>
                                        {/* Document Link */}
                                        {/* Policy Attachment with Hover Tooltip */}
                                        <td style={{ textAlign: "center" }}>
                                          {policy?.subPolicy?.[0]
                                            ?.policyAttachment ? (
                                            <a
                                              href={`http://localhost:8000${policy.subPolicy[0].policyAttachment}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              data-bs-toggle="tooltip"
                                              title={
                                                // Ensure the attachment is a valid string before calling .split()
                                                typeof policy.subPolicy[0]
                                                  .policyAttachment ===
                                                  "string" &&
                                                policy.subPolicy[0].policyAttachment.trim() !==
                                                  ""
                                                  ? policy.subPolicy[0].policyAttachment
                                                      .split("/")
                                                      .pop()
                                                  : policy.subPolicy[0]
                                                      .policyAttachment
                                              }
                                              style={{ textDecoration: "none" }}
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
                                            <span
                                              data-bs-toggle="tooltip"
                                              title="No Attachment Available"
                                              style={{
                                                color: "grey",
                                                cursor: "not-allowed",
                                              }}
                                            >
                                              <i className="ri-pushpin-fill"></i>
                                            </span>
                                          )}
                                        </td>
                                        <td>
                                          <div
                                            className="d-flex gap-2 justify-content-center"
                                            style={{
                                              textAlign: "-webkit-center",
                                            }}
                                          >
                                            <div className="view">
                                              <Link
                                                to="#"
                                                onClick={() =>
                                                  handleView(policy)
                                                }
                                                style={{
                                                  textDecoration: "none",
                                                }}
                                              >
                                                <i className="bx bx-show"></i>
                                              </Link>
                                            </div>
                                            <div className="view">
                                              <Link
                                                style={{
                                                  textDecoration: "none",
                                                }}
                                              >
                                                <i className="ri-mail-line"></i>
                                              </Link>
                                            </div>
                                            <div className="view">
                                              <Link
                                                style={{
                                                  textDecoration: "none",
                                                }}
                                              >
                                                <i className="bx bxl-whatsapp"></i>
                                              </Link>
                                            </div>
                                            <div className="view">
                                              <Link
                                                style={{
                                                  textDecoration: "none",
                                                }}
                                              >
                                                <i className="bx bx-text"></i>
                                              </Link>
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })
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
                                          We've searched more than 150+ Orders.
                                          We did not find any orders for your
                                          search.
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
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {emailModalVisible && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Send Email</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEmailModalVisible(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Client Email:</strong> {selectedClientEmail}
                  {console.log("selectedClientEmail", selectedClientEmail)}
                </p>
                <p>
                  <strong>Policy Number:</strong> {selectedPolicy?.policyNumber}
                </p>
                <p>
                  <strong>Message:</strong>
                </p>
                <textarea
                  className="form-control"
                  rows="4"
                  defaultValue={`
Subject: Upcoming Policy Expiry Notice  

Dear ${selectedPolicy?.clientName?.firstName} ${
                    selectedPolicy?.clientName?.lastName
                  },  

I hope this message finds you well.  

We are writing to remind you that your policy (Policy Number: ${
                    selectedPolicy?.policyNumber
                  }) is approaching its expiry date on ${
                    selectedPolicy?.subPolicy[0]?.expiryDate.split("T")[0]
                  }.  

To ensure uninterrupted coverage and continued peace of mind, we kindly encourage you to review your policy and consider renewing it at your earliest convenience.  

If you have any questions or require assistance, our team is here to help. Please don't hesitate to reach out.  

Warm regards,  
Insurance Company
`}
                ></textarea>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setEmailModalVisible(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleSendEmail}
                >
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      <div
        className="modal fade"
        id="showModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-light p-3">
              <h5
                className="modal-title"
                id="exampleModalLabel"
                style={{ fontSize: "16.25px", color: "#495057" }}
              >
                View Detail
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body row d-flex flex-wrap justify-content-center">
              {selectedPolicy && (
                <>
                  {/* policy number */}
                  <div className="mb-3 col-md-6">
                    <label
                      htmlFor="policyNumber-field"
                      className="form-label"
                      style={{ fontSize: "13px", color: "#495057" }}
                    >
                      Policy Number:
                    </label>
                    <input
                      type="number"
                      name="policyNumber"
                      className="form-control"
                      value={selectedPolicy.policyNumber}
                    />
                  </div>
                  {/* client name */}
                  <div className="mb-3 col-md-6">
                    <label
                      htmlFor="customername-field"
                      className="form-label"
                      style={{ fontSize: "13px", color: "#495057" }}
                    >
                      Client Name:
                    </label>
                    <input
                      type="text"
                      name="clientName"
                      className="form-control"
                      value={`${selectedPolicy.clientName?.firstName} ${selectedPolicy.clientName?.lastName}`}
                    />
                  </div>
                  {/* company name */}
                  <div className="mb-3 col-md-6">
                    <label
                      htmlFor="companyname-field"
                      className="form-label"
                      style={{ fontSize: "13px", color: "#495057" }}
                    >
                      Company Name:
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      className="form-control"
                      // value={
                      //   selectedPolicy?.companyName
                      //     ? getCompanyName(selectedPolicy.companyName)
                      //     : "N/A"
                      // }
                      value={companyName ? companyName : "Company Not Found"}
                      readOnly
                    />
                  </div>
                  {console.log(
                    "selectedPolicy 1",
                    selectedPolicy.subPolicy[0].companyName
                  )}
                  {/* policy name */}
                  <div className="mb-3 col-md-6">
                    <label
                      htmlFor="policyName-field"
                      className="form-label"
                      style={{ fontSize: "13px", color: "#495057" }}
                    >
                      Policy Name:
                    </label>
                    <input
                      type="text"
                      name="policyName"
                      className="form-control"
                      value={selectedPolicy.subCategory?.subCategoryName}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light cancel-btn"
                data-bs-dismiss="modal"
                style={{ fontSize: "13px" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
