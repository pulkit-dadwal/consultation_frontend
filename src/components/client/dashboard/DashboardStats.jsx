import Card from "../../ui/Card";
import { formatCurrency } from "../../../utils/formatters";

function DashboardStats({ user, consultantsCount, consultationsCount }) {
  const stats = [
    {
      label: "Wallet Balance",
      value: formatCurrency(user?.wallet_balance),
      hint: "Ready to book sessions",
    },
    {
      label: "Online Consultants",
      value: consultantsCount,
      hint: "Available right now",
    },
    {
      label: "Active Consultations",
      value: consultationsCount,
      hint: "Pending or ongoing",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} padding="p-5">
          <p className="text-sm text-slate-500">{stat.label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</p>
          <p className="mt-1 text-xs text-slate-400">{stat.hint}</p>
        </Card>
      ))}
    </div>
  );
}

export default DashboardStats;
