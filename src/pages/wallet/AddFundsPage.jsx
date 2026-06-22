import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { depositFunds } from "../../api/walletApi";
import AppLayout from "../../components/layout/AppLayout";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";

const quickAmounts = [25, 50, 100, 250];

function AddFundsPage() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const parsedAmount = Number(amount);

    if (!parsedAmount || parsedAmount <= 0) {
      setError("Please enter a valid amount greater than zero.");
      return;
    }

    try {
      setLoading(true);
      await depositFunds(parsedAmount);
      setSuccess("Funds added successfully.");
      setAmount("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            ← Back to home
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">Add Funds</h1>
          <p className="mt-2 text-slate-600">
            Top up your wallet to book consultations with online experts.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="amount"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Amount (USD)
              </label>
              <input
                id="amount"
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Enter amount"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                required
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAmount(String(value))}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  ${value}
                </button>
              ))}
            </div>

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    Processing...
                  </>
                ) : (
                  "Add Funds"
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/wallet/transactions")}
              >
                View transactions
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}

export default AddFundsPage;