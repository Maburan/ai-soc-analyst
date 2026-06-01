import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AnalysisProvider } from "./context/AnalysisContext";
import { AnalysisResultsPage } from "./pages/AnalysisResultsPage";
import { UploadLogsPage } from "./pages/UploadLogsPage";

export default function App() {
  return (
    <AnalysisProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<UploadLogsPage />} />
            <Route path="/results" element={<AnalysisResultsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AnalysisProvider>
  );
}
