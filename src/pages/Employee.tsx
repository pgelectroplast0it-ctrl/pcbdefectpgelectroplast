import { useState } from "react";
import { getEmployeeSession, clearEmployeeSession } from "@/lib/dataStore";
import { EmployeeSession } from "@/types/pcb";
import EmployeeLogin from "@/components/EmployeeLogin";
import DefectEntryForm from "@/components/DefectEntryForm";

const EmployeePage = () => {
  const existingSession = getEmployeeSession();
  const [session, setSession] = useState<EmployeeSession | null>(existingSession);

  if (session) {
    return (
      <DefectEntryForm
        session={session}
        onSubmit={() => {}}
        onLogout={() => {
          clearEmployeeSession();
          setSession(null);
        }}
      />
    );
  }

  return <EmployeeLogin onSessionStart={(newSession) => setSession(newSession)} />;
};

export default EmployeePage;
