import React from "react";
import { useApp } from "../../context/AppContext";
import KpiCard from "../../components/KpiCard";
import ProductionPlanModal from "../../components/ProductionPlanModal";
import {
  HelpdeskAndGuidelines,
  PageHeader,
  RecordsTable,
  WorkflowLine,
  qty,
} from "./DashboardShared";

export default function NurseryOperatorDashboard() {
  const { currentUser, data, getVisible, can, navigate } = useApp();
  const [showAdd, setShowAdd] = React.useState(false);
  const nursery = getVisible("nur");
  const production = getVisible("prod");
  const inspections = getVisible("insp");
  const pending = production.filter(
    (record) => record.status === "Pending" || record.status === "In Review",
  );

  return (
    <div className="p-3 sm:p-6 space-y-6">
      <PageHeader
        title={`Welcome, ${currentUser.name}`}
        actions={
          can("prod") && (
            <button
              onClick={() => setShowAdd(true)}
              className="action-button"
            >
              Add production
            </button>
          )
        }
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Assigned seed garden"
          value={nursery.length}
          sublabel={nursery[0]?.status || "Assigned seed garden"}
          onClick={() => navigate("nur")}
        />
        <KpiCard
          label="Seedlings recorded"
          value={production
            .reduce((sum, record) => sum + qty(record), 0)
            .toLocaleString()}
          sublabel={`${production.length} production records`}
          onClick={() => navigate("prod")}
        />
        <KpiCard
          label="Awaiting inspection"
          value={pending.length}
          sublabel="Not yet approved"
          onClick={() => navigate("prod", { status: "Pending" })}
        />
        <KpiCard
          label="Review progress"
          value={inspections.length}
          sublabel="Linked checks"
          onClick={() => navigate("prod")}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecordsTable
          title="Recent production activity"
          records={[...production].sort((a, b) => b.date.localeCompare(a.date))}
          empty="No production records yet."
          onRecordClick={(record) => navigate("workflow", { workflowPageKey: 'prod', workflowRecordId: record.id })}
          columns={["status", "date", "by"]}
        />
        <RecordsTable
          title="Assigned seed garden details"
          records={nursery}
          empty="No seed garden assigned."
          onRecordClick={(record) => navigate("workflow", { workflowPageKey: 'nur', workflowRecordId: record.id })}
          columns={["status", "date"]}
        />
      </div>
      <WorkflowLine steps={["Record production", "Wait for inspection", "Track the result"]} />
      <HelpdeskAndGuidelines />
      <ProductionPlanModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        nurOptions={nursery.map((record) => record.name)}
        varOptions={data.vars.map((record) => record.name)}
      />
    </div>
  );
}
