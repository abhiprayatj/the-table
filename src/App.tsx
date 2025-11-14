import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ClassDetail from "./pages/ClassDetail";
import Profile from "./pages/Profile";
import CreateClass from "./pages/CreateClass";
import ApplyHost from "./pages/ApplyHost";
import Admin from "./pages/Admin";
import AllClasses from "./pages/AllClasses";
import BeATeacher from "./pages/BeATeacher";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/class/:id" element={<ClassDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-class" element={<CreateClass />} />
          <Route path="/apply-host" element={<ApplyHost />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/classes" element={<AllClasses />} />
          <Route path="/be-a-teacher" element={<BeATeacher />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
