import Card from "../../ui/Card";
import Badge from "../../ui/Badge";
import EmptyState from "../../ui/EmptyState";
import { formatCurrency, formatDate } from "../../../utils/formatters";

const typeStyles = {
  deposit: "success",
  paid: "danger",
  refund: "info",
  received: "info",
};

function TransactionHistory({ transactions, loading, limit = 8 }) {
  const visibleTransactions =
    limit === null ? transactions : transactions.slice(0, limit);
  return (
    <Card>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Wallet Activity
          </h2>
          <p className="text-sm text-slate-500">
            Recent deposits and consultation payments
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-slate-500">
          Loading transactions...
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          description="Add funds to your wallet to get started with consultations."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="px-2 py-3 font-medium">Type</th>
                <th className="px-2 py-3 font-medium">Description</th>
                <th className="px-2 py-3 font-medium">Amount</th>
                <th className="px-2 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {visibleTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-slate-50 last:border-0"
                >
                  <td className="px-2 py-3">
                    <Badge variant={typeStyles[transaction.transaction_type] || "default"}>
                      {transaction.transaction_type}
                    </Badge>
                  </td>
                  <td className="px-2 py-3 text-slate-600">
                    {transaction.description || "—"}
                  </td>
                  <td
                    className={`px-2 py-3 font-semibold ${
                      transaction.transaction_type === "deposit"
                        ? "text-emerald-600"
                        : "text-slate-900"
                    }`}
                  >
                    {transaction.transaction_type === "deposit" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-2 py-3 text-slate-500">
                    {formatDate(transaction.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export default TransactionHistory;