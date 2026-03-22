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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] bg-gray-50 dark:bg-gray-900 p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
          Welcome Home
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your medical system data efficiently.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <Link 
          href="/dashboard/admin/uom"
          className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-blue-500 transition-all duration-300 flex flex-col items-center text-center"
        >
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform">
            <Ruler size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">UOM Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configure units of measurement for medical tests.</p>
        </Link>

        <Link 
          href="/dashboard/admin/test-categories"
          className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-green-500 transition-all duration-300 flex flex-col items-center text-center"
        >
          <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400 mb-4 group-hover:scale-110 transition-transform">
            <Layers size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Test Categories</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Organize medical tests into logical categories.</p>
        </Link>

        <Link 
          href="/dashboard/admin/medical-tests"
          className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-purple-500 transition-all duration-300 flex flex-col items-center text-center"
        >
          <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400 mb-4 group-hover:scale-110 transition-transform">
            <Activity size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Medical Tests</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Define test parameters, normal ranges, and units.</p>
        </Link>
      </div>
    </div>
  );
}
