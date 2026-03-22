import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Activity, Layers, Ruler } from "lucide-react";

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect("/");
    }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] bg-slate-50/50 p-6">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
          System Dashboard
        </h1>
        <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
          Manage clinical units, categories, and test parameters through a centralized data hub.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <Link 
          href="/dashboard/admin/uom"
          className="group p-8 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500 transition-all duration-300 flex flex-col items-center text-center"
        >
          <div className="p-4 bg-slate-50 rounded-xl text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 mb-6">
            <Ruler size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">UOM Registry</h2>
          <p className="text-sm text-slate-500">Configure standardized clinical measurement units.</p>
        </Link>

        <Link 
          href="/dashboard/admin/test-categories"
          className="group p-8 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500 transition-all duration-300 flex flex-col items-center text-center"
        >
          <div className="p-4 bg-slate-50 rounded-xl text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 mb-6">
            <Activity size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Test Categories</h2>
          <p className="text-sm text-slate-500">Organize and group clinical diagnostic procedures.</p>
        </Link>

        <Link 
          href="/dashboard/admin/medical-tests"
          className="group p-8 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500 transition-all duration-300 flex flex-col items-center text-center"
        >
          <div className="p-4 bg-slate-50 rounded-xl text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 mb-6">
            <Layers size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Parameter Hub</h2>
          <p className="text-sm text-slate-500">Define normal ranges and operational test data.</p>
        </Link>
      </div>
    </div>
  );
}
