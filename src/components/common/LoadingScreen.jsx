import Spinner from "../ui/Spinner";

function LoadingScreen({ message = "Loading your dashboard..." }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <Spinner size="lg" />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
}

export default LoadingScreen;
