import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ToastContainer } from "./components/ToastContainer";
import { AnalysisProvider } from "./context/AnalysisContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import { DashboardPage } from "./pages/DashboardPage";
import { AnalyzePage } from "./pages/AnalyzePage";
import { WorkspacePage } from "./pages/WorkspacePage";
import { AnalysisResultsPage } from "./pages/AnalysisResultsPage";

export default function App() {
  return (
    <ThemeProvider>
      <AnalysisProvider>
        <ToastProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/analyze" element={<AnalyzePage />} />
                <Route path="/workspace" element={<WorkspacePage />} />
                <Route path="/results" element={<AnalysisResultsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </BrowserRouter>
          <ToastContainer />
        </ToastProvider>
      </AnalysisProvider>
    </ThemeProvider>
  );
}
