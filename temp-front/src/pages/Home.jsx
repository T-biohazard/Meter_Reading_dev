export default function Home() {
  return (
    <section className="hero bg-base-200 rounded-2xl p-8">
      <div className="hero-content text-center">
        <div className="max-w-xl">
          <h1 className="text-3xl font-bold">Welcome</h1>
          <p className="mt-2 opacity-80">
            This is your reusable SPA template (React + Tailwind + daisyUI + Router).
          </p>
          <div className="mt-4">
            <a href="/dashboard" className="btn btn-primary">Go to Dashboard</a>
          </div>
        </div>
      </div>
    </section>
  );
}
