import React, { useState } from "react";
import "./Navbar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({
  activeItem,
  handleMenuClick,
  isSidebarOpen,
  toggleSidebar,
}) {
  console.log(activeItem);

  const [userToggle, setUserToggle] = useState(false);
  const navigate = useNavigate();

  const handleToggle = () => {
    setUserToggle(!userToggle);
  };

  const handleOnClick = () => {
    navigate("/notification");
    handleMenuClick("Notification");
  };

  return (
    <>
      <header
        id="page-topbar"
        style={{ left: isSidebarOpen ? "250px" : "0px" }}
      >
        <div className="layout-width">
          <div className="navbar-header justify-content-between">
            <div className="d-flex">
              <button
                type="button"
                className="btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger"
                style={{ border: "none", background: "none" }}
                id="topnav-hamburger-icon"
                onClick={toggleSidebar}
              >
                <span
                  style={{
                    color: "#878a99",
                    fontWeight: "bold",
                    fontSize: "20px",
                  }}
                  className={
                    isSidebarOpen ? "ri-menu-2-line" : "fa-solid fa-arrow-right"
                  }
                ></span>
              </button>
              <nav aria-label="breadcrumb" style={{ paddingTop: "25px" }}>
                <ol
                  className="breadcrumb"
                  style={{ fontSize: "13px", fontWeight: "bolder" }}
                >
                  <li className="breadcrumb-item"></li>
                  {activeItem}
                  {activeItem === "Policy Category" && (
                    <li className="breadcrumb-item active" aria-current="page">
                      {activeItem === "main-category" && (
                        <li
                          className="breadcrumb-item active"
                          aria-current="page"
                        >
                          Main Category
                        </li>
                      )}
                      {activeItem === "sub-category" && (
                        <li
                          className="breadcrumb-item active"
                          aria-current="page"
                        >
                          Sub Category
                        </li>
                      )}
                      {activeItem === "Notification" && (
                        <li
                          className="breadcrumb-item active"
                          aria-current="page"
                        >
                          Notification
                        </li>
                      )}
                    </li>
                  )}
                </ol>
              </nav>
            </div>

            <div className="d-flex align-items-center">
              <div
                className="dropdown topbar-head-dropdown ms-1 header-item"
                id="notificationDropdown"
              >
                <Link
                  type="button"
                  to="/notification"
                  onClick={handleOnClick}
                  className="btn btn-icon btn-topbar btn-ghost-secondary text-center"
                  id="page-header-notifications-dropdown"
                  data-bs-auto-close="outside"
                  aria-haspopup="true"
                  aria-expanded={userToggle ? "true" : "false"}
                >
                  <i className="bx bx-bell fs-22"></i>
                  <span
                    className="position-absolute topbar-badge fs-10 translate-middle badge rounded-pill bg-danger"
                    style={{ margin: "8px 7px" }}
                  >
                    0<span className="visually-hidden">unread messages</span>
                  </span>
                </Link>
              </div>

              <div className="dropdown ms-sm-3 header-item topbar-user">
                <button
                  type="button"
                  className="btn"
                  onClick={handleToggle}
                  style={{ border: "none" }}
                  id="page-header-user-dropdown"
                  aria-haspopup="true"
                  aria-expanded={userToggle ? "true" : "false"}
                >
                  <span className="d-flex align-items-center">
                    <img
                      className="rounded-circle header-profile-user"
                      src="assets/images/users/avatar-1.jpg"
                      alt="Header Avatar"
                      style={{ width: "40px", height: "40px" }}
                    />
                    <span className="text-start ms-xl-2">
                      <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">
                        Anna Adame
                      </span>
                    </span>
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userToggle && (
                  <div
                    class="dropdown-menu dropdown-menu-end show"
                    data-popper-placement="bottom-end"
                    style={{
                      position: "absolute",
                      inset: "0px 0px auto auto",
                      margin: "0px",
                      transform: "translate(0px, 65px)",
                    }}
                  >
                    <h6 class="dropdown-header">Welcome Anna!</h6>
                    <a class="dropdown-item" href="pages-profile.html">
                      <i class="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i>{" "}
                      <span class="align-middle">Profile</span>
                    </a>

                    <a class="dropdown-item" href="auth-logout-basic.html">
                      <i class="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>
                      <span class="align-middle" data-key="t-logout">
                        Logout
                      </span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
