import Card from "../../ui/Card";

function AdminStats({ requests }) {
  const pendingCount = requests.filter((item) => item.status === "pending").length;
  const approvedCount = requests.filter((item) => item.status === "approved").length;
  const rejectedCount = requests.filter((item) => item.status === "rejected").length;

  const stats = [
    {
      label: "Pending Review",
      value: pendingCount,
      hint: "Applications awaiting decision",
      accent: "text-amber-300",
    },
    {
      label: "Approved",
      value: approvedCount,
      hint: "Clients promoted to consultants",
      accent: "text-emerald-300",
    },
    {
      label: "Rejected",
      value: rejectedCount,
      hint: "Applications with cooldown applied",
      accent: "text-rose-300",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          padding="p-5"
          className="border-slate-800 bg-slate-900 text-slate-100"
        >
          <p className="text-sm text-slate-400">{stat.label}</p>
          <p className={`mt-2 text-3xl font-bold ${stat.accent}`}>{stat.value}</p>
          <p className="mt-1 text-xs text-slate-500">{stat.hint}</p>
        </Card>
      ))}
    </div>
  );
}

export default AdminStats;
