import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as bootstrap from "bootstrap";

export default function PolicyTable({ handleMenuClick }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [policy, setPolicy] = useState([]);
  const [company, setCompany] = useState([]);

  // Fetch policy and company data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch policy data
        const policyRes = await fetch("http://localhost:8000/api/policy");
        const policyData = await policyRes.json();
        setPolicy(policyData);

        // Fetch company data
        const companyRes = await fetch("http://localhost:8000/api/company");
        const companyData = await companyRes.json();
        setCompany(companyData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  console.log("policy data is ....", policy);

  // Helper function to get company name by ID
  const getCompanyNameById = (companyId) => {
    const companyObj = company.find((comp) => comp._id === companyId);
    return companyObj ? companyObj.companyName : "Unknown Company";
  };

  // Filter policies based on search query
  const filteredData = policy.filter((policy) => {
    const query = searchQuery.toLowerCase();
    const clientName =
      (policy.clientName?.firstName || "") +
      " " +
      (policy.clientName?.lastName || "");
    return (
      clientName.toLowerCase().includes(query) ||
      getCompanyNameById(policy.subPolicy.companyName)
        .toLowerCase()
        .includes(query) ||
      policy.subCategory?.subCategoryName?.toLowerCase().includes(query) ||
      policy.subPolicy.expiryDate?.toLowerCase().includes(query) ||
      policy.subPolicy.policyAmount?.toLowerCase().includes(query)
    );
  });

  console.log("filteredData", filteredData);

  // Pagination logic
  const rowsPerPage = 5;
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  console.log("currentData", currentData);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle deleting a policy

  const handleDelete = (policyToDelete) => {
    const modal = new bootstrap.Modal(
      document.getElementById("deleteRecordModal")
    );
    modal.show();

    const deleteButton = document.getElementById("delete-record");
    const closeButton = document.getElementById("btn-close");

    const cleanupListeners = () => {
      deleteButton.removeEventListener("click", confirmDeletion);
      closeButton.removeEventListener("click", cancelDeletion);
    };

    const confirmDeletion = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/policy/${policyToDelete._id}`,
          { method: "DELETE" }
        );
        if (response.ok) {
          setPolicy((prevPolicies) =>
            prevPolicies.filter((policy) => policy._id !== policyToDelete._id)
          );
          modal.hide();
          showDeleteToast("Record deleted successfully!");
        } else {
          const errorData = await response.json();
          showDeleteToast(`Failed to delete policy: ${errorData.message}`);
        }
      } catch (error) {
        console.error("Error deleting policy:", error);
        showDeleteToast("An error occurred while deleting the policy.");
      } finally {
        cleanupListeners();
      }
    };

    const cancelDeletion = () => {
      modal.hide();
      cleanupListeners();
    };

    deleteButton.addEventListener("click", confirmDeletion);
    closeButton.addEventListener("click", cancelDeletion);
  };

  // Show delete toast message
  const showDeleteToast = (message) => {
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

  // Initialize tooltips for table rows
  useEffect(() => {
    const tooltipTriggerList = Array.from(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }, [policy]);

  return (
    <>
      {/* Table */}
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12">
            <div className="card" style={{ border: "none" }}>
              <div className="card-body">
                <div className="listjs-table" id="customerList">
                  <div className="row g-4 mb-3 d-flex flex-row-reverse">
                    <div className="col-sm-auto">
                      <div>
                        <Link
                          type="button"
                          className="btn btn-success add-btn"
                          id="create-btn"
                          data-bs-target="#showModal"
                          to="/policy-add"
                          onClick={() => handleMenuClick("Add Policy")}
                          style={{ fontSize: "13px", color: "white" }}
                        >
                          <i className="ri-add-line align-bottom me-1"></i> Add
                        </Link>
                      </div>
                    </div>
                    <div className="col-sm">
                      <div className="d-flex">
                        <div className="search-box ms-2">
                          <input
                            type="text"
                            className="form-control search"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          <i className="ri-search-line search-icon"></i>
                        </div>
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
                          <th style={{ fontSize: ".8rem", fontWeight: "bold" }}>
                            SR No.
                          </th>
                          <th style={{ fontSize: ".8rem", fontWeight: "bold" }}>
                            Policy No.
                          </th>
                          <th style={{ fontSize: ".8rem", fontWeight: "bold" }}>
                            Client Name
                          </th>
                          <th style={{ fontSize: ".8rem", fontWeight: "bold" }}>
                            Company Name
                          </th>
                          <th style={{ fontSize: ".8rem", fontWeight: "bold" }}>
                            Sub Category
                          </th>
                          <th style={{ fontSize: ".8rem", fontWeight: "bold" }}>
                            Entry Date
                          </th>
                          <th style={{ fontSize: ".8rem", fontWeight: "bold" }}>
                            Issue Date
                          </th>
                          <th style={{ fontSize: ".8rem", fontWeight: "bold" }}>
                            Expiry Date
                          </th>
                          <th style={{ fontSize: ".8rem", fontWeight: "bold" }}>
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="list form-check-all">
                        {currentData.length > 0 ? (
                          currentData.map((policy, index) => (
                            <tr key={index}>
                              <td style={{ fontSize: ".8rem" }}>
                                {(currentPage - 1) * rowsPerPage + index + 1}
                              </td>
                              <td style={{ fontSize: ".8rem" }}>
                                {policy.policyNumber}
                              </td>
                              <td style={{ fontSize: ".8rem" }}>
                                {`${policy.clientName?.firstName} ${policy.clientName?.lastName}`}
                              </td>
                              {console.log(
                                "policy client name",
                                policy?.clientName?.firstName
                              )}
                              <td style={{ fontSize: ".8rem" }}>
                                {getCompanyNameById(
                                  policy.subPolicy[0].companyName
                                )}
                              </td>
                              <td style={{ fontSize: ".8rem" }}>
                                {policy.subCategory?.subCategoryName}
                              </td>
                              <td style={{ fontSize: ".8rem" }}>
                                {policy.subPolicy[0].entryDate.split("T")[0]}
                              </td>
                              <td style={{ fontSize: ".8rem" }}>
                                {policy.subPolicy[0].issueDate.split("T")[0]}
                              </td>
                              <td style={{ fontSize: ".8rem" }}>
                                {policy.subPolicy[0].expiryDate.split("T")[0]}
                              </td>
                              <td>
                                <div className="d-flex gap-2 justify-content-center">
                                  <div className="information">
                                    <i
                                      className="ri-information-fill"
                                      style={{
                                        color: "#405189",
                                        cursor: "pointer",
                                        fontSize: "15px",
                                      }}
                                      data-bs-toggle="tooltip"
                                      data-bs-placement="top"
                                      data-bs-title="user"
                                    ></i>
                                  </div>
                                  <div className="edit">
                                    <Link
                                      to={`/policy-update-form/${policy._id}`}
                                      onClick={() =>
                                        handleMenuClick("Update Policy")
                                      }
                                      style={{ textDecoration: "none" }}
                                    >
                                      <i className="ri-edit-2-line"></i>
                                    </Link>
                                  </div>
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
                          ))
                        ) : (
                          <tr>
                            <td colSpan="9">
                              <div className="noresult">
                                <div className="text-center">
                                  <lord-icon
                                    src="https://cdn.lordicon.com/msoeawqm.json"
                                    trigger="loop"
                                    colors="primary:#121331,secondary:#08a88a"
                                    style={{ width: "75px", height: "75px" }}
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
                  {/* Pagination */}
                  <div className="gridjs-footer" style={{ boxShadow: "none" }}>
                    {filteredData.length > 0 && (
                      <div className="gridjs-pagination">
                        <div
                          style={{ fontSize: "13px" }}
                          role="status"
                          aria-live="polite"
                          className="gridjs-summary"
                        >
                          Showing <b>{(currentPage - 1) * rowsPerPage + 1}</b>{" "}
                          to{" "}
                          <b>
                            {Math.min(currentPage * rowsPerPage, policy.length)}
                          </b>{" "}
                          of <b>{filteredData.length}</b> results
                        </div>
                        <div className="gridjs-pages">
                          <button
                            style={{ fontSize: "13px", cursor: "pointer" }}
                            tabIndex="0"
                            role="button"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            title="Previous"
                            aria-label="Previous"
                          >
                            Previous
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => (
                            <button
                              key={i}
                              style={{
                                fontSize: "13px",
                                backgroundColor:
                                  currentPage === i + 1 ? "#405189" : "",
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
                          ))}
                          <button
                            style={{ fontSize: "13px" }}
                            tabIndex="0"
                            role="button"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            title="Next"
                            aria-label="Next"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* delete modal */}
        <div
          className="modal fade zoomIn"
          id="deleteRecordModal"
          tabindex="-1"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: "none" }}>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  id="btn-close"
                ></button>
              </div>
              <div class="modal-body">
                <div class="mt-2 text-center">
                  <lord-icon
                    src="https://cdn.lordicon.com/gsqxdxog.json"
                    trigger="loop"
                    colors="primary:#f7b84b,secondary:#f06548"
                    style={{ width: "100px", height: "100px" }}
                  ></lord-icon>
                  <div class="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
                    <h4>Are you Sure?</h4>
                    <p class="text-muted mx-4 mb-0">
                      Are you sure you want to remove this record?
                    </p>
                  </div>
                </div>
                <div class="d-flex gap-2 justify-content-center mt-4 mb-2">
                  <button
                    type="button"
                    class="btn w-sm btn-light close-btn"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    class="btn w-sm btn-danger remove"
                    id="delete-record"
                  >
                    Yes, Delete It!
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
