import React, { useEffect, useState } from "react";

export default function Notification() {
  const [policy, setPolicy] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState("all");

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
    return (
      clientName.includes(query) ||
      item.companyName.companyName.toLowerCase().includes(query) ||
      item.subCategory.subCategoryName.toLowerCase().includes(query)
    );
  });

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

  return (
    <>
      <div className="main-content">
        <div className="page-content">
          <div className="container-fluid">
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
                                onChange={(e) => setSearchQuery(e.target.value)}
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
                                <option value="all" selected>
                                  All
                                </option>
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
                                className="srno_sort"
                                style={{
                                  fontSize: ".8rem",
                                  fontWeight: "bold",
                                }}
                              >
                                SR No.
                              </th>
                              <th
                                className="clientName_sort"
                                style={{
                                  fontSize: ".8rem",
                                  fontWeight: "bold",
                                }}
                              >
                                Client Name
                              </th>
                              <th
                                className="companyName_sort"
                                style={{
                                  fontSize: ".8rem",
                                  fontWeight: "bold",
                                }}
                              >
                                Company Name
                              </th>
                              <th
                                className="policyName_sort"
                                style={{
                                  fontSize: ".8rem",
                                  fontWeight: "bold",
                                }}
                              >
                                Policy Name
                              </th>
                              <th
                                className="expiryDate_sort"
                                style={{
                                  fontSize: ".8rem",
                                  fontWeight: "bold",
                                }}
                              >
                                Remaining Days
                              </th>
                            </tr>
                          </thead>
                          <tbody className="list form-check-all">
                            {finalFilteredData.length > 0 ? (
                              finalFilteredData.map((data, index) => (
                                <tr key={index}>
                                  <td
                                    className="serial number"
                                    style={{ fontSize: ".8rem" }}
                                  >
                                    {index + 1}
                                  </td>
                                  <td
                                    className="client_name"
                                    style={{ fontSize: ".8rem" }}
                                  >{`${data.clientName?.firstName || ""} ${
                                    data.clientName?.lastName || ""
                                  }`}</td>
                                  <td
                                    className="company_name"
                                    style={{ fontSize: ".8rem" }}
                                  >
                                    {data.companyName.companyName}
                                  </td>
                                  <td
                                    className="policy_name"
                                    style={{ fontSize: ".8rem" }}
                                  >
                                    {data.subCategory.subCategoryName}
                                  </td>
                                  <td
                                    className="expiry_date"
                                    style={{ fontSize: ".8rem" }}
                                  >
                                    {calculateDaysLeft(data.expiryDate)} days
                                    left
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="5">
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
                                        We couldn't find any policies matching
                                        your filter.
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
    </>
  );
}
