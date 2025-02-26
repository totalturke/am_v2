import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";

// Layout components
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";

// Pages
import Dashboard from "./pages/Dashboard";
import CorrectiveMaintenance from "./pages/CorrectiveMaintenance";
import PreventiveMaintenance from "./pages/PreventiveMaintenance";
import Purchasing from "./pages/Purchasing";
import Cities from "./pages/Cities";
import Buildings from "./pages/Buildings";
import Apartments from "./pages/Apartments";
import ApartmentDetails from "./pages/ApartmentDetails";
import NotFound from "@/pages/not-found";
import Login from "./pages/Login";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Protected routes */}
      <Route path="/">
        {() => (
          <AppLayout>
            <Dashboard />
          </AppLayout>
        )}
      </Route>
      
      <Route path="/corrective">
        {() => (
          <AppLayout>
            <CorrectiveMaintenance />
          </AppLayout>
        )}
      </Route>
      
      <Route path="/preventive">
        {() => (
          <AppLayout>
            <PreventiveMaintenance />
          </AppLayout>
        )}
      </Route>
      
      <Route path="/purchasing">
        {() => (
          <AppLayout>
            <Purchasing />
          </AppLayout>
        )}
      </Route>
      
      <Route path="/cities">
        {() => (
          <AppLayout>
            <Cities />
          </AppLayout>
        )}
      </Route>
      
      <Route path="/buildings">
        {() => (
          <AppLayout>
            <Buildings />
          </AppLayout>
        )}
      </Route>
      
      <Route path="/apartments/:id">
        {(params) => (
          <AppLayout>
            <ApartmentDetails id={params.id} />
          </AppLayout>
        )}
      </Route>
      
      <Route path="/apartments">
        {() => (
          <AppLayout>
            <Apartments />
          </AppLayout>
        )}
      </Route>
      
      <Route>
        {() => (
          <AppLayout>
            <NotFound />
          </AppLayout>
        )}
      </Route>
    </Switch>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-neutral-100 text-neutral-800 font-sans antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-neutral-100 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export { AppLayout };
export default App;
