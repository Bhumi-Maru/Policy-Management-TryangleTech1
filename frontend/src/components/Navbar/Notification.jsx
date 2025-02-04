import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as bootstrap from "bootstrap";

export default function Notification({ handleMenuClick }) {
  const [policy, setPolicy] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState("all");
  const [selectedPolicy, setSelectedPolicy] = useState(null);

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
                                        <td style={{ textAlign: "center" }}>
                                          {policy.policyAttachment ? (
                                            <a
                                              href={`http://localhost:8000${policy.policyAttachment}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              style={{ textDecoration: "none" }}
                                              data-bs-toggle="tooltip"
                                              title={policy.policyAttachment
                                                .split(/[/\\]/)
                                                .pop()}
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
                                            "No Attachment"
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
    </>
  );
}
