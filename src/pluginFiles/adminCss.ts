export const adminCssContent = `@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&display=swap');

/* Main Wrapper & Layout */
.wc-bpe-app {
  font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  direction: rtl;
  text-align: right;
  color: #2c3338;
  max-width: 1400px;
  margin: 15px 0 30px;
}

.wc-bpe-app * {
  box-sizing: border-box;
}

/* Header Banner */
.wc-bpe-header-banner {
  background: #1d2327;
  color: #c3c4c7;
  border-radius: 4px 4px 0 0;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
}
.wc-bpe-header-banner .title {
  color: #fff;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}
.wc-bpe-header-banner .badge-wp {
  background: #2271b1;
  color: #fff;
  padding: 2px 6px;
  border-radius: 2px;
  font-weight: bold;
}

/* Main Navigation Tabs */
.wc-bpe-nav-tabs {
  background: #fff;
  border: 1px solid #c3c4c7;
  border-top: none;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0 10px;
}
.wc-bpe-tab-btn {
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #50575e;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.wc-bpe-tab-btn:hover {
  color: #2271b1;
}
.wc-bpe-tab-btn.active {
  color: #2271b1;
  border-bottom-color: #2271b1;
  background: #f6f7f7;
}

/* Container Cards */
.wc-bpe-card {
  background: #fff;
  border: 1px solid #c3c4c7;
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(0,0,0,.03);
  padding: 18px;
  margin-top: 15px;
}

/* Stepper Indicator */
.wc-bpe-stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  margin-bottom: 20px;
  padding: 10px 0;
}
.wc-bpe-stepper-track {
  position: absolute;
  top: 50%;
  left: 30px;
  right: 30px;
  height: 4px;
  background: #dcdcde;
  z-index: 1;
  transform: translateY(-50%);
}
.wc-bpe-stepper-progress {
  position: absolute;
  top: 50%;
  right: 30px;
  height: 4px;
  background: #2271b1;
  z-index: 2;
  transform: translateY(-50%);
  transition: width 0.3s ease;
}
.wc-bpe-step-node {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
}
.wc-bpe-step-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #c3c4c7;
  color: #646970;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 13px;
  transition: all 0.2s;
}
.wc-bpe-step-node.active .wc-bpe-step-circle {
  border-color: #2271b1;
  color: #2271b1;
  box-shadow: 0 0 0 4px #e5f0f8;
}
.wc-bpe-step-node.completed .wc-bpe-step-circle {
  background: #2271b1;
  border-color: #2271b1;
  color: #fff;
}
.wc-bpe-step-label {
  font-size: 12px;
  margin-top: 6px;
  color: #646970;
  font-weight: 500;
}
.wc-bpe-step-node.active .wc-bpe-step-label {
  color: #2271b1;
  font-weight: 700;
}

/* Toolbar & Filters */
.wc-bpe-toolbar {
  background: #fff;
  border: 1px solid #c3c4c7;
  padding: 12px 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  border-radius: 3px;
  margin-bottom: 15px;
}
.wc-bpe-toolbar-left, .wc-bpe-toolbar-right {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

/* Inputs & Form Controls */
.wc-bpe-input, .wc-bpe-select {
  border: 1px solid #8c8f94;
  border-radius: 3px;
  padding: 5px 8px;
  font-size: 12px;
  background: #f6f7f7;
  outline: none;
  font-family: inherit;
}
.wc-bpe-input:focus, .wc-bpe-select:focus {
  border-color: #2271b1;
  background: #fff;
  box-shadow: 0 0 0 1px #2271b1;
}

/* Editable Spreadsheet Table */
.wc-bpe-top-scrollbar {
  overflow-x: auto;
  background: #f8fafc;
  border: 1px solid #c3c4c7;
  border-bottom: none;
  height: 14px;
  border-radius: 3px 3px 0 0;
}
.wc-bpe-table-wrapper {
  background: #fff;
  border: 1px solid #c3c4c7;
  border-radius: 3px;
  overflow-x: auto;
  overflow-y: auto;
  max-height: calc(100vh - 280px);
  min-height: 400px;
  box-shadow: 0 1px 2px rgba(0,0,0,.03);
  position: relative;
}
.wc-bpe-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  white-space: nowrap;
  text-align: right;
}
.wc-bpe-table thead th {
  background: #f0f0f1;
  color: #2c3338;
  font-weight: 600;
  padding: 10px 12px;
  border-bottom: 1px solid #c3c4c7;
  border-left: 1px solid #e5e5e5;
  position: sticky;
  top: 0;
  z-index: 5;
}
.wc-bpe-table thead th:last-child {
  border-left: none;
}
.wc-bpe-table tbody tr {
  border-bottom: 1px solid #f0f0f1;
  transition: background 0.15s;
}
.wc-bpe-table tbody tr:hover {
  background: #f6f7f7;
}
.wc-bpe-table tbody tr.modified {
  background: #fff9e6;
}
.wc-bpe-table tbody tr.selected {
  background: #eef6fd;
}
.wc-bpe-table td {
  padding: 8px 10px;
  vertical-align: middle;
  border-left: 1px solid #f0f0f1;
}
.wc-bpe-table td:last-child {
  border-left: none;
}

/* Cell Editable Inputs */
.wc-bpe-cell-input {
  width: 100%;
  border: 1px solid transparent;
  background: transparent;
  padding: 4px 6px;
  border-radius: 3px;
  font-size: 12px;
  font-family: inherit;
  transition: all 0.2s;
}
.wc-bpe-cell-input:hover {
  border-color: #c3c4c7;
  background: #fff;
}
.wc-bpe-cell-input:focus {
  border-color: #2271b1;
  background: #fff;
  box-shadow: 0 0 0 1px #2271b1;
  outline: none;
}

/* Thumbnail */
.wc-bpe-thumb {
  width: 38px;
  height: 38px;
  border-radius: 4px;
  border: 1px solid #dcdcde;
  object-fit: cover;
  background: #f0f0f1;
  display: block;
  margin: 0 auto;
}
.wc-bpe-thumb-empty {
  width: 38px;
  height: 38px;
  border-radius: 4px;
  border: 1px solid #dcdcde;
  background: #f6f7f7;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8c8f94;
  margin: 0 auto;
  font-size: 14px;
}

/* Content Buttons for Description & Short Desc */
.wc-bpe-btn-content {
  border: 1px solid #dcdcde;
  background: #fff;
  color: #8c8f94;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-family: monospace;
  cursor: pointer;
  transition: all 0.2s;
}
.wc-bpe-btn-content.has-content {
  background: #f0f0f1;
  border-color: #8c8f94;
  color: #1d2327;
  font-weight: 600;
}
.wc-bpe-btn-content:hover {
  background: #2271b1;
  color: #fff;
  border-color: #2271b1;
}

/* Switch Toggle (Manage Stock Yes / No) */
.wc-bpe-switch {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}
.wc-bpe-switch-track {
  width: 34px;
  height: 18px;
  border-radius: 10px;
  background: #c3c4c7;
  position: relative;
  transition: background 0.2s;
}
.wc-bpe-switch.active .wc-bpe-switch-track {
  background: #00a32a;
}
.wc-bpe-switch-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 2px;
  right: 2px;
  transition: transform 0.2s;
}
.wc-bpe-switch.active .wc-bpe-switch-thumb {
  transform: translateX(-16px);
}
.wc-bpe-switch-label {
  font-size: 11px;
  font-weight: 600;
}
.wc-bpe-switch.active .wc-bpe-switch-label {
  color: #00a32a;
}

/* Primary & Action Buttons */
.wc-bpe-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}
.wc-bpe-btn-primary {
  background: #2271b1;
  color: #fff;
}
.wc-bpe-btn-primary:hover {
  background: #135e96;
}
.wc-bpe-btn-success {
  background: #00a32a;
  color: #fff;
}
.wc-bpe-btn-success:hover {
  background: #008a20;
}
.wc-bpe-btn-secondary {
  background: #f6f7f7;
  border-color: #8c8f94;
  color: #2c3338;
}
.wc-bpe-btn-secondary:hover {
  background: #ebebeb;
}
.wc-bpe-btn-danger {
  background: #fff;
  border-color: #d63638;
  color: #d63638;
}
.wc-bpe-btn-danger:hover {
  background: #d63638;
  color: #fff;
}

/* Modals */
.wc-bpe-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.wc-bpe-modal {
  background: #fff;
  border-radius: 4px;
  max-width: 650px;
  width: 100%;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  border: 1px solid #c3c4c7;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.wc-bpe-modal-header {
  background: #f0f0f1;
  padding: 12px 18px;
  border-bottom: 1px solid #c3c4c7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 700;
  font-size: 13px;
}
.wc-bpe-modal-body {
  padding: 16px;
  max-height: 70vh;
  overflow-y: auto;
}
.wc-bpe-modal-footer {
  background: #f0f0f1;
  padding: 10px 18px;
  border-top: 1px solid #c3c4c7;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Progress Bar */
.wc-bpe-progress-track {
  width: 100%;
  background: #f0f0f1;
  height: 12px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #dcdcde;
  margin: 10px 0;
}
.wc-bpe-progress-fill {
  background: #2271b1;
  height: 100%;
  width: 0%;
  transition: width 0.3s ease;
}

/* Notices & Badges */
.wc-bpe-notice {
  padding: 12px 16px;
  border-right: 4px solid;
  border-radius: 3px;
  margin-bottom: 15px;
  font-size: 12px;
}
.wc-bpe-notice-info {
  background: #f0f6fc;
  border-color: #2271b1;
  color: #1d2327;
}
.wc-bpe-notice-success {
  background: #edfaef;
  border-color: #00a32a;
  color: #008a20;
}
.wc-bpe-notice-warning {
  background: #fff8e5;
  border-color: #dba617;
  color: #614400;
}

/* Quick Filter Preset Buttons */
.wc-bpe-preset-btn {
  background: #f0f0f1;
  color: #2c3338;
  border: 1px solid #dcdcde;
  border-radius: 12px;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}
.wc-bpe-preset-btn:hover {
  background: #e5e5e5;
  border-color: #c3c4c7;
}
.wc-bpe-preset-btn.active {
  background: #2271b1;
  color: #fff;
  border-color: #2271b1;
}

.wc-bpe-wiz-row.selected {
  background: #eef6fd !important;
  border-right: 3px solid #2271b1;
}
`;
