import Button from "../../ui/Button";
import Card from "../../ui/Card";
import { formatCurrency } from "../../../utils/formatters";

function WalletOverview({ balance, onAddFunds, loading }) {
  return (
    <Card
      id="wallet"
      className="overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 text-white"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-100">Available Balance</p>
          <p className="mt-2 text-4xl font-bold tracking-tight">
            {loading ? "..." : formatCurrency(balance)}
          </p>
          <p className="mt-3 max-w-md text-sm text-indigo-100">
            Funds are checked when you book a consultation. Payment is deducted only
            after the consultant accepts your request.
          </p>
        </div>

        <Button
          variant="secondary"
          size="lg"
          className="border-0 bg-white text-indigo-700 hover:bg-indigo-50"
          onClick={onAddFunds}
        >
          Add Funds
        </Button>
      </div>
    </Card>
  );
}

export default WalletOverview;
