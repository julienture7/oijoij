# Project Todos

## Phase 1: Core Functionality

### Download Data Feature
- [x] **Create `todos.md` file** (Completed)
- [x] **Identify data sources for "Download Data"**: Pinpoint all JSON files in `src/data` that should be included. (Completed - all JSONs in `public/data` now)
- [x] **Add "Download Data" button to UI**: Place this button in a logical location, perhaps in the dashboard header or sidebar. (Completed - added to `dashboard-header.tsx`)
- [x] **Implement data aggregation logic**: Write a function to read and combine the content of the identified JSON files. (Completed in `dashboard-header.tsx`)
- [x] **Implement download trigger**: Create functionality to convert the aggregated data into a downloadable JSON file (e.g., `all_data.json`). (Completed in `dashboard-header.tsx`)
- [ ] **Test "Download Data" feature thoroughly.**

### Export PDF Feature
- [ ] **Identify data sections for PDF**: List all sections of the website (patient profile, medical history, lab results, etc.) to be included in the PDF.
- [ ] **Research and select PDF generation strategy/library**: Evaluate options like `jspdf`, `html2canvas`, `react-pdf/renderer`, or print stylesheets.
- [ ] **Design PDF layout and structure**: Create a mock-up or outline of how the PDF will look, focusing on print optimization and doctor readability.
    - [ ] Define header/footer content (e.g., patient name, date, page numbers).
    - [ ] Plan data presentation for each section (tables, lists, condensed text).
- [ ] **Add "Export PDF" button to UI**: Place this button alongside the "Download Data" button or in another suitable location.
- [ ] **Develop React components for PDF content (if using `react-pdf/renderer` or similar)**: Create reusable components to render data into the PDF format.
- [ ] **Implement PDF generation logic**:
    - [ ] Write functions to fetch and format data for the PDF.
    - [ ] Integrate the chosen PDF library/strategy to compile the document.
    - [ ] Trigger the download of the generated PDF.
- [ ] **Implement print-specific styling**: Ensure the PDF uses a clean, black-and-white design, legible fonts, and well-formatted tables.
- [ ] **Test "Export PDF" feature across different data scenarios.**
- [ ] **Optimize PDF file size (if necessary).**

## Phase 2: Refinements and Enhancements (Future)
- [ ] **User feedback incorporation**: Gather feedback on both features and iterate.
- [ ] **Selective data download/export**: Allow users to choose which data sections to include in the download/PDF.
- [ ] **Configuration for PDF**: Options for paper size, orientation, etc.
- [ ] **Error handling and loading states**: Implement robust error messages and loading indicators for both features.
