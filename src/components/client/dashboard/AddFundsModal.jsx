import { useState } from "react";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import Spinner from "../../ui/Spinner";

function AddFundsModal({ isOpen, onClose, onSubmit }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const quickAmounts = [25, 50, 100, 250];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const parsedAmount = Number(amount);

    if (!parsedAmount || parsedAmount <= 0) {
      setError("Please enter a valid amount greater than zero.");
      return;
    }

    try {
      setLoading(true);
      await onSubmit(parsedAmount);
      setAmount("");
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) {
      return;
    }

    setError("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Funds to Wallet"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="add-funds-form" disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" />
                Processing...
              </>
            ) : (
              "Add Funds"
            )}
          </Button>
        </>
      }
    >
      <form id="add-funds-form" onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-600">
          Top up your wallet to book consultations with online experts.
        </p>

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
      </form>
    </Modal>
  );
}

export default AddFundsModal;
