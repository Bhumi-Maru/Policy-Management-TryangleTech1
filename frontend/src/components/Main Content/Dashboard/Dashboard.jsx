import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as bootstrap from "bootstrap";
import "./Dashboard.css";

export default function Dashboard({ handleMenuClick }) {
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [policy, setPolicy] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [selectedClientEmail, setSelectedClientEmail] = useState("");
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [filterOption, setFilterOption] = useState("all");
  const [emailContent, setEmailContent] = useState("");
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const policyRes = await fetch("http://localhost:8000/api/policy");
        const clientsRes = await fetch("http://localhost:8000/api/clients");
        const policyData = await policyRes.json();
        const clientsData = await clientsRes.json();
        setPolicy(policyData);
        setClients(clientsData);
        console.log("clientsData", clientsData);
      } catch (error) {
        console.error("Error fetching policy Dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  // Filter clients based on search query
  const filteredData = policy.filter((item) => {
    const query = searchQuery.toLowerCase();
    const clientName = `${item.clientName?.firstName || ""} ${
      item.clientName?.lastName || ""
    }`.toLowerCase();
    return (
      item.policyNumber?.toLowerCase().includes(query) ||
      clientName.includes(query) ||
      item.expiryDate?.toLowerCase().includes(query)
    );
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

  const handleView = useCallback((policy) => {
    setSelectedPolicy(policy);
    const modal = new bootstrap.Modal(document.getElementById("showModal"));
    modal.show();
  }, []);

  // Calculate remaining days
  const calculateDaysLeft = (expiryDate) => {
    if (!expiryDate) return "No date provided";
    const expiry = new Date(expiryDate);
    const today = new Date();
    const timeDiff = expiry - today;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysLeft >= 0 ? `${daysLeft} Days Remain` : "Expired";
  };

  // Filter policies based on the filterOption
  const filterByDaysRemaining = (data) => {
    const daysLeft = calculateDaysLeft(data.expiryDate);
    switch (filterOption) {
      case "All":
        return daysLeft;
      case "today":
        return daysLeft === 0;
      case "tomorrow":
        return daysLeft === 1;
      case "10":
        return daysLeft > 0 && daysLeft <= 10;
      case "25":
        return daysLeft > 10 && daysLeft <= 25;
      case "50":
        return daysLeft > 25 && daysLeft <= 50;
      case "100":
        return daysLeft > 50 && daysLeft <= 100;
      default:
        return true;
    }
  };

  // Apply the day filter to filtered data
  const finalFilteredData = filteredData.filter(filterByDaysRemaining);

  console.log("finalFilteredData", finalFilteredData);

  const handleSendEmailClick = (policy) => {
    setSelectedPolicy(policy);
    const client = clients.find(
      (client) => client._id === policy.clientName._id
    );
    if (client) {
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

    // Set default email content based on policy details
    const defaultEmailContent = `Subject: Upcoming Policy Expiry\n\nDear ${
      policy.clientName.firstName
    } ${
      policy.clientName.lastName
    },\n\nWe are writing to remind you that your policy (Policy Number: ${
      policy.policyNumber
    }) is approaching its expiry date on ${
      policy.subPolicy[0]?.expiryDate.split("T")[0]
    }. You have ${calculateDaysLeft(
      policy.subPolicy[0]?.expiryDate.split("T")[0]
    )} remaining to renew your policy. To ensure uninterrupted coverage and continued peace of mind, we kindly encourage you to review your policy and consider renewing it at your earliest convenience.\n\nPlease don't hesitate to reach out if you need assistance.\n\nWarm regards, Insurance Company`;
    setEmailContent(defaultEmailContent);

    setEmailModalVisible(true);
  };

  const handleSendEmail = async () => {
    if (!selectedClientEmail) {
      alert("Client email is missing.");
      return;
    }

    const subject = "Insurance Policy from Tryangle Tech";
    const body = emailContent; // Use the edited email content

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

  // Handle changes to the email content in the textarea
  const handleEmailContentChange = (event) => {
    setEmailContent(event.target.value);
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
      {/* Dashboard */}
      <div className="container-fluid">
        <div className="row">
          <div className="col">
            <div className="h-100">
              <div className="row">
                {/* card 1 */}
                <div className="col-lg-4 col-sm-6">
                  <Link to="/policy" onClick={() => handleMenuClick("Policy")}>
                    <div className="card card-animate">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1 overflow-hidden">
                            <p
                              className="text-uppercase fw-medium text-muted mb-0"
                              style={{ fontSize: "13px", color: "#878a99" }}
                            >
                              Total Policy
                            </p>
                          </div>
                        </div>
                        <div className="d-flex align-items-end justify-content-between mt-4">
                          <div>
                            <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                              <span
                                className="counter-value"
                                data-target="559.25"
                              >
                                {policy.length}
                              </span>
                            </h4>
                            <Link
                              to="/policy"
                              className="text-decoration-underline"
                              style={{ color: "#405189", fontSize: "13px" }}
                            >
                              View all policy
                            </Link>
                          </div>
                          <div class="avatar-sm flex-shrink-0">
                            <span class="avatar-title bg-success-subtle rounded fs-3">
                              <i className="ri-layout-3-line text-success"></i>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
                {/* card 2 */}
                <div className="col-lg-4 col-sm-6">
                  <Link
                    to="/notification"
                    onClick={() => handleMenuClick("Upcoming Expiry")}
                  >
                    <div className="card card-animate">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1 overflow-hidden">
                            <p
                              className="text-uppercase fw-medium text-muted text-truncate mb-0"
                              style={{ fontSize: "13px", color: "#878a99" }}
                            >
                              Upcoming Expiry
                            </p>
                          </div>
                        </div>
                        <div className="d-flex align-items-end justify-content-between mt-4">
                          <div>
                            <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                              <span
                                className="counter-value"
                                data-target="36894"
                              >
                                {policy.length}
                              </span>
                            </h4>
                            <Link
                              to="/notification"
                              className="text-decoration-underline"
                              style={{ color: "#405189", fontSize: "13px" }}
                            >
                              View all expiry
                            </Link>
                          </div>
                          <div class="avatar-sm flex-shrink-0">
                            <span class="avatar-title bg-info-subtle rounded fs-3">
                              <i class="fa-regular fa-calendar-days text-info"></i>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
                {/* card 3 */}
                <div className="col-lg-4 col-sm-6">
                  <Link to="/client" onClick={() => handleMenuClick("Client")}>
                    <div className="card card-animate">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1 overflow-hidden">
                            <p
                              className="text-uppercase fw-medium text-muted text-truncate mb-0"
                              style={{ fontSize: "13px", color: "#878a99" }}
                            >
                              Total Client
                            </p>
                          </div>
                        </div>
                        <div className="d-flex align-items-end justify-content-between mt-4">
                          <div>
                            <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                              <span
                                className="counter-value"
                                data-target="183.35"
                              >
                                {clients.length}
                              </span>
                            </h4>
                            <Link
                              to="/client"
                              className="text-decoration-underline"
                              style={{ color: "#405189", fontSize: "13px" }}
                            >
                              view all client
                            </Link>
                          </div>
                          <div class="avatar-sm flex-shrink-0">
                            <span class="avatar-title bg-warning-subtle rounded fs-3">
                              <i class="bx bx-user-circle text-warning"></i>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
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
                            <div className="view-all">
                              <Link
                                to="/notification"
                                onClick={() => handleMenuClick("Notification")}
                                className="link-success"
                                style={{ fontSize: "13px" }}
                              >
                                View More{" "}
                                <i className="ri-arrow-right-line align-middle"></i>
                              </Link>
                            </div>
                            {/* <div
                                class="dataTables_length"
                                id="example_length"
                                style={{
                                  display: "flex",
                                  justifyContent: "end",
                                  alignItems: "center",
                                  width: "60%",
                                }}
                              >
                                <label
                                  style={{
                                    display: "flex",
                                    fontSize: "13px",
                                    alignItems: "center",
                                    gap: "10px",
                                  }}
                                >
                                  Issue Date
                                  <input
                                    type="date"
                                    className="form-control"
                                    style={{ height: "33px", width: "126px" }}
                                  />
                                  Expiry Date
                                  <input
                                    type="date"
                                    className="form-control"
                                    style={{ height: "33px", width: "126px" }}
                                  />
                                </label>
                              </div> */}
                          </div>
                        </div>

                        <div className="table-responsive table-card mt-3 mb-1">
                          <table
                            className="table align-middle table-nowrap"
                            id="customerTable"
                          >
                            <thead className="table-light">
                              <tr>
                                {/* serial number */}
                                <th
                                  style={{
                                    fontSize: ".8rem",
                                    fontWeight: "bold",
                                  }}
                                >
                                  SR No.
                                </th>
                                {/* policy number */}
                                <th
                                  style={{
                                    fontSize: ".8rem",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Policy No.
                                </th>
                                {/* client name */}
                                <th
                                  style={{
                                    fontSize: ".8rem",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Client Name
                                </th>
                                {/* Expiry Date */}
                                <th
                                  style={{
                                    fontSize: ".8rem",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Expiry Date
                                </th>
                                {/* Remaining Days */}
                                <th
                                  style={{
                                    fontSize: ".8rem",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Remaining Days
                                </th>
                                {/* policy Attachment */}
                                <th
                                  style={{
                                    fontSize: ".8rem",
                                    fontWeight: "bold",
                                    textAlign: "center",
                                  }}
                                >
                                  Policy Attachment
                                </th>
                                {/* Action */}
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
                              {finalFilteredData.slice(0, 10).length > 0 ? (
                                finalFilteredData
                                  .slice(0, 10)
                                  .map((policy, index) => {
                                    // Get the first expiry date from subPolicy (if it exists)
                                    const firstExpiryDate =
                                      policy.subPolicy &&
                                      policy.subPolicy.length > 0
                                        ? policy.subPolicy[0].expiryDate
                                        : null;

                                    // Calculate remaining days based on the first expiry date
                                    const remainingDays = firstExpiryDate
                                      ? calculateDaysLeft(firstExpiryDate)
                                      : "N/A";

                                    return (
                                      <tr key={index}>
                                        {/* Serial Number */}
                                        <td
                                          className="serial number"
                                          data-sort="serial number"
                                          style={{ fontSize: ".8rem" }}
                                        >
                                          {index + 1}
                                        </td>

                                        {/* Policy Number */}
                                        <td
                                          className="policy number"
                                          data-sort="policy number"
                                          style={{ fontSize: ".8rem" }}
                                        >
                                          {policy.policyNumber}
                                        </td>

                                        {/* Customer Name */}
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

                                        {/* Expiry Date (first expiry date from subPolicy) */}
                                        <td
                                          className="expiry_date"
                                          style={{ fontSize: ".8rem" }}
                                        >
                                          {firstExpiryDate
                                            ? firstExpiryDate.split("T")[0]
                                            : "N/A"}
                                        </td>

                                        {/* Remaining Days */}
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

                                        {/* View Actions */}
                                        <td>
                                          <div
                                            className="d-flex gap-2 justify-content-center"
                                            style={{
                                              textAlign: "-webkit-center",
                                            }}
                                          >
                                            {/* View Button */}
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
                                            {/* Mail button */}

                                            <div className="view">
                                              <Link
                                                style={{
                                                  textDecoration: "none",
                                                  cursor: "pointer",
                                                }}
                                                onClick={() =>
                                                  handleSendEmailClick(policy)
                                                }
                                              >
                                                <i className="ri-mail-line"></i>
                                              </Link>
                                            </div>
                                            {/* WhatsApp button */}
                                            <div className="view">
                                              <Link
                                                style={{
                                                  textDecoration: "none",
                                                }}
                                              >
                                                <i className="bx bxl-whatsapp"></i>
                                              </Link>
                                            </div>
                                            {/* Text button */}
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

                        {/* <div
                            className="gridjs-footer"
                            style={{ boxShadow: "none" }}
                          >
                            {filteredData.length > 0 && (
                              <div className="gridjs-pagination">
                                <div
                                  style={{ fontSize: "13px" }}
                                  role="status"
                                  aria-live="polite"
                                  className="gridjs-summary"
                                >
                                  Showing{" "}
                                  <b>{(currentPage - 1) * rowsPerPage + 1}</b>{" "}
                                  to{" "}
                                  <b>
                                    {Math.min(
                                      currentPage * rowsPerPage,
                                      clients.length
                                    )}
                                  </b>{" "}
                                  of <b>{filteredData.length}</b> results
                                </div>
                                <div className="gridjs-pages">
                                  <button
                                    style={{
                                      fontSize: "13px",
                                      cursor: "pointer",
                                    }}
                                    tabIndex="0"
                                    role="button"
                                    onClick={() =>
                                      handlePageChange(currentPage - 1)
                                    }
                                    disabled={currentPage === 1}
                                    title="Previous"
                                    aria-label="Previous"
                                  >
                                    Previous
                                  </button>
                                  {Array.from(
                                    { length: totalPages },
                                    (_, i) => (
                                      <button
                                        key={i}
                                        style={{
                                          fontSize: "13px",
                                          backgroundColor:
                                            currentPage === i + 1
                                              ? "#405189"
                                              : "",
                                        }}
                                        tabIndex="0"
                                        role="button"
                                        className={
                                          currentPage === i + 1
                                            ? "gridjs-currentPage"
                                            : ""
                                        }
                                        onClick={() => handlePageChange(i + 1)}
                                        title={`Page ${i + 1}`}
                                        aria-label={`Page ${i + 1}`}
                                      >
                                        {i + 1}
                                      </button>
                                    )
                                  )}
                                  <button
                                    style={{ fontSize: "13px" }}
                                    tabIndex="0"
                                    role="button"
                                    onClick={() =>
                                      handlePageChange(currentPage + 1)
                                    }
                                    disabled={currentPage === totalPages}
                                    title="Next"
                                    aria-label="Next"
                                  >
                                    Next
                                  </button>
                                </div>
                              </div>
                            )}
                          </div> */}
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
                <h5 className="modal-title-email">Send Email</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEmailModalVisible(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p style={{ fontSize: "13px" }}>
                  <strong>Client Email:</strong> {selectedClientEmail}
                  {console.log("selectedClientEmail", selectedClientEmail)}
                </p>
                <p style={{ fontSize: "13px" }}>
                  <strong>Policy Number:</strong> {selectedPolicy?.policyNumber}
                </p>
                <p style={{ fontSize: "13px" }}>
                  <strong>Message:</strong>
                </p>
                <textarea
                  className="form-control"
                  rows="4"
                  value={emailContent} // Bind the textarea value to the state
                  onChange={handleEmailContentChange}
                ></textarea>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setEmailModalVisible(false)}
                  style={{ fontSize: "13px" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleSendEmail}
                  style={{ fontSize: "13px" }}
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
                      value={companyName}
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
