import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchWalletTransactions } from "../../api/walletApi";
import AppLayout from "../../components/layout/AppLayout";
import TransactionHistory from "../../components/client/dashboard/TransactionHistory";
import Button from "../../components/ui/Button";
import LoadingScreen from "../../components/common/LoadingScreen";

function TransactionHistoryPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTransactions = useCallback(async () => {
    try {
      const data = await fetchWalletTransactions();
      setTransactions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  if (loading) {
    return (
      <AppLayout>
        <LoadingScreen />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              ← Back to home
            </Link>
            <h1 className="mt-4 text-3xl font-bold text-slate-900">
              Transaction History
            </h1>
            <p className="mt-2 text-slate-600">
              View all wallet deposits and consultation payments.
            </p>
          </div>
          <Button onClick={() => navigate("/wallet/add-funds")}>
            Add Funds
          </Button>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        ) : (
          <TransactionHistory transactions={transactions} loading={false} limit={null} />
        )}
      </div>
    </AppLayout>
  );
}

export default TransactionHistoryPage;