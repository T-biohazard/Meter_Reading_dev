// export default function Home() {
//   return (
//     <section className="hero bg-base-200 rounded-2xl p-8">
//       <div className="hero-content text-center">
//         <div className="max-w-xl">
//           <h1 className="text-3xl font-bold">Welcome</h1>
//           <p className="mt-2 opacity-80">
//             This is your reusable SPA template (React + Tailwind + daisyUI + Router).
//           </p>
//           <div className="mt-4">
//             <a href="/dashboard" className="btn btn-primary">Go to Dashboard</a>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

import DataTable from "../components/table/DataTable";



// import DataTable from "@/components/table/DataTable";

const rows = [
  { id: 1, name: "Ada", email: "ada@lovelace.io", role: "admin", active: true },
  { id: 2, name: "Grace", email: "grace@hopper.io", role: "user", active: false },
  { id: 3, name: "Linus", email: "linus@kernel.org", role: "user", active: true },
];

export default function Demo() {
  return (
    <div className="p-6 bg-white">
      <DataTable
        title="Users"
        data={rows}
        // columns optional: will auto-infer. Or pass minimal:
        // columns={["name","email","role","active"]}
        initialSort={{ key: "name", dir: "asc" }}
        importMeta={{
          startedAt: Date.now() - 1345,
          finishedAt: Date.now(),
          added: 2,
          updated: 1,
          skipped: 0,
          errors: 0,
        }}
      />
    </div>
  );
}
