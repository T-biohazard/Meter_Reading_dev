export default function NotAuthorized() {
  return (
    <section className="text-center">
      <h2 className="text-2xl font-semibold">403</h2>
      <p className="mt-2 opacity-80">You don’t have permission to view this page.</p>
      <a href="/" className="btn btn-outline mt-4">Back Home</a>
    </section>
  );
}
