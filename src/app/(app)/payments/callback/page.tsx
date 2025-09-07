export default function PaymentCallbackPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Payment Complete</h1>
      <p className="mb-6">Thank you for your payment! You can now return to the dashboard.</p>
      <a href="/dashboard" className="px-4 py-2 bg-primary text-primary-foreground rounded shadow">Go to Dashboard</a>
    </div>
  );
}
